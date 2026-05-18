import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet
} from "react-native";
import Header from "../components/Header";
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadow, spacing, typography } from "@/constants/theme";

// ────────────────────── API URL ──────────────────────────────────
const API_URL = "https://ai-hajjcare-api.onrender.com";
// ─────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
};

const WELCOME_MESSAGE: Message = {
  id: "0",
  role: "bot",
  text: "Hello! I am your AI Medical Assistant 🤖\n\nPlease describe your symptoms in English , and I will assess the severity of your condition.\n\nExample: \"I have a high fever, chest pain, and fatigue.\"",
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userText = input.trim();
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      // if severity is null or undefined, ask for more information
      if (!data.severity || data.severity === null) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: data.message || "I couldn't recognize any clear symptoms. Could you describe your condition more clearly?\n\nExample: \"I am experiencing a headache, fever, and fatigue.\"",
        };
        setMessages((prev) => [...prev, botMessage]);
        return;
      }

     // Ensure severity data exists, otherwise ask for more clarity
      if (data.severity === "Insufficient") {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "I need a little more information about your condition 🤔\n\nAre you experiencing any other symptoms, such as:\n• Fever or high temperature?\n• Pain anywhere in your body?\n• Dizziness or nausea?",
        };
        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: `Symptoms analyzed successfully ✅\nDisplaying results...`,
};
      setMessages((prev) => [...prev, botMessage]);
      // Redirect to results after processing
      setTimeout(() => {
        router.push({
          pathname: "/result-screen",
          params: {
            severity:   data.severity,
            confidence: String(data.confidence),
            decided_by: data.decided_by,
            reason:     data.reason,
            symptoms:   (data.symptoms_detected || []).join(","),
             input_method: "chat",
          },
        });
      }, 1000);

    } catch (error) {
      Alert.alert("Error", "An error occurred while communicating with the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Component to render each chat message bubble.
   */
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.botWrapper]}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? colors.primary : colors.card,
              borderBottomRightRadius: isUser ? 4 : radius.lg,
              borderBottomLeftRadius: isUser ? radius.lg : 4,
            }
          ]}
        >
          <Text style={[styles.messageText, { color: isUser ? colors.textOnPrimary : colors.textPrimary }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} 
      style={styles.container}
    >
      {/* --- Custom Header with Responsive Insets --- */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AI Medical Consultant</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* --- Scrollable Chat Area --- */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Analyzing...</Text>
        </View>
      )}

      {/* --- Fixed Input Area at the bottom --- */}
      <View style={[styles.inputArea]}>
        <TextInput
          style={styles.textInput}
          placeholder="Type your symptoms..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          style={[styles.sendButton, { backgroundColor: input.trim() ? colors.primary : colors.divider }]}
        >
          <Ionicons name="send" size={20} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// Professional Stylesheet
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    padding: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  headerTitleContainer: {
    flex: 1
  },
  headerTitle: {
    ...typography.title, 
    fontSize: 18, 
    fontWeight: "800", 
    color: colors.textPrimary 
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
  },
  listContent: {
    paddingVertical: spacing.md
  },
  messageWrapper: {
    maxWidth: "80%",
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
  },
  userWrapper: { alignSelf: "flex-end" },
  botWrapper: { alignSelf: "flex-start" },
  messageBubble: {
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingArea: {
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: spacing.lg, 
    paddingBottom: spacing.sm 
  },
  loadingText: {
    marginLeft: spacing.sm, 
    color: colors.textSecondary, 
    fontSize: 13 
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.divider,
    textAlign: "left",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  }
});