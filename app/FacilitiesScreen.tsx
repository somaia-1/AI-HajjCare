import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Linking } from "react-native";
import { supabase } from "@/lib/supabase";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";

export default function FacilitiesScreen() {
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: 60, paddingHorizontal: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ ...typography.title, fontSize: 22, fontWeight: "800" }}>Nearby Facilities</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ marginBottom: spacing.lg, backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.lg, ...shadow.card }}>
          <Text style={{ ...typography.body, fontWeight: "700", marginBottom: spacing.sm, color: colors.primary }}>Select Your Location:</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["Auto", "Mina", "Arafat", "Muzdalifah"].map((phase) => (
              <TouchableOpacity
                key={phase}
                onPress={() => setCurrentHajjPhase(phase as any)}
                style={{
                  paddingHorizontal: 15, paddingVertical: 8, borderRadius: 99,
                  backgroundColor: currentHajjPhase === phase ? colors.primary : colors.background,
                  borderWidth: 1, borderColor: colors.primary
                }}
              >
                <Text style={{ color: currentHajjPhase === phase ? "#fff" : colors.primary, fontSize: 12, fontWeight: "600" }}>{phase}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {severity === "High" && currentHajjPhase === "Muzdalifah" && (
          <View style={{ backgroundColor: "#fffbeb", padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: "#fef3c7" }}>
            <Text style={{ color: "#b45309", fontWeight: "700", fontSize: 13 }}>Note: There are no hospitals in Muzdalifah. Health centers (PHCC) are displayed instead.</Text>
          </View>
        )}

        <Text style={{ ...typography.body, fontWeight: "800", marginBottom: spacing.sm, color: colors.textPrimary }}>Results:</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : facilities.length > 0 ? (
          facilities.map((item) => (
            <View key={item.id} style={{
              backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md,
              marginBottom: spacing.sm, flexDirection: "row", alignItems: "center",
              justifyContent: "space-between", borderLeftWidth: 5, borderLeftColor: colors.primary, ...shadow.card
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", fontSize: 16, color: colors.textPrimary }}>{item.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.area}</Text>
              </View>
              <TouchableOpacity onPress={() => openInMaps(item.lat, item.lng, item.name)} style={{ backgroundColor: colors.primaryLight, padding: 10, borderRadius: 50 }}>
                <Ionicons name="location" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: colors.textMuted }}>No facilities found.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}