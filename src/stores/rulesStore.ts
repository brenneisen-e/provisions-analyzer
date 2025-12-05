import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProvisionRule, DocumentChunk, AnalysisProgress } from '../types';

interface RulesState {
  // Data
  rules: ProvisionRule[];
  chunks: DocumentChunk[];
  documentName: string | null;

  // Progress
  analysisProgress: AnalysisProgress;

  // Actions
  setRules: (rules: ProvisionRule[]) => void;
  addRules: (rules: ProvisionRule[]) => void;
  setChunks: (chunks: DocumentChunk[]) => void;
  setDocumentName: (name: string | null) => void;
  setAnalysisProgress: (progress: Partial<AnalysisProgress>) => void;
  resetProgress: () => void;
  clearAll: () => void;

  // Getters
  getRuleById: (id: string) => ProvisionRule | undefined;
  getRulesByCategory: (category: ProvisionRule['category']) => ProvisionRule[];
  getRulesByProduct: (product: string) => ProvisionRule[];
}

const initialProgress: AnalysisProgress = {
  stage: 'idle',
  current: 0,
  total: 0,
  message: ''
};

export const useRulesStore = create<RulesState>()(
  persist(
    (set, get) => ({
      // Initial State
      rules: [],
      chunks: [],
      documentName: null,
      analysisProgress: initialProgress,

      // Actions
      setRules: (rules) => set({ rules }),

      addRules: (newRules) => set((state) => ({
        rules: [...state.rules, ...newRules]
      })),

      setChunks: (chunks) => set({ chunks }),

      setDocumentName: (name) => set({ documentName: name }),

      setAnalysisProgress: (progress) => set((state) => ({
        analysisProgress: { ...state.analysisProgress, ...progress }
      })),

      resetProgress: () => set({ analysisProgress: initialProgress }),

      clearAll: () => set({
        rules: [],
        chunks: [],
        documentName: null,
        analysisProgress: initialProgress
      }),

      // Getters
      getRuleById: (id) => get().rules.find(r => r.id === id),

      getRulesByCategory: (category) =>
        get().rules.filter(r => r.category === category),

      getRulesByProduct: (product) =>
        get().rules.filter(r =>
          r.products.some(p =>
            p.toLowerCase().includes(product.toLowerCase())
          )
        )
    }),
    {
      name: 'provisions-rules-storage',
      partialize: (state) => ({
        rules: state.rules,
        chunks: state.chunks,
        documentName: state.documentName
      })
    }
  )
);
