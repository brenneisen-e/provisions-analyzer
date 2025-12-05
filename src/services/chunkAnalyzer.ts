import type { DocumentChunk, ExtractedDocument } from '../types';
import { generateSimpleId } from '../utils/helpers';

interface ChunkingOptions {
  maxChunkSize?: number; // Max characters per chunk
  overlapSize?: number; // Characters to overlap between chunks
  preserveStructure?: boolean; // Try to preserve paragraph/section boundaries
  fastMode?: boolean; // Use larger chunks for faster processing
}

/**
 * Analysiert ein PDF-Dokument und teilt es in semantisch sinnvolle Chunks
 *
 * Standard: ~15.000 Zeichen pro Chunk (ca. 3-4 Seiten)
 * Fast Mode: ~25.000 Zeichen pro Chunk (ca. 6-8 Seiten)
 *
 * Bei 100 Seiten ergibt das ca. 25-35 Chunks statt 400!
 */
export function chunkDocument(
  document: ExtractedDocument,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const isFastMode = options.fastMode ?? false;
  const {
    maxChunkSize = isFastMode ? 25000 : 15000,  // Deutlich größere Chunks
    overlapSize = isFastMode ? 100 : 300,        // Weniger Overlap
    preserveStructure = true
  } = options;

  const chunks: DocumentChunk[] = [];

  if (preserveStructure) {
    // Structure-aware chunking
    chunks.push(...structureAwareChunking(document, maxChunkSize, overlapSize));
  } else {
    // Simple sliding window chunking
    chunks.push(...slidingWindowChunking(document, maxChunkSize, overlapSize));
  }

  return chunks;
}

/**
 * Struktur-bewusstes Chunking - respektiert Kapitel/Paragraphen
 */
function structureAwareChunking(
  document: ExtractedDocument,
  maxChunkSize: number,
  overlapSize: number
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  // Pattern für Sektionsüberschriften
  const sectionPatterns = [
    /^§\s*\d+/,
    /^\d+\.\s+[A-ZÄÖÜ]/,
    /^\d+\.\d+/,
    /^(Artikel|Abschnitt|Kapitel|Teil)\s+\d+/i,
    /^[IVXLCDM]+\.\s+/
  ];

  const isSectionStart = (line: string): boolean => {
    return sectionPatterns.some(pattern => pattern.test(line.trim()));
  };

  let currentChunk: {
    content: string[];
    pageStart: number;
    pageEnd: number;
    title?: string;
    type: DocumentChunk['type'];
  } | null = null;

  for (const page of document.pages) {
    for (const line of page.lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check if this line starts a new section
      if (isSectionStart(trimmedLine)) {
        // Save current chunk if it exists and has content
        if (currentChunk && currentChunk.content.length > 0) {
          const content = currentChunk.content.join('\n');
          chunks.push({
            id: generateSimpleId(),
            pageStart: currentChunk.pageStart,
            pageEnd: currentChunk.pageEnd,
            title: currentChunk.title,
            content,
            type: currentChunk.type
          });
        }

        // Start new chunk
        currentChunk = {
          content: [trimmedLine],
          pageStart: page.pageNumber,
          pageEnd: page.pageNumber,
          title: trimmedLine.substring(0, 100),
          type: detectChunkType(trimmedLine)
        };
      } else if (currentChunk) {
        // Add to current chunk
        currentChunk.content.push(trimmedLine);
        currentChunk.pageEnd = page.pageNumber;

        // Check if chunk is getting too large
        const currentSize = currentChunk.content.join('\n').length;
        if (currentSize > maxChunkSize) {
          // Split chunk at a natural boundary if possible
          const splitResult = splitChunkAtBoundary(currentChunk.content, maxChunkSize, overlapSize);

          chunks.push({
            id: generateSimpleId(),
            pageStart: currentChunk.pageStart,
            pageEnd: currentChunk.pageEnd,
            title: currentChunk.title,
            content: splitResult.first.join('\n'),
            type: currentChunk.type
          });

          // Continue with remainder
          currentChunk = {
            content: splitResult.second,
            pageStart: currentChunk.pageEnd,
            pageEnd: currentChunk.pageEnd,
            title: currentChunk.title ? `${currentChunk.title} (Fortsetzung)` : undefined,
            type: currentChunk.type
          };
        }
      } else {
        // No current chunk - start one
        currentChunk = {
          content: [trimmedLine],
          pageStart: page.pageNumber,
          pageEnd: page.pageNumber,
          type: 'paragraph'
        };
      }
    }
  }

  // Don't forget the last chunk
  if (currentChunk && currentChunk.content.length > 0) {
    chunks.push({
      id: generateSimpleId(),
      pageStart: currentChunk.pageStart,
      pageEnd: currentChunk.pageEnd,
      title: currentChunk.title,
      content: currentChunk.content.join('\n'),
      type: currentChunk.type
    });
  }

  return chunks;
}

