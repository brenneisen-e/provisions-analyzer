import React, { useState, useCallback } from 'react';
import { ArrowLeft, Search, FileDown, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { Button, Input, Card, CardHeader, ProgressBar, Select, ConfidenceBadge } from '../components/ui';
import { FileUpload } from '../components/FileUpload';
import { useAppStore } from '../stores/appStore';
import { useRulesStore } from '../stores/rulesStore';
import { useTransactionsStore } from '../stores/transactionsStore';
import { extractTextFromPDF } from '../services/pdfParser';
import { parseTransactionsFromText, explainAllTransactions } from '../services/transactionMatcher';
import { formatCurrency, formatDate } from '../utils/helpers';
import { ExportModal } from './ExportModal';
import type { Transaction } from '../types';

export const AnalyzeView: React.FC = () => {
  const { setCurrentView, addNotification } = useAppStore();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('setup')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Zurück
        </Button>

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
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

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
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  explanation,
  isExpanded,
  isFlagged,
  onToggle,
  onToggleFlag
}) => {
  const isNegative = transaction.provisionsbetrag < 0;

  return (
    <>
      <tr
        className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
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
        <td className="px-4 py-3 text-sm font-medium text-gray-900">
          {transaction.vertragsnummer}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {transaction.produktart}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {transaction.provisionsart}
        </td>
        <td className={`px-4 py-3 text-sm text-right font-medium ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
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
            className={`p-1 rounded hover:bg-gray-100 ${isFlagged ? 'text-red-500' : 'text-gray-300'}`}
          >
            <Flag className="w-4 h-4" />
          </button>
        </td>
      </tr>

      {/* Expanded Details */}
      {isExpanded && explanation && (
        <tr className="bg-gray-50">
          <td colSpan={8} className="px-4 py-4">
            <div className="ml-8 space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Erklärung</h4>
                <p className="text-sm text-gray-600">{explanation.explanation}</p>
              </div>

              {explanation.calculation && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Berechnung</h4>
                  <p className="text-sm text-gray-600 font-mono bg-white px-3 py-2 rounded border border-gray-200">
                    {explanation.calculation}
                  </p>
                </div>
              )}

              {explanation.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Hinweise</h4>
                  <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded">
                    {explanation.notes}
                  </p>
                </div>
              )}

              {transaction.beitrag && (
                <div className="text-xs text-gray-500">
                  Beitrag: {formatCurrency(transaction.beitrag)}
                  {transaction.bewertungssumme && ` | Bewertungssumme: ${formatCurrency(transaction.bewertungssumme)}`}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
