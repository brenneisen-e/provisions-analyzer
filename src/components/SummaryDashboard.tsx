import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import type { Transaction, TransactionExplanation } from '../types';
import { SPARTEN_ICONS, PROVISIONSART_COLORS } from '../data/demoData';

interface SummaryDashboardProps {
  transactions: Transaction[];
  explanations: Map<string, TransactionExplanation>;
  documentName?: string;
  period?: string;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  transactions,
  explanations,
  documentName,
  period = 'November 2024'
}) => {
  const stats = useMemo(() => {
    // Total provision
    const totalProvision = transactions.reduce((sum, t) => sum + t.provisionsbetrag, 0);

    // By Provisionsart
    const byArt: Record<string, { count: number; sum: number }> = {};
    transactions.forEach(t => {
      if (!byArt[t.provisionsart]) {
        byArt[t.provisionsart] = { count: 0, sum: 0 };
      }
      byArt[t.provisionsart].count++;
      byArt[t.provisionsart].sum += t.provisionsbetrag;
    });

    // By Sparte
    const bySparte: Record<string, { count: number; sum: number }> = {};
    transactions.forEach(t => {
      const sparte = t.sparte || 'Sonstig';
      if (!bySparte[sparte]) {
        bySparte[sparte] = { count: 0, sum: 0 };
      }
      bySparte[sparte].count++;
      bySparte[sparte].sum += t.provisionsbetrag;
    });

    // Confidence analysis
    let highConfidence = 0;
    let mediumConfidence = 0;
    let lowConfidence = 0;
    let noExplanation = 0;

    transactions.forEach(t => {
      const exp = explanations.get(t.id);
      if (!exp) {
        noExplanation++;
      } else if (exp.confidence === 'high') {
        highConfidence++;
      } else if (exp.confidence === 'medium') {
        mediumConfidence++;
      } else {
        lowConfidence++;
      }
    });

    return {
      totalProvision,
      totalTransactions: transactions.length,
      byArt,
      bySparte,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      noExplanation,
      explainedPercent: transactions.length > 0
        ? Math.round(((highConfidence + mediumConfidence + lowConfidence) / transactions.length) * 100)
        : 0,
      highConfidencePercent: transactions.length > 0
        ? Math.round((highConfidence / transactions.length) * 100)
        : 0
    };
  }, [transactions, explanations]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Sort provisions by amount for display
  const sortedArts = Object.entries(stats.byArt).sort((a, b) => Math.abs(b[1].sum) - Math.abs(a[1].sum));
  const sortedSparten = Object.entries(stats.bySparte).sort((a, b) => b[1].sum - a[1].sum);

  // Calculate max for bar widths
  const maxArtSum = Math.max(...Object.values(stats.byArt).map(v => Math.abs(v.sum)));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Übersicht</h2>
            {documentName && (
              <p className="text-teal-100 text-sm mt-0.5">{documentName}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-teal-100 text-sm">{period}</p>
          </div>
        </div>
      </div>

      {/* Total Provision */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Gesamtprovision</p>
          <p className={`text-4xl font-bold mt-1 ${stats.totalProvision < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(stats.totalProvision)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{stats.totalTransactions} Transaktionen</p>
        </div>

        {/* Breakdown by Art */}
        <div className="mt-6 space-y-2">
          {sortedArts.map(([art, data]) => {
            const colors = PROVISIONSART_COLORS[art] || PROVISIONSART_COLORS['Sonstig'];
            const widthPercent = maxArtSum > 0 ? (Math.abs(data.sum) / maxArtSum) * 100 : 0;
            const isNegative = data.sum < 0;

            return (
              <div key={art} className="flex items-center gap-3">
                <span className={`text-sm w-28 ${colors.text}`}>{art}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isNegative ? 'bg-red-400' : 'bg-teal-500'}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <span className={`text-sm font-medium w-24 text-right ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatCurrency(data.sum)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sparten Cards */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Nach Sparte</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sortedSparten.map(([sparte, data]) => {
            const icon = SPARTEN_ICONS[sparte] || '📄';
            const percentage = stats.totalProvision > 0
              ? Math.round((data.sum / stats.totalProvision) * 100)
              : 0;

            return (
              <div
                key={sparte}
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-medium text-gray-700">{sparte}</span>
                </div>
                <p className={`text-lg font-bold ${data.sum < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatCurrency(data.sum)}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{data.count} Verträge</span>
                  <span className="text-xs text-gray-500">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis Status */}
      <div className="px-6 py-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Analyse-Status</p>

        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span className="text-sm text-gray-700">
            <span className="font-semibold">{stats.highConfidence + stats.mediumConfidence + stats.lowConfidence}</span> Transaktionen erklärt
          </span>
        </div>

        {/* Confidence bars */}
        <div className="space-y-2">
          <ConfidenceBar
            label="Vollständig nachvollziehbar"
            count={stats.highConfidence}
            total={stats.totalTransactions}
            color="bg-emerald-500"
            icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
          />
          <ConfidenceBar
            label="Mit Annahmen"
            count={stats.mediumConfidence}
            total={stats.totalTransactions}
            color="bg-amber-500"
            icon={<HelpCircle className="w-4 h-4 text-amber-500" />}
          />
          <ConfidenceBar
            label="Regelwerk-Lücke"
            count={stats.lowConfidence}
            total={stats.totalTransactions}
            color="bg-red-500"
            icon={<AlertCircle className="w-4 h-4 text-red-500" />}
          />
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              {stats.highConfidencePercent}% der Transaktionen vollständig nachvollziehbar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confidence bar helper component
interface ConfidenceBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ label, count, total, color, icon }) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-gray-500 w-12 text-right">{percent}%</span>
      <span className="text-xs text-gray-400 w-16">{label}</span>
    </div>
  );
};

export default SummaryDashboard;
