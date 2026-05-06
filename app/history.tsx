import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from "react-native";
import Header from "../components/Header";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AnalysisSession {
  id: string;
  created_at: string;
  severity_result: string;
  input_method: "chat" | "quick_checklist";
}

export default function HistoryScreen() {
   const insets = useSafeAreaInsets();
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
      <View style={[styles.card, { borderLeftColor: theme.color }]}>
        <View style={[styles.iconWrapper, { backgroundColor: theme.color + "15" }]}>
          <Ionicons name={theme.icon as any} size={22} color={theme.color} />
        </View>

        <View style={styles.cardContent}>
            <Text style={[styles.severityText, { color: theme.color }]}>
              {item.severity_result} Severity
            </Text>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()} • via {item.input_method === "chat" ? "AI Chat" : "Checklist"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top } ]}>
      <Header title="Medical History" />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={60} color={colors.divider} />
              <Text style={styles.emptyText}>No previous records.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );} 
  
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: colors.background, 
    padding: spacing.lg
  },
  loader: {
    marginTop: spacing.xl
  },
  card: {
    backgroundColor: colors.card, 
    borderRadius: radius.lg, 
    padding: spacing.md, 
    marginBottom: spacing.md, 
    flexDirection: "row", 
    alignItems: "center",
    borderLeftWidth: 6,
    ...shadow.card 
  },
  iconWrapper: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginRight: spacing.md
  },
  cardContent: {
    flex: 1
  },
  severityText: {
    ...typography.body, 
    fontWeight: "800"
  },
  dateText: {
    ...typography.caption, 
    color: colors.textSecondary
  },
  emptyContainer: {
    alignItems: "center", 
    marginTop: spacing.xxl
  },
  emptyText: {
    color: colors.textSecondary, 
    marginTop: spacing.sm
  }
});