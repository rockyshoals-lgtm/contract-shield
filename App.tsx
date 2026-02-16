// ContractShield — App.tsx
// Custom JS navigation (no react-navigation / react-native-screens)
// Same battle-tested pattern from Yard Sale Finder

import React, { useState, createContext, useContext, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from './src/theme';
import HomeScreen from './src/screens/Home/HomeScreen';
import UploadScreen from './src/screens/Upload/UploadScreen';
import HistoryScreen from './src/screens/History/HistoryScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import AnalysisScreen from './src/screens/Analysis/AnalysisScreen';
import type { ContractAnalysis } from './src/types';

// --- Navigation types ---
type Screen =
  | { name: 'tabs'; tab: string }
  | { name: 'Analysis'; params: { analysis: ContractAnalysis } };

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
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  label: {
    fontSize: 11,
    ...FONTS.medium,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  labelActive: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
});

// --- App Root ---
export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'tabs', tab: 'Home' });
  const [activeTab, setActiveTab] = useState('Home');

  const navigate = useCallback((name: string, params?: any) => {
    if (name === 'Analysis') {
      setScreen({ name: 'Analysis', params });
    } else if (['Home', 'Upload', 'History', 'Settings'].includes(name)) {
      setActiveTab(name);
      setScreen({ name: 'tabs', tab: name });
    }
  }, []);

  const goBack = useCallback(() => {
    setScreen({ name: 'tabs', tab: activeTab });
  }, [activeTab]);

  const nav = { navigate, goBack };

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
        </View>
      </NavContext.Provider>
    </SafeAreaProvider>
  );
}
