import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef } from "react";

const SEVERITY_CONFIG = {
  High: {
    color:       "#ef4444",
    bgColor:     "#fef2f2",
    icon:        "alert-circle" as const,
    title:       "⚠️ Critical Condition",
    subtitle:    "Call Emergency?",
    description: "Your symptoms indicate a medical emergency that requires immediate attention. Do not delay — go to the nearest hospital or medical center now.",
    action:      "🏥 Get Help Now",
    actionColor: "#ef4444",
  },
  Medium: {
    color:       "#f97316",
    bgColor:     "#fff7ed",
    icon:        "warning" as const,
    title:       "Medium Condition",
    subtitle:    "See a doctor soon",
    description: "Your condition requires medical attention as soon as possible. Do not ignore your symptoms — visit the nearest clinic or medical center.",
    action:      "Find Nearby Hospitals",
    actionColor: "#f97316",
  },
  Low: {
    color:       "#22c55e",
    bgColor:     "#f0fdf4",
    icon:        "checkmark-circle" as const,
    title:       "✅ Mild Condition",
    subtitle:    "Rest is sufficient",
    description: "Your symptoms are mild and not a cause for concern. Make sure to rest and stay hydrated. If symptoms worsen, consult a doctor.",
    action:      undefined,
    actionColor: undefined,
  },
  Insufficient: {
    color:       "#6b7280",
    bgColor:     "#f9fafb",
    icon:        "help-circle" as const,
    title:       "❓ Insufficient Data",
    subtitle:    "Please enter more symptoms",
    description: "The symptoms provided were not enough to determine the severity accurately. Please enter at least 3 symptoms.",
    action:      "🔄 Try Again",
    actionColor: "#6b7280",
  },
};

