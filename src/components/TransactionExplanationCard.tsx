/**
 * TRANSACTION EXPLANATION CARD
 * Unified component for displaying transaction explanations
 * Works with both demo mode (pre-computed) and live mode (Claude-generated)
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Info,
  FileText,
  HeartPulse,
  Home,
  TrendingUp,
  Car
} from 'lucide-react';
import type { Transaction, TransactionExplanation, CalculationStep, AppliedRuleInfo } from '../types';
import { getAppliedRuleDetails, getConfidenceInfo, formatProvisionAmount } from '../services/ruleMatcher';
import { type ProvisionRule } from '../data/provisionRules';

interface TransactionExplanationCardProps {
  transaction: Transaction;
  explanation: TransactionExplanation | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showRuleDetails?: boolean;
}

// Sparte Icon Component
const SparteIcon: React.FC<{ sparte?: string; className?: string }> = ({
  sparte,
  className = 'w-4 h-4'
}) => {
  const iconClass = `${className} text-gray-500`;
  switch (sparte?.toUpperCase()) {
    case 'KV':
    case 'KRANKEN':
    case 'PKV':
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

// Calculation Step Component
const CalculationStepItem: React.FC<{ step: CalculationStep; isLast: boolean }> = ({ step, isLast }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`relative ${!isLast ? 'pb-6' : ''}`}>
      {/* Connecting line */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
      )}

      <div className="flex gap-3">
        {/* Step number circle */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm z-10">
          {step.step}
        </div>

        {/* Step content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-900 text-sm">
              {step.label}
            </h4>
            <span className="text-sm font-medium text-teal-600 whitespace-nowrap">
              {formatProvisionAmount(step.result)}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {step.description}
          </p>

          {/* Formula and calculation */}
          <div className="mt-2 bg-gray-50 rounded-lg p-3 font-mono text-sm">
            {step.formula && (
              <div className="text-gray-500 mb-1">{step.formula}</div>
            )}
            <div className="text-gray-900">{step.calculation}</div>
          </div>

          {/* Rule reference toggle */}
          {step.ruleReference && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              {step.ruleReference.paragraph} - {step.ruleReference.document}
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {/* Rule reference details */}
          {showDetails && step.ruleReference && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs border-l-2 border-blue-300">
              <div className="font-medium text-blue-800 mb-1">
                {step.ruleReference.paragraph}
              </div>
              <p className="text-blue-700 italic">
                "{step.ruleReference.quote}"
              </p>
              {step.ruleReference.pageNumber && (
                <div className="mt-1 text-blue-600">
                  Seite {step.ruleReference.pageNumber}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Applied Rules List Component
const AppliedRulesList: React.FC<{ appliedRules: (string | AppliedRuleInfo)[] }> = ({ appliedRules }) => {
  const ruleDetails = getAppliedRuleDetails(appliedRules);

  if (ruleDetails.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Angewandte Regeln ({ruleDetails.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {ruleDetails.map((rule: ProvisionRule) => (
          <span
            key={rule.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            title={`${rule.paragraph} - ${rule.description}`}
          >
            <span className="font-medium">{rule.shortName}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">{rule.paragraph}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// Main Component
export const TransactionExplanationCard: React.FC<TransactionExplanationCardProps> = ({
  transaction,
  explanation,
  isExpanded = false,
  onToggleExpand,
  showRuleDetails = true
}) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const toggleExpand = onToggleExpand || (() => setLocalExpanded(!localExpanded));

  if (!explanation) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle className="w-5 h-5" />
          <span>Keine Erklärung verfügbar</span>
        </div>
      </div>
    );
  }

  const confidenceInfo = getConfidenceInfo(explanation.confidence);
  const hasSteps = explanation.calculationSteps && explanation.calculationSteps.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={toggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <SparteIcon sparte={transaction.sparte} className="w-5 h-5" />
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {transaction.kundenname || transaction.vertragsnummer}
            </div>
            <div className="text-sm text-gray-500">
              {transaction.produktart} • {transaction.provisionsart}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Amount */}
          <span className={`font-semibold ${transaction.provisionsbetrag < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatProvisionAmount(transaction.provisionsbetrag)}
          </span>

          {/* Confidence badge */}
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${confidenceInfo.bgColor} ${confidenceInfo.color}`}>
            {explanation.confidence === 'high' ? (
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
            ) : (
              <Info className="w-3 h-3 inline mr-1" />
            )}
            {confidenceInfo.label}
          </span>

          {/* Expand icon */}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Summary */}
          {explanation.summary && (
            <div className="mt-4 p-3 bg-teal-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Calculator className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-teal-800">
                  {explanation.summary}
                </p>
              </div>
            </div>
          )}

          {/* Calculation steps */}
          {hasSteps && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Berechnung Schritt für Schritt
              </h4>
              <div className="space-y-0">
                {explanation.calculationSteps!.map((step, index) => (
                  <CalculationStepItem
                    key={step.step}
                    step={step}
                    isLast={index === explanation.calculationSteps!.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Simple explanation if no steps */}
          {!hasSteps && explanation.explanation && (
            <div className="mt-4">
              <p className="text-sm text-gray-700">{explanation.explanation}</p>
              {explanation.calculation && (
                <div className="mt-2 p-2 bg-gray-50 rounded font-mono text-sm text-gray-700">
                  {explanation.calculation}
                </div>
              )}
            </div>
          )}

          {/* Confidence reasons */}
          {explanation.confidenceReasons && explanation.confidenceReasons.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Begründung Konfidenz
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {explanation.confidenceReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-1 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {explanation.notes && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  {explanation.notes}
                </p>
              </div>
            </div>
          )}

          {/* Applied rules */}
          {showRuleDetails && explanation.appliedRules && explanation.appliedRules.length > 0 && (
            <AppliedRulesList appliedRules={explanation.appliedRules} />
          )}

          {/* Final amount highlight */}
          {explanation.finalAmount !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Auszahlungsbetrag:</span>
                <span className={`text-lg font-bold ${explanation.finalAmount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatProvisionAmount(explanation.finalAmount)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionExplanationCard;
