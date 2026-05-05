import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";

const SEVERITY_CONFIG = {
  High: {
    color: "#ef4444",
    bgColor: "#fef2f2",
    icon: "alert-circle" as const,
    title: "⚠️ Critical Condition",
    subtitle: "Call Emergency?",
    description: "Your symptoms indicate a medical emergency that requires immediate attention. Do not delay — go to the nearest hospital or medical center now.",
    action: "🏥 Get Help Now",
    actionColor: "#ef4444",
    type: "Hospital",
  },
  Medium: {
    color: "#f97316",
    bgColor: "#fff7ed",
    icon: "warning" as const,
    title: "Medium Condition",
    subtitle: "See a doctor soon",
    description: "Your condition requires medical attention as soon as possible. Do not ignore your symptoms — visit the nearest clinic or medical center.",
    action: "Find Nearby Hospitals",
    actionColor: "#f97316",
    type: "PHCC",
  },
  Low: {
    color: "#22c55e",
    bgColor: "#f0fdf4",
    icon: "checkmark-circle" as const,
    title: "✅ Mild Condition",
    subtitle: "Rest is sufficient",
    description: "Your symptoms are mild and not a cause for concern. Make sure to rest and stay hydrated. If symptoms worsen, consult a doctor.",
    action: undefined,
    actionColor: undefined,
    type: "PHCC",
  },
  Insufficient: {
    color: "#6b7280",
    bgColor: "#f9fafb",
    icon: "help-circle" as const,
    title: "❓ Insufficient Data",
    subtitle: "Please enter more symptoms",
    description: "The symptoms provided were not enough to determine the severity accurately. Please enter at least 3 symptoms.",
    action: "🔄 Try Again",
    actionColor: "#6b7280",
    type: "PHCC",
  },
};

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    severity: string;
    confidence: string;
    decided_by: string;
    reason: string;
    symptoms: string;
    input_method: string;
  }>();

  const severity = params.severity || "Insufficient";
  const confidence = parseFloat(params.confidence || "0");
  const symptoms = params.symptoms ? params.symptoms.split(",") : [];
  const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.Insufficient;

  const hasSaved = useRef(false);

  useEffect(() => {
    const saveToDatabase = async () => {
      if (severity === "Insufficient" || hasSaved.current) return;
      hasSaved.current = true;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: pilgrim } = await supabase.from("pilgrims").select("id").eq("user_id", user.id).single();
        if (!pilgrim) return;

        const { data: session } = await supabase.from("analysis_sessions").insert({
          pilgrim_id: pilgrim.id,
          input_method: params.input_method || "unknown",
          severity_result: severity,
          confidence_score: confidence,
          decided_by: params.decided_by || "model",
          reason: params.reason || ""
        }).select().single();

        if (session && symptoms.length > 0) {
          const symptomsData = symptoms.map(symp => ({ session_id: session.id, symptom_name: symp.trim() }));
          await supabase.from("session_symptoms").insert(symptomsData);
        }
      } catch (error) { console.error("Database Save Error:", error); }
    };
    saveToDatabase();
  }, [severity]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.xl }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.xs, backgroundColor: colors.primaryLight, borderRadius: radius.sm, marginRight: spacing.md }}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={{ ...typography.title, color: colors.textPrimary, fontSize: 22, fontWeight: "800" }}>Analysis Results</Text>
        </View>

        <View style={{ backgroundColor: config.bgColor, borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", marginBottom: spacing.xl, borderWidth: 2, borderColor: config.color, ...shadow.card }}>
          <Ionicons name={config.icon} size={64} color={config.color} />
          <Text style={{ fontSize: 26, fontWeight: "900", color: config.color, marginTop: spacing.md, textAlign: "center" }}>{config.title}</Text>
          <Text style={{ fontSize: 16, color: config.color, fontWeight: "600", marginTop: spacing.xs }}>{config.subtitle}</Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.card }}>
          <Text style={{ ...typography.subtitle, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.sm }}>Recommendation</Text>
          <Text style={{ ...typography.body, color: colors.textSecondary, lineHeight: 24 }}>{config.description}</Text>
        </View>

        {severity === "High" && (
          <TouchableOpacity
            style={{ backgroundColor: "#ef4444", borderRadius: radius.md, padding: spacing.lg, alignItems: "center", justifyContent: "center", marginBottom: spacing.md, flexDirection: "row", ...shadow.floating }}
            onPress={() => Linking.openURL("tel:911")}
          >
            <Ionicons name="call" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ ...typography.body, fontWeight: "700", color: "#fff", fontSize: 18 }}>Call Emergency 911</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{ backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.lg, alignItems: "center", justifyContent: "center", marginBottom: spacing.lg, flexDirection: "row", ...shadow.floating }}
          onPress={() => router.push({ pathname: "/FacilitiesScreen" as any, params: { type: config.type, severity: severity } })}
        >
          <Ionicons name="location" size={24} color="#fff" style={{ marginRight: 10 }} />
          <Text style={{ ...typography.body, fontWeight: "700", color: "#fff", fontSize: 18 }}>Find Nearest {config.type}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ borderRadius: radius.md, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.divider }}
          onPress={() => router.push("/symptom-screen")}
        >
          <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>🔄 New Analysis</Text>
        </TouchableOpacity>

        <Text style={{ ...typography.caption, color: colors.textMuted, textAlign: "center", marginTop: spacing.xl, lineHeight: 18 }}>
          ⚠️ This app is for assistance only and does not replace professional medical advice.
        </Text>
      </ScrollView>
    </View>
  );
}