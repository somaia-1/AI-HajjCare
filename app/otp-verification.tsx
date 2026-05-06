import { colors, radius, spacing, typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { 
  ActivityIndicator, 
  Alert, 
  Text, 
  TextInput, 
  TouchableOpacity,  
  KeyboardAvoidingView,  
  ScrollView, 
  TouchableWithoutFeedback,
  Platform,
  StyleSheet
} from "react-native";
import { useHeaderHeight } from '@react-navigation/elements';

export default function OtpVerification() {
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { email, data } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const verifyCode = async () => {
    if (!code || verifying) return;
    setVerifying(true);

    // 1. verify OTP code with Supabase Auth
    const { error } = await supabase.auth.verifyOtp({
      email: email as string,
      token: code,
      type: "email",
    });

    if (error) {
      Alert.alert("Verification Error", error.message);
      setVerifying(false);
      return;
    }

    // 2. parse scanned QR data (which contains Nusuk ID) from previous step
    let pilgrimData;
    try {
      pilgrimData = JSON.parse(data as string);
    } catch {
      Alert.alert("Error", "Invalid QR Data format");
      setVerifying(false);
      return;
    }

    // 3. get current authenticated user to link with pilgrim data
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;

    if (!currentUser) {
      Alert.alert("Error", "User session not found.");
      setVerifying(false);
      return;
    }

    // 4. update pilgrims table to link this user with the scanned Nusuk ID and also update last login time
    const { error: updateError } = await supabase
      .from("pilgrims")
      .update(
        { 
          user_id: currentUser.id,         
          last_login: new Date(),          
        })
      .eq("nusuk_id", pilgrimData.id);

    if (updateError) {
      console.error("Database Error:", updateError);
      Alert.alert("Database Error", "Failed to update pilgrim data. Please try again.");
    }

   
    router.replace("/home");
  };

  const maskEmail = (emailText: string) => {
    if (!emailText) return "";
    const [name, domain] = emailText.split("@");
    if (!domain) return emailText;  
  
    if (name.length <= 3) {
      return `${name}***@${domain}`;
    }
    
    // show first 3 characters of the email and mask the rest
    const visibleStart = name.substring(0, 3);
    return `${visibleStart}***@${domain}`;
  };
  

 return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight  : 0} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: headerHeight + 70 }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text style={styles.title}>Verification Code</Text>

        {/* Description & Masked Email */}
        <Text style={styles.subtitle}>
          Please enter the verification code sent to{"\n"}
          <Text style={styles.emailHighlight}>
            {maskEmail(email as string)}
          </Text>
        </Text>

        {/* OTP Input Field */}
        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          placeholder=" - - - - - - - -"
          placeholderTextColor={colors.textSecondary}
          maxLength={8}
          style={styles.otpInput}
          textContentType="oneTimeCode"
        />

        {/* Verification Button */}
        <TouchableOpacity
          onPress={verifyCode}
          disabled={verifying || code.length < 6}
          style={[
            styles.verifyButton, 
            { opacity: verifying || code.length < 6 ? 0.7 : 1 }
          ]}
        >
          {verifying ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Login</Text>
          )}
        </TouchableOpacity>

        {/* Back Navigation Button */}
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          disabled={verifying}
          activeOpacity={0.6}
          style={[styles.backButton, { opacity: verifying ? 0.4 : 1 }]}
        >
          <Ionicons 
            name="arrow-back-outline" 
            size={20} 
            color={colors.textSecondary} 
          />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexGrow: 1, 
    justifyContent: "center",
    paddingHorizontal: spacing.lg 
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: "center",
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: "700", 
    color: colors.textPrimary 
  },
  otpInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xl,
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  verifyButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  },
  backButton: { 
    marginTop: spacing.lg, 
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backButtonText: { 
    color: colors.textSecondary, 
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  }
});