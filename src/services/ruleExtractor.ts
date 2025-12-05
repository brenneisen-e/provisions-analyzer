import type { ProvisionRule, DocumentChunk } from '../types';
import { sendMessage, extractJSON, PROMPTS } from './anthropicClient';
import { generateSimpleId } from '../utils/helpers';

interface ExtractedRulesResponse {
  rules: Partial<ProvisionRule>[];
}

/**
 * Extrahiert Provisionsregeln aus einem Chunk mittels LLM
 */
export async function extractRulesFromChunk(
  chunk: DocumentChunk
): Promise<ProvisionRule[]> {
  const userMessage = `Abschnitt (Seite ${chunk.pageStart}-${chunk.pageEnd}):
${chunk.title ? `Titel: ${chunk.title}\n` : ''}
${chunk.content}`;

  try {
    const response = await sendMessage(
      PROMPTS.RULE_EXTRACTION,
      userMessage,
      { temperature: 0.2 }
    );

    const extracted = extractJSON<ExtractedRulesResponse>(response);

    if (!extracted || !extracted.rules) {
      return [];
    }

    // Validate and complete rules
    return extracted.rules
      .filter(rule => rule.name && rule.category)
      .map(rule => ({
        id: rule.id || generateSimpleId(),
        name: rule.name!,
        category: validateCategory(rule.category!),
        products: rule.products || [],
        conditions: rule.conditions || '',
        formula: rule.formula || '',
        parameters: rule.parameters || {},
        notes: rule.notes,
        sourceChunk: chunk.id
      }));
  } catch (error) {
    console.error('Fehler bei Regelextraktion:', error);
    return [];
  }
}

/**
 * Extrahiert Regeln aus allen Chunks mit Fortschrittsanzeige
 */
export async function extractRulesFromDocument(
  chunks: DocumentChunk[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<ProvisionRule[]> {
  const allRules: ProvisionRule[] = [];
  const total = chunks.length;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    onProgress?.(i + 1, total, `Analysiere Chunk ${i + 1} von ${total}...`);

    const rules = await extractRulesFromChunk(chunk);
    allRules.push(...rules);

    // Small delay to avoid rate limiting
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Deduplicate rules by name
  const deduped = deduplicateRules(allRules);

  onProgress?.(total, total, `${deduped.length} Regeln extrahiert`);

  return deduped;
}

/**
 * Entfernt doppelte Regeln
 */
function deduplicateRules(rules: ProvisionRule[]): ProvisionRule[] {
  const seen = new Map<string, ProvisionRule>();

  for (const rule of rules) {
    const key = `${rule.name.toLowerCase()}-${rule.category}`;

    if (!seen.has(key)) {
      seen.set(key, rule);
    } else {
      // Merge information from duplicate
      const existing = seen.get(key)!;
      if (rule.conditions && !existing.conditions) {
        existing.conditions = rule.conditions;
      }
      if (rule.formula && !existing.formula) {
        existing.formula = rule.formula;
      }
      if (rule.products.length > existing.products.length) {
        existing.products = rule.products;
      }
    }
  }

  return Array.from(seen.values());
}

/**
 * Validiert und normalisiert die Kategorie
 */
function validateCategory(category: string): ProvisionRule['category'] {
  const normalized = category.toLowerCase();

  if (normalized.includes('abschluss') || normalized.includes('ap')) {
    return 'Abschluss';
  }
  if (normalized.includes('bestand') || normalized.includes('bp')) {
    return 'Bestand';
  }
  if (normalized.includes('storno')) {
    return 'Storno';
  }
  if (normalized.includes('dynamik')) {
    return 'Dynamik';
  }

  return 'Sonstig';
}

/**
 * Sucht die passenden Regeln für eine Transaktion
 */
export function findMatchingRules(
  transaction: {
    produktart: string;
    sparte?: string;
    provisionsart: string;
  },
  rules: ProvisionRule[]
): ProvisionRule[] {
  const matches: { rule: ProvisionRule; score: number }[] = [];

  for (const rule of rules) {
    let score = 0;

    // Category match
    if (rule.category.toLowerCase() === transaction.provisionsart.toLowerCase()) {
      score += 10;
    }

    // Product match
    const produktLower = transaction.produktart.toLowerCase();
    const sparteLower = (transaction.sparte || '').toLowerCase();

    for (const product of rule.products) {
      const productLower = product.toLowerCase();
      if (produktLower.includes(productLower) || productLower.includes(produktLower)) {
        score += 5;
      }
      if (sparteLower && (sparteLower.includes(productLower) || productLower.includes(sparteLower))) {
        score += 5;
      }
    }

    // Check conditions for keywords
    const conditionsLower = rule.conditions.toLowerCase();
    if (produktLower && conditionsLower.includes(produktLower)) {
      score += 3;
    }

    if (score > 0) {
      matches.push({ rule, score });
    }
  }

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(m => m.rule);
}

/**
 * Konvertiert Regeln zu einem kompakten Format für LLM-Prompts
 */
export function rulesToPromptFormat(rules: ProvisionRule[]): string {
  return rules.map(rule => {
    let text = `[${rule.id}] ${rule.name} (${rule.category})`;

    if (rule.products.length > 0) {
      text += `\nProdukte: ${rule.products.join(', ')}`;
    }
    if (rule.conditions) {
      text += `\nBedingungen: ${rule.conditions}`;
    }
    if (rule.formula) {
      text += `\nFormel: ${rule.formula}`;
    }
    if (rule.parameters.rate) {
      text += `\nSatz: ${rule.parameters.rate}`;
    }
    if (rule.parameters.basis) {
      text += `\nBasis: ${rule.parameters.basis}`;
    }
    if (rule.notes) {
      text += `\nHinweis: ${rule.notes}`;
    }

    return text;
  }).join('\n\n---\n\n');
}