const decidedByLabel: Record<string, string> = {
  model:            "🤖 Model",
  safety_override:  "🛡️ Safety Rule",
};

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    severity:   string;
    confidence: string;
    decided_by: string;
    reason:     string;
    symptoms:   string;
    input_method: string;
  }>();

  const severity   = params.severity   || "Insufficient";
  const confidence = parseFloat(params.confidence || "0");
  const decided_by = params.decided_by || "model";
  const reason     = params.reason     || "";
  const symptoms   = params.symptoms   ? params.symptoms.split(",") : [];
  const input_method = params.input_method || "unknown";

  const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.Insufficient;

  const phoneNumber = "911";

  const hasSaved = useRef(false);
  useEffect(() => {
    const saveToDatabase = async () => {
      // don't save if severity is insufficient or if we've already saved for this session.
      if (severity === "Insufficient" || hasSaved.current) return;
      hasSaved.current = true;

      try {
        //1. user authentication and session saving logic
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
          //2. user is authenticated, now we find their pilgrim profile
        const { data: pilgrim, error: pilgrimError } = await supabase
          .from("pilgrims")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (pilgrimError || !pilgrim) {
          console.log("Pilgrim profile not found for saving session.");
          return;
        }

        //3. Save the analysis session
        const { data: session, error: sessionError } = await supabase
          .from("analysis_sessions")
          .insert({
            pilgrim_id: pilgrim.id,
            input_method: input_method,
            severity_result: severity,
            confidence_score: confidence,
             decided_by: decided_by,
            reason: reason
          })
          .select() // to return the inserted session with its ID
          .single();

        if (sessionError || !session) {
          console.error("Error saving session:", sessionError);
          return;
        }

        //4. Save detected symptoms linked to this session
        if (symptoms.length > 0) {
          const symptomsData = symptoms.map(symp => ({
            session_id: session.id,
            symptom_name: symp.trim()
          }));
            const { error: symptomsError } = await supabase
            .from("session_symptoms")
            .insert(symptomsData);

          if (symptomsError) {
            console.error("Error saving symptoms:", symptomsError);
          } else {
            console.log("✅ Session and Symptoms saved to database successfully!");
          }
        }

      } catch (error) {
        console.error("Database Save Exception:", error);
      }
    };
     saveToDatabase();
  }, [severity]); //to run only once when severity is determined

  const callEmergency = () => {
    const phoneUrl = `telprompt:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Sorry", "Cannot open the dialer on a simulator. Please test on a real device.");
        } else {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch((err) => console.error("Error calling:", err));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: spacing.xl,
          marginBottom: spacing.xl,
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
          Analysis Results
        </Text>
      </View>

      {/* Main Result Card */}
      <View
        style={{
          backgroundColor: config.bgColor,
          borderRadius: radius.xl,
          padding: spacing.xl,
          alignItems: "center",
          marginBottom: spacing.xl,
          borderWidth: 2,
          borderColor: config.color,
          ...shadow.card,
        }}
      >
        <Ionicons name={config.icon} size={64} color={config.color} />
        <Text style={{ fontSize: 26, fontWeight: "900", color: config.color, marginTop: spacing.md, textAlign: "center" }}>
          {config.title}
        </Text>
        <Text style={{ fontSize: 16, color: config.color, fontWeight: "600", marginTop: spacing.xs }}>
          {config.subtitle}
        </Text>
      </View>

      {/* Recommendation */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginBottom: spacing.lg,
          ...shadow.card,
        }}
      >
        <Text style={{ ...typography.subtitle, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.sm }}>
          Recommendation
        </Text>
        <Text style={{ ...typography.body, color: colors.textSecondary, lineHeight: 24 }}>
          {config.description}
        </Text>
      </View>

      {/* Detected Symptoms */}
      {symptoms.length > 0 && (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            ...shadow.card,
          }}
        >
          <Text style={{ ...typography.subtitle, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.sm }}>
            Detected Symptoms ({symptoms.length})
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            {symptoms.map((s, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: colors.primaryLight,
                  borderRadius: radius.full,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>
                  {s.replace(/_/g, " ")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 
      Debug Info — remove before final submission 
      <View
        style={{
          backgroundColor: "#f3f4f6",
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.lg,
          borderWidth: 1,
          borderColor: "#9ca3af",
          borderStyle: "dashed",
        }}
      >
        <Text style={{ ...typography.subtitle, fontWeight: "800", color: "#374151", marginBottom: spacing.sm, textAlign: "center" }}>
          ⚙️ Developer Info (Debug)
        </Text>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ ...typography.body, color: "#4b5563", fontWeight: "600" }}>
            🔹 Decision by: {decidedByLabel[decided_by] || decided_by}
          </Text>
          <Text style={{ ...typography.body, color: "#4b5563", fontWeight: "600" }}>
            🔹 Confidence: {Math.round(confidence * 100)}%
          </Text>
          {reason ? (
            <Text style={{ ...typography.body, color: "#4b5563", fontWeight: "600" }}>
              🔹 Reason: {reason}
            </Text>
          ) : null}
        </View>
      </View>*/}

      {/* Action Button */}
      {config.action && (
        <TouchableOpacity
          style={{
            backgroundColor: config.actionColor,
            borderRadius: radius.md,
            padding: spacing.lg,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.md,
            flexDirection: "row",
            ...shadow.floating,
          }}
          onPress={() => {
            if (severity === "High") {
              callEmergency();
            } else if (severity === "Insufficient") {
              router.back();
            } else {
              router.push("/home");
            }
          }}
        >
          {severity === "High" && (
            <Ionicons name="call" size={24} color="#fff" style={{ marginRight: 10 }} />
          )}
          <Text style={{ ...typography.body, fontWeight: "700", color: "#fff", fontSize: 18 }}>
            {severity === "High" ? `Call Emergency ${phoneNumber}` : config.action}
          </Text>
        </TouchableOpacity>
      )}

      {/* New Analysis Button */}
      <TouchableOpacity
        style={{
          borderRadius: radius.md,
          padding: spacing.md,
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.divider,
        }}
        onPress={() => router.push("/symptom-screen")}
      >
        <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>
          🔄 New Analysis
        </Text>
      </TouchableOpacity>

      {/* Medical Disclaimer */}
      <Text
        style={{
          ...typography.caption,
          color: colors.textMuted,
          textAlign: "center",
          marginTop: spacing.xl,
          lineHeight: 18,
        }}
      >
        ⚠️ This app is for assistance only and does not replace professional medical advice.
      </Text>
    </ScrollView>
  );
}