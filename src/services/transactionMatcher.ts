import type { Transaction, TransactionExplanation, ProvisionRule, CalculationStep, AppliedRuleInfo } from '../types';
import { sendMessage, extractJSON, PROMPTS, isClientInitialized } from './anthropicClient';
import { findMatchingRules, rulesToPromptFormat } from './ruleExtractor';
import { generateSimpleId, parseGermanDate } from '../utils/helpers';
import {
  matchTransactionToRules,
  createRuleReference,
  getDemoExplanation
} from './ruleMatcher';

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
 * Verwendet API wenn verfügbar, sonst Regex-Fallback
 */
export async function parseTransactionsFromText(
  text: string,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Transaction[]> {
  // Check if API is available
  if (!isClientInitialized()) {
    onProgress?.(10, 100, 'Kein API-Key - nutze lokale Extraktion...');
    await new Promise(resolve => setTimeout(resolve, 200));

    onProgress?.(30, 100, 'Analysiere Dokumentstruktur...');
    await new Promise(resolve => setTimeout(resolve, 200));

    const transactions = parseTransactionsWithRegex(text);

    onProgress?.(70, 100, `${transactions.length} Transaktionen gefunden...`);
    await new Promise(resolve => setTimeout(resolve, 200));

    const result = transactions
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

    onProgress?.(100, 100, `${result.length} Transaktionen extrahiert`);
    return result;
  }

  // Use API for better extraction
  onProgress?.(10, 100, 'KI-Analyse startet...');
  await new Promise(resolve => setTimeout(resolve, 100));

  onProgress?.(20, 100, 'Sende Dokument an Claude...');

  const response = await sendMessage(
    PROMPTS.TRANSACTION_PARSING,
    `Provisionsabrechnung:\n\n${text}`,
    { temperature: 0.1, maxTokens: 8000 }
  );

  onProgress?.(80, 100, 'Verarbeite KI-Antwort...');
  await new Promise(resolve => setTimeout(resolve, 100));

  const parsed = extractJSON<ParsedTransactionsResponse>(response);

  if (!parsed || !parsed.transactions) {
    onProgress?.(100, 100, 'Keine Transaktionen gefunden');
    return [];
  }

  const result = parsed.transactions
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

  onProgress?.(100, 100, `${result.length} Transaktionen extrahiert`);
  return result;
}

/**
 * Parst Transaktionen mit Regex-Fallback
 * Erkennt das Landscape-Format der generierten Provisionsabrechnungen
 */
export function parseTransactionsWithRegex(text: string): Partial<Transaction>[] {
  const transactions: Partial<Transaction>[] = [];
  const lines = text.split('\n');

  // Pattern für Landscape-PDF Format:
  // Datum | VS-Nummer | Kunde | Gesellschaft | Produkt | Sparte | Art | Beitrag | Basis | Satz | Provision | SR
  const landscapePattern = /(\d{1,2}\.\d{1,2}\.\d{2,4})\s+([A-Z]{2,4}-\d{4}-\d+)\s+(\S+)\s+(.+?)\s+(Leben|PKV|Sach|Kfz|LV|KV|SHUK)\s+(AP|BP|ST|DYN|NP|SO|RA|BE|CTG|FP)\s+([\d.,]+)\s+([\d.,]+)\s+(\S+)\s+([-]?[\d.,]+)/gi;

  // Pattern für einfacheres Format:
  // Datum | VS-Nummer | Produkt | Art | Provision
  const simplePattern = /(\d{1,2}\.\d{1,2}\.\d{2,4})\s+([A-Z]{2,4}-\d{4}-\d+)\s+(.+?)\s+(AP|BP|ST|DYN|Abschluss|Bestand|Storno|Dynamik)\s+([-]?[\d.,]+)/gi;

  // Pattern für Zeilen mit Vertragsnummer und Provision
  const contractPattern = /([A-Z]{2,4}-\d{4}-\d+)[^\d]*([\d.,]+)\s*€?\s+([-]?[\d.,]+)\s*€?/gi;

  const seenContracts = new Set<string>();

  for (const line of lines) {
    // Skip header lines
    if (line.includes('Datum') && line.includes('VS-Nummer')) continue;
    if (line.includes('Provision') && line.includes('Sparte')) continue;

    // Try landscape pattern first
    landscapePattern.lastIndex = 0;
    let match = landscapePattern.exec(line);
    if (match) {
      const vsnr = match[2];
      if (!seenContracts.has(vsnr)) {
        seenContracts.add(vsnr);
        const sparte = detectSparte(match[5]);
        transactions.push({
          datum: parseGermanDate(match[1]),
          vertragsnummer: vsnr,
          kundenname: match[3]?.trim(),
          produktart: match[4]?.trim() || 'Unbekannt',
          sparte,
          beitrag: parseGermanNumber(match[7]),
          bewertungssumme: parseGermanNumber(match[8]),
          provisionsbetrag: parseGermanNumber(match[10]),
          provisionsart: detectProvisionsartFromCode(match[6])
        });
      }
      continue;
    }

    // Try simple pattern
    simplePattern.lastIndex = 0;
    match = simplePattern.exec(line);
    if (match) {
      const vsnr = match[2];
      if (!seenContracts.has(vsnr)) {
        seenContracts.add(vsnr);
        transactions.push({
          datum: parseGermanDate(match[1]),
          vertragsnummer: vsnr,
          produktart: match[3]?.trim() || 'Unbekannt',
          sparte: detectSparteFromProduct(match[3] || ''),
          provisionsbetrag: parseGermanNumber(match[5]),
          provisionsart: detectProvisionsart(match[4])
        });
      }
      continue;
    }

    // Try contract pattern
    contractPattern.lastIndex = 0;
    match = contractPattern.exec(line);
    if (match) {
      const vsnr = match[1];
      if (!seenContracts.has(vsnr)) {
        seenContracts.add(vsnr);
        transactions.push({
          vertragsnummer: vsnr,
          beitrag: parseGermanNumber(match[2]),
          provisionsbetrag: parseGermanNumber(match[3]),
          provisionsart: detectProvisionsart(line),
          sparte: detectSparteFromContract(vsnr)
        });
      }
    }
  }

  return transactions;
}

function detectSparte(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('leben') || lower === 'lv') return 'LV';
  if (lower.includes('pkv') || lower === 'kv' || lower.includes('kranken')) return 'KV';
  if (lower.includes('sach') || lower === 'shuk') return 'SHUK';
  if (lower.includes('kfz')) return 'Kfz';
  return 'LV';
}

