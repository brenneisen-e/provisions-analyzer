import React, { useState, useCallback } from 'react';
import { ArrowLeft, Search, FileDown, ChevronDown, ChevronUp, Flag, Calculator, AlertTriangle, Sparkles, HeartPulse, Home, TrendingUp, Car, FileText } from 'lucide-react';
import { Button, Input, Card, CardHeader, ProgressBar, Select, ConfidenceBadge } from '../components/ui';
import { FileUpload } from '../components/FileUpload';
import { useAppStore } from '../stores/appStore';
import { useRulesStore } from '../stores/rulesStore';
import { useTransactionsStore } from '../stores/transactionsStore';
import { extractTextFromPDF } from '../services/pdfParser';
import { parseTransactionsFromText, explainAllTransactions } from '../services/transactionMatcher';
import { formatCurrency, formatDate } from '../utils/helpers';
import { ExportModal } from './ExportModal';
import { CalculationBreakdown } from '../components/CalculationBreakdown';
import { RuleReferencePanel, useRuleReferencePanel } from '../components/RuleReferencePanel';
import { SummaryDashboard } from '../components/SummaryDashboard';
import { PROVISIONSART_COLORS } from '../data/demoData';
import type { Transaction, RuleReference } from '../types';

// Sparten Icon Component - einfarbige Lucide Icons
const SparteIcon: React.FC<{ sparte?: string; className?: string }> = ({ sparte, className = 'w-4 h-4' }) => {
  const iconClass = `${className} text-gray-500`;
  switch (sparte?.toUpperCase()) {
    case 'KV':
    case 'KRANKEN':
      return <HeartPulse className={iconClass} />;
    case 'SHUK':
    case 'SACH':
      return <Home className={iconClass} />;
    case 'LV':
    case 'LEBEN':
      return <TrendingUp className={iconClass} />;
    case 'KFZ':
      return <Car className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
};

export const AnalyzeView: React.FC = () => {
  const { setCurrentView, addNotification, demoMode, presenterMode } = useAppStore();
  const { rules } = useRulesStore();
  const {
    transactions,
    explanations,
    analysisProgress,
    filterText,
    filterConfidence,
    setTransactions,
    setExplanation,
    setAnalysisProgress,
    setFilterText,
    setFilterConfidence,
    getFilteredTransactions,
    getExplanation
  } = useTransactionsStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [flaggedTransactions, setFlaggedTransactions] = useState<Set<string>>(new Set());
  const [showFullBreakdown, setShowFullBreakdown] = useState<string | null>(null);

  // Rule reference panel
  const rulePanel = useRuleReferencePanel();

  // Handle rule reference click
  const handleRuleReferenceClick = (reference: RuleReference) => {
    rulePanel.openPanel(reference);
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  // Process provision statement
  const handleProcessStatement = async () => {
    if (!selectedFile) return;

    try {
      // Parse PDF
      setAnalysisProgress({
        stage: 'parsing',
        current: 0,
        total: 100,
        message: 'PDF wird gelesen...'
      });

      const document = await extractTextFromPDF(selectedFile, (current, total) => {
        setAnalysisProgress({
          current: Math.round((current / total) * 100),
          message: `Seite ${current} von ${total}...`
        });
      });

      // Extract transactions
      setAnalysisProgress({
        stage: 'parsing',
        current: 0,
        total: 100,
        message: 'Transaktionen werden extrahiert...'
      });

      const extractedTransactions = await parseTransactionsFromText(document.fullText);
      setTransactions(extractedTransactions);

      if (extractedTransactions.length === 0) {
        setAnalysisProgress({
          stage: 'error',
          current: 0,
          total: 0,
          message: 'Keine Transaktionen in der Abrechnung gefunden'
        });
        addNotification({
          type: 'warning',
          message: 'Keine Transaktionen in der PDF gefunden'
        });
        return;
      }

      // Analyze transactions
      setAnalysisProgress({
        stage: 'analyzing',
        current: 0,
        total: extractedTransactions.length,
        message: 'Transaktionen werden analysiert...'
      });

      const transactionExplanations = await explainAllTransactions(
        extractedTransactions,
        rules,
        (current, total, message) => {
          setAnalysisProgress({ current, total, message });
        }
      );

      // Set explanations
      for (const explanation of transactionExplanations) {
        setExplanation(explanation.transactionId, explanation);
      }

      setAnalysisProgress({
        stage: 'complete',
        current: extractedTransactions.length,
        total: extractedTransactions.length,
        message: `${extractedTransactions.length} Transaktionen analysiert`
      });

      addNotification({
        type: 'success',
        message: `${extractedTransactions.length} Transaktionen erfolgreich analysiert`
      });

    } catch (error) {
      console.error('Fehler bei Abrechnungsverarbeitung:', error);
      setAnalysisProgress({
        stage: 'error',
        current: 0,
        total: 0,
        message: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
      addNotification({
        type: 'error',
        message: 'Fehler bei der Verarbeitung der Abrechnung'
      });
    }
  };

  // Toggle row expansion
  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Toggle flag
  const toggleFlag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFlagged = new Set(flaggedTransactions);
    if (newFlagged.has(id)) {
      newFlagged.delete(id);
    } else {
      newFlagged.add(id);
    }
    setFlaggedTransactions(newFlagged);
  };

  const isProcessing = analysisProgress.stage !== 'idle' &&
    analysisProgress.stage !== 'complete' &&
    analysisProgress.stage !== 'error';

  const filteredTransactions = getFilteredTransactions();
  const hasTransactions = transactions.length > 0;

  const progressPercent = analysisProgress.total > 0
    ? Math.round((analysisProgress.current / analysisProgress.total) * 100)
    : 0;

  // Get selected transaction for full breakdown
  const selectedTransaction = showFullBreakdown
    ? transactions.find(t => t.id === showFullBreakdown)
    : null;
  const selectedExplanation = showFullBreakdown
    ? getExplanation(showFullBreakdown)
    : null;

  return (
    <div className={`space-y-6 ${presenterMode ? 'presenter-mode' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('setup')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Zurück
          </Button>
          {demoMode && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Demo-Modus</span>
            </div>
          )}
        </div>

        {hasTransactions && (
          <Button
            onClick={() => setShowExportModal(true)}
            leftIcon={<FileDown className="w-4 h-4" />}
          >
            Exportieren
          </Button>
        )}
      </div>

      {/* Upload Section */}
      {!hasTransactions && (
        <Card>
          <CardHeader
            title="Provisionsabrechnung analysieren"
            description="Laden Sie eine Provisionsabrechnung zur Analyse hoch"
          />

          {!isProcessing && (
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClear={() => setSelectedFile(null)}
              label="Provisionsabrechnung hochladen"
              description="PDF-Datei mit Ihrer Provisionsabrechnung"
            />
          )}

          {isProcessing && (
            <div className="space-y-3">
              <ProgressBar
                progress={progressPercent}
                label={analysisProgress.stage === 'parsing' ? 'Verarbeitung' : 'Analyse'}
              />
              <p className="text-sm text-gray-600 text-center">
                {analysisProgress.message}
              </p>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleProcessStatement}
              disabled={!selectedFile || isProcessing}
              isLoading={isProcessing}
            >
              Analysieren
            </Button>
          </div>
        </Card>
      )}

      {/* Results Section */}
      {hasTransactions && (
        <>
          {/* Summary Dashboard - shown in demo mode or after analysis */}
          {(demoMode || explanations.size > 0) && (
            <SummaryDashboard
              transactions={transactions}
              explanations={explanations}
              documentName={demoMode ? 'Demo: Provisionsabrechnung November 2024' : undefined}
              period="November 2024"
            />
          )}

          {/* Filters */}
          <Card padding="sm">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Suchen..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="w-40">
                <Select
                  value={filterConfidence}
                  onChange={(value) => setFilterConfidence(value as typeof filterConfidence)}
                  options={[
                    { value: 'all', label: 'Alle Konfidenz' },
                    { value: 'high', label: 'Hoch' },
                    { value: 'medium', label: 'Mittel' },
                    { value: 'low', label: 'Niedrig' }
                  ]}
                />
              </div>
              <div className="text-sm text-gray-500">
                {filteredTransactions.length} von {transactions.length} Transaktionen
              </div>
            </div>
          </Card>

          {/* Transactions Table */}
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                      {/* Expand */}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vertrag
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produkt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Art
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provision
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Konfidenz
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                      {/* Flag */}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      explanation={getExplanation(transaction.id)}
                      isExpanded={expandedRows.has(transaction.id)}
                      isFlagged={flaggedTransactions.has(transaction.id)}
                      onToggle={() => toggleRow(transaction.id)}
                      onToggleFlag={(e) => toggleFlag(transaction.id, e)}
                      onShowFullBreakdown={() => setShowFullBreakdown(transaction.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Full Breakdown Modal */}
      {showFullBreakdown && selectedTransaction && selectedExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900">Detaillierte Berechnung</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullBreakdown(null)}
              >
                Schließen
              </Button>
            </div>
            <div className="p-6">
              <CalculationBreakdown
                transaction={selectedTransaction}
                explanation={selectedExplanation}
                onRuleReferenceClick={handleRuleReferenceClick}
                isExpanded
              />
            </div>
          </div>
        </div>
      )}

      {/* Rule Reference Panel */}
      <RuleReferencePanel
        isOpen={rulePanel.isOpen}
        onClose={rulePanel.closePanel}
        reference={rulePanel.reference}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={transactions}
        explanations={explanations}
      />
    </div>
  );
};

// Transaction Row Component
interface TransactionRowProps {
  transaction: Transaction;
  explanation: ReturnType<typeof useTransactionsStore.getState>['getExplanation'] extends (id: string) => infer R ? R : never;
  isExpanded: boolean;
  isFlagged: boolean;
  onToggle: () => void;
  onToggleFlag: (e: React.MouseEvent) => void;
  onShowFullBreakdown: () => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  explanation,
  isExpanded,
  isFlagged,
  onToggle,
  onToggleFlag,
  onShowFullBreakdown
}) => {
  const isNegative = transaction.provisionsbetrag < 0;
  const isStorno = transaction.provisionsart === 'Storno' || isNegative;
  const artColors = PROVISIONSART_COLORS[transaction.provisionsart] || PROVISIONSART_COLORS['Sonstig'];

  return (
    <>
      <tr
        className={`hover:bg-gray-50 cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/50' : ''} ${isStorno ? 'bg-red-50/30' : ''}`}
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {formatDate(transaction.datum)}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <SparteIcon sparte={transaction.sparte} className="w-4 h-4" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {transaction.kundenname || transaction.vertragsnummer}
              </div>
              <div className="text-xs text-gray-500">{transaction.vertragsnummer}</div>
            </div>
            {isStorno && (
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          <span className="truncate max-w-[200px] block" title={transaction.produktart}>
            {transaction.produktart}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${artColors.bg} ${artColors.text}`}>
            {transaction.provisionsart}
          </span>
        </td>
        <td className={`px-4 py-3 text-sm text-right font-semibold ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
          {formatCurrency(transaction.provisionsbetrag)}
        </td>
        <td className="px-4 py-3 text-center">
          {explanation && (
            <ConfidenceBadge confidence={explanation.confidence} />
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <button
            onClick={onToggleFlag}
            className={`p-1 rounded hover:bg-gray-100 transition-colors ${isFlagged ? 'text-red-500' : 'text-gray-300 hover:text-gray-400'}`}
          >
            <Flag className="w-4 h-4" />
          </button>
        </td>
      </tr>

      {/* Expanded Details */}
      {isExpanded && explanation && (
        <tr className="bg-slate-50">
          <td colSpan={8} className="px-4 py-4">
            <div className="ml-8 space-y-4">
              {/* Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  {explanation.summary || 'Berechnungsnachweis'}
                </h4>
                <p className="text-sm text-gray-600">{explanation.explanation}</p>
              </div>

              {/* Calculation Preview */}
              {explanation.calculation && (
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Berechnung
                    </h4>
                    {explanation.calculationSteps && explanation.calculationSteps.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowFullBreakdown();
                        }}
                        rightIcon={<ChevronDown className="w-3 h-3" />}
                      >
                        Vollständige Berechnung
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 font-mono bg-white px-4 py-3 rounded border border-slate-300">
                    {explanation.calculation}
                  </p>

                  {/* Quick step preview */}
                  {explanation.calculationSteps && explanation.calculationSteps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {explanation.calculationSteps.slice(0, 3).map((step, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 bg-white border border-slate-300 rounded text-xs text-gray-600"
                        >
                          <span className="w-4 h-4 bg-teal-100 text-teal-700 rounded-full text-xs flex items-center justify-center mr-1.5 font-medium">
                            {step.step}
                          </span>
                          {step.label}
                        </span>
                      ))}
                      {explanation.calculationSteps.length > 3 && (
                        <span className="text-xs text-gray-500 self-center">
                          +{explanation.calculationSteps.length - 3} weitere Schritte
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {explanation.notes && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-4 py-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Hinweis:</span> {explanation.notes}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {transaction.beitrag && (
                  <span>Beitrag: <span className="font-medium text-gray-700">{formatCurrency(transaction.beitrag)}</span></span>
                )}
                {transaction.bewertungssumme && (
                  <span>Bewertungssumme: <span className="font-medium text-gray-700">{formatCurrency(transaction.bewertungssumme)}</span></span>
                )}
                {transaction.zusatzinfo && (
                  <span className="text-amber-600">{transaction.zusatzinfo}</span>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
