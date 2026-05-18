import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet
} from "react-native";
import Header from "../components/Header";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadow, spacing, typography } from "@/constants/theme";

const API_URL = "https://ai-hajjcare-api.onrender.com";

const COMMON_SYMPTOMS = [
  { label: "Headache",          value: "headache" },
  { label: "High fever",        value: "high_fever" },
  { label: "Cough",             value: "cough" },
  { label: "Dizziness",         value: "dizziness" },
  { label: "Fatigue",           value: "fatigue" },
  { label: "Nausea",            value: "nausea" },
  { label: "Vomiting",          value: "vomiting" },
  { label: "Chest pain",        value: "chest_pain" },
  { label: "Breathlessness",    value: "breathlessness" },
  { label: "Joint pain",        value: "joint_pain" },
  { label: "Diarrhoea",         value: "diarrhoea" },
  { label: "Abdominal pain",    value: "abdominal_pain" },
  { label: "Skin rash",         value: "skin_rash" },
  { label: "Sweating",          value: "sweating" },
  { label: "Chills",            value: "chills" },
  { label: "Loss of appetite",  value: "loss_of_appetite" },
];

export default function SymptomIntakeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (value: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length < 3) {
      Alert.alert("Alert", "Please select at least 3 symptoms for a more accurate analysis.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });

      const data = await response.json();

      router.push({
        pathname: "/result-screen",
        params: {
          severity:   data.severity,
          confidence: String(data.confidence),
          decided_by: data.decided_by,
          reason:     data.reason,
          symptoms:   selectedSymptoms.join(","),
          input_method: "quick_checklist",
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to analyze symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
     <View style={{ paddingHorizontal: spacing.lg }}>
        <Header title="Symptom Analysis" />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Quick Checklist</Text>
        <Text style={styles.sectionSubtitle}>
          Select your current symptoms ({selectedSymptoms.length} selected)
        </Text>

        <View style={styles.gridWrapper}>
          {COMMON_SYMPTOMS.map((symptom) => {
            const selected = selectedSymptoms.includes(symptom.value);
            return (
              <TouchableOpacity
                key={symptom.value}
                onPress={() => toggleSymptom(symptom.value)}
                style={[
                  styles.symptomCard, 
                  { 
                    backgroundColor: selected ? colors.primaryLight : colors.card,
                    borderWidth: selected ? 1.5 : 0.5,
                    borderColor: selected ? colors.primary : colors.divider,
                  }
                ]}
              >
                <Text style={[styles.symptomText, { color: selected ? colors.primary : colors.textPrimary }]}>
                  {symptom.label}
                </Text>
                {selected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatCard} onPress={() => router.push("/chat-screen")}>
          <View style={styles.chatIconWrapper}>
            <MaterialCommunityIcons name="robot-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.chatTextWrapper}>
            <Text style={styles.chatTitle}>Chat with AI</Text>
            <Text style={styles.chatSubtitle}>Describe your condition</Text>
          </View>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.analyzeButton, { opacity: selectedSymptoms.length >= 3 ? 1 : 0.5 }]}
          disabled={selectedSymptoms.length < 3 || loading}
          onPress={handleAnalyze}
        >
          {loading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.analyzeButtonText}>
              View Results {selectedSymptoms.length >= 3 ? `(${selectedSymptoms.length})` : ""}
            </Text>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ==========================================
// styles
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingHorizontal: spacing.lg, 
    paddingBottom: spacing.md
  },
  sectionTitle: {
    ...typography.subtitle, 
    color: colors.textPrimary, 
    fontWeight: "700", 
    marginBottom: 4
  },
  sectionSubtitle: {
    ...typography.body, 
    color: colors.textSecondary, 
    fontSize: 13, 
    marginBottom: spacing.md
  },
  gridWrapper: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8
  },
  symptomCard: {
    width: "48%",
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  symptomText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 0.5,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  chatCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    ...shadow.card,
  },
  chatIconWrapper: {
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: radius.md,
    marginRight: spacing.md,
  },
  chatTextWrapper: {
    flex: 1
  },
  chatTitle: {
    ...typography.body, 
    fontWeight: "700", 
    color: colors.textPrimary
  },
  chatSubtitle: {
    ...typography.caption, 
    color: colors.textSecondary
  },
  analyzeButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    ...shadow.floating,
  },
  analyzeButtonText: {
    ...typography.body, 
    fontWeight: "700", 
    color: colors.textOnPrimary, 
    fontSize: 16
  }
});