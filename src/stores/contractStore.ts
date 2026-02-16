// ContractShield — Contract Store
// Manages contract analysis history with AsyncStorage persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ContractAnalysis, StoredContract } from '../types';

interface ContractState {
  // Full analyses (most recent N kept in memory)
  analyses: ContractAnalysis[];
  // Lightweight history list
  history: StoredContract[];
  // Currently viewing
  currentAnalysis: ContractAnalysis | null;
  // Processing state
  isAnalyzing: boolean;
  analysisProgress: string;

  // Actions
  addAnalysis: (analysis: ContractAnalysis) => void;
  setCurrentAnalysis: (analysis: ContractAnalysis | null) => void;
  toggleFavorite: (id: string) => void;
  deleteContract: (id: string) => void;
  setAnalyzing: (isAnalyzing: boolean, progress?: string) => void;
  getAnalysisById: (id: string) => ContractAnalysis | undefined;
}

const MAX_STORED_ANALYSES = 50;

export const useContractStore = create<ContractState>()(
  persist(
    (set, get) => ({
      analyses: [],
      history: [],
      currentAnalysis: null,
      isAnalyzing: false,
      analysisProgress: '',

      addAnalysis: (analysis) => {
        const historyEntry: StoredContract = {
          id: analysis.id,
          title: analysis.title,
          contractType: analysis.contractType,
          overallRisk: analysis.overallRisk,
          clauseCount: analysis.clauses.length,
          redFlagCount: analysis.redFlags.length,
          createdAt: analysis.createdAt,
          isFavorite: false,
        };
        set((state) => ({
          analyses: [analysis, ...state.analyses].slice(0, MAX_STORED_ANALYSES),
          history: [historyEntry, ...state.history],
          currentAnalysis: analysis,
        }));
      },

      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

      toggleFavorite: (id) =>
        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
          ),
        })),

      deleteContract: (id) =>
        set((state) => ({
          analyses: state.analyses.filter((a) => a.id !== id),
          history: state.history.filter((h) => h.id !== id),
          currentAnalysis:
            state.currentAnalysis?.id === id ? null : state.currentAnalysis,
        })),

      setAnalyzing: (isAnalyzing, progress = '') =>
        set({ isAnalyzing, analysisProgress: progress }),

      getAnalysisById: (id) => get().analyses.find((a) => a.id === id),
    }),
    {
      name: 'contract-shield-contracts',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        analyses: state.analyses,
        history: state.history,
      }),
    }
  )
);
