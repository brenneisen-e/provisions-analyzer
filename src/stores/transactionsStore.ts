import { create } from 'zustand';
import type { Transaction, TransactionExplanation, TransactionAnalysisProgress } from '../types';

interface TransactionsState {
  // Data
  transactions: Transaction[];
  explanations: Map<string, TransactionExplanation>;
  documentName: string | null;

  // Progress
  analysisProgress: TransactionAnalysisProgress;

  // UI State
  selectedTransactionId: string | null;
  filterText: string;
  filterConfidence: 'all' | 'high' | 'medium' | 'low';
  sortColumn: keyof Transaction | null;
  sortDirection: 'asc' | 'desc';

  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  setExplanation: (transactionId: string, explanation: TransactionExplanation) => void;
  setExplanations: (explanations: TransactionExplanation[]) => void;
  setDocumentName: (name: string | null) => void;
  setAnalysisProgress: (progress: Partial<TransactionAnalysisProgress>) => void;
  resetProgress: () => void;

  // UI Actions
  setSelectedTransaction: (id: string | null) => void;
  setFilterText: (text: string) => void;
  setFilterConfidence: (confidence: 'all' | 'high' | 'medium' | 'low') => void;
  setSorting: (column: keyof Transaction | null, direction?: 'asc' | 'desc') => void;

  clearAll: () => void;

  // Getters
  getFilteredTransactions: () => Transaction[];
  getExplanation: (transactionId: string) => TransactionExplanation | undefined;
}

const initialProgress: TransactionAnalysisProgress = {
  stage: 'idle',
  current: 0,
  total: 0,
  message: ''
};

export const useTransactionsStore = create<TransactionsState>()((set, get) => ({
  // Initial State
  transactions: [],
  explanations: new Map(),
  documentName: null,
  analysisProgress: initialProgress,
  selectedTransactionId: null,
  filterText: '',
  filterConfidence: 'all',
  sortColumn: null,
  sortDirection: 'asc',

  // Actions
  setTransactions: (transactions) => set({
    transactions,
    explanations: new Map()
  }),

  setExplanation: (transactionId, explanation) => set((state) => {
    const newExplanations = new Map(state.explanations);
    newExplanations.set(transactionId, explanation);
    return { explanations: newExplanations };
  }),

  setExplanations: (explanations) => set(() => {
    const newMap = new Map<string, TransactionExplanation>();
    explanations.forEach(exp => newMap.set(exp.transactionId, exp));
    return { explanations: newMap };
  }),

  setDocumentName: (name) => set({ documentName: name }),

  setAnalysisProgress: (progress) => set((state) => ({
    analysisProgress: { ...state.analysisProgress, ...progress }
  })),

  resetProgress: () => set({ analysisProgress: initialProgress }),

  // UI Actions
  setSelectedTransaction: (id) => set({ selectedTransactionId: id }),

  setFilterText: (text) => set({ filterText: text }),

  setFilterConfidence: (confidence) => set({ filterConfidence: confidence }),

  setSorting: (column, direction) => set((state) => ({
    sortColumn: column,
    sortDirection: direction || (
      state.sortColumn === column && state.sortDirection === 'asc'
        ? 'desc'
        : 'asc'
    )
  })),

  clearAll: () => set({
    transactions: [],
    explanations: new Map(),
    documentName: null,
    analysisProgress: initialProgress,
    selectedTransactionId: null,
    filterText: '',
    filterConfidence: 'all'
  }),

  // Getters
  getFilteredTransactions: () => {
    const state = get();
    let filtered = [...state.transactions];

    // Text filter
    if (state.filterText) {
      const search = state.filterText.toLowerCase();
      filtered = filtered.filter(t =>
        t.vertragsnummer.toLowerCase().includes(search) ||
        t.produktart.toLowerCase().includes(search) ||
        t.kundenname?.toLowerCase().includes(search) ||
        t.provisionsart.toLowerCase().includes(search)
      );
    }

    // Confidence filter
    if (state.filterConfidence !== 'all') {
      filtered = filtered.filter(t => {
        const exp = state.explanations.get(t.id);
        return exp?.confidence === state.filterConfidence;
      });
    }

    // Sorting
    if (state.sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[state.sortColumn!];
        const bVal = b[state.sortColumn!];

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return state.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  },

  getExplanation: (transactionId) => get().explanations.get(transactionId)
}));
