import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

// Configure PDF.js worker - use unpkg CDN which has the correct version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  lines: string[];
}

export interface ExtractedDocument {
  fileName: string;
  totalPages: number;
  pages: ExtractedPage[];
  fullText: string;
}

function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return 'str' in item;
}

/**
 * Extrahiert Text aus einer PDF-Datei
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const pages: ExtractedPage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Extract text items and sort by position
    const items: { text: string; y: number; x: number }[] = [];

    for (const item of textContent.items) {
      if (isTextItem(item)) {
        items.push({
          text: item.str,
          y: item.transform[5],
          x: item.transform[4]
        });
      }
    }

    // Group by lines (similar Y position)
    const lineGroups = new Map<number, typeof items>();
    const threshold = 5; // Y-position threshold for same line

    for (const item of items) {
      let foundGroup = false;
      for (const [groupY] of lineGroups) {
        if (Math.abs(item.y - groupY) < threshold) {
          lineGroups.get(groupY)?.push(item);
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        lineGroups.set(item.y, [item]);
      }
    }

    // Sort lines by Y position (descending for top-to-bottom) and items by X position
    const sortedLines = Array.from(lineGroups.entries())
      .sort(([a], [b]) => b - a)
      .map(([, items]) =>
        items
          .sort((a, b) => a.x - b.x)
          .map(item => item.text)
          .join(' ')
          .trim()
      )
      .filter(line => line.length > 0);

    pages.push({
      pageNumber: pageNum,
      text: sortedLines.join('\n'),
      lines: sortedLines
    });

    onProgress?.(pageNum, totalPages);
  }

  return {
    fileName: file.name,
    totalPages,
    pages,
    fullText: pages.map(p => p.text).join('\n\n')
  };
}

/**
 * Erkennt Überschriften und Paragraphen in extrahiertem Text
 */
export function detectStructure(text: string): {
  title: string | null;
  sections: { heading: string; content: string }[];
} {
  const lines = text.split('\n');
  const sections: { heading: string; content: string }[] = [];
  let currentSection: { heading: string; content: string[] } | null = null;

  // Patterns für Überschriften
  const headingPatterns = [
    /^§\s*\d+/, // §1, §2 etc
    /^\d+\.\s+[A-ZÄÖÜ]/, // 1. Überschrift
    /^\d+\.\d+\s+[A-ZÄÖÜ]/, // 1.1 Überschrift
    /^[IVXLCDM]+\.\s+/, // Römische Zahlen
    /^[A-Z][A-ZÄÖÜ\s]{3,}$/, // ALL CAPS HEADING
    /^(Artikel|Abschnitt|Kapitel|Teil)\s+\d+/i
  ];

  const isHeading = (line: string): boolean => {
    return headingPatterns.some(pattern => pattern.test(line.trim()));
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (isHeading(trimmedLine)) {
      // Save previous section
      if (currentSection) {
        sections.push({
          heading: currentSection.heading,
          content: currentSection.content.join('\n')
        });
      }
      currentSection = { heading: trimmedLine, content: [] };
    } else if (currentSection) {
      currentSection.content.push(trimmedLine);
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      heading: currentSection.heading,
      content: currentSection.content.join('\n')
    });
  }

  // Try to find document title
  const title = lines.find(l =>
    l.trim().length > 0 &&
    l.trim().length < 100 &&
    /^[A-ZÄÖÜ]/.test(l.trim())
  )?.trim() || null;

  return { title, sections };
}

/**
 * Erkennt und extrahiert Tabellendaten aus Text
 */
export function extractTableData(text: string): string[][] | null {
  const lines = text.split('\n').filter(l => l.trim());

  // Check if text looks like a table (multiple columns separated by spaces/tabs)
  const potentialRows = lines.map(line => {
    // Split by multiple spaces or tabs
    return line.split(/\s{2,}|\t/).filter(cell => cell.trim());
  });

  // Validate: table should have consistent column count
  const columnCounts = potentialRows.map(r => r.length);
  const mostCommon = columnCounts.sort(
    (a, b) =>
      columnCounts.filter(v => v === b).length -
      columnCounts.filter(v => v === a).length
  )[0];

  if (mostCommon < 2) return null;

  // Filter rows with consistent column count
  const tableRows = potentialRows.filter(r =>
    Math.abs(r.length - mostCommon) <= 1
  );

  return tableRows.length > 2 ? tableRows : null;
}

/**
 * Sucht nach Provisionsbeträgen und -sätzen im Text
 */
export function extractProvisionData(text: string): {
  rates: { value: number; unit: string; context: string }[];
  amounts: { value: number; context: string }[];
} {
  const rates: { value: number; unit: string; context: string }[] = [];
  const amounts: { value: number; context: string }[] = [];

  // Patterns for rates
  const ratePattern = /(\d+[,.]?\d*)\s*(%|Prozent|Promille|‰)/gi;
  let match;

  while ((match = ratePattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(',', '.'));
    const unit = match[2].toLowerCase().includes('promille') || match[2] === '‰' ? 'promille' : 'percent';
    const contextStart = Math.max(0, match.index - 50);
    const contextEnd = Math.min(text.length, match.index + match[0].length + 50);
    const context = text.substring(contextStart, contextEnd).trim();

    rates.push({ value, unit, context });
  }

  // Patterns for amounts (Euro)
  const amountPattern = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:€|EUR|Euro)/gi;

  while ((match = amountPattern.exec(text)) !== null) {
    const valueStr = match[1].replace(/\./g, '').replace(',', '.');
    const value = parseFloat(valueStr);
    const contextStart = Math.max(0, match.index - 50);
    const contextEnd = Math.min(text.length, match.index + match[0].length + 50);
    const context = text.substring(contextStart, contextEnd).trim();

    amounts.push({ value, context });
  }

  return { rates, amounts };
}
