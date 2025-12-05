import type { Transaction, TransactionExplanation, ProvisionRule, CalculationStep, AppliedRuleInfo } from '../types';
import { sendMessage, extractJSON, PROMPTS } from './anthropicClient';
import { findMatchingRules, rulesToPromptFormat } from './ruleExtractor';
import { generateSimpleId, parseGermanDate } from '../utils/helpers';

interface ParsedTransactionsResponse {
  transactions: Partial<Transaction>[];
}

interface ExplanationResponse {
  summary?: string;
  appliedRules: (string | AppliedRuleInfo)[];
  explanation: string;
  calculation: string;
  calculationSteps?: CalculationStep[];
  finalAmount?: number;
  confidence: 'high' | 'medium' | 'low';
  confidenceReasons?: string[];
  notes?: string;
}

/**
 * Parst Transaktionen aus extrahiertem PDF-Text
 */
export async function parseTransactionsFromText(
  text: string
): Promise<Transaction[]> {
  const response = await sendMessage(
    PROMPTS.TRANSACTION_PARSING,
    `Provisionsabrechnung:\n\n${text}`,
    { temperature: 0.1, maxTokens: 8000 }
  );

  const parsed = extractJSON<ParsedTransactionsResponse>(response);

  if (!parsed || !parsed.transactions) {
    return [];
  }

  return parsed.transactions
    .filter(t => t.vertragsnummer && t.provisionsbetrag !== undefined)
    .map(t => ({
      id: generateSimpleId(),
      datum: t.datum || new Date().toISOString().split('T')[0],
      vertragsnummer: t.vertragsnummer!,
      produktart: t.produktart || 'Unbekannt',
      sparte: t.sparte,
      beitrag: t.beitrag,
      bewertungssumme: t.bewertungssumme,
      provisionsbetrag: t.provisionsbetrag!,
      provisionsart: validateProvisionsart(t.provisionsart),
      vermittlernummer: t.vermittlernummer,
      kundenname: t.kundenname,
      rawText: undefined
    }));
}

/**
 * Parst Transaktionen mit Regex-Fallback
 */
export function parseTransactionsWithRegex(text: string): Partial<Transaction>[] {
  const transactions: Partial<Transaction>[] = [];
  const lines = text.split('\n');

  // Common patterns for provision statements
  const patterns = [
    // Pattern: Date, Contract Nr, Product, Type, Amount, Provision
    /(\d{1,2}\.\d{1,2}\.\d{2,4})\s+([A-Z0-9-]+)\s+(.+?)\s+(Abschluss|Bestand|Storno|Dynamik|AP|BP)\s+([\d.,]+)\s*(?:EUR)?\s+([-]?[\d.,]+)/gi,
    // Alternative pattern
    /([A-Z]{2,3}-\d{4}-\d+)\s+(.+?)\s+([\d.,]+)\s*EUR\s+([-]?[\d.,]+)\s*EUR/gi
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(line);
      if (match) {
        transactions.push({
          datum: parseGermanDate(match[1]),
          vertragsnummer: match[2],
          produktart: match[3]?.trim(),
          provisionsbetrag: parseGermanNumber(match[6] || match[4]),
          provisionsart: detectProvisionsart(match[4] || line)
        });
      }
    }
  }

  return transactions;
}

/**
 * Generiert eine Erklärung für eine Transaktion
 */
