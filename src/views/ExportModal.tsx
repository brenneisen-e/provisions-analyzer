import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Modal, Button } from '../components/ui';
import { generateAnalysisReport, downloadBlob } from '../services/pdfGenerator';
import type { Transaction, TransactionExplanation } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  explanations: Map<string, TransactionExplanation>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  explanations
}) => {
  const [options, setOptions] = useState({
    filterLowConfidence: false,
    groupByType: false,
    includeCalculations: true
  });

  const handleExport = () => {
    const blob = generateAnalysisReport(transactions, explanations, options);
    const date = new Date().toISOString().split('T')[0];
    downloadBlob(blob, `Provisionsanalyse-${date}.pdf`);
    onClose();
  };

  // Count low confidence transactions
  const lowConfidenceCount = transactions.filter(t => {
    const exp = explanations.get(t.id);
    return exp?.confidence === 'low';
  }).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Analyse exportieren"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Als PDF exportieren
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Exportieren Sie die Analyseergebnisse als PDF-Report.
        </p>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.filterLowConfidence}
              onChange={(e) => setOptions(prev => ({
                ...prev,
                filterLowConfidence: e.target.checked
              }))}
              className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Nur niedrige Konfidenz
              </span>
              <p className="text-xs text-gray-500">
                Exportiert nur Transaktionen mit niedriger Konfidenz ({lowConfidenceCount} Stück)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.groupByType}
              onChange={(e) => setOptions(prev => ({
                ...prev,
                groupByType: e.target.checked
              }))}
              className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Nach Provisionsart gruppieren
              </span>
              <p className="text-xs text-gray-500">
                Gruppiert Transaktionen nach Abschluss, Bestand, Storno etc.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeCalculations}
              onChange={(e) => setOptions(prev => ({
                ...prev,
                includeCalculations: e.target.checked
              }))}
              className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Berechnungen einschließen
              </span>
              <p className="text-xs text-gray-500">
                Zeigt die detaillierte Berechnung für jede Transaktion
              </p>
            </div>
          </label>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Zusammenfassung</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              {options.filterLowConfidence
                ? `${lowConfidenceCount} Transaktionen (niedrige Konfidenz)`
                : `${transactions.length} Transaktionen (alle)`
              }
            </li>
            <li>
              {options.groupByType ? 'Gruppiert nach Art' : 'Chronologisch sortiert'}
            </li>
            <li>
              {options.includeCalculations ? 'Mit Berechnungen' : 'Ohne Berechnungen'}
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
