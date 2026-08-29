import React, { useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme";
import type { Role } from "./RoleSelectScreen";

const ROLE_COPY: Record<Role, string> = {
  parent: "Continue as Parent",
  passenger: "Continue as Employee / Passenger",
  driver: "Continue as Driver",
  organization: "Continue as Organization",
};

interface Props {
  intendedRole?: Role;
  onBack?: () => void;
}

export default function LoginScreen({ intendedRole, onBack }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch {
      setError("Couldn't sign in. Check your username, password, and that the backend is reachable.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{"\u2039"} Back</Text>
        </TouchableOpacity>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={styles.eyebrow}>SMART MOBILITY · SAFER JOURNEYS</Text>
          <Text style={styles.title}>RideX360</Text>
          <Text style={styles.subtitle}>{intendedRole ? ROLE_COPY[intendedRole] : "Sign in to continue"}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="e.g. parent1"
              placeholderTextColor={colors.inkFaint}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.inkFaint}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !username || !password}
          >
            {submitting ? (
              <ActivityIndicator color={colors.cream} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Demo accounts: driver1 / parent1{"\u2013"}parent5{"\n"}Password: ridex360demo
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl },
  backBtn: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  backText: { color: colors.rose, fontWeight: "700", fontSize: 13 },
  eyebrow: {
    fontSize: 11, fontWeight: "700", letterSpacing: 1.4, color: colors.rose,
    marginBottom: spacing.xs,
  },
  title: { fontSize: 34, fontWeight: "700", color: colors.plum, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.inkSoft, marginBottom: spacing.xl },
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: "600", color: colors.inkSoft, marginBottom: 6 },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: 15, color: colors.ink,
  },
  error: { color: colors.alert, fontSize: 12.5, marginBottom: spacing.sm },
  button: {
    backgroundColor: colors.plum, borderRadius: radius.pill, paddingVertical: 14,
    alignItems: "center", marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.cream, fontWeight: "700", fontSize: 15 },
  hint: { marginTop: spacing.lg, fontSize: 11.5, color: colors.inkFaint, textAlign: "center", lineHeight: 18 },
});