function detectSparteFromProduct(product: string): string {
  const lower = product.toLowerCase();
  if (lower.includes('leben') || lower.includes('risiko') || lower.includes('rente')) return 'LV';
  if (lower.includes('kranken') || lower.includes('pkv') || lower.includes('pfleg')) return 'KV';
  if (lower.includes('haftpflicht') || lower.includes('wohn') || lower.includes('hausrat')) return 'SHUK';
  if (lower.includes('kfz') || lower.includes('auto')) return 'Kfz';
  return 'LV';
}

function detectSparteFromContract(vsnr: string): string {
  const prefix = vsnr.split('-')[0]?.toUpperCase();
  if (prefix === 'LV') return 'LV';
  if (prefix === 'KV') return 'KV';
  if (prefix === 'SHUK') return 'SHUK';
  if (prefix === 'KFZ') return 'Kfz';
  return 'LV';
}

function detectProvisionsartFromCode(code: string): Transaction['provisionsart'] {
  const upper = code.toUpperCase();
  if (upper === 'AP' || upper === 'CTG') return 'Abschluss';
  if (upper === 'BP' || upper === 'FP') return 'Bestand';
  if (upper === 'ST') return 'Storno';
  if (upper === 'DYN') return 'Dynamik';
  if (upper === 'NP') return 'Nachprovision';
  if (upper === 'RA') return 'Storno'; // Rückabrechnung
  if (upper === 'BE') return 'Dynamik'; // Beitragserhöhung
  return 'Sonstig';
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

/**
 * Generiert eine Erklärung ohne API basierend auf dem Regelwerk
 * (Fallback wenn kein API-Key verfügbar)
 */
export function generateFallbackExplanation(
  transaction: Transaction
): TransactionExplanation {
  // First check if this is a demo transaction with pre-computed explanation
  const demoExplanation = getDemoExplanation(transaction.id);
  if (demoExplanation) {
    return demoExplanation;
  }

  // Match transaction to rules using the intelligent matcher
  const matchResults = matchTransactionToRules(transaction);

  if (matchResults.length === 0) {
    return {
      transactionId: transaction.id,
      appliedRules: [],
      explanation: 'Keine passende Provisionsregel gefunden.',
      calculation: 'Automatische Berechnung nicht möglich',
      confidence: 'low',
      notes: 'Laden Sie einen API-Key ein, um eine detaillierte KI-Analyse zu erhalten.'
    };
  }

  // Get top matching rules (up to 3)
  const topMatches = matchResults.slice(0, 3);
  const primaryRule = topMatches[0].rule;

  // Generate calculation steps based on matched rules
  const calculationSteps: CalculationStep[] = [];
  let stepNum = 1;

  // Step 1: Determine calculation basis
  const beitrag = transaction.beitrag || 0;
  const bewertungssumme = transaction.bewertungssumme || beitrag * 12;

  // Find relevant calculation rules
  const basisRules = topMatches.filter(m =>
    m.rule.category === 'Berechnung'
  );

  if (basisRules.length > 0) {
    const basisRule = basisRules[0].rule;
    calculationSteps.push({
      step: stepNum++,
      label: basisRule.name,
      description: basisRule.description,
      formula: basisRule.formula || '',
      inputValues: { beitrag },
      calculation: `Basis: ${beitrag.toLocaleString('de-DE')} €`,
      result: beitrag,
      resultLabel: 'Berechnungsgrundlage',
      ruleReference: createRuleReference(basisRule)
    });
  }

  // Step 2: Apply main provision rule
  const mainRules = topMatches.filter(m =>
    m.rule.category === transaction.provisionsart ||
    ['Abschluss', 'Bestand', 'Storno', 'Dynamik'].includes(m.rule.category)
  );

  if (mainRules.length > 0) {
    const mainRule = mainRules[0].rule;
    calculationSteps.push({
      step: stepNum++,
      label: mainRule.name,
      description: mainRule.description,
      formula: mainRule.formula || '',
      inputValues: { basis: bewertungssumme },
      calculation: mainRule.formula
        ? `${mainRule.formula} = ${transaction.provisionsbetrag.toLocaleString('de-DE')} €`
        : `Provision: ${transaction.provisionsbetrag.toLocaleString('de-DE')} €`,
      result: transaction.provisionsbetrag,
      resultLabel: 'Provisionsbetrag',
      ruleReference: createRuleReference(mainRule)
    });
  }

  // Generate summary
  const summary = `${transaction.provisionsart}provision für ${transaction.produktart} nach ${primaryRule.paragraph}`;

  // Generate explanation text
  const explanation = `Diese ${transaction.provisionsart}provision wurde gemäß ${primaryRule.document} (${primaryRule.paragraph}) berechnet. ` +
    `${primaryRule.description}`;

  // Generate calculation string
  const calculation = primaryRule.formula
    ? `${primaryRule.formula} = ${transaction.provisionsbetrag.toLocaleString('de-DE')} €`
    : `${transaction.provisionsbetrag.toLocaleString('de-DE')} €`;

  // Determine confidence
  const confidence: 'high' | 'medium' | 'low' =
    topMatches[0].matchScore >= 70 ? 'high' :
    topMatches[0].matchScore >= 40 ? 'medium' : 'low';

  return {
    transactionId: transaction.id,
    summary,
    appliedRules: topMatches.map(m => ({
      id: m.rule.id,
      name: m.rule.name,
      category: m.rule.category
    })),
    explanation,
    calculation,
    calculationSteps: calculationSteps.length > 0 ? calculationSteps : undefined,
    finalAmount: transaction.provisionsbetrag,
    confidence,
    confidenceReasons: [
      `Regelübereinstimmung: ${topMatches[0].matchScore}% (${topMatches[0].matchReason})`,
      topMatches.length > 1 ? `${topMatches.length} potenzielle Regeln gefunden` : 'Eindeutige Regelzuordnung',
      'Automatische Analyse ohne KI-Validierung'
    ],
    notes: 'Diese Erklärung wurde automatisch basierend auf dem Regelwerk generiert. ' +
      'Für eine detailliertere KI-Analyse einen API-Key eingeben.'
  };
}

/**
 * Erklärt alle Transaktionen - mit API wenn verfügbar, sonst Fallback
 */
export async function explainAllTransactionsWithFallback(
  transactions: Transaction[],
  rules: ProvisionRule[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<TransactionExplanation[]> {
  const useApi = isClientInitialized() && rules.length > 0;
  const explanations: TransactionExplanation[] = [];
  const total = transactions.length;

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    onProgress?.(i + 1, total, useApi
      ? `KI-Analyse Transaktion ${i + 1} von ${total}...`
      : `Regelwerk-Analyse Transaktion ${i + 1} von ${total}...`
    );

    let explanation: TransactionExplanation;

    if (useApi) {
      try {
        explanation = await explainTransaction(transaction, rules);
      } catch (error) {
        // Fallback to rule-based explanation if API fails
        console.warn('API-Aufruf fehlgeschlagen, nutze Fallback:', error);
        explanation = generateFallbackExplanation(transaction);
      }
    } else {
      // Use fallback without API
      explanation = generateFallbackExplanation(transaction);
    }

    explanations.push(explanation);

    // Small delay for progress visibility
    if (i < transactions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, useApi ? 300 : 50));
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
