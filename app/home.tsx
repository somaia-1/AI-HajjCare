import { colors, spacing, typography, radius, shadow } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [pilgrimData, setPilgrimData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPilgrimData();
  }, []);

  const loadPilgrimData = async () => {
    try {
      // 1. جلب المستخدم الحالي من الجلسة
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // إذا ما في جلسة، ارجع لصفحة البداية
        router.replace("/");
        return;
      }

      // 2. البحث باستخدام user_id (الطريقة الصحيحة ✅)
      const { data, error } = await supabase
        .from("pilgrims")
        .select("nusuk_id, full_name")
        .eq("user_id", user.id) // 👈 الربط الصحيح
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
        // حالة نادرة: المستخدم مسجل دخول لكن بياناته غير موجودة في جدول الحجاج
        console.log("User exists in Auth but not in Pilgrims table");
      }

    } catch (error) {
      console.error("System Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // 1. تسجيل الخروج من Supabase
          await supabase.auth.signOut();
          // 2. تنظيف أي بيانات مخزنة محلياً (إن وجدت)
          await AsyncStorage.clear();
          // 3. العودة لصفحة البداية
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>
          Loading your profile...
        </Text>
      </View>
    );
  }
//--------------------------------
 return (
  <ScrollView 
    style={{ flex: 1, backgroundColor: colors.background }} 
    contentContainerStyle={{ padding: spacing.lg }}
  >
    
    {/* 1️⃣ Header: دمجنا البراند مع أيقونات التحكم */}
    <View style={{ 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginTop: spacing.xxl, 
      marginBottom: spacing.xl
    }}>
      <Text style={{ ...typography.title, color: colors.textPrimary, fontSize: 29, fontWeight: "900" }}>
        AI HajjCare
      </Text>

      {/* تجمع أيقونة البروفايل والخروج معاً لتفادي التعارض البصري */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          {/* أيقونة زر الترجمة نضيفها لاحقاً لما نضيف خاصية اللغات، حالياً مجرد ديكور */}
          <Ionicons name="globe-outline" size={32} color={colors.primary} />
        

        {/* زر تسجيل الخروج حقك */}
        <TouchableOpacity onPress={handleLogout} style={{ padding: spacing.xs }}>
          <Ionicons name="log-out-outline" size={32} color={colors.buttonDanger} />
        </TouchableOpacity>
      </View>
    </View>

    {/* 2️⃣ Welcome Digital ID Card - ستايلك الرهيب */}
    <View style={{ 
      backgroundColor: colors.card, 
      borderRadius: radius.lg, 
      padding: spacing.lg, 
      marginBottom: spacing.xxl,
      borderWidth: 1,
      borderColor: colors.divider,
      borderLeftWidth: 6, 
      borderLeftColor: colors.primary,
      ...shadow.card 
    }}>
      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 }}>
          WELCOME TO YOUR JOURNEY
      </Text>
      
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 4 }}>
        {pilgrimData?.name || "----"}
      </Text>

      <View style={{ height: 1.4, backgroundColor: colors.divider, marginVertical: spacing.md }} />
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>NUSUK ID</Text>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800', marginTop: 2 }}>
            #{pilgrimData?.id || "2026101"}
          </Text>
        </View>
        <Ionicons name="qr-code-outline" size={30} color={colors.primary} />
      </View>
    </View>

    {/* 3️⃣ Medical Services Section */}
    <Text style={{ ...typography.subtitle, color: colors.textPrimary, marginBottom: spacing.md, fontWeight: '700' }}>
      Medical Services
    </Text>
    
    <TouchableOpacity 
      style={{ 
        backgroundColor: colors.card, 
        borderRadius: radius.md, 
        padding: spacing.lg, 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderWidth: 1,
        borderColor: colors.divider,
        ...shadow.card 
      }}
      onPress={() => router.push("/symptom-screen")}
    >
      <View style={{ 
        backgroundColor: colors.primaryLight, 
        padding: 10, 
        borderRadius: radius.sm,
        marginRight: spacing.md
      }}>
        <Ionicons name="pulse" size={26} color={colors.primary} />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.body, fontWeight: '700', color: colors.textPrimary, fontSize: 18 }}>
          Check Symptoms
        </Text>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>
          AI Health Analysis
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
    </TouchableOpacity>
  <TouchableOpacity 
  style={{ 
    backgroundColor: colors.card, 
    borderRadius: radius.md, 
    padding: spacing.lg, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: colors.divider,
    marginTop: spacing.md, 
    ...shadow.card 
  }}
  onPress={() => router.push("../history")}
>
  <View style={{ 
    backgroundColor: colors.primaryLight, 
    padding: spacing.sm, 
    borderRadius: radius.sm,
    marginRight: spacing.md
  }}>
    <Ionicons name="time" size={26} color={colors.primary} />
  </View>
  
  <View style={{ flex: 1 }}>
    <Text style={{ ...typography.subtitle, color: colors.textPrimary }}>
      Medical History
    </Text>
    <Text style={{ ...typography.caption, color: colors.textSecondary }}>
      Past AI Analysis Records
    </Text>
  </View>
  
  <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
</TouchableOpacity>

  </ScrollView>
);}