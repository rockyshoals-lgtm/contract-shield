// ContractShield — Upload/Scan Screen
// Camera scan, file upload, or paste text input methods
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../theme';
import { useContractStore } from '../../stores/contractStore';
import { useUserStore } from '../../stores/userStore';
import { analyzeContract, getDemoAnalysis } from '../../services/contractAnalyzer';

interface Props {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void };
}

type InputMethod = 'choose' | 'paste' | 'file' | 'camera';

export default function UploadScreen({ navigation }: Props) {
  const [method, setMethod] = useState<InputMethod>('choose');
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const apiKey = useUserStore((s) => s.claudeApiKey);
  const canReview = useUserStore((s) => s.canReview());
  const incrementReviews = useUserStore((s) => s.incrementReviews);
  const addAnalysis = useContractStore((s) => s.addAnalysis);
  const setAnalyzing = useContractStore((s) => s.setAnalyzing);

  const handleAnalyze = async (text: string, inputMethod: 'camera' | 'file' | 'paste', fName?: string) => {
    if (!text.trim()) {
      Alert.alert('No Text', 'Please provide contract text to analyze.');
      return;
    }
    if (!apiKey) {
      Alert.alert('API Key Required', 'Please add your Claude API key in Settings.', [
        { text: 'Go to Settings', onPress: () => navigation.navigate('Settings') },
        { text: 'Try Demo', onPress: handleDemo },
      ]);
      return;
    }
    if (!canReview) {
      Alert.alert('Review Limit Reached', 'You\'ve used all free reviews this month. Upgrade to Pro for unlimited reviews.', [
        { text: 'Upgrade', onPress: () => navigation.navigate('Settings') },
        { text: 'Cancel' },
      ]);
      return;
    }

    setIsLoading(true);
    setAnalyzing(true, 'Starting analysis...');

    try {
      const analysis = await analyzeContract({
        text,
        apiKey,
        inputMethod,
        fileName: fName,
        onProgress: (status) => {
          setProgress(status);
          setAnalyzing(true, status);
        },
      });

      addAnalysis(analysis);
      incrementReviews();
      setAnalyzing(false);
      navigation.navigate('Analysis', { analysis });
    } catch (error: any) {
      setAnalyzing(false);
      Alert.alert('Analysis Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  const handleDemo = () => {
    const demo = getDemoAnalysis();
    addAnalysis(demo);
    navigation.navigate('Analysis', { analysis: demo });
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setFileName(file.name);

        // For MVP, read text content (works for .txt files)
        // PDF/DOCX would need server-side extraction in production
        if (file.mimeType === 'text/plain' && file.uri) {
          const response = await fetch(file.uri);
          const text = await response.text();
          setPasteText(text);
          setMethod('paste');
        } else {
          Alert.alert(
            'File Selected',
            `Selected: ${file.name}\n\nFor the MVP, please paste the contract text below. Full PDF/DOCX parsing is coming soon!`,
          );
          setMethod('paste');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick file. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingTitle}>Analyzing Your Contract</Text>
          <Text style={styles.loadingProgress}>{progress || 'Sending to Claude AI...'}</Text>
          <View style={styles.loadingSteps}>
            {['Extracting clauses', 'Assessing risk levels', 'Finding red flags', 'Building negotiation tips'].map(
              (step, i) => (
                <View key={i} style={styles.loadingStep}>
                  <Text style={styles.loadingStepEmoji}>
                    {i === 0 ? '📄' : i === 1 ? '⚖️' : i === 2 ? '🚨' : '💡'}
                  </Text>
                  <Text style={styles.loadingStepText}>{step}</Text>
                </View>
              )
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Method chooser
  if (method === 'choose') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Review a Contract</Text>
          <Text style={styles.subtitle}>How would you like to provide your contract?</Text>

          <TouchableOpacity style={styles.methodCard} onPress={() => setMethod('paste')} activeOpacity={0.7}>
            <Text style={styles.methodEmoji}>📝</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Paste Text</Text>
              <Text style={styles.methodDesc}>Copy and paste contract text directly</Text>
            </View>
            <Text style={styles.methodArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodCard} onPress={handleFilePick} activeOpacity={0.7}>
            <Text style={styles.methodEmoji}>📁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Upload File</Text>
              <Text style={styles.methodDesc}>PDF, DOCX, or TXT file</Text>
            </View>
            <Text style={styles.methodArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodCard, { opacity: 0.5 }]}
            onPress={() => Alert.alert('Coming Soon', 'Camera scanning will be available in the next update!')}
            activeOpacity={0.7}
          >
            <Text style={styles.methodEmoji}>📷</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Scan with Camera</Text>
              <Text style={styles.methodDesc}>Take a photo of a paper contract</Text>
            </View>
            <Text style={styles.methodBadge}>SOON</Text>
          </TouchableOpacity>

          {/* Demo button */}
          <TouchableOpacity style={styles.demoButton} onPress={handleDemo} activeOpacity={0.7}>
            <Text style={styles.demoEmoji}>🎯</Text>
            <Text style={styles.demoText}>Try a Demo Analysis</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Paste text input
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.backRow}>
            <TouchableOpacity onPress={() => setMethod('choose')}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            {fileName ? <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text> : null}
          </View>

          <Text style={styles.title}>Paste Your Contract</Text>
          <Text style={styles.subtitle}>
            Paste the full contract text below. The more complete the text, the better the analysis.
          </Text>

          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Paste your contract text here...\n\nTip: Include all clauses, terms, and conditions for the most thorough analysis."
            placeholderTextColor={COLORS.textTertiary}
            value={pasteText}
            onChangeText={setPasteText}
            textAlignVertical="top"
          />

          <View style={styles.charCount}>
            <Text style={styles.charCountText}>
              {pasteText.length} characters · ~{Math.ceil(pasteText.split(/\s+/).filter(Boolean).length)} words
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.analyzeButton, !pasteText.trim() && { opacity: 0.5 }]}
            onPress={() => handleAnalyze(pasteText, fileName ? 'file' : 'paste', fileName || undefined)}
            disabled={!pasteText.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.analyzeEmoji}>🛡️</Text>
            <Text style={styles.analyzeText}>Analyze Contract</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },

  title: { fontSize: 24, ...FONTS.bold, color: COLORS.primary, marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.xl },

  methodCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  methodEmoji: { fontSize: 32, marginRight: SPACING.lg },
  methodTitle: { fontSize: 16, ...FONTS.bold, color: COLORS.textPrimary },
  methodDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  methodArrow: { fontSize: 20, color: COLORS.textTertiary },
  methodBadge: {
    fontSize: 10, ...FONTS.bold, color: COLORS.accent,
    backgroundColor: COLORS.riskLowBg, paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderRadius: RADIUS.sm,
  },

  demoButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.lg, marginTop: SPACING.lg,
  },
  demoEmoji: { fontSize: 18, marginRight: SPACING.sm },
  demoText: { fontSize: 15, color: COLORS.accent, ...FONTS.semibold },

  backRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg,
  },
  backButton: { fontSize: 16, color: COLORS.accent, ...FONTS.semibold },
  fileName: {
    fontSize: 13, color: COLORS.textSecondary, marginLeft: SPACING.lg, flex: 1,
  },

  textInput: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg,
    fontSize: 15, color: COLORS.textPrimary, minHeight: 250, maxHeight: 400,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },

  charCount: { alignItems: 'flex-end', marginTop: SPACING.sm, marginBottom: SPACING.lg },
  charCountText: { fontSize: 12, color: COLORS.textTertiary },

  analyzeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg,
    marginBottom: SPACING.xxxl, ...SHADOWS.md,
  },
  analyzeEmoji: { fontSize: 20, marginRight: SPACING.sm },
  analyzeText: { fontSize: 17, ...FONTS.bold, color: COLORS.textInverse },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl },
  loadingTitle: { fontSize: 20, ...FONTS.bold, color: COLORS.primary, marginTop: SPACING.xl },
  loadingProgress: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.sm },
  loadingSteps: { marginTop: SPACING.xxxl },
  loadingStep: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  loadingStepEmoji: { fontSize: 22, marginRight: SPACING.md },
  loadingStepText: { fontSize: 15, color: COLORS.textSecondary },
});
