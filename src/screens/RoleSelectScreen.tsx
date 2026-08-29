import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "../theme";
import { API_BASE_URL } from "../api/client";

export type Role = "parent" | "passenger" | "driver" | "organization";

interface Props {
  onSelect: (role: Role) => void;
}

const ROLES: { key: Role; title: string; subtitle: string; icon: string; bg: string }[] = [
  { key: "parent", title: "Parent", subtitle: "Track your child's journey", icon: "\uD83D\uDC68\u200D\uD83D\uDC67", bg: colors.beige },
  { key: "passenger", title: "Employee / Passenger", subtitle: "Track your own transport", icon: "\uD83E\uDDCD", bg: colors.roseLight },
  { key: "driver", title: "Driver", subtitle: "Run today's route", icon: "\uD83D\uDE8C", bg: colors.rose },
  { key: "organization", title: "Organization", subtitle: "Manage fleet & routes", icon: "\uD83C\uDFE2", bg: colors.mauve },
];

/**
 * First screen of the app. Doesn't gate any real backend logic on its
 * own -- Parent and Employee/Passenger both route to the same Login
 * screen today (the backend's role field, returned after login,
 * decides what the person actually sees). Organization opens the web
 * admin dashboard directly, since that's RideX360's V1 org experience.
 * This screen exists to make "how will you use RideX360" the very
 * first thing anyone sees, per the product brief.
 */
export default function RoleSelectScreen({ onSelect }: Props) {
  function handlePress(role: Role) {
    if (role === "organization") {
      Linking.openURL(API_BASE_URL.replace(/\/api\/?$/, "/admin/"));
      return;
    }
    onSelect(role);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.mark} />
        <Text style={styles.brand}>RideX360</Text>
        <Text style={styles.tagline}>Smart Mobility {"\u00B7"} Safer Journeys</Text>
      </View>

      <Text style={styles.question}>How will you use RideX360?</Text>

      <View style={styles.grid}>
        {ROLES.map((r) => (
          <TouchableOpacity key={r.key} style={styles.card} onPress={() => handlePress(r.key)} activeOpacity={0.85}>
            <View style={[styles.iconWrap, { backgroundColor: r.bg }]}>
              <Text style={styles.icon}>{r.icon}</Text>
            </View>
            <Text style={styles.cardTitle}>{r.title}</Text>
            <Text style={styles.cardSubtitle}>{r.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.footnote}>You can switch roles anytime from your profile.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.lg },
  header: { alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.xl },
  mark: {
    width: 30, height: 30, borderRadius: 10, marginBottom: 10,
    backgroundColor: colors.plum,
  },
  brand: { fontSize: 22, fontWeight: "700", color: colors.plum },
  tagline: { fontSize: 11, color: colors.rose, fontWeight: "600", letterSpacing: 0.4, marginTop: 2 },
  question: { fontSize: 17, fontWeight: "700", color: colors.plum, textAlign: "center", marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  icon: { fontSize: 20 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.plum, marginBottom: 3 },
  cardSubtitle: { fontSize: 11, color: colors.inkFaint, lineHeight: 15 },
  footnote: { textAlign: "center", fontSize: 11, color: colors.inkFaint, marginTop: spacing.xl },
});