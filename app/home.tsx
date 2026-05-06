import { colors, spacing, typography, radius, shadow } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, Linking, StyleSheet } from "react-native";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [pilgrimData, setPilgrimData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPilgrimData();
  }, []);

  const loadPilgrimData = async () => {
    try {
      // get current user from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // if no user found, it means the session is invalid or expired, so we log out and go back to login screen
        router.replace("/");
        return;
      }

     
      const { data, error } = await supabase
        .from("pilgrims")
        .select("nusuk_id, full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching data:", error);
      }

      if (data) {
        setPilgrimData({
          id: data.nusuk_id,
          name: data.full_name,
        });
      } else {
        // if no pilgrim data found, it means the user exists in Auth but not in Pilgrims table
        console.log("User exists in Auth but not in Pilgrims table");
      }

    } catch (error) {
      console.error("System Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = () => {
  const email = 'hajjcare7@gmail.com';
  Linking.openURL(`mailto:${email}`).catch((err) => 
    console.error('Error opening email client:', err)
  );
};

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // 1. log out from Supabase
          await supabase.auth.signOut();
          // 2. clear local storage
          await AsyncStorage.clear();
          // 3. back to login screen
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]} 
      contentContainerStyle={styles.scrollContent}
    >
      
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.brandTitle}>AI HajjCare</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleSupport} style={styles.iconButton}>
            <MaterialIcons name="support-agent" size={32} color={colors.blue} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={32} color={colors.buttonDanger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Digital ID Card */}
      <View style={styles.idCard}>
        <Text style={styles.welcomeText}>WELCOME TO YOUR JOURNEY</Text>
        <Text style={styles.nameText}>{pilgrimData?.name || "----"}</Text>

        <View style={styles.divider} />
        
        <View style={styles.nusukRow}>
          <View>
            <Text style={styles.nusukLabel}>NUSUK ID</Text>
            <Text style={styles.nusukValue}>#{pilgrimData?.id || "2026101"}</Text>
          </View>
          <Ionicons name="qr-code-outline" size={30} color={colors.primary} />
        </View>
      </View>

      {/*  Medical Services Section */}
      <Text style={styles.sectionTitle}>Medical Services</Text>
      
      <TouchableOpacity 
        style={styles.serviceCard}
        onPress={() => router.push("/symptom-screen")}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="pulse" size={26} color={colors.primary} />
        </View>
        <View style={styles.serviceTextWrapper}>
          <Text style={styles.serviceTitle}>Check Symptoms</Text>
          <Text style={styles.serviceSubtitle}>AI Health Analysis</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.serviceCard, styles.historyCardMargin]}
        onPress={() => router.push("../history")}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="time" size={26} color={colors.primary} />
        </View>
        <View style={styles.serviceTextWrapper}>
          <Text style={styles.serviceTitle}>Medical History</Text>
          <Text style={styles.serviceSubtitle}>Past AI Analysis Records</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md, 
    color: colors.textSecondary
  },
  container: {
    flex: 1, 
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: spacing.lg
  },
  headerRow: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: spacing.xxl, 
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm
  },
  brandTitle: {
    ...typography.title, 
    color: colors.textPrimary, 
    fontSize: 29, 
    fontWeight: "900"
  },
  actionsRow: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: spacing.md
  },
  iconButton: {
    padding: spacing.xs, 
  },
  idCard: {
    backgroundColor: colors.card, 
    borderRadius: radius.lg, 
    padding: spacing.lg, 
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.divider,
    borderLeftWidth: 6, 
    borderLeftColor: colors.primary,
    ...shadow.card
  },
  welcomeText: {
    color: colors.textSecondary, 
    fontSize: 12, 
    fontWeight: '600', 
    letterSpacing: 0.5
  },
  nameText: {
    color: colors.textPrimary, 
    fontSize: 24, 
    fontWeight: '800', 
    marginTop: 4
  },
  divider: {
    height: 1.4, 
    backgroundColor: colors.divider, 
    marginVertical: spacing.md
  },
  nusukRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  nusukLabel: {
    fontSize: 10, 
    color: colors.textMuted, 
    fontWeight: '700'
  },
  nusukValue: {
    color: colors.primary, 
    fontSize: 18, 
    fontWeight: '800', 
    marginTop: 2
  },
  sectionTitle: {
    ...typography.subtitle, 
    color: colors.textPrimary, 
    marginBottom: spacing.md, 
    fontWeight: '700'
  },
  serviceCard: {
    backgroundColor: colors.card, 
    borderRadius: radius.md, 
    padding: spacing.lg, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadow.card 
  },
  historyCardMargin: {
    marginTop: spacing.md
  },
  iconWrapper: {
    backgroundColor: colors.primaryLight, 
    padding: 10, 
    borderRadius: radius.sm,
    marginRight: spacing.md
  },
  serviceTextWrapper: {
    flex: 1
  },
  serviceTitle: {
    ...typography.body, 
    fontWeight: '700', 
    color: colors.textPrimary, 
    fontSize: 18
  },
  serviceSubtitle: {
    ...typography.caption, 
    color: colors.textSecondary
  }
});