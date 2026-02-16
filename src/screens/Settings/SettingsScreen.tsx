// ContractShield — Settings Screen
// API key management, subscription, and app settings
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS, TIERS } from '../../theme';
import { useUserStore } from '../../stores/userStore';
import { useContractStore } from '../../stores/contractStore';

interface Props {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void };
}

export default function SettingsScreen({ navigation }: Props) {
  const {
    name, email, claudeApiKey, subscription, totalReviews, joinedAt,
    setProfile, setApiKey, upgradeToPro,
  } = useUserStore();
  const remaining = useUserStore((s) => s.getRemainingReviews());
  const historyCount = useContractStore((s) => s.history.length);

  const [editingKey, setEditingKey] = useState(false);
  const [keyInput, setKeyInput] = useState(claudeApiKey);
  const [nameInput, setNameInput] = useState(name);
  const [emailInput, setEmailInput] = useState(email);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (trimmed && !trimmed.startsWith('sk-ant-')) {
      Alert.alert('Invalid Key', 'Claude API keys start with "sk-ant-". Please check your key.');
      return;
    }
    setApiKey(trimmed);
    setEditingKey(false);
    if (trimmed) {
      Alert.alert('API Key Saved', 'You\'re all set to analyze contracts!');
    }
  };

  const handleSaveProfile = () => {
    setProfile(nameInput.trim(), emailInput.trim());
    Alert.alert('Saved', 'Profile updated.');
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Pro',
      `$${TIERS.pro.price}/month for unlimited contract reviews.\n\nPayment processing coming soon! For now, enjoy Pro features for free during beta.`,
      [
        { text: 'Cancel' },
        { text: 'Activate Beta Pro', onPress: () => {
          upgradeToPro();
          Alert.alert('Welcome to Pro!', 'You now have unlimited contract reviews.');
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* API Key Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Claude API Key</Text>
          <Text style={styles.sectionDesc}>
            Your API key is stored locally on your device and never sent anywhere except directly to Anthropic's servers for contract analysis.
          </Text>

          {!editingKey ? (
            <View style={styles.keyRow}>
              <View style={styles.keyDisplay}>
                <Text style={styles.keyText}>
                  {claudeApiKey
                    ? `${claudeApiKey.substring(0, 12)}...${claudeApiKey.substring(claudeApiKey.length - 4)}`
                    : 'No API key set'}
                </Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditingKey(true)}>
                <Text style={styles.editBtnText}>{claudeApiKey ? 'Change' : 'Add Key'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TextInput
                style={styles.input}
                placeholder="sk-ant-api03-..."
                placeholderTextColor={COLORS.textTertiary}
                value={keyInput}
                onChangeText={setKeyInput}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <View style={styles.keyActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditingKey(false); setKeyInput(claudeApiKey); }}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveKey}>
                  <Text style={styles.saveBtnText}>Save Key</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.helpLink}
            onPress={() => Linking.openURL('https://console.anthropic.com/settings/keys')}
          >
            <Text style={styles.helpLinkText}>How do I get a Claude API key? →</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Subscription</Text>
          <View style={styles.subCard}>
            <View style={styles.subHeader}>
              <Text style={styles.subPlan}>
                {subscription.tier === 'pro' ? '⭐ Pro Plan' : '📋 Free Plan'}
              </Text>
              {subscription.tier === 'pro' && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>ACTIVE</Text>
                </View>
              )}
            </View>
            <View style={styles.subStats}>
              <View style={styles.subStat}>
                <Text style={styles.subStatNum}>{totalReviews}</Text>
                <Text style={styles.subStatLabel}>Total Reviews</Text>
              </View>
              <View style={styles.subStat}>
                <Text style={styles.subStatNum}>
                  {subscription.tier === 'pro' ? '∞' : remaining}
                </Text>
                <Text style={styles.subStatLabel}>Remaining</Text>
              </View>
              <View style={styles.subStat}>
                <Text style={styles.subStatNum}>{historyCount}</Text>
                <Text style={styles.subStatLabel}>Saved</Text>
              </View>
            </View>
            {subscription.tier === 'free' && (
              <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} activeOpacity={0.8}>
                <Text style={styles.upgradeBtnText}>
                  Upgrade to Pro — ${TIERS.pro.price}/month
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Profile</Text>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={COLORS.textTertiary}
            value={nameInput}
            onChangeText={setNameInput}
          />
          <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={COLORS.textTertiary}
            value={emailInput}
            onChangeText={setEmailInput}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.saveProfileBtn} onPress={handleSaveProfile} activeOpacity={0.8}>
            <Text style={styles.saveProfileBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutLogo}>🛡️ ContractShield</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0 (MVP)</Text>
            <Text style={styles.aboutText}>
              AI-powered contract analysis for freelancers. Powered by Claude AI from Anthropic.
            </Text>
            <Text style={styles.aboutJoined}>
              Member since {new Date(joinedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={{ height: SPACING.xxxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },

  title: { fontSize: 24, ...FONTS.bold, color: COLORS.primary, marginBottom: SPACING.xl },

  section: { marginBottom: SPACING.xxl },
  sectionTitle: { fontSize: 17, ...FONTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  sectionDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 18 },

  keyRow: { flexDirection: 'row', alignItems: 'center' },
  keyDisplay: {
    flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.md,
    marginRight: SPACING.md,
  },
  keyText: { fontSize: 14, color: COLORS.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  editBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  editBtnText: { fontSize: 14, ...FONTS.bold, color: COLORS.textInverse },

  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg,
    fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
  },
  inputLabel: { fontSize: 13, ...FONTS.semibold, color: COLORS.textSecondary, marginBottom: SPACING.xs },

  keyActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.md },
  cancelBtn: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, marginRight: SPACING.md },
  cancelBtnText: { fontSize: 14, ...FONTS.medium, color: COLORS.textSecondary },
  saveBtn: {
    backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  saveBtnText: { fontSize: 14, ...FONTS.bold, color: COLORS.textInverse },

  helpLink: { marginTop: SPACING.md },
  helpLinkText: { fontSize: 13, color: COLORS.accent, ...FONTS.medium },

  // Subscription
  subCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, ...SHADOWS.sm },
  subHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  subPlan: { fontSize: 18, ...FONTS.bold, color: COLORS.textPrimary, flex: 1 },
  proBadge: {
    backgroundColor: COLORS.accent, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  proBadgeText: { fontSize: 11, ...FONTS.bold, color: COLORS.textInverse },
  subStats: { flexDirection: 'row', marginBottom: SPACING.lg },
  subStat: { flex: 1, alignItems: 'center' },
  subStatNum: { fontSize: 22, ...FONTS.bold, color: COLORS.primary },
  subStatLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  upgradeBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  upgradeBtnText: { fontSize: 16, ...FONTS.bold, color: COLORS.textInverse },

  saveProfileBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: SPACING.lg,
    alignItems: 'center', marginTop: SPACING.lg,
  },
  saveProfileBtnText: { fontSize: 15, ...FONTS.bold, color: COLORS.textInverse },

  // About
  aboutCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', ...SHADOWS.sm },
  aboutLogo: { fontSize: 28, ...FONTS.bold, color: COLORS.primary },
  aboutVersion: { fontSize: 13, color: COLORS.textTertiary, marginTop: SPACING.xs },
  aboutText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.md, lineHeight: 20 },
  aboutJoined: { fontSize: 12, color: COLORS.textTertiary, marginTop: SPACING.md },
});
