import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Api } from "../../api/endpoints";
import { ApiError } from "../../api/client";
import TripMap from "../../components/TripMap";
import SOSButton from "../../components/SOSButton";
import { colors, radius, spacing } from "../../theme";
import { Trip } from "../../types";
import { formatClockTime, formatDelay } from "../../utils/format";
import type { ParentStackParamList } from "../../navigation/ParentNavigator";

type Props = NativeStackScreenProps<ParentStackParamList, "ChildTrip">;

// Polling stands in for real-time push in V1 -- see backend README for why.
const POLL_INTERVAL_MS = 8000;

export default function ChildTripScreen({ route }: Props) {
  const { passengerId, childName } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notScheduled, setNotScheduled] = useState(false);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await Api.childToday(passengerId);
      setTrip(data);
      setNotScheduled(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setNotScheduled(true);
      }
    } finally {
      setLoading(false);
    }
  }, [passengerId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  async function handleMarkAbsent() {
    Alert.alert(
      "Mark absent today?",
      `${childName}'s stop will be removed from today's route automatically.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark absent",
          style: "destructive",
          onPress: async () => {
            setMarking(true);
            try {
              const updated = await Api.markAbsent(passengerId);
              setTrip(updated);
            } catch {
              Alert.alert("Couldn't mark absent", "Please try again.");
            } finally {
              setMarking(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.plum} />
      </SafeAreaView>
    );
  }

  if (notScheduled || !trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No trip today</Text>
          <Text style={styles.emptyText}>There's no scheduled trip for {childName} today.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const myPassengerRecord = trip.trip_passengers.find((tp) => tp.passenger === passengerId);
  const isAbsent = myPassengerRecord?.status === "absent";
  const nextStop = trip.trip_stops.find((s) => s.status !== "arrived" && s.status !== "skipped");

  const pingAgeSec = trip.last_ping_at
    ? Math.floor((Date.now() - new Date(trip.last_ping_at).getTime()) / 1000)
    : null;
  const gpsLabel =
    pingAgeSec == null ? "No live signal yet"
    : pingAgeSec < 20 ? "Live"
    : `Updated ${pingAgeSec}s ago`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{trip.route.route_type === "morning" ? "Good morning" : "Good evening"}</Text>
        <Text style={styles.title}>{childName}'s trip</Text>

        {trip.traffic_detected && (
          <View style={[styles.banner, trip.alt_route_active ? styles.bannerGood : styles.bannerWarn]}>
            <Text style={styles.bannerIcon}>{trip.alt_route_active ? "\u2713" : "\u26A0\uFE0F"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                {trip.alt_route_active ? "Using alternate route" : "Heavy traffic detected"}
              </Text>
              <Text style={styles.bannerText}>
                {trip.alt_route_active
                  ? "Your driver switched routes \u2014 ETA updated."
                  : "Your driver may switch to a faster route shortly."}
              </Text>
            </View>
          </View>
        )}

        <TripMap trip={trip} />

        <View style={styles.vehicleCard}>
          <View style={styles.vehicleTop}>
            <View>
              <Text style={styles.vehicleName}>{trip.vehicle_label || "Vehicle"}</Text>
              <Text style={styles.vehicleSub}>{trip.route.name}</Text>
            </View>
            <View style={[styles.statusChip, trip.status === "active" && styles.statusChipActive]}>
              <Text style={styles.statusChipText}>
                {trip.status === "active" ? "On Route" : trip.status === "completed" ? "Completed" : "Scheduled"}
              </Text>
            </View>
          </View>

          {nextStop?.eta_minutes != null && (
            <>
              <View style={styles.etaRow}>
                <Text style={styles.etaNum}>{nextStop.eta_minutes}</Text>
                <Text style={styles.etaUnit}>min to {nextStop.stop.name}</Text>
              </View>
              <Text style={styles.arrivalText}>Arriving at {formatClockTime(nextStop.live_arrival_at)}</Text>
              {nextStop.delay_minutes != null && (() => {
                const { label, isDelayed } = formatDelay(nextStop.delay_minutes);
                return (
                  <View style={styles.delayRow}>
                    <Text style={styles.scheduledText}>Scheduled {formatClockTime(nextStop.scheduled_arrival_at)}</Text>
                    <Text style={[styles.delayText, isDelayed && styles.delayTextWarn]}>
                      {isDelayed ? "\u26A0\uFE0F " : ""}{label}
                    </Text>
                  </View>
                );
              })()}
            </>
          )}

          <Text style={styles.driverText}>Driver: {trip.driver_name || "Not assigned"}</Text>
          <Text style={styles.driverText}>{gpsLabel}</Text>
        </View>

        <Text style={styles.sectionLabel}>Route stops</Text>
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

        <TouchableOpacity
          style={[styles.absentButton, isAbsent && styles.absentButtonActive]}
          onPress={handleMarkAbsent}
          disabled={marking}
        >
          {marking ? (
            <ActivityIndicator color={isAbsent ? colors.cream : colors.alert} />
          ) : (
            <Text style={[styles.absentButtonText, isAbsent && styles.absentButtonTextActive]}>
              {isAbsent ? `${childName} marked absent today` : "Mark absent today"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <SOSButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.plum, marginBottom: 6 },
  emptyText: { fontSize: 13, color: colors.inkFaint, textAlign: "center" },
  content: { padding: spacing.lg, paddingBottom: 60 },
  banner: { flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 13, borderRadius: radius.md, marginBottom: spacing.sm },
  bannerWarn: { backgroundColor: "#F3E5CF" },
  bannerGood: { backgroundColor: colors.goodSoft },
  bannerIcon: { fontSize: 15 },
  bannerTitle: { fontSize: 12.5, fontWeight: "700", color: colors.plum },
  bannerText: { fontSize: 11.5, color: colors.inkSoft, marginTop: 1 },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.rose, textTransform: "uppercase" },
  title: { fontSize: 22, fontWeight: "700", color: colors.plum, marginTop: 4, marginBottom: spacing.md },
  vehicleCard: { backgroundColor: colors.plum, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  vehicleTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  vehicleName: { color: colors.cream, fontSize: 18, fontWeight: "700" },
  vehicleSub: { color: "#D8C6C3", fontSize: 11.5, marginTop: 2 },
  statusChip: { backgroundColor: "rgba(232,210,196,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  statusChipActive: { backgroundColor: colors.good },
  statusChipText: { color: "#F1E4DD", fontSize: 10.5, fontWeight: "700" },
  etaRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: spacing.md },
  etaNum: { color: colors.cream, fontSize: 34, fontWeight: "700" },
  etaUnit: { color: "#D8C6C3", fontSize: 12 },
  arrivalText: { color: colors.cream, fontSize: 12.5, fontWeight: "600", marginTop: 4 },
  delayRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  scheduledText: { color: "#B8A6A3", fontSize: 11, textDecorationLine: "line-through" },
  delayText: { color: "#B7D6AE", fontSize: 11, fontWeight: "700" },
  delayTextWarn: { color: "#F0B67D" },
  driverText: { color: "#D8C6C3", fontSize: 11.5, marginTop: spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: colors.inkFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm },
  stopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  stopDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.roseLight, marginTop: 3 },
  stopDotDone: { backgroundColor: colors.good },
  stopDotSkipped: { backgroundColor: colors.inkFaint },
  stopName: { fontSize: 13.5, fontWeight: "600", color: colors.plum },
  stopNameSkipped: { textDecorationLine: "line-through", color: colors.inkFaint },
  stopStatus: { fontSize: 11, color: colors.inkFaint, marginTop: 1, textTransform: "capitalize" },
  stopTime: { fontSize: 11, color: colors.inkFaint, fontWeight: "600" },
  absentButton: {
    marginTop: spacing.xl, borderWidth: 1.5, borderColor: colors.alert, borderRadius: radius.pill,
    paddingVertical: 14, alignItems: "center",
  },
  absentButtonActive: { backgroundColor: colors.alert },
  absentButtonText: { color: colors.alert, fontWeight: "700", fontSize: 13.5 },
  absentButtonTextActive: { color: colors.cream },
});