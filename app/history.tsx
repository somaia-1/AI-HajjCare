import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";

import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";

interface AnalysisSession {
  id: string;
  created_at: string;
  severity_result: string;
  input_method: "chat" | "quick_checklist";
}

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pilgrim } = await supabase
        .from("pilgrims")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!pilgrim) return;

      const { data, error } = await supabase
        .from("analysis_sessions")
        .select("id, created_at, severity_result, input_method")
        .eq("pilgrim_id", pilgrim.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("History Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const getSeverityTheme = (severity: string) => {
    switch (severity) {
      case "High":   return { color: colors.severity.emergency, icon: "alert-circle" };
      case "Medium": return { color: colors.severity.moderate, icon: "warning" };
      case "Low":    return { color: colors.severity.normal, icon: "checkmark-circle" };
      default:       return { color: colors.textMuted, icon: "help-circle" };
    }
  };

 const renderItem = ({ item }: { item: AnalysisSession }) => {
    const theme = getSeverityTheme(item.severity_result);
    return (
      <View style={{ 
        backgroundColor: colors.card, 
        borderRadius: radius.lg, 
        padding: spacing.md, 
        marginBottom: spacing.md, 
        flexDirection: "row", 
        alignItems: "center",
        borderLeftWidth: 6,
        borderLeftColor: theme.color, 
        ...shadow.card 
      }}>
        <View style={{ 
          backgroundColor: theme.color + "15", // خلفية شفافة من نفس لون الحالة
          padding: spacing.sm,
          borderRadius: radius.sm,
          marginRight: spacing.md
        }}>
          <Ionicons name={theme.icon as any} size={22} color={theme.color} />
        </View>

        <View style={{ flex: 1 }}>
            <Text style={{ ...typography.body, fontWeight: "800", color: theme.color }}>
              {item.severity_result} Severity
            </Text>
          
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>
            {new Date(item.created_at).toLocaleDateString()} • via {item.input_method === "chat" ? "AI Chat" : "Checklist"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.lg }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.xs, backgroundColor: colors.primaryLight, borderRadius: radius.sm }}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ ...typography.title, color: colors.textPrimary, marginLeft: spacing.md }}>Medical History</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: spacing.xxl }}>
              <Ionicons name="clipboard-outline" size={60} color={colors.divider} />
              <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>No previous records.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}