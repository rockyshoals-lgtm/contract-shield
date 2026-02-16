// ContractShield — Design Tokens
// Professional, trustworthy feel for contract review

export const COLORS = {
  // Primary — deep navy blue (trust, professionalism)
  primary: '#1B3A5C',
  primaryLight: '#2A5A8C',
  primaryDark: '#0F2440',

  // Accent — teal/green (safety, protection)
  accent: '#00A896',
  accentLight: '#33C4B4',
  accentDark: '#007A6E',

  // Risk levels
  riskHigh: '#E63946',
  riskHighBg: '#FDE8EA',
  riskMedium: '#F4A261',
  riskMediumBg: '#FEF3E2',
  riskLow: '#2A9D8F',
  riskLowBg: '#E6F5F3',
  riskInfo: '#457B9D',
  riskInfoBg: '#E8F0F6',

  // Neutrals
  bg: '#F8F9FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F5',
  border: '#E2E6EB',
  borderLight: '#F0F2F5',
  textPrimary: '#1A1D23',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  processing: '#6366F1',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const FONTS = {
  regular: { fontWeight: 'normal' as const },
  medium: { fontWeight: '500' as const },
  semibold: { fontWeight: '600' as const },
  bold: { fontWeight: 'bold' as const },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Risk level helpers
export type RiskLevel = 'high' | 'medium' | 'low' | 'info';

export const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; emoji: string }> = {
  high: { label: 'High Risk', color: COLORS.riskHigh, bg: COLORS.riskHighBg, emoji: '🚨' },
  medium: { label: 'Medium Risk', color: COLORS.riskMedium, bg: COLORS.riskMediumBg, emoji: '⚠️' },
  low: { label: 'Low Risk', color: COLORS.riskLow, bg: COLORS.riskLowBg, emoji: '✅' },
  info: { label: 'Info', color: COLORS.riskInfo, bg: COLORS.riskInfoBg, emoji: 'ℹ️' },
};

// Subscription tiers
export const TIERS = {
  free: { name: 'Free', reviewsPerMonth: 3, price: 0 },
  pro: { name: 'Pro', reviewsPerMonth: -1, price: 9.99 }, // -1 = unlimited
};
