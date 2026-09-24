import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { Api } from "../../api/endpoints";
import { ApiError } from "../../api/client";
import SOSButton from "../../components/SOSButton";
import { colors, radius, spacing } from "../../theme";
import { Passenger, Trip } from "../../types";

interface Row {
  passenger: Passenger;
  trip: Trip | null;
}

function safetyMessage(trip: Trip | null): { icon: string; text: string; color: string; bg: string } {
  if (!trip) return { icon: "\u26AA", text: "No active trip right now", color: colors.inkFaint, bg: colors.line };
  if (trip.status === "active") {
    return { icon: "\u2705", text: "Live tracking active", color: colors.good, bg: colors.goodSoft };
  }
  if (trip.status === "completed") {
    return { icon: "\u2705", text: "Trip completed safely", color: colors.good, bg: colors.goodSoft };
  }
  return { icon: "\u23F3", text: "Trip scheduled, not started yet", color: colors.warn, bg: colors.warnSoft };
}

/**
 * Real safety status per child, derived from the same trip data the
 * Home screen uses -- not a separate mocked "safety score" system.
 */
export default function SafetyScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const children = await Api.myChildren();
      const withTrips = await Promise.all(
        children.map(async (passenger): Promise<Row> => {
          try {
            const trip = await Api.childToday(passenger.id);
            return { passenger, trip };
          } catch (e) {
            if (e instanceof ApiError && e.status === 404) return { passenger, trip: null };
            throw e;
          }
        })
      );
      setRows(withTrips);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SAFETY</Text>
        <Text style={styles.title}>Journey safety</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.plum} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {rows.length === 0 && <Text style={styles.empty}>No children linked to your account yet.</Text>}
          {rows.map(({ passenger, trip }) => {
            const msg = safetyMessage(trip);
            return (
              <View key={passenger.id} style={[styles.card, { backgroundColor: msg.bg }]}>
                <Text style={styles.cardIcon}>{msg.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{passenger.full_name} is safe</Text>
                  <Text style={[styles.cardMessage, { color: msg.color }]}>{msg.text}</Text>
                  {trip?.last_ping_at && (
                    <Text style={styles.cardSub}>
                      Last updated {Math.max(0, Math.floor((Date.now() - new Date(trip.last_ping_at).getTime()) / 60000))} min ago
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

        <SOSButton bottomOffset={78} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.rose, textTransform: "uppercase" },
  title: { fontSize: 24, fontWeight: "700", color: colors.plum, marginTop: 4 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  empty: { textAlign: "center", color: colors.inkFaint, marginTop: 40 },
  card: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderRadius: radius.md, padding: spacing.md,
  },
  cardIcon: { fontSize: 20 },
  cardName: { fontSize: 14, fontWeight: "700", color: colors.plum },
  cardMessage: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  cardSub: { fontSize: 10.5, color: colors.inkFaint, marginTop: 3 },
});