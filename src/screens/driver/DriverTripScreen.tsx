import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";

import { Api } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TripMap from "../../components/TripMap";
import SOSButton from "../../components/SOSButton";
import { colors, radius, spacing } from "../../theme";
import { Trip } from "../../types";
import { formatClockTime, formatDelay } from "../../utils/format";

// Foreground GPS polling -- see backend README on why not background
// tracking / WebSockets in V1.
const GPS_INTERVAL_MS = 10000;

export default function DriverTripScreen() {
  const { me, logout } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const gpsTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const trips = await Api.myTripsToday();
      setTrip(trips[0] ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Once the trip is active, broadcast GPS on an interval. The whole
  // flow (permission -> location fix -> network call) is wrapped in
  // one try/catch so a failure at ANY step surfaces as a visible
  // banner instead of silently doing nothing forever.
  useEffect(() => {
    if (trip?.status !== "active") {
      if (gpsTimer.current) clearInterval(gpsTimer.current);
      return;
    }

    async function sendPing() {
      if (!trip) return;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setGpsError("Location permission not granted.");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const updated = await Api.sendGpsPing(trip.id, pos.coords.latitude, pos.coords.longitude);
        setTrip(updated);
        setGpsError(null);
      } catch (e) {
        setGpsError(e instanceof Error ? e.message : "Couldn't get GPS location.");
      }
    }

    sendPing();
    gpsTimer.current = setInterval(sendPing, GPS_INTERVAL_MS);
    return () => { if (gpsTimer.current) clearInterval(gpsTimer.current); };
  }, [trip?.status, trip?.id]);

  async function handleStart() {
    if (!trip) return;
    setBusy(true);
    try {
      setTrip(await Api.startTrip(trip.id));
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete() {
    if (!trip) return;
    Alert.alert("Complete trip?", "This marks the trip finished.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          setBusy(true);
          try {
            setTrip(await Api.completeTrip(trip.id));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }

  async function handleBoard(tripPassengerId: string) {
    if (!trip) return;
    setTrip(await Api.markPassengerBoarded(trip.id, tripPassengerId));
  }

  async function handleDroppedOff(tripPassengerId: string) {
    if (!trip) return;
    setTrip(await Api.markPassengerDroppedOff(trip.id, tripPassengerId));
  }

  async function handleDetectTraffic() {
    if (!trip) return;
    setTrip(await Api.detectTraffic(trip.id));
  }

  async function handleUseAlternate() {
    if (!trip) return;
    setTrip(await Api.useAlternateRoute(trip.id));
  }

  async function handleClearTraffic() {
    if (!trip) return;
    setTrip(await Api.clearTraffic(trip.id));
  }

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
          <TouchableOpacity onPress={logout} style={{ marginTop: spacing.lg }}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeStops = trip.trip_stops.filter((s) => s.status !== "skipped");
  const removedCount = trip.trip_stops.length - activeStops.length;
  const nextStop = activeStops.find((s) => s.status !== "arrived");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>
          {trip.is_replacement_driver ? "Replacement · " : ""}{trip.route.route_type} route
        </Text>
        <Text style={styles.title}>{trip.vehicle_label || "Your vehicle"}</Text>
        <Text style={styles.subtitle}>{trip.route.name}</Text>

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
                <TouchableOpacity onPress={handleUseAlternate} style={styles.altRouteBtn}>
                  <Text style={styles.altRouteBtnText}>Use Alternate Route</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={handleClearTraffic}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <TripMap trip={trip} height={180} />

        {trip.status === "active" && !trip.traffic_detected && (
          <TouchableOpacity style={styles.trafficTriggerBtn} onPress={handleDetectTraffic}>
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
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart} disabled={busy}>
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

        <Text style={styles.sectionLabel}>Passengers</Text>
        {trip.trip_passengers.map((tp) => {
          const isAbsent = tp.status === "absent" || tp.status === "no_show";
          return (
            <View key={tp.id} style={[styles.paxRow, isAbsent && styles.paxRowRemoved]}>
              <View style={styles.paxAvatar}>
                <Text style={styles.paxAvatarText}>
                  {tp.passenger_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </Text>
              </View>
              <Text style={[styles.paxName, isAbsent && styles.paxNameRemoved]}>{tp.passenger_name}</Text>
              {!isAbsent && trip.status === "active" && (
                <View style={styles.paxActions}>
                  {tp.status !== "boarded" && tp.status !== "dropped_off" && (
                    <TouchableOpacity style={styles.paxActionBtn} onPress={() => handleBoard(tp.id)}>
                      <Text style={styles.paxActionText}>Board</Text>
                    </TouchableOpacity>
                  )}
                  {tp.status === "boarded" && (
                    <TouchableOpacity style={styles.paxActionBtn} onPress={() => handleDroppedOff(tp.id)}>
                      <Text style={styles.paxActionText}>Drop off</Text>
                    </TouchableOpacity>
                  )}
                  {tp.status === "dropped_off" && <Text style={styles.paxDone}>Done</Text>}
                </View>
              )}
              {isAbsent && <Text style={styles.paxAbsentTag}>Absent</Text>}
            </View>
          );
        })}

        <TouchableOpacity onPress={logout} style={{ marginTop: spacing.xl, alignItems: "center" }}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
      <SOSButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.plum },
  content: { padding: spacing.lg, paddingBottom: 60 },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.rose, textTransform: "uppercase" },
  title: { fontSize: 22, fontWeight: "700", color: colors.plum, marginTop: 4 },
  subtitle: { fontSize: 12.5, color: colors.inkFaint, marginTop: 2, marginBottom: spacing.md },
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
  trafficTriggerBtn: { alignSelf: "flex-start", marginTop: 10, marginBottom: 4, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
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
  sectionLabel: { fontSize: 12, fontWeight: "700", color: colors.inkFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm },
  paxRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, padding: 10, marginBottom: 8 },
  paxRowRemoved: { opacity: 0.5 },
  paxAvatar: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.beige, alignItems: "center", justifyContent: "center" },
  paxAvatarText: { fontSize: 11, fontWeight: "700", color: colors.mauve },
  paxName: { flex: 1, fontSize: 12.5, fontWeight: "600", color: colors.plum },
  paxNameRemoved: { textDecorationLine: "line-through" },
  paxActions: { flexDirection: "row" },
  paxActionBtn: { backgroundColor: colors.plum, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  paxActionText: { color: colors.cream, fontSize: 11, fontWeight: "700" },
  paxDone: { fontSize: 11, color: colors.good, fontWeight: "700" },
  paxAbsentTag: { fontSize: 10, fontWeight: "700", color: colors.alert, backgroundColor: colors.alertSoft, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
  logoutText: { color: colors.alert, fontSize: 13, fontWeight: "600" },
});