// ContractShield — User Store
// Manages user profile, subscription, and review limits

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Subscription } from '../types';
import { TIERS } from '../theme';

interface UserState {
  // Profile
  name: string;
  email: string;
  joinedAt: string;
  totalReviews: number;

  // Subscription
  subscription: Subscription;

  // API key (stored locally for MVP — user provides their own)
  claudeApiKey: string;

  // Actions
  setProfile: (name: string, email: string) => void;
  setApiKey: (key: string) => void;
  incrementReviews: () => void;
  canReview: () => boolean;
  getRemainingReviews: () => number;
  upgradeToPro: () => void;
  resetMonthlyCount: () => void;
}

function getMonthResetDate(): string {
  const now = new Date();
  const reset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return reset.toISOString();
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      email: '',
      joinedAt: new Date().toISOString(),
      totalReviews: 0,

      subscription: {
        tier: 'free',
        reviewsUsedThisMonth: 0,
        monthResetDate: getMonthResetDate(),
      },

      claudeApiKey: '',

      setProfile: (name, email) => set({ name, email }),

      setApiKey: (key) => set({ claudeApiKey: key }),

      incrementReviews: () => {
        const state = get();
        // Check if month has reset
        const now = new Date();
        const resetDate = new Date(state.subscription.monthResetDate);
        if (now >= resetDate) {
          set({
            totalReviews: state.totalReviews + 1,
            subscription: {
              ...state.subscription,
              reviewsUsedThisMonth: 1,
              monthResetDate: getMonthResetDate(),
            },
          });
        } else {
          set({
            totalReviews: state.totalReviews + 1,
            subscription: {
              ...state.subscription,
              reviewsUsedThisMonth: state.subscription.reviewsUsedThisMonth + 1,
            },
          });
        }
      },

      canReview: () => {
        const state = get();
        if (state.subscription.tier === 'pro') return true;
        if (!state.claudeApiKey) return false;
        // Check month reset
        const now = new Date();
        const resetDate = new Date(state.subscription.monthResetDate);
        const used =
          now >= resetDate ? 0 : state.subscription.reviewsUsedThisMonth;
        return used < TIERS.free.reviewsPerMonth;
      },

      getRemainingReviews: () => {
        const state = get();
        if (state.subscription.tier === 'pro') return -1; // unlimited
        const now = new Date();
        const resetDate = new Date(state.subscription.monthResetDate);
        const used =
          now >= resetDate ? 0 : state.subscription.reviewsUsedThisMonth;
        return Math.max(0, TIERS.free.reviewsPerMonth - used);
      },

      upgradeToPro: () =>
        set((state) => ({
          subscription: {
            ...state.subscription,
            tier: 'pro',
            subscribedAt: new Date().toISOString(),
          },
        })),

      resetMonthlyCount: () =>
        set((state) => ({
          subscription: {
            ...state.subscription,
            reviewsUsedThisMonth: 0,
            monthResetDate: getMonthResetDate(),
          },
        })),
    }),
    {
      name: 'contract-shield-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        name: state.name,
        email: state.email,
        joinedAt: state.joinedAt,
        totalReviews: state.totalReviews,
        subscription: state.subscription,
        claudeApiKey: state.claudeApiKey,
      }),
    }
  )
);
