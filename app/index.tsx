import { colors, radius, spacing, typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "expo-router";
import { useEffect} from "react"; 
import { Dimensions, StyleSheet, View, Text } from "react-native"; 
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");
export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Delay to allow the Lottie animation to play (3 seconds)
      setTimeout(() => {
      if (session) {
        router.replace("/home");
      } else {
       router.replace("/login");
      }
      }, 3000);
    };

    checkSession();
  }, []);
 
  return (
    <View style={styles.container}>
      {/* Animated Splash Illustration */}
      <LottieView
        source={require('@/assets/splash.json')}
        autoPlay
        loop
        style={styles.lottie}
      />

      {/* Brand Identity */}
      <Text style={styles.brandText}>
        AI HajjCare
      </Text>
    </View>
  );
}

// ==========================================
// Stylesheet
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  lottie: {
    width: 300,
    height: 300,
  },
  brandText: {
    ...typography.title,
    marginTop: spacing.xxl,
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    letterSpacing: 1,
   
  },
});