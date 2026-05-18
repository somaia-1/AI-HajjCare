import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Linking, StyleSheet } from "react-native";
import Header from "../components/Header";
import { supabase } from "@/lib/supabase";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function FacilitiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { type, severity } = useLocalSearchParams<{ type: string; severity: string }>();

  const [currentHajjPhase, setCurrentHajjPhase] = useState<"Auto" | "Mina" | "Arafat" | "Muzdalifah">("Auto");
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, [currentHajjPhase]);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      let query = supabase.from('health_facilities').select('*');
      if (currentHajjPhase !== "Auto") query = query.ilike('area', currentHajjPhase);
      
      let targetType = type;
      if (severity === "High" && currentHajjPhase === "Muzdalifah") targetType = "PHCC"; 
      
      query = query.ilike('type', targetType || "PHCC");
      const { data, error } = await query;
      if (error) throw error;
      setFacilities(data || []);
    } catch (error: any) { console.error(error.message); } finally { setLoading(false); }
  };

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(name)}&ll=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(name)})`
    });
    if (url) Linking.openURL(url);
  };

 return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header Component with custom padding to match original design */}
      <View style={styles.headerWrapper}>
        <Header 
          title="Nearby Facilities" 
          iconName="close-circle" 
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Location Selection Area */}
        <View style={styles.phaseCard}>
          <Text style={styles.phaseTitle}>Select Your Location:</Text>
          <View style={styles.phaseTagsWrapper}>
            {["Auto", "Mina", "Arafat", "Muzdalifah"].map((phase) => (
              <TouchableOpacity
                key={phase}
                onPress={() => setCurrentHajjPhase(phase as any)}
                style={[
                  styles.phaseTag,
                  currentHajjPhase === phase ? styles.phaseTagActive : styles.phaseTagInactive
                ]}
              >
                <Text style={currentHajjPhase === phase ? styles.phaseTextActive : styles.phaseTextInactive}>
                  {phase}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Warning for Muzdalifah */}
        {severity === "High" && currentHajjPhase === "Muzdalifah" && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Note: There are no hospitals in Muzdalifah. Health centers (PHCC) are displayed instead.
            </Text>
          </View>
        )}

        <Text style={styles.resultsTitle}>Results:</Text>
        
        {/* Facilities List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : facilities.length > 0 ? (
          facilities.map((item) => (
            <View key={item.id} style={styles.facilityCard}>
              <View style={styles.facilityInfo}>
                <Text style={styles.facilityName}>{item.name}</Text>
                <Text style={styles.facilityArea}>{item.area}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => openInMaps(item.lat, item.lng, item.name)} 
                style={styles.mapButton}
              >
                <Ionicons name="location" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No facilities found.</Text>
          </View>
        )}
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
  headerWrapper: {
    paddingHorizontal: spacing.lg
  },
  scrollContent: {
    padding: spacing.lg
  },
  phaseCard: {
    marginBottom: spacing.lg, 
    backgroundColor: colors.card, 
    padding: spacing.md, 
    borderRadius: radius.lg, 
    ...shadow.card
  },
  phaseTitle: {
    ...typography.body, 
    fontWeight: "700", 
    marginBottom: spacing.sm, 
    color: colors.primary
  },
  phaseTagsWrapper: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8
  },
  phaseTag: {
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 99, 
    borderWidth: 1, 
    borderColor: colors.primary
  },
  phaseTagActive: {
    backgroundColor: colors.primary
  },
  phaseTagInactive: {
    backgroundColor: colors.background
  },
  phaseTextActive: {
    color: "#fff", 
    fontSize: 12, 
    fontWeight: "600"
  },
  phaseTextInactive: {
    color: colors.primary, 
    fontSize: 12, 
    fontWeight: "600"
  },
  warningBox: {
    backgroundColor: "#fffbeb", 
    padding: spacing.md, 
    borderRadius: radius.md, 
    marginBottom: spacing.md, 
    borderWidth: 1, 
    borderColor: "#fef3c7"
  },
  warningText: {
    color: "#b45309", 
    fontWeight: "700", 
    fontSize: 13
  },
  resultsTitle: {
    ...typography.body, 
    fontWeight: "800", 
    marginBottom: spacing.sm, 
    color: colors.textPrimary
  },
  loader: {
    marginTop: 20
  },
  facilityCard: {
    backgroundColor: colors.card, 
    padding: spacing.md, 
    borderRadius: radius.md, 
    marginBottom: spacing.sm, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    borderLeftWidth: 5, 
    borderLeftColor: colors.primary, 
    ...shadow.card
  },
  facilityInfo: {
    flex: 1
  },
  facilityName: {
    fontWeight: "700", 
    fontSize: 16, 
    color: colors.textPrimary
  },
  facilityArea: {
    color: colors.textSecondary, 
    fontSize: 12
  },
  mapButton: {
    backgroundColor: colors.primaryLight, 
    padding: 10, 
    borderRadius: 50
  },
  emptyContainer: {
    padding: 20, 
    alignItems: "center"
  },
  emptyText: {
    color: colors.textMuted
  }
});