import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface HeaderProps {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap; 
  onPress?: () => void;
  containerStyle?: ViewStyle;
}

export default function Header({ 
  title, 
  iconName = "chevron-back", 
  onPress, 
  containerStyle 
}: HeaderProps) {
  const router = useRouter();

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity 
        onPress={onPress ? onPress : () => router.back()} 
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name={iconName} size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    flex: 1, 
  }
});