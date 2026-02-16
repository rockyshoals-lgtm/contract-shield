// ContractShield — App.tsx
// Custom JS navigation (no react-navigation / react-native-screens)
// Includes first-launch legal disclaimer acceptance

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from './src/theme';
import HomeScreen from './src/screens/Home/HomeScreen';
import UploadScreen from './src/screens/Upload/UploadScreen';
import HistoryScreen from './src/screens/History/HistoryScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import AnalysisScreen from './src/screens/Analysis/AnalysisScreen';
import LegalScreen from './src/screens/Legal/LegalScreen';
import type { ContractAnalysis } from './src/types';

const DISCLAIMER_KEY = 'cs_disclaimer_accepted';

// --- Navigation types ---
type Screen =
  | { name: 'tabs'; tab: string }
  | { name: 'Analysis'; params: { analysis: ContractAnalysis } }
  | { name: 'Legal'; params?: { section?: 'tos' | 'privacy' } };

interface NavContextType {
  navigate: (name: string, params?: any) => void;
  goBack: () => void;
}

const NavContext = createContext<NavContextType>({
  navigate: () => {},
  goBack: () => {},
});

export const useNav = () => useContext(NavContext);

// --- Tab config ---
const TABS = [
  { key: 'Home', label: 'Home', emoji: '🏠' },
  { key: 'Upload', label: 'Scan', emoji: '📄' },
  { key: 'History', label: 'History', emoji: '📋' },
  { key: 'Settings', label: 'Settings', emoji: '⚙️' },
];

// --- First Launch Disclaimer ---
function DisclaimerScreen({ onAccept }: { onAccept: () => void }) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  return (
    <SafeAreaView style={ds.safe} edges={['top', 'bottom']}>
      <View style={ds.header}>
        <Text style={ds.logo}>🛡️ ContractShield</Text>
        <Text style={ds.subtitle}>Before you get started</Text>
      </View>

      <ScrollView
        style={ds.scroll}
        contentContainerStyle={ds.scrollContent}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 40) {
            setScrolledToEnd(true);
          }
        }}
        scrollEventThrottle={200}
      >
        <View style={ds.importantBox}>
          <Text style={ds.importantTitle}>⚖️ Important Legal Notice</Text>
          <Text style={ds.importantText}>
            Please read and acknowledge the following before using ContractShield.
          </Text>
        </View>

        <Text style={ds.sectionTitle}>Not Legal Advice</Text>
        <Text style={ds.body}>
          ContractShield is an AI-powered informational and educational tool. It does NOT provide legal advice, legal representation, or legal services of any kind. ContractShield is NOT a law firm.
        </Text>

        <Text style={ds.sectionTitle}>AI Limitations</Text>
        <Text style={ds.body}>
          Contract analysis is performed by artificial intelligence (Claude by Anthropic). AI-generated content may contain errors, inaccuracies, or omissions. The tool may miss important legal issues or misinterpret contract language.
        </Text>

        <Text style={ds.sectionTitle}>Always Consult an Attorney</Text>
        <Text style={ds.body}>
          You should ALWAYS consult with a qualified, licensed attorney in your jurisdiction before signing any contract or making legal decisions based on information from this app.
        </Text>

        <Text style={ds.sectionTitle}>No Liability</Text>
        <Text style={ds.body}>
          ContractShield and its developers are not liable for any damages or losses resulting from your use of the app or reliance on its analysis. You use this tool at your own risk.
        </Text>

        <Text style={ds.sectionTitle}>Your Data</Text>
        <Text style={ds.body}>
          All contract data is stored locally on your device. When you analyze a contract, the text is sent directly to Anthropic's API using your personal API key. We never see or store your contracts on any server.
        </Text>

        <Text style={ds.scrollHint}>
          {scrolledToEnd ? '✓ You\'ve read the full notice' : '↓ Scroll down to continue'}
        </Text>
      </ScrollView>

      <View style={ds.footer}>
        <Text style={ds.footerNote}>
          By tapping "I Understand & Agree", you acknowledge that ContractShield provides informational analysis only and agree to our Terms of Service and Privacy Policy.
        </Text>
        <TouchableOpacity
          style={[ds.acceptBtn, !scrolledToEnd && ds.acceptBtnDisabled]}
          onPress={onAccept}
          disabled={!scrolledToEnd}
          activeOpacity={0.8}
        >
          <Text style={ds.acceptBtnText}>
            {scrolledToEnd ? 'I Understand & Agree' : 'Please scroll to read full notice'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const ds = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.lg },
  logo: { fontSize: 28, ...FONTS.bold, color: COLORS.primary },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: SPACING.xs },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl },
  importantBox: {
    backgroundColor: '#FFF8E7', borderRadius: RADIUS.lg, padding: SPACING.xl,
    borderWidth: 1, borderColor: '#F0D060', marginBottom: SPACING.xl,
  },
  importantTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  importantText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  sectionTitle: { fontSize: 16, ...FONTS.bold, color: COLORS.primary, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  body: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22, marginBottom: SPACING.sm },
  scrollHint: {
    fontSize: 14, ...FONTS.semibold, color: COLORS.accent, textAlign: 'center',
    marginTop: SPACING.xl, marginBottom: SPACING.lg,
  },
  footer: {
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  footerNote: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'center', marginBottom: SPACING.md, lineHeight: 16 },
  acceptBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg,
    alignItems: 'center', ...SHADOWS.md,
  },
  acceptBtnDisabled: { backgroundColor: COLORS.textTertiary },
  acceptBtnText: { fontSize: 16, ...FONTS.bold, color: COLORS.textInverse },
});

