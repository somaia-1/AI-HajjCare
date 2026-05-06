import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  
  
  const isProcessing = useRef(false);

  useEffect(() => {
   
    isProcessing.current = false;
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
  
    if (isProcessing.current) return;
    isProcessing.current = true;
    setShowScanner(false);

    let scannedData;
    try {
      scannedData = JSON.parse(data);
    } catch {
      Alert.alert("error", "Invalid QR code format.");
      isProcessing.current = false;
      return;
    }

    try {
     // Step 1: fetch the pilgrim's email using the scanned Nusuk ID
      const { data: pilgrim, error: dbError } = await supabase
        .from("pilgrims")
        .select("email")
        .eq("nusuk_id", scannedData.id) 
        .maybeSingle();

      if (dbError || !pilgrim) {
        Alert.alert("Access Denied", "Sorry, this Nusuk card is not registered in our system.");
        isProcessing.current = false;
        return;
      }

      // Step 2: Send OTP to the pilgrim's email for authentication
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: pilgrim.email,
        options: { shouldCreateUser: true },
      });

      if (authError) {
        Alert.alert("Error", authError.message);
        isProcessing.current = false;
        return;
      }

     // Step 3: Navigate to OTP verification screen
      router.replace({
        pathname: "/otp-verification",
        params: {
          email: pilgrim.email,
          data: JSON.stringify(scannedData),
        },
      });

    } catch (err: any) {
      Alert.alert("Error", "An error occurred while connecting to the database.");
      isProcessing.current = false;
    }
  };
  
  // --- Loading State UI during data processing ---
  if (!showScanner && isProcessing.current) {
     return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={{ marginTop: 20, color: colors.textSecondary }}>Processing...</Text>
      </View>
    );
  }

 // --- Camera Scanner Interface ---
  if (showScanner) {
    if (!permission?.granted) {
       return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ marginBottom: 20 }}>Camera permission required</Text>
          <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: colors.buttonPrimary, padding: 10, borderRadius: 5 }}>
            <Text style={{ color: 'white' }}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

   return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.fullScreen}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
        <TouchableOpacity
          style={styles.closeScannerButton}
          onPress={() => {
            setShowScanner(false);
            isProcessing.current = false;
          }}
        >
          <Ionicons name="close-circle" size={70} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  // --- Main Landing Login Interface ---
  return (
    <View style={styles.mainContainer}>
      
      {/* 1. Large QR Code Icon Branding */}
      <View style={styles.brandingWrapper}>
        <MaterialCommunityIcons 
          name="qrcode" 
          size={140} 
          color={colors.primary} 
        />
      </View>

      {/* 2. Main Title */}
      <Text style={styles.title}>Scan Your Nusuk Card</Text>

      {/* 3. Description text explaining the login process */}
      <Text style={styles.subtitle}>
        Point your camera at the QR code on your Nusuk card to log in securely.
      </Text>

      {/* 4. Action Button: Start Scanning */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          isProcessing.current = false;
          setShowScanner(true);
        }}
      >
        <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
        <Text style={styles.scanButtonText}>Start Scanning</Text>
      </TouchableOpacity>

    </View>
  );
}

// ==========================================
// Stylesheet
// ==========================================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: colors.background 
  },
  loadingText: {
    marginTop: 20, 
    color: colors.textSecondary,
    fontWeight: "600"
  },
  permissionContainer: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  permissionText: {
    marginBottom: 20,
    fontSize: 16,
    color: colors.textPrimary
  },
  permissionButton: {
    backgroundColor: colors.buttonPrimary, 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: radius.sm 
  },
  buttonText: {
    color: 'white',
    fontWeight: "bold"
  },
  scannerContainer: {
    flex: 1, 
    backgroundColor: "black" 
  },
  fullScreen: {
    flex: 1 
  },
  closeScannerButton: {
    position: "absolute", 
    bottom: 50, 
    alignSelf: "center" 
  },
  mainContainer: {
    flex: 1, 
    backgroundColor: colors.background, 
    paddingHorizontal: spacing.xl, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  brandingWrapper: {
    marginBottom: spacing.xl 
  },
  title: {
    ...typography.title,
    fontSize: 28, 
    fontWeight: 'bold', 
    color: colors.textPrimary, 
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  subtitle: {
    ...typography.body,
    fontSize: 16, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    marginBottom: spacing.xxl,
    lineHeight: 24,
    paddingHorizontal: 15
  },
  scanButton: {
    backgroundColor: colors.buttonPrimary, 
    width: '90%', 
    height: 58, 
    borderRadius: radius.md, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12,
    ...shadow.floating // Professional elevation/shadow
  },
  scanButtonText: {
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  }
});