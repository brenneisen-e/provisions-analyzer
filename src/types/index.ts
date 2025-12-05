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

// Erklärung für eine Transaktion
export interface TransactionExplanation {
  transactionId: string;
  appliedRules: string[];
  explanation: string;
  calculation: string;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
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