export async function explainTransaction(
  transaction: Transaction,
  rules: ProvisionRule[]
): Promise<TransactionExplanation> {
  // Find potentially matching rules
  const matchingRules = findMatchingRules(
    {
      produktart: transaction.produktart,
      sparte: transaction.sparte,
      provisionsart: transaction.provisionsart
    },
    rules
  );

  // If no rules match, return low confidence explanation
  if (matchingRules.length === 0) {
    return {
      transactionId: transaction.id,
      appliedRules: [],
      explanation: 'Keine passende Provisionsregel in den Bestimmungen gefunden.',
      calculation: 'Nicht möglich ohne passende Regel',
      confidence: 'low',
      notes: 'Die Provisionsbestimmungen enthalten möglicherweise keine Regel für diesen Transaktionstyp oder die Regel wurde nicht korrekt extrahiert.'
    };
  }

  // Build prompt with relevant rules
  const rulesText = rulesToPromptFormat(matchingRules);

  const transactionText = `
Transaktion:
- Datum: ${transaction.datum}
- Vertragsnummer: ${transaction.vertragsnummer}
- Produkt: ${transaction.produktart}${transaction.sparte ? ` (${transaction.sparte})` : ''}
- Provisionsart: ${transaction.provisionsart}
- Beitrag: ${transaction.beitrag ? `${transaction.beitrag} EUR` : 'nicht angegeben'}
- Bewertungssumme: ${transaction.bewertungssumme ? `${transaction.bewertungssumme} EUR` : 'nicht angegeben'}
- Provisionsbetrag: ${transaction.provisionsbetrag} EUR`;

  const userMessage = `Provisionsregeln:
${rulesText}

${transactionText}`;

  try {
    const response = await sendMessage(
      PROMPTS.TRANSACTION_EXPLANATION,
      userMessage,
      { temperature: 0.2 }
    );

    const parsed = extractJSON<ExplanationResponse>(response);

    if (!parsed) {
      return {
        transactionId: transaction.id,
        appliedRules: matchingRules.map(r => r.id),
        explanation: 'Erklärung konnte nicht generiert werden.',
        calculation: '',
        confidence: 'low',
        notes: 'Fehler bei der Verarbeitung der LLM-Antwort'
      };
    }

    return {
      transactionId: transaction.id,
      appliedRules: parsed.appliedRules || matchingRules.map(r => r.id),
      explanation: parsed.explanation || '',
      calculation: parsed.calculation || '',
      confidence: parsed.confidence || 'medium',
      notes: parsed.notes,
      // New fields for enhanced explanations
      summary: parsed.summary,
      calculationSteps: parsed.calculationSteps,
      finalAmount: parsed.finalAmount || transaction.provisionsbetrag,
      confidenceReasons: parsed.confidenceReasons
    };
  } catch (error) {
    console.error('Fehler bei Erklärungsgenerierung:', error);
    return {
      transactionId: transaction.id,
      appliedRules: [],
      explanation: 'Fehler bei der Erklärungsgenerierung.',
      calculation: '',
      confidence: 'low',
      notes: error instanceof Error ? error.message : 'Unbekannter Fehler'
    };
  }
}

/**
 * Erklärt alle Transaktionen mit Fortschrittsanzeige
 */
export async function explainAllTransactions(
  transactions: Transaction[],
  rules: ProvisionRule[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<TransactionExplanation[]> {
  const explanations: TransactionExplanation[] = [];
  const total = transactions.length;

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    onProgress?.(i + 1, total, `Analysiere Transaktion ${i + 1} von ${total}...`);

    const explanation = await explainTransaction(transaction, rules);
    explanations.push(explanation);

    // Small delay to avoid rate limiting
    if (i < transactions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  onProgress?.(total, total, 'Analyse abgeschlossen');

  return explanations;
}

// Helper functions

function validateProvisionsart(art?: string): Transaction['provisionsart'] {
  if (!art) return 'Sonstig';

  const normalized = art.toLowerCase();

  if (normalized.includes('abschluss') || normalized === 'ap') return 'Abschluss';
  if (normalized.includes('bestand') || normalized === 'bp') return 'Bestand';
  if (normalized.includes('storno')) return 'Storno';
  if (normalized.includes('dynamik')) return 'Dynamik';
  if (normalized.includes('nach')) return 'Nachprovision';

  return 'Sonstig';
}

function detectProvisionsart(text: string): Transaction['provisionsart'] {
  const lower = text.toLowerCase();

  if (lower.includes('storno') || lower.includes('rückbuchung')) return 'Storno';
  if (lower.includes('dynamik')) return 'Dynamik';
  if (lower.includes('bestand') || lower.includes('bp')) return 'Bestand';
  if (lower.includes('nach')) return 'Nachprovision';
  if (lower.includes('abschluss') || lower.includes('ap')) return 'Abschluss';

  return 'Sonstig';
}

function parseGermanNumber(str: string): number {
  // Remove thousand separators and convert decimal comma
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}