// --- Tab Bar ---
function TabBar({ activeTab, onSelect }: { activeTab: string; onSelect: (key: string) => void }) {
  return (
    <View style={tb.bar}>
      {TABS.map((t) => {
        const active = activeTab === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={tb.tab}
            onPress={() => onSelect(t.key)}
            activeOpacity={0.7}
          >
            <Text style={[tb.emoji, { opacity: active ? 1 : 0.4 }]}>{t.emoji}</Text>
            <Text style={[tb.label, active && tb.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20,
    paddingTop: SPACING.sm,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  label: { fontSize: 11, ...FONTS.medium, color: COLORS.textTertiary, marginTop: 2 },
  labelActive: { color: COLORS.primary, ...FONTS.bold },
});

// --- App Root ---
export default function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'tabs', tab: 'Home' });
  const [activeTab, setActiveTab] = useState('Home');

  // Check if disclaimer was already accepted
  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then((val) => {
      setDisclaimerAccepted(val === 'true');
    });
  }, []);

  const handleAcceptDisclaimer = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
    setDisclaimerAccepted(true);
  };

  const navigate = useCallback((name: string, params?: any) => {
    if (name === 'Analysis') {
      setScreen({ name: 'Analysis', params });
    } else if (name === 'Legal') {
      setScreen({ name: 'Legal', params });
    } else if (['Home', 'Upload', 'History', 'Settings'].includes(name)) {
      setActiveTab(name);
      setScreen({ name: 'tabs', tab: name });
    }
  }, []);

  const goBack = useCallback(() => {
    setScreen({ name: 'tabs', tab: activeTab });
  }, [activeTab]);

  const nav = { navigate, goBack };

  // Loading state
  if (disclaimerAccepted === null) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 36 }}>🛡️</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // First launch — show disclaimer
  if (!disclaimerAccepted) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <DisclaimerScreen onAccept={handleAcceptDisclaimer} />
      </SafeAreaProvider>
    );
  }

  // Main app
  return (
    <SafeAreaProvider>
      <NavContext.Provider value={nav}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
          {screen.name === 'tabs' && (
            <>
              <View style={{ flex: 1 }}>
                {activeTab === 'Home' && <HomeScreen navigation={nav} />}
                {activeTab === 'Upload' && <UploadScreen navigation={nav} />}
                {activeTab === 'History' && <HistoryScreen navigation={nav} />}
                {activeTab === 'Settings' && <SettingsScreen navigation={nav} />}
              </View>
              <TabBar
                activeTab={activeTab}
                onSelect={(key) => {
                  setActiveTab(key);
                  setScreen({ name: 'tabs', tab: key });
                }}
              />
            </>
          )}

          {screen.name === 'Analysis' && (
            <AnalysisScreen
              navigation={nav}
              route={{ params: (screen as any).params }}
            />
          )}

          {screen.name === 'Legal' && (
            <LegalScreen
              navigation={nav}
              route={{ params: (screen as any).params }}
            />
          )}
        </View>
      </NavContext.Provider>
    </SafeAreaProvider>
  );
}
