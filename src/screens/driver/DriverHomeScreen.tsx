import React from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { useDriverTrip } from "../../context/DriverTripContext";
import { colors, radius, spacing } from "../../theme";
import { formatClockTime, formatDelay } from "../../utils/format";
import type { DriverTabParamList } from "../../navigation/DriverNavigator";

const STALE_AFTER_SEC = 20;

export default function DriverHomeScreen() {
  const { trip, loading, busy, gpsError, startTrip, completeTrip, detectTraffic, useAlternateRoute, clearTraffic } = useDriverTrip();
  const navigation = useNavigation<BottomTabNavigationProp<DriverTabParamList>>();

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

  const activeStops = trip.trip_stops.filter((s) => s.status !== "skipped");
  const removedCount = trip.trip_stops.length - activeStops.length;
  const nextStop = activeStops.find((s) => s.status !== "arrived");

  const pingAgeSec = trip.last_ping_at
    ? Math.floor((Date.now() - new Date(trip.last_ping_at).getTime()) / 1000)
    : null;
  const gpsStatus =
    pingAgeSec == null ? { label: "No GPS yet", color: colors.inkFaint, dot: colors.inkFaint }
    : pingAgeSec < STALE_AFTER_SEC ? { label: "Live", color: colors.good, dot: colors.good }
    : { label: `Updated ${pingAgeSec}s ago`, color: colors.warn, dot: colors.warn };

  async function handleComplete() {
    Alert.alert("Complete trip?", "This marks the trip finished.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          const result = await completeTrip();
          if (!result.ok) Alert.alert("Can't complete trip yet", result.message);
        },
      },
    ]);
  }

  const previewPassengers = trip.trip_passengers.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              {trip.is_replacement_driver ? "Replacement · " : ""}{trip.route.route_type} route
            </Text>
            <Text style={styles.title}>{trip.vehicle_label || "Your vehicle"}</Text>
            <Text style={styles.subtitle}>{trip.route.name}</Text>
          </View>
          {trip.status === "active" && (
            <View style={styles.gpsStatusChip}>
              <View style={[styles.gpsDot, { backgroundColor: gpsStatus.dot }]} />
              <Text style={[styles.gpsStatusText, { color: gpsStatus.color }]}>{gpsStatus.label}</Text>
            </View>
          )}
        </View>

        {gpsError && (
          <View style={styles.gpsErrorBanner}>
            <Text style={styles.gpsErrorText}>⚠️ GPS: {gpsError}</Text>
          </View>
        )}

        {trip.traffic_detected && (
          <View style={[styles.trafficBanner, trip.alt_route_active ? styles.trafficBannerGood : styles.trafficBannerWarn]}>
            <Text style={styles.bannerIcon}>{trip.alt_route_active ? "\u2713" : "\u26A0\uFE0F"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                {trip.alt_route_active ? "Using alternate route" : "Heavy traffic detected"}
              </Text>
              {!trip.alt_route_active && (
                <TouchableOpacity onPress={useAlternateRoute} style={styles.altRouteBtn}>
                  <Text style={styles.altRouteBtnText}>Use Alternate Route</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={clearTraffic}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {trip.status === "active" && !trip.traffic_detected && (
          <TouchableOpacity style={styles.trafficTriggerBtn} onPress={detectTraffic}>
            <Text style={styles.trafficTriggerText}>{"\u26A0\uFE0F"} Simulate Traffic Detected</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{activeStops.length}</Text>
            <Text style={styles.statLabel}>Active stops</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{removedCount}</Text>
            <Text style={styles.statLabel}>Removed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{trip.trip_passengers.length}</Text>
            <Text style={styles.statLabel}>Passengers</Text>
          </View>
        </View>

        {nextStop?.eta_minutes != null && (
          <View style={styles.nextStopCard}>
            <Text style={styles.nextStopLabel}>Next: {nextStop.stop.name}</Text>
            <Text style={styles.nextStopTime}>Arriving {formatClockTime(nextStop.live_arrival_at)}</Text>
            {nextStop.delay_minutes != null && (() => {
              const { label, isDelayed } = formatDelay(nextStop.delay_minutes);
              return (
                <Text style={[styles.nextStopDelay, isDelayed && styles.nextStopDelayWarn]}>
                  {isDelayed ? "\u26A0\uFE0F " : ""}{label} {"\u00B7"} scheduled {formatClockTime(nextStop.scheduled_arrival_at)}
                </Text>
              );
            })()}
          </View>
        )}

        {trip.status === "scheduled" && (
          <TouchableOpacity style={styles.primaryButton} onPress={startTrip} disabled={busy}>
            <Text style={styles.primaryButtonText}>{busy ? "Starting..." : "Start Trip"}</Text>
          </TouchableOpacity>
        )}
        {trip.status === "active" && (
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete} disabled={busy}>
            <Text style={styles.completeButtonText}>{busy ? "..." : "Complete Trip"}</Text>
          </TouchableOpacity>
        )}
        {trip.status === "completed" && (
          <View style={styles.doneBanner}><Text style={styles.doneBannerText}>Trip completed</Text></View>
        )}

        <View style={styles.previewHeader}>
          <Text style={styles.sectionLabel}>Passengers</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Passengers")}>
            <Text style={styles.viewAllText}>View all \u2192</Text>
          </TouchableOpacity>
        </View>
        {previewPassengers.map((tp) => (
          <View key={tp.id} style={styles.paxPreviewRow}>
            <Text style={styles.paxPreviewName}>{tp.passenger_name}</Text>
            <Text style={styles.paxPreviewStatus}>{tp.status.replace("_", " ")}</Text>
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
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.rose, textTransform: "uppercase" },
  title: { fontSize: 22, fontWeight: "700", color: colors.plum, marginTop: 4 },
  subtitle: { fontSize: 12.5, color: colors.inkFaint, marginTop: 2, marginBottom: spacing.md },
  gpsStatusChip: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  gpsDot: { width: 7, height: 7, borderRadius: 4 },
  gpsStatusText: { fontSize: 10.5, fontWeight: "700" },
  gpsErrorBanner: { backgroundColor: colors.alertSoft, borderRadius: radius.md, padding: 10, marginBottom: spacing.sm },
  gpsErrorText: { fontSize: 11.5, color: colors.alert, fontWeight: "600" },
  trafficBanner: { flexDirection: "row", gap: 10, alignItems: "center", padding: 13, borderRadius: radius.md, marginBottom: spacing.sm },
  trafficBannerWarn: { backgroundColor: colors.alertSoft },
  trafficBannerGood: { backgroundColor: colors.goodSoft },
  bannerIcon: { fontSize: 15 },
  bannerTitle: { fontSize: 12.5, fontWeight: "700", color: colors.plum },
  altRouteBtn: { marginTop: 6, alignSelf: "flex-start", backgroundColor: colors.plum, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill },
  altRouteBtnText: { color: colors.cream, fontSize: 11, fontWeight: "700" },
  clearText: { fontSize: 11.5, color: colors.inkFaint, fontWeight: "600" },
  trafficTriggerBtn: { alignSelf: "flex-start", marginTop: 4, marginBottom: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  trafficTriggerText: { fontSize: 11, fontWeight: "600", color: colors.warn },
  statRow: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  statBox: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, padding: 12, alignItems: "center" },
  statNum: { fontSize: 19, fontWeight: "700", color: colors.plum },
  statLabel: { fontSize: 9.5, color: colors.inkFaint, textTransform: "uppercase", marginTop: 2 },
  nextStopCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14, marginBottom: spacing.md },
  nextStopLabel: { fontSize: 11, fontWeight: "700", color: colors.rose, textTransform: "uppercase", letterSpacing: 0.4 },
  nextStopTime: { fontSize: 16, fontWeight: "700", color: colors.plum, marginTop: 4 },
  nextStopDelay: { fontSize: 11.5, color: colors.good, marginTop: 3, fontWeight: "600" },
  nextStopDelayWarn: { color: colors.warn },
  primaryButton: { backgroundColor: colors.plum, borderRadius: radius.pill, paddingVertical: 14, alignItems: "center", marginBottom: spacing.lg },
  primaryButtonText: { color: colors.cream, fontWeight: "700", fontSize: 14 },
  completeButton: { backgroundColor: colors.good, borderRadius: radius.pill, paddingVertical: 14, alignItems: "center", marginBottom: spacing.lg },
  completeButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  doneBanner: { backgroundColor: colors.goodSoft, borderRadius: radius.sm, padding: 12, alignItems: "center", marginBottom: spacing.lg },
  doneBannerText: { color: "#3F5A3C", fontWeight: "700", fontSize: 12.5 },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: colors.inkFaint, textTransform: "uppercase", letterSpacing: 0.5 },
  viewAllText: { fontSize: 11.5, fontWeight: "700", color: colors.rose },
  paxPreviewRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  paxPreviewName: { fontSize: 12.5, fontWeight: "600", color: colors.plum },
  paxPreviewStatus: { fontSize: 11, color: colors.inkFaint, textTransform: "capitalize" },
});