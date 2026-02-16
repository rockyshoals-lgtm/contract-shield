// ContractShield — Type Definitions

import { RiskLevel } from '../theme';

/** Individual clause extracted from a contract */
export interface ContractClause {
  id: string;
  title: string;
  originalText: string;
  plainEnglish: string;
  riskLevel: RiskLevel;
  riskExplanation: string;
  negotiationTip?: string;
  category: ClauseCategory;
}

export type ClauseCategory =
  | 'payment'
  | 'scope'
  | 'termination'
  | 'liability'
  | 'ip'
  | 'confidentiality'
  | 'non_compete'
  | 'indemnification'
  | 'dispute'
  | 'timeline'
  | 'other';

export const CLAUSE_CATEGORY_LABELS: Record<ClauseCategory, string> = {
  payment: 'Payment Terms',
  scope: 'Scope of Work',
  termination: 'Termination',
  liability: 'Liability',
  ip: 'Intellectual Property',
  confidentiality: 'Confidentiality / NDA',
  non_compete: 'Non-Compete',
  indemnification: 'Indemnification',
  dispute: 'Dispute Resolution',
  timeline: 'Timeline & Deadlines',
  other: 'Other',
};

/** Full analysis result for a contract */
export interface ContractAnalysis {
  id: string;
  title: string;
  contractType: string; // e.g. "Freelance Service Agreement", "NDA", etc.
  overallRisk: RiskLevel;
  overallSummary: string;
  clauses: ContractClause[];
  redFlags: string[];
  missingClauses: string[];
  negotiationSummary: string;
  createdAt: string; // ISO date
  rawText: string;
  inputMethod: 'camera' | 'file' | 'paste';
  fileName?: string;
}

/** Stored contract in history */
export interface StoredContract {
  id: string;
  title: string;
  contractType: string;
  overallRisk: RiskLevel;
  clauseCount: number;
  redFlagCount: number;
  createdAt: string;
  isFavorite: boolean;
}

/** User subscription state */
export interface Subscription {
  tier: 'free' | 'pro';
  reviewsUsedThisMonth: number;
  monthResetDate: string; // ISO date
  subscribedAt?: string;
}

/** User profile */
export interface UserProfile {
  name: string;
  email: string;
  subscription: Subscription;
  totalReviews: number;
  joinedAt: string;
}
