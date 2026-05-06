import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View, StyleSheet} from "react-native";
import Header from "../components/Header";
import { supabase } from "@/lib/supabase";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";

const SEVERITY_CONFIG = {
  High: {
    color: colors.severity.high,
    bgColor: "#fef2f2",
    icon: "alert-circle" as const,
    title: "⚠️ Critical Condition",
    subtitle: "Call Emergency?",
    description: "Your symptoms indicate a medical emergency that requires immediate attention. Do not delay — go to the nearest hospital or medical center now.",
    action: "🏥 Get Help Now",
    actionColor: colors.severity.high,
    type: "Hospital",
  },
  Medium: {
    color: colors.severity.moderate,
    bgColor: "#fff7ed",
    icon: "warning" as const,
    title: "Medium Condition",
    subtitle: "See a doctor soon",
    description: "Your condition requires medical attention as soon as possible. Do not ignore your symptoms — visit the nearest clinic or medical center.",
    action: "Find Nearby Hospitals",
    actionColor: colors.severity.moderate,
    type: "PHCC",
  },
  Low: {
    color: colors.severity.low,
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
    color: colors.severity.insufficientData,
    bgColor: "#f9fafb",
    icon: "help-circle" as const,
    title: "❓ Insufficient Data",
    subtitle: "Please enter more symptoms",
    description: "The symptoms provided were not enough to determine the severity accurately. Please enter at least 3 symptoms.",
    action: "🔄 Try Again",
    actionColor: colors.severity.insufficientData,
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Unified Header Component */}
        <Header title="Analysis Results" />

        {/* Severity Status Card */}
        <View style={[styles.statusCard, { backgroundColor: config.bgColor, borderColor: config.color }]}>
          <Ionicons name={config.icon} size={64} color={config.color} />
          <Text style={[styles.statusTitle, { color: config.color }]}>{config.title}</Text>
          <Text style={[styles.statusSubtitle, { color: config.color }]}>{config.subtitle}</Text>
        </View>

        {/* Recommendation Section */}
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>Recommendation</Text>
          <Text style={styles.recommendationText}>{config.description}</Text>
        </View>

        {/* Emergency Action (Visible only for High Severity) */}
        {severity === "High" && (
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Linking.openURL("tel:911")}
          >
            <Ionicons name="call" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.emergencyButtonText}>Call Emergency 911</Text>
          </TouchableOpacity>
        )}

        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: "/FacilitiesScreen" as any, params: { type: config.type, severity: severity } })}
        >
          <Ionicons name="location" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.actionButtonText}>Find Nearest {config.type}</Text>
        </TouchableOpacity>

        {/* Retry Analysis Button */}
        <TouchableOpacity
          style={styles.newAnalysisButton}
          onPress={() => router.push("/symptom-screen")}
        >
          <Text style={styles.newAnalysisText}>🔄 New Analysis</Text>
        </TouchableOpacity>

        {/* Disclaimer Note */}
        <Text style={styles.disclaimerText}>
          ⚠️ This app is for assistance only and does not replace professional medical advice.
        </Text>
      </ScrollView>
    </View>
  );
}

// ==========================================
// Stylesheet
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: spacing.lg, 
    paddingBottom: spacing.xxl
  },
  statusCard: {
    borderRadius: radius.xl, 
    padding: spacing.xl, 
    alignItems: "center", 
    marginBottom: spacing.xl, 
    borderWidth: 2, 
    ...shadow.card
  },
  statusTitle: {
    fontSize: 26, 
    fontWeight: "900", 
    marginTop: spacing.md, 
    textAlign: "center"
  },
  statusSubtitle: {
    fontSize: 16, 
    fontWeight: "600", 
    marginTop: spacing.xs
  },
  recommendationCard: {
    backgroundColor: colors.card, 
    borderRadius: radius.lg, 
    padding: spacing.lg, 
    marginBottom: spacing.lg, 
    ...shadow.card
  },
  recommendationTitle: {
    ...typography.subtitle, 
    fontWeight: "700", 
    color: colors.textPrimary, 
    marginBottom: spacing.sm
  },
  recommendationText: {
    ...typography.body, 
    color: colors.textSecondary, 
    lineHeight: 24
  },
  emergencyButton: {
    backgroundColor: "#ef4444", 
    borderRadius: radius.md, 
    padding: spacing.lg, 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: spacing.md, 
    flexDirection: "row", 
    ...shadow.floating
  },
  emergencyButtonText: {
    ...typography.body, 
    fontWeight: "700", 
    color: "#fff", 
    fontSize: 18
  },
  actionButton: {
    backgroundColor: colors.primary, 
    borderRadius: radius.md, 
    padding: spacing.lg, 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: spacing.lg, 
    flexDirection: "row", 
    ...shadow.floating
  },
  actionButtonText: {
    ...typography.body, 
    fontWeight: "700", 
    color: "#fff", 
    fontSize: 18
  },
  buttonIcon: {
    marginRight: 10
  },
  newAnalysisButton: {
    borderRadius: radius.md, 
    padding: spacing.md, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: colors.divider
  },
  newAnalysisText: {
    color: colors.textSecondary, 
    fontWeight: "600"
  },
  disclaimerText: {
    ...typography.caption, 
    color: colors.textMuted, 
    textAlign: "center", 
    marginTop: spacing.xl, 
    lineHeight: 18
  }
});