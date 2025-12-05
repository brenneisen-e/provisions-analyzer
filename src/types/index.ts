// Provisionsregel aus den Bestimmungen extrahiert
export interface ProvisionRule {
  id: string;
  name: string;
  category: 'Abschluss' | 'Bestand' | 'Storno' | 'Dynamik' | 'Beitragsänderung' | 'Nachbearbeitung' | 'Sonstig';
  products: string[];
  conditions: string;
  formula: string;
  parameters: {
    rate?: string;
    basis?: string;
    staffel?: StaffelItem[];
    stornohaftung?: string;
    [key: string]: unknown;
  };
  notes?: string;
  sourceChunk?: string;
  /** Quellenangabe im Vertrag, z.B. "§3 Abs. 2 Provisionsbestimmungen" */
  sourceReference?: string;
}

export interface StaffelItem {
  von: number;
  bis: number | null;
  rate: number;
}

// Transaktion aus einer Provisionsabrechnung
export interface Transaction {
  id: string;
  datum: string;
  vertragsnummer: string;
  produktart: string;
  sparte?: string;
  beitrag?: number;
  bewertungssumme?: number;
  provisionsbetrag: number;
  provisionsart: 'Abschluss' | 'Bestand' | 'Storno' | 'Dynamik' | 'Nachprovision' | 'Beitragserhöhung' | 'Rückabrechnung' | 'Sonstig';
  vermittlernummer?: string;
  kundenname?: string;
  rawText?: string;
  /** Zusatzinfo z.B. bei Storno: Grund, bei Dynamik: Erhöhungsbetrag */
  zusatzinfo?: string;
}

// Regelwerk-Referenz für detaillierte Quellenangaben
export interface RuleReference {
  paragraph: string;                    // "§2 Abs. 3"
  document: string;                     // "Provisionsbestimmungen KV"
  quote: string;                        // Exakter Wortlaut aus dem Regelwerk
  context?: string;                     // Umgebender Text für mehr Kontext
  pageNumber?: number;
  relatedRules?: string[];              // Verwandte Paragraphen
}

// Einzelner Berechnungsschritt
export interface CalculationStep {
  step: number;
  label: string;                          // "Bereinigten Monatsbeitrag ermitteln"
  description: string;                    // Warum dieser Schritt nötig ist
  formula: string;                        // "MB_netto = MB_brutto × 0,90"
  inputValues: Record<string, number>;    // { mb_brutto: 632.14 }
  calculation: string;                    // "632,14 € × 0,90 = 568,93 €"
  result: number;
  resultLabel: string;                    // "Bereinigter Monatsbeitrag"
  ruleReference: RuleReference;
}

// Angewandte Regel mit Details
export interface AppliedRuleInfo {
  id: string;
  name: string;
  category?: string;
}

// Erklärung für eine Transaktion (erweitert für Showcase)
export interface TransactionExplanation {
  transactionId: string;
  appliedRules: (string | AppliedRuleInfo)[];  // Array of strings or AppliedRuleInfo objects
  explanation: string;
  calculation: string;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  // Neue Felder für Step-by-Step Berechnung
  summary?: string;                       // Kurze Zusammenfassung der Berechnung
  calculationSteps?: CalculationStep[];   // Detaillierte Schritte
  finalAmount?: number;
  confidenceReasons?: string[];           // Begründung für Confidence-Level
}

// Chunk aus den Provisionsbestimmungen
export interface DocumentChunk {
  id: string;
  pageStart: number;
  pageEnd: number;
  title?: string;
  content: string;
  type: 'chapter' | 'section' | 'paragraph' | 'table';
}

// App State Types
export interface ApiConfig {
  anthropicApiKey: string;
}

export type ViewType = 'setup' | 'analyze' | 'export';

export interface AnalysisProgress {
  stage: 'idle' | 'parsing' | 'chunking' | 'extracting' | 'complete' | 'error';
  current: number;
  total: number;
  message: string;
}

export interface TransactionAnalysisProgress {
  stage: 'idle' | 'parsing' | 'analyzing' | 'complete' | 'error';
  current: number;
  total: number;
  message: string;
}

// Export Options
export interface ExportOptions {
  filterLowConfidence: boolean;
  groupByType: boolean;
  includeCalculations: boolean;
}

// PDF Text Item
export interface PDFTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName?: string;
}

// Sample Transaction für Generator
export interface SampleTransactionConfig {
  type: 'Abschluss' | 'Bestand' | 'Storno' | 'Dynamik' | 'Nachprovision';
  sparte: 'Leben' | 'Sach' | 'Kranken' | 'KFZ';
}

// PDF Extracted Document
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
