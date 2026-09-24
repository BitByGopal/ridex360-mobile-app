import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDriverTrip } from "../../context/DriverTripContext";
import TripMap from "../../components/TripMap";
import { colors, radius, spacing } from "../../theme";
import { formatClockTime } from "../../utils/format";

export default function DriverRouteScreen() {
  const { trip, loading } = useDriverTrip();

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.plum} />
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No trip assigned today</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ROUTE OVERVIEW</Text>
        <Text style={styles.title}>{trip.route.name}</Text>

        <TripMap trip={trip} height={280} />

        <Text style={styles.sectionLabel}>Stops</Text>
        {trip.trip_stops.map((ts) => (
          <View key={ts.id} style={styles.stopRow}>
            <View style={[
              styles.stopDot,
              ts.status === "arrived" && styles.stopDotDone,
              ts.status === "skipped" && styles.stopDotSkipped,
            ]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.stopName, ts.status === "skipped" && styles.stopNameSkipped]}>
                {ts.stop.name}
              </Text>
              <Text style={styles.stopStatus}>
                {ts.status === "skipped" ? "Skipped -- no passengers today" : ts.status}
              </Text>
            </View>
            {ts.status !== "skipped" && ts.scheduled_arrival_at && (
              <Text style={styles.stopTime}>{formatClockTime(ts.scheduled_arrival_at)}</Text>
            )}
          </View>
        ))}
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
  sectionLabel: { fontSize: 12, fontWeight: "700", color: colors.inkFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.sm },
  stopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  stopDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.roseLight, marginTop: 3 },
  stopDotDone: { backgroundColor: colors.good },
  stopDotSkipped: { backgroundColor: colors.inkFaint },
  stopName: { fontSize: 13.5, fontWeight: "600", color: colors.plum },
  stopNameSkipped: { textDecorationLine: "line-through", color: colors.inkFaint },
  stopStatus: { fontSize: 11, color: colors.inkFaint, marginTop: 1, textTransform: "capitalize" },
  stopTime: { fontSize: 11, color: colors.inkFaint, fontWeight: "600" },
});