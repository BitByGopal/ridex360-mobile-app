import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { Api } from "../../api/endpoints";
import { colors, radius, spacing } from "../../theme";
import { OrgDashboardMetrics } from "../../types";

const POLL_INTERVAL_MS = 15000;

export default function OrgDashboardScreen() {
  const [metrics, setMetrics] = useState<OrgDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setMetrics(await Api.orgDashboard());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]));

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.plum} />
      </SafeAreaView>
    );
  }

  if (!metrics) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Couldn't load dashboard</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cards = [
    { label: "Active Vehicles", value: `${metrics.active_vehicles}/${metrics.total_vehicles}`, needsAttention: metrics.active_vehicles < metrics.total_vehicles },
    { label: "Active Drivers", value: `${metrics.active_drivers}/${metrics.total_drivers}` },
    { label: "Today's Trips", value: metrics.todays_trips },
    { label: "Active Alerts", value: metrics.active_alerts, isAlert: metrics.active_alerts > 0 },
    { label: "Passengers", value: metrics.total_passengers },
    { label: "Parents", value: metrics.total_parents },
    { label: "Employees", value: metrics.total_employees },
    { label: "Active Routes", value: metrics.active_routes },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{metrics.organization.name.toUpperCase()}</Text>
        <Text style={styles.title}>What's happening right now</Text>

        <View style={styles.grid}>
          {cards.map((c) => (
            <View key={c.label} style={[styles.card, c.isAlert && styles.cardAlert]}>
              <Text style={styles.cardLabel}>{c.label}</Text>
              <Text style={[styles.cardValue, c.isAlert && styles.cardValueAlert]}>{c.value}</Text>
              {c.needsAttention && !c.isAlert && <Text style={styles.attentionTag}>Needs attention</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.plum },
  content: { padding: spacing.lg, paddingBottom: 60 },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.rose, textTransform: "uppercase" },
  title: { fontSize: 22, fontWeight: "700", color: colors.plum, marginTop: 4, marginBottom: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { flexBasis: "47%", flexGrow: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md },
  cardAlert: { borderColor: colors.alert, backgroundColor: colors.alertSoft },
  cardLabel: { fontSize: 11, fontWeight: "600", color: colors.inkSoft },
  cardValue: { fontSize: 22, fontWeight: "700", color: colors.plum, marginTop: 6 },
  cardValueAlert: { color: colors.alert },
  attentionTag: { fontSize: 10, fontWeight: "700", color: colors.warn, marginTop: 4 },
});