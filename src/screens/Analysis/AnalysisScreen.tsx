// ContractShield — Analysis Results Screen
// Shows full contract analysis with risk breakdown, clauses, red flags, and tips
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS, RISK_CONFIG } from '../../theme';
import { CLAUSE_CATEGORY_LABELS } from '../../types';
import type { ContractAnalysis, ContractClause } from '../../types';
import type { RiskLevel } from '../../theme';

interface Props {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void };
  route: { params: { analysis: ContractAnalysis } };
}

type Tab = 'overview' | 'clauses' | 'redflags' | 'negotiate';

export default function AnalysisScreen({ navigation, route }: Props) {
  const { analysis } = route.params;
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  const overallRisk = RISK_CONFIG[analysis.overallRisk];

  // Risk distribution
  const riskCounts: Record<RiskLevel, number> = { high: 0, medium: 0, low: 0, info: 0 };
  analysis.clauses.forEach((c) => { riskCounts[c.riskLevel]++; });

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'overview', label: 'Overview', emoji: '📊' },
    { key: 'clauses', label: 'Clauses', emoji: '📋' },
    { key: 'redflags', label: 'Red Flags', emoji: '🚨' },
    { key: 'negotiate', label: 'Tips', emoji: '💡' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{analysis.title}</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Overall Risk Banner */}
            <View style={[styles.riskBanner, { backgroundColor: overallRisk.bg, borderColor: overallRisk.color }]}>
              <Text style={styles.riskBannerEmoji}>{overallRisk.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.riskBannerLevel, { color: overallRisk.color }]}>
                  {overallRisk.label} Contract
                </Text>
                <Text style={styles.riskBannerType}>{analysis.contractType}</Text>
              </View>
            </View>

            {/* Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Summary</Text>
              <Text style={styles.summaryText}>{analysis.overallSummary}</Text>
            </View>

            {/* Risk Distribution */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Risk Distribution</Text>
              <View style={styles.riskBar}>
                {(['high', 'medium', 'low', 'info'] as RiskLevel[]).map((level) => {
                  const count = riskCounts[level];
                  if (count === 0) return null;
                  const pct = (count / analysis.clauses.length) * 100;
                  return (
                    <View
                      key={level}
                      style={[styles.riskBarSegment, {
                        width: `${pct}%`,
                        backgroundColor: RISK_CONFIG[level].color,
                      }]}
                    />
                  );
                })}
              </View>
              <View style={styles.riskLegend}>
                {(['high', 'medium', 'low', 'info'] as RiskLevel[]).map((level) => (
                  <View key={level} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: RISK_CONFIG[level].color }]} />
                    <Text style={styles.legendText}>
                      {RISK_CONFIG[level].emoji} {riskCounts[level]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{analysis.clauses.length}</Text>
                <Text style={styles.statLabel}>Clauses</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: COLORS.riskHigh }]}>{analysis.redFlags.length}</Text>
                <Text style={styles.statLabel}>Red Flags</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: COLORS.warning }]}>{analysis.missingClauses.length}</Text>
                <Text style={styles.statLabel}>Missing</Text>
              </View>
            </View>
          </>
        )}

        {/* CLAUSES TAB */}
        {activeTab === 'clauses' && (
          <>
            <Text style={styles.tabIntro}>
              {analysis.clauses.length} clauses analyzed. Tap to expand details.
            </Text>
            {analysis.clauses.map((clause) => (
              <ClauseCard
                key={clause.id}
                clause={clause}
                expanded={expandedClause === clause.id}
                onToggle={() => setExpandedClause(expandedClause === clause.id ? null : clause.id)}
              />
            ))}
          </>
        )}

        {/* RED FLAGS TAB */}
        {activeTab === 'redflags' && (
          <>
            {analysis.redFlags.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🚨 Red Flags ({analysis.redFlags.length})</Text>
                {analysis.redFlags.map((flag, i) => (
                  <View key={i} style={styles.flagItem}>
                    <View style={styles.flagDot} />
                    <Text style={styles.flagText}>{flag}</Text>
                  </View>
                ))}
              </View>
            )}

            {analysis.missingClauses.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>⚠️ Missing Clauses ({analysis.missingClauses.length})</Text>
                {analysis.missingClauses.map((clause, i) => (
                  <View key={i} style={styles.missingItem}>
                    <Text style={styles.missingEmoji}>📌</Text>
                    <Text style={styles.missingText}>{clause}</Text>
                  </View>
                ))}
              </View>
            )}

            {analysis.redFlags.length === 0 && analysis.missingClauses.length === 0 && (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyEmoji}>✅</Text>
                <Text style={styles.emptyText}>No red flags or missing clauses found!</Text>
              </View>
            )}
          </>
        )}

        {/* NEGOTIATE TAB */}
        {activeTab === 'negotiate' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💡 Negotiation Strategy</Text>
              <Text style={styles.summaryText}>{analysis.negotiationSummary}</Text>
            </View>

            <Text style={styles.tabIntro}>Clause-specific negotiation tips:</Text>
            {analysis.clauses
              .filter((c) => c.negotiationTip)
              .map((clause) => {
                const risk = RISK_CONFIG[clause.riskLevel];
                return (
                  <View key={clause.id} style={styles.tipCard}>
                    <View style={styles.tipHeader}>
                      <View style={[styles.tipRisk, { backgroundColor: risk.bg }]}>
                        <Text style={[styles.tipRiskText, { color: risk.color }]}>{risk.emoji}</Text>
                      </View>
                      <Text style={styles.tipTitle} numberOfLines={1}>{clause.title}</Text>
                    </View>
                    <Text style={styles.tipText}>{clause.negotiationTip}</Text>
                  </View>
                );
              })}

            {analysis.clauses.filter((c) => c.negotiationTip).length === 0 && (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyText}>This contract looks fair — no specific negotiation tips needed!</Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Clause Card component
function ClauseCard({ clause, expanded, onToggle }: {
  clause: ContractClause; expanded: boolean; onToggle: () => void;
}) {
  const risk = RISK_CONFIG[clause.riskLevel];

  return (
    <TouchableOpacity
      style={[styles.clauseCard, { borderLeftColor: risk.color }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.clauseHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.clauseTitle}>{clause.title}</Text>
          <Text style={styles.clauseCategory}>{CLAUSE_CATEGORY_LABELS[clause.category]}</Text>
        </View>
        <View style={[styles.clauseRisk, { backgroundColor: risk.bg }]}>
          <Text style={[styles.clauseRiskText, { color: risk.color }]}>{risk.emoji} {risk.label}</Text>
        </View>
      </View>

      {!expanded && (
        <Text style={styles.clausePreview} numberOfLines={2}>{clause.plainEnglish}</Text>
      )}

      {expanded && (
        <View style={styles.clauseExpanded}>
          <View style={styles.clauseSection}>
            <Text style={styles.clauseSectionTitle}>📄 Original Text</Text>
            <Text style={styles.clauseOriginal}>{clause.originalText}</Text>
          </View>

          <View style={styles.clauseSection}>
            <Text style={styles.clauseSectionTitle}>💬 Plain English</Text>
            <Text style={styles.clausePlain}>{clause.plainEnglish}</Text>
          </View>

          <View style={[styles.clauseSection, { backgroundColor: risk.bg, borderRadius: RADIUS.sm, padding: SPACING.md }]}>
            <Text style={styles.clauseSectionTitle}>⚖️ Risk Assessment</Text>
            <Text style={styles.clauseRiskExplain}>{clause.riskExplanation}</Text>
          </View>

          {clause.negotiationTip && (
            <View style={[styles.clauseSection, { backgroundColor: '#EEF6FF', borderRadius: RADIUS.sm, padding: SPACING.md }]}>
              <Text style={styles.clauseSectionTitle}>💡 Negotiation Tip</Text>
              <Text style={styles.clauseTip}>{clause.negotiationTip}</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.expandHint}>{expanded ? 'Tap to collapse' : 'Tap to expand'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg },

  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { fontSize: 16, color: COLORS.accent, ...FONTS.semibold, marginRight: SPACING.md },
  headerTitle: { fontSize: 16, ...FONTS.bold, color: COLORS.textPrimary, flex: 1 },

  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1,
    borderBottomColor: COLORS.border, paddingHorizontal: SPACING.sm,
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabEmoji: { fontSize: 18 },
  tabLabel: { fontSize: 11, ...FONTS.medium, color: COLORS.textTertiary, marginTop: 2 },
  tabLabelActive: { color: COLORS.primary, ...FONTS.bold },

  tabIntro: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.lg, marginBottom: SPACING.md },

  // Risk banner
  riskBanner: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.xl,
    borderRadius: RADIUS.lg, borderWidth: 1, marginTop: SPACING.lg, marginBottom: SPACING.lg,
  },
  riskBannerEmoji: { fontSize: 36, marginRight: SPACING.lg },
  riskBannerLevel: { fontSize: 20, ...FONTS.bold },
  riskBannerType: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },

  // Card
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl,
    marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  cardTitle: { fontSize: 16, ...FONTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  summaryText: { fontSize: 15, color: COLORS.textPrimary, lineHeight: 22 },

  // Risk bar
  riskBar: {
    flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden',
    backgroundColor: COLORS.surfaceAlt, marginBottom: SPACING.md,
  },
  riskBarSegment: { height: '100%' },
  riskLegend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.xs },
  legendText: { fontSize: 13, color: COLORS.textSecondary },

  // Stats
  statsRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  statBox: {
    flex: 1, alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.lg, marginHorizontal: SPACING.xs / 2,
    ...SHADOWS.sm,
  },
  statNum: { fontSize: 24, ...FONTS.bold, color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // Clause card
  clauseCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.md, borderLeftWidth: 4, ...SHADOWS.sm,
  },
  clauseHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  clauseTitle: { fontSize: 15, ...FONTS.bold, color: COLORS.textPrimary },
  clauseCategory: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  clauseRisk: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm, marginLeft: SPACING.sm },
  clauseRiskText: { fontSize: 11, ...FONTS.semibold },
  clausePreview: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  expandHint: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'center', marginTop: SPACING.sm },

  clauseExpanded: { marginTop: SPACING.sm },
  clauseSection: { marginBottom: SPACING.md },
  clauseSectionTitle: { fontSize: 13, ...FONTS.bold, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  clauseOriginal: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 20 },
  clausePlain: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22 },
  clauseRiskExplain: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  clauseTip: { fontSize: 14, color: COLORS.primary, lineHeight: 20 },

  // Red flags
  flagItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  flagDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.riskHigh, marginTop: 6, marginRight: SPACING.md },
  flagText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },

  // Missing
  missingItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  missingEmoji: { fontSize: 16, marginRight: SPACING.sm },
  missingText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },

  // Tips
  tipCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  tipRisk: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  tipRiskText: { fontSize: 14 },
  tipTitle: { fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary, flex: 1 },
  tipText: { fontSize: 14, color: COLORS.primary, lineHeight: 20 },

  // Empty
  emptyTab: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginTop: SPACING.md, textAlign: 'center' },
});
