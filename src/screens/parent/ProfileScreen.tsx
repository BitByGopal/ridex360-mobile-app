import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";
import { colors, radius, spacing } from "../../theme";

export default function ProfileScreen() {
  const { me, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileHead}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(me?.full_name || me?.username || "?").slice(0, 1).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.name}>{me?.full_name || me?.username}</Text>
            <Text style={styles.role}>Parent{me?.organization ? ` \u00B7 ${me.organization.name}` : ""}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Username</Text>
            <Text style={styles.rowValue}>{me?.username}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phone</Text>
            <Text style={styles.rowValue}>{me?.phone || "Not set"}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.rose, textTransform: "uppercase" },
  title: { fontSize: 24, fontWeight: "700", color: colors.plum, marginTop: 4 },
  content: { paddingHorizontal: spacing.lg },
  profileHead: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: spacing.lg },
  avatar: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: colors.plum,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: colors.cream, fontSize: 20, fontWeight: "700" },
  name: { fontSize: 16, fontWeight: "700", color: colors.plum },
  role: { fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg,
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { fontSize: 12, color: colors.inkSoft },
  rowValue: { fontSize: 12.5, fontWeight: "600", color: colors.plum },
  logoutBtn: { alignItems: "center", paddingVertical: 13, borderWidth: 1.5, borderColor: colors.alert, borderRadius: radius.pill },
  logoutText: { color: colors.alert, fontWeight: "700", fontSize: 13.5 },
});