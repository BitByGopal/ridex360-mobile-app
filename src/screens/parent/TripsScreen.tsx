import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { Api } from "../../api/endpoints";
import { ApiError } from "../../api/client";
import { colors, radius, spacing } from "../../theme";
import { Passenger, Trip } from "../../types";

interface Row {
  passenger: Passenger;
  trip: Trip | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Scheduled", color: colors.warn },
  active: { label: "On Route", color: colors.good },
  completed: { label: "Completed", color: colors.inkFaint },
  cancelled: { label: "Cancelled", color: colors.alert },
};

/**
 * The backend only exposes TODAY's trip per child -- there's no
 * multi-day trip-history endpoint yet. Rather than fake a history
 * list, this screen shows today's real status for every child, which
 * is the honest v1 of "Trips" until a history API exists.
 */
export default function TripsScreen() {
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
        <Text style={styles.eyebrow}>TODAY</Text>
        <Text style={styles.title}>Trips</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.plum} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {rows.length === 0 && <Text style={styles.empty}>No children linked to your account yet.</Text>}
          {rows.map(({ passenger, trip }) => {
            const status = trip ? STATUS_LABEL[trip.status] : { label: "No trip today", color: colors.inkFaint };
            return (
              <View key={passenger.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{passenger.full_name}</Text>
                  <Text style={styles.detail}>{passenger.detail}</Text>
                  {trip && <Text style={styles.routeName}>{trip.route.name}</Text>}
                </View>
                <View style={[styles.statusChip, { backgroundColor: status.color + "22" }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    flexDirection: "row", alignItems: "center", backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md,
  },
  name: { fontSize: 14, fontWeight: "700", color: colors.plum },
  detail: { fontSize: 11.5, color: colors.inkFaint, marginTop: 1 },
  routeName: { fontSize: 11, color: colors.inkSoft, marginTop: 3 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  statusText: { fontSize: 10.5, fontWeight: "700" },
});