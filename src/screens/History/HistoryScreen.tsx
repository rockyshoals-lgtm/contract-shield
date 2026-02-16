// ContractShield — History Screen
// Browse all past contract analyses
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS, RISK_CONFIG } from '../../theme';
import { useContractStore } from '../../stores/contractStore';
import type { StoredContract } from '../../types';
import type { RiskLevel } from '../../theme';

interface Props {
  navigation: { navigate: (name: string, params?: any) => void };
}

type Filter = 'all' | 'favorites' | 'high' | 'medium' | 'low';

export default function HistoryScreen({ navigation }: Props) {
  const history = useContractStore((s) => s.history);
  const analyses = useContractStore((s) => s.analyses);
  const toggleFavorite = useContractStore((s) => s.toggleFavorite);
  const deleteContract = useContractStore((s) => s.deleteContract);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = history.filter((h) => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return h.isFavorite;
    return h.overallRisk === filter;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'favorites', label: '❤️' },
    { key: 'high', label: '🚨 High' },
    { key: 'medium', label: '⚠️ Med' },
    { key: 'low', label: '✅ Low' },
  ];

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Contract',
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteContract(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: StoredContract }) => {
    const risk = RISK_CONFIG[item.overallRisk];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          const analysis = analyses.find((a) => a.id === item.id);
          if (analysis) navigation.navigate('Analysis', { analysis });
          else Alert.alert('Not Found', 'Full analysis is no longer available.');
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.riskStripe, { backgroundColor: risk.color }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.contractType} · {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.heart}>{item.isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardStats}>
            <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
              <Text style={[styles.riskBadgeText, { color: risk.color }]}>{risk.emoji} {risk.label}</Text>
            </View>
            <Text style={styles.statText}>{item.clauseCount} clauses</Text>
            {item.redFlagCount > 0 && (
              <Text style={[styles.statText, { color: COLORS.riskHigh }]}>
                {item.redFlagCount} red flags
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Contract History</Text>
        <Text style={styles.count}>{history.length} total</Text>
      </View>

      {/* Filter bar */}
      <View style={styles.filterBar}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{filter === 'favorites' ? '❤️' : '📋'}</Text>
          <Text style={styles.emptyTitle}>
            {filter === 'favorites' ? 'No favorites yet' : 'No contracts found'}
          </Text>
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? 'Upload your first contract to see it here.'
              : 'Try a different filter.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { fontSize: 24, ...FONTS.bold, color: COLORS.primary },
  count: { fontSize: 14, color: COLORS.textTertiary },

  filterBar: {
    flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface, marginRight: SPACING.sm, borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterLabel: { fontSize: 13, ...FONTS.medium, color: COLORS.textSecondary },
  filterLabelActive: { color: COLORS.textInverse },

  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },

  card: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    marginBottom: SPACING.md, overflow: 'hidden', ...SHADOWS.sm,
  },
  riskStripe: { width: 4 },
  cardBody: { flex: 1, padding: SPACING.lg },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, ...FONTS.bold, color: COLORS.textPrimary },
  cardMeta: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  heart: { fontSize: 18, marginLeft: SPACING.sm },

  cardStats: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
  riskBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm, marginRight: SPACING.md },
  riskBadgeText: { fontSize: 11, ...FONTS.semibold },
  statText: { fontSize: 12, color: COLORS.textSecondary, marginRight: SPACING.md },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xxxl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.textPrimary, marginTop: SPACING.md },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
});
