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
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadow, spacing, typography } from "@/constants/theme";

const API_URL = "https://gaited-stormless-galileo.ngrok-free.dev";

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
    // ✅ View رئيسي بدل ScrollView — عشان نتحكم في الثابت والمتحرك
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ── Header ثابت ─────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: spacing.xl,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          paddingTop: insets.top,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: spacing.xs,
            backgroundColor: colors.primaryLight,
            borderRadius: radius.sm,
            marginRight: spacing.md,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ ...typography.title, color: colors.textPrimary, fontSize: 22, fontWeight: "800" }}>
          Symptom Analysis
        </Text>
      </View>

      {/* ── القائمة — تتحرك ─────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ ...typography.subtitle, color: colors.textPrimary, fontWeight: "700", marginBottom: 4 }}>
          Quick Checklist
        </Text>
        <Text style={{ ...typography.body, color: colors.textSecondary, fontSize: 13, marginBottom: spacing.md }}>
          Select your current symptoms ({selectedSymptoms.length} selected)
        </Text>

        {/* ✅ Grid بصفين */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {COMMON_SYMPTOMS.map((symptom) => {
            const selected = selectedSymptoms.includes(symptom.value);
            return (
              <TouchableOpacity
                key={symptom.value}
                onPress={() => toggleSymptom(symptom.value)}
                style={{
                  width: "48%",
                  backgroundColor: selected ? colors.primaryLight : colors.card,
                  borderRadius: radius.lg,
                  borderWidth: selected ? 1.5 : 0.5,
                  borderColor: selected ? colors.primary : colors.divider,
                  padding: spacing.md,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: selected ? colors.primary : colors.textPrimary,
                    flex: 1,
                  }}
                >
                  {symptom.label}
                </Text>
                {selected && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── الأسفل — ثابت دايماً ────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxl,
          borderTopWidth: 0.5,
          borderTopColor: colors.divider,
          backgroundColor: colors.background,
          gap: spacing.sm,
        }}
      >
        {/* زر الشات */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.primary,
            flexDirection: "row",
            alignItems: "center",
            ...shadow.card,
          }}
          onPress={() => router.push("/chat-screen")}
        >
          <View
            style={{
              backgroundColor: colors.primaryLight,
              padding: 10,
              borderRadius: radius.md,
              marginRight: spacing.md,
            }}
          >
            <MaterialCommunityIcons name="robot-outline" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.body, fontWeight: "700", color: colors.textPrimary }}>
              Chat with AI
            </Text>
            <Text style={{ ...typography.caption, color: colors.textSecondary }}>
              Describe your condition
            </Text>
          </View>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
        </TouchableOpacity>

        {/* زر View Results */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.buttonPrimary,
            borderRadius: radius.md,
            padding: spacing.lg,
            alignItems: "center",
            ...shadow.floating,
            opacity: selectedSymptoms.length >= 3 ? 1 : 0.5,
          }}
          disabled={selectedSymptoms.length < 3 || loading}
          onPress={handleAnalyze}
        >
          {loading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={{ ...typography.body, fontWeight: "700", color: colors.textOnPrimary, fontSize: 16 }}>
              View Results {selectedSymptoms.length >= 3 ? `(${selectedSymptoms.length})` : ""}
            </Text>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}