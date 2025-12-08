/**
 * RULE MATCHER SERVICE
 * Intelligently matches transactions to provision rules
 * Used for both demo mode and live mode (Claude-assisted)
 */

import type { Transaction, TransactionExplanation, CalculationStep, RuleReference, AppliedRuleInfo } from '../types';
import {
  ALL_PROVISION_RULES,
  KV_RULES,
  SHUK_RULES,
  LV_RULES,
  KFZ_RULES,
  ALLGEMEIN_RULES,
  DEMO_TRANSACTION_RULE_MAPPINGS,
  getRuleById,
  getMappingForTransaction,
  type ProvisionRule
} from '../data/provisionRules';
import { DEMO_EXPLANATIONS } from '../data/demoData';

export interface RuleMatchResult {
  rule: ProvisionRule;
  matchScore: number;
  matchReason: string;
}

export interface MatchContext {
  sparte?: string;
  provisionsart?: string;
  produktart?: string;
  beitrag?: number;
  provisionsbetrag?: number;
}

/**
 * Get rules applicable to a specific sparte
 */
export function getRulesForSparte(sparte: string): ProvisionRule[] {
  const sparteNormalized = sparte?.toUpperCase();

  switch (sparteNormalized) {
    case 'KV':
    case 'KRANKEN':
    case 'PKV':
      return [...KV_RULES, ...ALLGEMEIN_RULES];
    case 'SHUK':
    case 'SACH':
    case 'HAFTPFLICHT':
      return [...SHUK_RULES, ...ALLGEMEIN_RULES];
    case 'LV':
    case 'LEBEN':
      return [...LV_RULES, ...ALLGEMEIN_RULES];
    case 'KFZ':
      return [...KFZ_RULES, ...ALLGEMEIN_RULES];
    default:
      return [...ALLGEMEIN_RULES];
  }
}

/**
 * Get rules for a specific category
 */
export function getRulesForCategory(category: ProvisionRule['category']): ProvisionRule[] {
  return ALL_PROVISION_RULES.filter(r => r.category === category);
}

/**
 * Match a transaction to potential rules based on context
 */
export function matchTransactionToRules(transaction: Transaction): RuleMatchResult[] {
  const results: RuleMatchResult[] = [];
  const context: MatchContext = {
    sparte: transaction.sparte,
    provisionsart: transaction.provisionsart,
    produktart: transaction.produktart,
    beitrag: transaction.beitrag,
    provisionsbetrag: transaction.provisionsbetrag
  };

  // Get sparte-specific rules
  const sparteRules = getRulesForSparte(context.sparte || '');

  for (const rule of sparteRules) {
    const { score, reason } = calculateMatchScore(rule, context);
    if (score > 0) {
      results.push({
        rule,
        matchScore: score,
        matchReason: reason
      });
    }
  }

  // Sort by match score descending
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculate how well a rule matches the transaction context
 */
function calculateMatchScore(rule: ProvisionRule, context: MatchContext): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // Category match (most important)
  const categoryMap: Record<string, string[]> = {
    'Abschluss': ['Abschluss', 'Nachprovision'],
    'Bestand': ['Bestand'],
    'Storno': ['Storno', 'Rückabrechnung'],
    'Dynamik': ['Dynamik', 'Beitragserhöhung'],
    'Korrektur': ['Nachprovision', 'Rückabrechnung'],
    'Bonus': ['Abschluss', 'Nachprovision'],
    'Berechnung': ['Abschluss', 'Bestand', 'Dynamik'],
    'Änderung': ['Nachprovision', 'Beitragserhöhung'],
    'Auszahlung': ['Bestand'],
    'Anpassung': ['Nachprovision', 'Beitragserhöhung']
  };

  const matchingCategories = categoryMap[rule.category] || [];
  if (context.provisionsart && matchingCategories.includes(context.provisionsart)) {
    score += 50;
    reasons.push(`Kategorie ${rule.category} passt zu ${context.provisionsart}`);
  }

  // Sparte match
  const sparteMap: Record<string, string[]> = {
    'KV': ['KV', 'Kranken', 'PKV'],
    'SHUK': ['SHUK', 'Sach', 'Haftpflicht'],
    'LV': ['LV', 'Leben'],
    'Kfz': ['Kfz', 'KFZ'],
    'Allgemein': ['KV', 'SHUK', 'LV', 'Kfz', 'Kranken', 'PKV', 'Sach', 'Leben']
  };

  const spartAliases = sparteMap[rule.sparte] || [];
  if (context.sparte && spartAliases.includes(context.sparte)) {
    score += 30;
    reasons.push(`Sparte ${rule.sparte} = ${context.sparte}`);
  }

  // Keyword match in product name
  if (context.produktart) {
    const produktLower = context.produktart.toLowerCase();
    const ruleName = rule.name.toLowerCase();
    const ruleDesc = rule.description.toLowerCase();

    const keywords = [
      { word: 'zahn', rules: ['zahn', 'zusatz'] },
      { word: 'vollversicherung', rules: ['vollversicherung', 'pkv'] },
      { word: 'krankentagegeld', rules: ['krankentagegeld', 'ktg'] },
      { word: 'wohngebäude', rules: ['wohngebäude', 'gebäude'] },
      { word: 'hausrat', rules: ['hausrat', 'sach'] },
      { word: 'haftpflicht', rules: ['haftpflicht', 'phv'] },
      { word: 'renten', rules: ['renten', 'lv', 'bws'] },
      { word: 'bu', rules: ['berufsunfähigkeit', 'bu'] },
      { word: 'vollkasko', rules: ['vollkasko', 'kfz'] },
      { word: 'dynamik', rules: ['dynamik', 'erhöhung'] },
      { word: 'storno', rules: ['storno', 'haftung'] },
    ];

    for (const kw of keywords) {
      if (produktLower.includes(kw.word)) {
        if (kw.rules.some(r => ruleName.includes(r) || ruleDesc.includes(r))) {
          score += 20;
          reasons.push(`Produkt enthält "${kw.word}"`);
          break;
        }
      }
    }
  }

  // Negative amount typically means storno or rückabrechnung
  if (context.provisionsbetrag && context.provisionsbetrag < 0) {
    if (rule.category === 'Storno' || rule.category === 'Korrektur') {
      score += 25;
      reasons.push('Negativer Betrag -> Storno/Korrektur');
    }
  }

  return { score, reason: reasons.join('; ') || 'Keine spezifische Übereinstimmung' };
}

