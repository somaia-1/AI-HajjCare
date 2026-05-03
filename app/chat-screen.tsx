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
} from "react-native";
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadow, spacing, typography } from "@/constants/theme";

// ── رابط الـ Backend — غيّريه لرابط ngrok الخاص بك ──────────────
const API_URL = "https://gaited-stormless-galileo.ngrok-free.dev";
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

      // لو ما عرف يستخرج أعراض
      if (!data.severity || data.severity === null) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: data.message || "I couldn't recognize any clear symptoms. Could you describe your condition more clearly?\n\nExample: \"I am experiencing a headache, fever, and fatigue.\"",
        };
        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      // لو الأعراض أقل من 3
      if (data.severity === "Insufficient") {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "I need a little more information about your condition 🤔\n\nAre you experiencing any other symptoms, such as:\n• Fever or high temperature?\n• Pain anywhere in your body?\n• Dizziness or nausea?",
        };
        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      // النتيجة جاهزة — انتقل لشاشة النتيجة
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: `Symptoms analyzed successfully ✅\nDisplaying results...`,
};
      setMessages((prev) => [...prev, botMessage]);

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
      Alert.alert("خطأ", "تعذّر الاتصال بالسيرفر.");
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={{
          alignSelf: isUser ? "flex-end" : "flex-start",
          maxWidth: "80%",
          marginVertical: spacing.xs,
          marginHorizontal: spacing.sm,
        }}
      >
        <View
          style={{
            backgroundColor: isUser ? colors.primary : colors.card,
            borderRadius: radius.lg,
            borderBottomRightRadius: isUser ? 4 : radius.lg,
            borderBottomLeftRadius: isUser ? radius.lg : 4,
            padding: spacing.md,
            ...shadow.card,
          }}
        >
          <Text
            style={{
              color: isUser ? colors.textOnPrimary : colors.textPrimary,
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };
const headerHeight = useHeaderHeight();
  return (
<KeyboardAvoidingView 
  behavior={Platform.OS === "ios" ? "padding" : "height"} 
  keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0} 
  style={{ flex: 1 }}
>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: spacing.xs,
            backgroundColor: colors.primaryLight,
            borderRadius: radius.sm,
            marginRight: spacing.md,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ ...typography.title, fontSize: 18, fontWeight: "800", color: colors.textPrimary }}>
            AI Medical Consultant
          </Text>
        </View>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "#22c55e",
          }}
        />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: spacing.md }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Loading indicator */}
      {loading && (
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ marginLeft: spacing.sm, color: colors.textSecondary, fontSize: 13 }}>
           Analyzing...
          </Text>
        </View>
      )}

      {/* Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          backgroundColor: colors.background,
          gap: spacing.sm,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: radius.full,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            fontSize: 15,
            color: colors.textPrimary,
            borderWidth: 1,
            borderColor: colors.divider,
            textAlign: "right",
          }}
          placeholder="Describe your symptoms in English..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            backgroundColor: input.trim() ? colors.primary : colors.divider,
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="send" size={20} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}