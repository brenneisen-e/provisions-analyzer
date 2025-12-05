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
 * OPTIMIERT: Große Chunks für schnellere Verarbeitung
 * - Standard: ~40.000 Zeichen pro Chunk (ca. 10-12 Seiten)
 * - Bei 63 Seiten = ca. 5-8 Chunks statt 270!
 *
 * Kleine Paragraphen (§1, §2, etc.) werden NICHT einzeln gechunkt,
 * sondern zusammengefasst bis die Chunk-Größe erreicht ist.
 */
export function chunkDocument(
  document: ExtractedDocument,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const {
    maxChunkSize = 40000,  // ~10-12 Seiten pro Chunk
    overlapSize = 500,      // Etwas Kontext-Overlap
    preserveStructure = true
  } = options;

  // Für Provisionsbestimmungen: Einfaches Sliding-Window ist besser
  // da wir ALLE Regeln erfassen müssen, nicht nur strukturelle Grenzen
  if (!preserveStructure) {
    return slidingWindowChunking(document, maxChunkSize, overlapSize);
  }

  // Optimiertes Chunking: Nur an GROSSEN Abschnitten splitten
  return optimizedChunking(document, maxChunkSize, overlapSize);
}

/**
 * OPTIMIERTES Chunking - sammelt Content bis maxChunkSize erreicht ist
 * Splittet nur an natürlichen Grenzen (Satzende, Absatz)
 * KEINE separaten Chunks für jeden § Paragraphen!
 */
function optimizedChunking(
  document: ExtractedDocument,
  maxChunkSize: number,
  overlapSize: number
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const fullText = document.fullText;

  // Wenn Dokument klein genug, nur 1 Chunk
  if (fullText.length <= maxChunkSize) {
    return [{
      id: generateSimpleId(),
      pageStart: 1,
      pageEnd: document.pages.length,
      content: fullText,
      type: 'paragraph'
    }];
  }

  let position = 0;
  let chunkIndex = 0;

  while (position < fullText.length) {
    // Ziel-Ende berechnen
    let end = Math.min(position + maxChunkSize, fullText.length);

    // Wenn nicht am Ende, suche guten Splitpunkt
    if (end < fullText.length) {
      // Suche rückwärts nach gutem Splitpunkt (max 2000 Zeichen zurück)
      const searchStart = Math.max(end - 2000, position + maxChunkSize / 2);
      let bestSplit = end;

      // Priorität 1: Doppelter Zeilenumbruch (Absatzende)
      const doubleNewline = fullText.lastIndexOf('\n\n', end);
      if (doubleNewline > searchStart) {
        bestSplit = doubleNewline + 2;
      } else {
        // Priorität 2: Satzende mit Zeilenumbruch
        const sentenceEnd = fullText.substring(searchStart, end).search(/[.!?]\s*\n/);
        if (sentenceEnd > 0) {
          bestSplit = searchStart + sentenceEnd + fullText.substring(searchStart + sentenceEnd).match(/[.!?]\s*\n/)![0].length;
        } else {
          // Priorität 3: Einfacher Zeilenumbruch
          const newline = fullText.lastIndexOf('\n', end);
          if (newline > searchStart) {
            bestSplit = newline + 1;
          }
        }
      }
      end = bestSplit;
    }

    // Seitennummern für diesen Chunk finden
    let charCount = 0;
    let startPage = 1;
    let endPage = document.pages.length;

    for (let i = 0; i < document.pages.length; i++) {
      const pageTextLength = document.pages[i].text.length + 2;
      if (charCount <= position && position < charCount + pageTextLength) {
        startPage = document.pages[i].pageNumber;
      }
      if (charCount <= end && end <= charCount + pageTextLength) {
        endPage = document.pages[i].pageNumber;
        break;
      }
      charCount += pageTextLength;
    }

    const content = fullText.substring(position, end).trim();

    if (content.length > 0) {
      chunks.push({
        id: generateSimpleId(),
        pageStart: startPage,
        pageEnd: endPage,
        content,
        title: `Teil ${chunkIndex + 1} (Seiten ${startPage}-${endPage})`,
        type: 'paragraph'
      });
      chunkIndex++;
    }

    // Nächste Position mit Overlap
    position = Math.max(position + 1, end - overlapSize);

    // Sicherheit: Vermeide Endlosschleife
    if (position >= fullText.length - 100) break;
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