/**
 * Get pre-computed explanation for demo transactions by ID
 */
export function getDemoExplanation(transactionId: string): TransactionExplanation | null {
  return DEMO_EXPLANATIONS[transactionId] || null;
}

/**
 * Get pre-computed explanation for demo transactions by contract number
 * This is used when parsing PDFs generates new transaction IDs
 */
export function getDemoExplanationByContract(vertragsnummer: string): TransactionExplanation | null {
  // Find the demo transaction with this contract number
  const { DEMO_TRANSACTIONS } = require('../data/demoData');

  const demoTx = DEMO_TRANSACTIONS.find((t: Transaction) => t.vertragsnummer === vertragsnummer);
  if (demoTx && DEMO_EXPLANATIONS[demoTx.id]) {
    return DEMO_EXPLANATIONS[demoTx.id];
  }
  return null;
}

/**
 * Get rule mapping for a demo transaction
 */
export function getDemoRuleMapping(transactionId: string) {
  return getMappingForTransaction(transactionId);
}

/**
 * Get full rule details for applied rules in an explanation
 */
export function getAppliedRuleDetails(appliedRules: (string | AppliedRuleInfo)[]): ProvisionRule[] {
  const details: ProvisionRule[] = [];

  for (const r of appliedRules) {
    const ruleId = typeof r === 'string' ? r : r.id;
    const rule = getRuleById(ruleId);
    if (rule) {
      details.push(rule);
    }
  }

  return details;
}

/**
 * Create a rule reference from a ProvisionRule
 */
export function createRuleReference(rule: ProvisionRule, quote?: string): RuleReference {
  return {
    paragraph: rule.paragraph,
    document: rule.document,
    quote: quote || rule.description,
    pageNumber: rule.pageNumber
  };
}

/**
 * Generate a basic calculation step from a rule
 */
export function createCalculationStepFromRule(
  rule: ProvisionRule,
  stepNumber: number,
  inputValues: Record<string, number>,
  result: number,
  customDescription?: string
): CalculationStep {
  return {
    step: stepNumber,
    label: rule.name,
    description: customDescription || rule.description,
    formula: rule.formula || '',
    inputValues,
    calculation: rule.formula ? `${rule.formula} = ${result.toFixed(2)} €` : `${result.toFixed(2)} €`,
    result,
    resultLabel: rule.shortName,
    ruleReference: createRuleReference(rule)
  };
}

/**
 * Get summary statistics for demo explanations
 */
export function getDemoExplanationStats() {
  const explanations = Object.values(DEMO_EXPLANATIONS);
  const mappings = DEMO_TRANSACTION_RULE_MAPPINGS;

  return {
    totalExplanations: explanations.length,
    totalMappings: mappings.length,
    highConfidence: explanations.filter(e => e.confidence === 'high').length,
    mediumConfidence: explanations.filter(e => e.confidence === 'medium').length,
    lowConfidence: explanations.filter(e => e.confidence === 'low').length,
    averageSteps: explanations.reduce((sum, e) => sum + (e.calculationSteps?.length || 0), 0) / explanations.length,
    rulesUsed: new Set(mappings.flatMap(m => m.appliedRuleIds)).size,
    totalRulesAvailable: ALL_PROVISION_RULES.length
  };
}

/**
 * Format provision amount for display
 */
export function formatProvisionAmount(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return amount < 0 ? `-${formatted} €` : `${formatted} €`;
}

/**
 * Get confidence label and color
 */
export function getConfidenceInfo(confidence: 'high' | 'medium' | 'low'): { label: string; color: string; bgColor: string } {
  switch (confidence) {
    case 'high':
      return { label: 'Hohe Konfidenz', color: 'text-emerald-700', bgColor: 'bg-emerald-50' };
    case 'medium':
      return { label: 'Mittlere Konfidenz', color: 'text-amber-700', bgColor: 'bg-amber-50' };
    case 'low':
      return { label: 'Niedrige Konfidenz', color: 'text-red-700', bgColor: 'bg-red-50' };
  }
}

export default {
  getRulesForSparte,
  getRulesForCategory,
  matchTransactionToRules,
  getDemoExplanation,
  getDemoExplanationByContract,
  getDemoRuleMapping,
  getAppliedRuleDetails,
  createRuleReference,
  createCalculationStepFromRule,
  getDemoExplanationStats,
  formatProvisionAmount,
  getConfidenceInfo
};
