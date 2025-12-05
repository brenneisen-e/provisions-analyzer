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
 *
 * VERBESSERT: Robustere Splitpunkt-Suche und Sicherheitslimits
 */
function optimizedChunking(
  document: ExtractedDocument,
  maxChunkSize: number,
  overlapSize: number
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const fullText = document.fullText;

  // Sicherheitsgrenze: Maximal 50 Chunks (typischerweise 5-10 für ein 60-80 Seiten Dokument)
  const MAX_CHUNKS = 50;

  // Debug-Info
  console.log(`[Chunking] Dokument: ${document.fileName}`);
  console.log(`[Chunking] Gesamtlänge: ${fullText.length} Zeichen`);
  console.log(`[Chunking] Seiten: ${document.pages.length}`);
  console.log(`[Chunking] maxChunkSize: ${maxChunkSize}, overlapSize: ${overlapSize}`);

  // Wenn Dokument klein genug, nur 1 Chunk
  if (fullText.length <= maxChunkSize) {
    console.log(`[Chunking] Dokument passt in 1 Chunk`);
    return [{
      id: generateSimpleId(),
      pageStart: 1,
      pageEnd: document.pages.length,
      content: fullText,
      type: 'paragraph'
    }];
  }

  // Berechne erwartete Chunk-Anzahl
  const expectedChunks = Math.ceil(fullText.length / (maxChunkSize - overlapSize));
  console.log(`[Chunking] Erwartete Chunks: ~${expectedChunks}`);

  let position = 0;
  let chunkIndex = 0;
  let iterationCount = 0;
  const maxIterations = MAX_CHUNKS + 10; // Sicherheit gegen Endlosschleifen

  while (position < fullText.length && iterationCount < maxIterations) {
    iterationCount++;

    // Ziel-Ende berechnen
    let end = Math.min(position + maxChunkSize, fullText.length);

    // Wenn nicht am Ende, suche guten Splitpunkt
    if (end < fullText.length) {
      // Suche in den letzten 2000 Zeichen nach gutem Splitpunkt
      // Aber niemals vor der Mitte des Chunks (position + maxChunkSize/2)
      const minSplitPosition = position + Math.floor(maxChunkSize * 0.75); // Mindestens 75% des Chunks
      const searchStart = Math.max(end - 2000, minSplitPosition);
      let bestSplit = end;

      // Suche nur im Bereich [searchStart, end]
      const searchRange = fullText.substring(searchStart, end);

      // Priorität 1: Doppelter Zeilenumbruch (Absatzende)
      const doubleNewlineIndex = searchRange.lastIndexOf('\n\n');
      if (doubleNewlineIndex >= 0) {
        bestSplit = searchStart + doubleNewlineIndex + 2;
      } else {
        // Priorität 2: Satzende mit Zeilenumbruch
        const sentenceEndMatch = searchRange.match(/.*[.!?]\s*\n/);
        if (sentenceEndMatch) {
          bestSplit = searchStart + sentenceEndMatch[0].length;
        } else {
          // Priorität 3: Einfacher Zeilenumbruch
          const newlineIndex = searchRange.lastIndexOf('\n');
          if (newlineIndex >= 0) {
            bestSplit = searchStart + newlineIndex + 1;
          }
        }
      }

      // Sicherheit: bestSplit muss immer vorwärts gehen
      if (bestSplit <= position + overlapSize) {
        bestSplit = end; // Falls kein guter Split gefunden, nutze volle Chunk-Größe
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

      // Warnung wenn zu viele Chunks
      if (chunkIndex === 20) {
        console.warn(`[Chunking] WARNUNG: Bereits 20 Chunks erstellt. Position: ${position}/${fullText.length}`);
      }
    }

    // Nächste Position: Minimaler Fortschritt = maxChunkSize - overlapSize
    const minProgress = Math.floor(maxChunkSize * 0.9); // Mindestens 90% vorwärts
    const nextPosition = end - overlapSize;
    position = Math.max(position + minProgress, nextPosition);

    // Sicherheit: Vermeide Endlosschleife
    if (position >= fullText.length - 100) break;

    // Sicherheitsabbruch bei zu vielen Chunks
    if (chunks.length >= MAX_CHUNKS) {
      console.warn(`[Chunking] Sicherheitslimit erreicht: ${MAX_CHUNKS} Chunks. Restlicher Text wird in letzten Chunk aufgenommen.`);
      // Restlichen Text in einen finalen Chunk packen
      const remainingContent = fullText.substring(position).trim();
      if (remainingContent.length > 0) {
        chunks.push({
          id: generateSimpleId(),
          pageStart: endPage,
          pageEnd: document.pages.length,
          content: remainingContent,
          title: `Teil ${chunkIndex + 1} (Seiten ${endPage}-${document.pages.length}) [Rest]`,
          type: 'paragraph'
        });
      }
      break;
    }
  }

  console.log(`[Chunking] Fertig: ${chunks.length} Chunks erstellt`);
  return chunks;
}

/**
 * Einfaches Sliding-Window Chunking
 * Mit Sicherheitslimit für maximale Chunk-Anzahl
 */
function slidingWindowChunking(
  document: ExtractedDocument,
  maxChunkSize: number,
  overlapSize: number
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const fullText = document.fullText;
  const MAX_CHUNKS = 50;

  let position = 0;

  while (position < fullText.length && chunks.length < MAX_CHUNKS) {
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

    // Move position with overlap - ensure minimum progress
    const minProgress = Math.floor(maxChunkSize * 0.9);
    position = Math.max(position + minProgress, end - overlapSize);
    if (position >= fullText.length - overlapSize) break;
  }

  // Falls Limit erreicht, Rest in letzten Chunk
  if (chunks.length >= MAX_CHUNKS && position < fullText.length) {
    const remainingContent = fullText.substring(position).trim();
    if (remainingContent.length > 0) {
      chunks.push({
        id: generateSimpleId(),
        pageStart: chunks[chunks.length - 1].pageEnd,
        pageEnd: document.pages.length,
        content: remainingContent,
        type: 'paragraph'
      });
    }
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
