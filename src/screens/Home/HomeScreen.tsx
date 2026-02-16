// ContractShield — Home/Dashboard Screen
import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS, RISK_CONFIG, TIERS } from '../../theme';
import { useContractStore } from '../../stores/contractStore';
import { useUserStore } from '../../stores/userStore';

interface Props {
  navigation: { navigate: (name: string, params?: any) => void };
}

export default function HomeScreen({ navigation }: Props) {
  const history = useContractStore((s) => s.history);
  const analyses = useContractStore((s) => s.analyses);
  const totalReviews = useUserStore((s) => s.totalReviews);
  const remaining = useUserStore((s) => s.getRemainingReviews());
  const tier = useUserStore((s) => s.subscription.tier);
  const apiKey = useUserStore((s) => s.claudeApiKey);

  const recentContracts = history.slice(0, 5);
  const highRiskCount = history.filter((h) => h.overallRisk === 'high').length;
  const totalRedFlags = history.reduce((sum, h) => sum + h.redFlagCount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️ ContractShield</Text>
          <Text style={styles.tagline}>AI-powered contract protection for freelancers</Text>
        </View>

        {/* API Key Warning */}
        {!apiKey && (
          <TouchableOpacity
            style={styles.warningCard}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.warningEmoji}>🔑</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Set Up Your API Key</Text>
              <Text style={styles.warningText}>
                Add your Claude API key in Settings to start analyzing contracts.
              </Text>
            </View>
            <Text style={styles.warningArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Quick Action */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Upload')}
          activeOpacity={0.8}
        >
          <Text style={styles.scanEmoji}>📄</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.scanTitle}>Review a Contract</Text>
            <Text style={styles.scanSubtitle}>
              Upload, scan, or paste your contract for instant AI analysis
            </Text>
          </View>
          <Text style={styles.scanArrow}>→</Text>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalReviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.riskHigh }]}>{highRiskCount}</Text>
            <Text style={styles.statLabel}>High Risk</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>{totalRedFlags}</Text>
            <Text style={styles.statLabel}>Red Flags</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.accent }]}>
              {tier === 'pro' ? '∞' : remaining}
            </Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        {/* Subscription Badge */}
        {tier === 'free' && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeTitle}>
                Free Plan — {remaining}/{TIERS.free.reviewsPerMonth} reviews left
              </Text>
              <Text style={styles.upgradeText}>
                Upgrade to Pro for unlimited reviews at ${TIERS.pro.price}/month
              </Text>
            </View>
            <Text style={styles.upgradeBadge}>PRO</Text>
          </TouchableOpacity>
        )}

        {/* Recent Contracts */}
        {recentContracts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
              {history.length > 5 && (
                <TouchableOpacity onPress={() => navigation.navigate('History')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            {recentContracts.map((contract) => {
              const risk = RISK_CONFIG[contract.overallRisk];
              return (
                <TouchableOpacity
                  key={contract.id}
                  style={styles.contractCard}
                  onPress={() => {
                    const analysis = analyses.find((a) => a.id === contract.id);
                    if (analysis) navigation.navigate('Analysis', { analysis });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contractTitle} numberOfLines={1}>{contract.title}</Text>
                    <Text style={styles.contractMeta}>
                      {contract.contractType} · {contract.clauseCount} clauses ·{' '}
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                    <Text style={[styles.riskBadgeText, { color: risk.color }]}>
                      {risk.emoji} {risk.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {history.length === 0 && apiKey && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No contracts reviewed yet</Text>
            <Text style={styles.emptyText}>
              Upload your first contract to get an instant AI-powered analysis with risk flags and negotiation tips.
            </Text>
          </View>
        )}

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            {[
              { emoji: '📷', title: 'Scan or Upload', desc: 'Photo, PDF, or paste text' },
              { emoji: '🤖', title: 'AI Analyzes', desc: 'Claude reviews every clause' },
              { emoji: '🛡️', title: 'Get Protected', desc: 'Risk flags + negotiation tips' },
            ].map((step, i) => (
              <View key={i} style={styles.stepCard}>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg },
  header: { paddingTop: SPACING.lg, paddingBottom: SPACING.xl, alignItems: 'center' },
  logo: { fontSize: 28, ...FONTS.bold, color: COLORS.primary },
  tagline: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.xs },

  warningCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E7',
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: '#F0D060',
  },
  warningEmoji: { fontSize: 28, marginRight: SPACING.md },
  warningTitle: { fontSize: 15, ...FONTS.bold, color: COLORS.textPrimary },
  warningText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  warningArrow: { fontSize: 20, color: COLORS.textTertiary },

  scanButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  scanEmoji: { fontSize: 36, marginRight: SPACING.lg },
  scanTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.textInverse },
  scanSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  scanArrow: { fontSize: 24, color: 'rgba(255,255,255,0.6)' },

  statsRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginHorizontal: SPACING.xs / 2,
    ...SHADOWS.sm,
  },
  statNumber: { fontSize: 22, ...FONTS.bold, color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  upgradeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  upgradeTitle: { fontSize: 14, ...FONTS.semibold, color: COLORS.textPrimary },
  upgradeText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  upgradeBadge: {
    backgroundColor: COLORS.accent, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm, marginLeft: SPACING.md,
  },

  section: { marginBottom: SPACING.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.textPrimary },
  seeAll: { fontSize: 14, color: COLORS.accent, ...FONTS.semibold },

  contractCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  riskDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.md },
  contractTitle: { fontSize: 15, ...FONTS.semibold, color: COLORS.textPrimary },
  contractMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  riskBadge: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm, marginLeft: SPACING.sm },
  riskBadgeText: { fontSize: 11, ...FONTS.semibold },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.textPrimary, marginTop: SPACING.md },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, paddingHorizontal: SPACING.xl },

  stepsContainer: { flexDirection: 'row' },
  stepCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginHorizontal: SPACING.xs / 2,
    ...SHADOWS.sm,
  },
  stepEmoji: { fontSize: 28 },
  stepTitle: { fontSize: 13, ...FONTS.bold, color: COLORS.textPrimary, marginTop: SPACING.sm },
  stepDesc: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
});