/**
 * Einfaches Sliding-Window Chunking
 */
function slidingWindowChunking(
  document: ExtractedDocument,
  maxChunkSize: number,
  overlapSize: number
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const fullText = document.fullText;

  let position = 0;

  while (position < fullText.length) {
    const end = Math.min(position + maxChunkSize, fullText.length);

    // Find page numbers for this chunk
    let charCount = 0;
    let startPage = 1;
    let endPage = 1;

    for (let i = 0; i < document.pages.length; i++) {
      const pageTextLength = document.pages[i].text.length + 2; // +2 for \n\n separator
      if (charCount <= position && position < charCount + pageTextLength) {
        startPage = document.pages[i].pageNumber;
      }
      if (charCount <= end && end <= charCount + pageTextLength) {
        endPage = document.pages[i].pageNumber;
        break;
      }
      charCount += pageTextLength;
    }

    chunks.push({
      id: generateSimpleId(),
      pageStart: startPage,
      pageEnd: endPage,
      content: fullText.substring(position, end),
      type: 'paragraph'
    });

    // Move position with overlap
    position = end - overlapSize;
    if (position >= fullText.length - overlapSize) break;
  }

  return chunks;
}

/**
 * Erkennt den Typ eines Chunks anhand der Überschrift
 */
function detectChunkType(title: string): DocumentChunk['type'] {
  const lowerTitle = title.toLowerCase();

  if (/^§/.test(title)) return 'section';
  if (/^(kapitel|teil)/i.test(title)) return 'chapter';
  if (/tabelle|übersicht|staffel/i.test(lowerTitle)) return 'table';

  return 'paragraph';
}

/**
 * Teilt einen zu großen Chunk an einer natürlichen Grenze
 */
function splitChunkAtBoundary(
  lines: string[],
  maxSize: number,
  overlapSize: number
): { first: string[]; second: string[] } {
  let currentSize = 0;
  let splitIndex = 0;

  // Find split point
  for (let i = 0; i < lines.length; i++) {
    currentSize += lines[i].length + 1; // +1 for newline

    if (currentSize > maxSize * 0.8) {
      // Look for a good split point (empty line, sentence end)
      for (let j = i; j >= Math.max(0, i - 10); j--) {
        if (lines[j].trim() === '' || /[.!?]$/.test(lines[j])) {
          splitIndex = j + 1;
          break;
        }
      }
      if (splitIndex === 0) splitIndex = i;
      break;
    }
  }

  if (splitIndex === 0) splitIndex = Math.floor(lines.length / 2);

  // Calculate overlap start
  const overlapLines = Math.max(0, splitIndex - Math.ceil(overlapSize / 50));

  return {
    first: lines.slice(0, splitIndex),
    second: lines.slice(overlapLines)
  };
}

/**
 * Findet relevante Chunks für eine bestimmte Suchanfrage
 */
export function findRelevantChunks(
  chunks: DocumentChunk[],
  query: string,
  limit: number = 5
): DocumentChunk[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  const scoredChunks = chunks.map(chunk => {
    const contentLower = chunk.content.toLowerCase();
    const titleLower = (chunk.title || '').toLowerCase();

    let score = 0;

    for (const term of queryTerms) {
      // Count occurrences in content
      const contentMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
      score += contentMatches;

      // Title matches are worth more
      if (titleLower.includes(term)) {
        score += 5;
      }
    }

    // Boost for certain chunk types
    if (chunk.type === 'section' || chunk.type === 'chapter') {
      score *= 1.2;
    }

    return { chunk, score };
  });

  return scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.chunk);
}
