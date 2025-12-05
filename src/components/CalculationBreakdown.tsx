import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Check, Calculator, Info } from 'lucide-react';
import type { Transaction, TransactionExplanation, CalculationStep, RuleReference, AppliedRuleInfo } from '../types';
import { ConfidenceBadge } from './ui/Badge';
import { SPARTEN_ICONS, PROVISIONSART_COLORS } from '../data/demoData';

interface CalculationBreakdownProps {
  transaction: Transaction;
  explanation: TransactionExplanation;
  onRuleReferenceClick?: (reference: RuleReference) => void;
  isExpanded?: boolean;
  compact?: boolean;
}

export const CalculationBreakdown: React.FC<CalculationBreakdownProps> = ({
  transaction,
  explanation,
  onRuleReferenceClick,
  isExpanded: initialExpanded = false,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1]));

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const sparteIcon = SPARTEN_ICONS[transaction.sparte || ''] || '📄';
  const artColors = PROVISIONSART_COLORS[transaction.provisionsart] || PROVISIONSART_COLORS['Sonstig'];

  // Compact preview mode
  if (compact) {
    return (
      <div
        className="bg-slate-50 rounded-lg p-4 cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {explanation.summary || explanation.explanation}
            </p>
            {explanation.calculationSteps && explanation.calculationSteps.length > 0 && (
              <p className="text-sm text-gray-600 mt-1 font-mono">
                {explanation.calculationSteps[explanation.calculationSteps.length - 1]?.calculation}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">Berechnungsnachweis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Transaktion</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              {sparteIcon} {transaction.kundenname || 'Unbekannt'} | {transaction.vertragsnummer}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Produkt</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{transaction.produktart}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Provisionsbetrag</p>
            <p className={`text-lg font-bold mt-0.5 ${transaction.provisionsbetrag < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatCurrency(transaction.provisionsbetrag)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100">
        <div className="flex items-start gap-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${artColors.bg} ${artColors.text} ${artColors.border} border`}>
            {transaction.provisionsart}
          </div>
          <p className="text-sm text-gray-700 flex-1">
            {explanation.summary || explanation.explanation}
          </p>
          <ConfidenceBadge confidence={explanation.confidence} />
        </div>
      </div>

      {/* Calculation Steps */}
      {explanation.calculationSteps && explanation.calculationSteps.length > 0 && (
        <div className="px-6 py-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-8 bottom-4 w-0.5 bg-gray-200" />

            {explanation.calculationSteps.map((step, index) => (
              <CalculationStepItem
                key={step.step}
                step={step}
                isLast={index === explanation.calculationSteps!.length - 1}
                isExpanded={expandedSteps.has(step.step)}
                onToggle={() => toggleStep(step.step)}
                onRuleReferenceClick={onRuleReferenceClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Final Result */}
      <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">Ergebnis</p>
            <p className={`text-xl font-bold ${(explanation.finalAmount || transaction.provisionsbetrag) < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {formatCurrency(explanation.finalAmount || transaction.provisionsbetrag)}
            </p>
          </div>
        </div>
      </div>

      {/* Applied Rules */}
      {explanation.appliedRules && explanation.appliedRules.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            Angewandte Regelungen
          </p>
          <div className="flex flex-wrap gap-2">
            {explanation.appliedRules.map((rule, index) => {
              const ruleInfo = typeof rule === 'string' ? { id: rule, name: rule } : rule as AppliedRuleInfo;
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700"
                >
                  <BookOpen className="w-3 h-3 mr-1.5 text-gray-400" />
                  {ruleInfo.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Confidence Reasons */}
      {explanation.confidenceReasons && explanation.confidenceReasons.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                Konfidenz-Begründung
              </p>
              <ul className="text-sm text-gray-600 space-y-0.5">
                {explanation.confidenceReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-1">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {explanation.notes && (
        <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Hinweis:</span> {explanation.notes}
          </p>
        </div>
      )}
    </div>
  );
};

// Individual Calculation Step Component
interface CalculationStepItemProps {
  step: CalculationStep;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onRuleReferenceClick?: (reference: RuleReference) => void;
}

const CalculationStepItem: React.FC<CalculationStepItemProps> = ({
  step,
  isLast: _isLast,
  isExpanded,
  onToggle,
  onRuleReferenceClick
}) => {
  return (
    <div className="relative pl-10 pb-4">
      {/* Step indicator */}
      <div
        className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-colors
          ${isExpanded
            ? 'bg-teal-600 text-white'
            : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-teal-500'
          }`}
        onClick={onToggle}
      >
        {step.step}
      </div>

      {/* Step content */}
      <div>
        {/* Step header */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onToggle}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
            Schritt {step.step}: {step.label}
          </h4>
        </div>

        {/* Collapsed preview */}
        {!isExpanded && (
          <p className="text-sm text-gray-500 mt-1 ml-6 font-mono">
            {step.calculation} = {typeof step.result === 'number'
              ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(step.result)
              : step.result
            }
          </p>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 ml-6 space-y-4 animate-fadeIn">
            {/* Description */}
            <p className="text-sm text-gray-600">
              {step.description}
            </p>

            {/* Formula Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="font-mono text-center space-y-2">
                {/* Formula */}
                <div className="text-base text-gray-700">
                  {step.formula}
                </div>
                {/* Calculation with values */}
                <div className="text-lg font-semibold text-gray-900">
                  {step.calculation}
                </div>
              </div>

              {/* Input values */}
              {Object.keys(step.inputValues).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Eingabewerte</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(step.inputValues).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                        title={key}
                      >
                        <span className="text-gray-500">{key}:</span>
                        <span className="ml-1 font-semibold text-gray-900">
                          {typeof value === 'number' && value > 100
                            ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
                            : value
                          }
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Result */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">{step.resultLabel}</span>
              <span className="text-base font-semibold text-gray-900">
                {typeof step.result === 'number'
                  ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(step.result)
                  : step.result
                }
              </span>
            </div>

            {/* Rule Reference */}
            {step.ruleReference && (
              <div
                className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-3 cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => onRuleReferenceClick?.(step.ruleReference)}
              >
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">
                      {step.ruleReference.paragraph} {step.ruleReference.document}
                      {step.ruleReference.pageNumber && (
                        <span className="text-amber-600 font-normal"> (Seite {step.ruleReference.pageNumber})</span>
                      )}
                    </p>
                    <p className="text-sm text-amber-900 italic mt-1">
                      "{step.ruleReference.quote}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculationBreakdown;
