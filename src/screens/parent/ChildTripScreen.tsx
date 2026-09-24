import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text,
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

export default function ChildTripScreen({ route, navigation }: Props) {
  const { passengerId, childName } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notScheduled, setNotScheduled] = useState(false);
  const [marking, setMarking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

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
    if (!trip) return;
    const myRecord = trip.trip_passengers.find((tp) => tp.passenger === passengerId);
    const isAbsent = myRecord?.status === "absent";
    Alert.alert(
      isAbsent ? "Undo absence?" : "Mark absent today?",
      isAbsent
        ? `${childName} will be scheduled again for today's trip.`
        : `${childName}'s stop will be removed from today's route automatically.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isAbsent ? "Undo" : "Mark absent",
          style: isAbsent ? "default" : "destructive",
          onPress: async () => {
            setMarking(true);
            try {
              const updated = await Api.markAbsent(passengerId);
              setTrip(updated);
            } catch {
              Alert.alert("Couldn't update", "Please try again.");
            } finally {
              setMarking(false);
            }
          },
        },
      ]
    );
  }

  function handleContactDriver() {
    if (!trip?.driver_phone) {
      Alert.alert("No phone on file", "The driver hasn't added a contact number yet.");
      return;
    }
    Linking.openURL(`tel:${trip.driver_phone}`);
  }

  function handleViewFullRoute() {
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  function handleSafety() {
    // ChildTripScreen sits inside the Home tab's nested stack -- the
    // Safety tab lives one level up, on the parent Tab.Navigator.
    navigation.getParent()?.navigate("Safety" as never);
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
  const boardedCount = trip.trip_passengers.filter((p) => p.status === "boarded").length;
  const activeCount = trip.trip_passengers.filter((p) => p.status !== "absent" && p.status !== "no_show").length;
  const delay = nextStop?.delay_minutes != null ? formatDelay(nextStop.delay_minutes) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
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

        {/* Identity card -- vehicle, route, status only */}
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
          <Text style={styles.driverText}>Driver: {trip.driver_name || "Not assigned"}</Text>
        </View>

        {/* Metrics row -- Next Stop / ETA (+delay) / Speed / Onboard */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Next Stop</Text>
            <Text style={styles.metricValue} numberOfLines={1}>{nextStop?.stop.name || "--"}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>ETA</Text>
            <Text style={styles.metricValue}>{nextStop ? formatClockTime(nextStop.live_arrival_at) : "--"}</Text>
            {delay && (
              <Text style={[styles.metricDelay, delay.isDelayed && styles.metricDelayWarn]}>{delay.label}</Text>
            )}
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Speed</Text>
            <Text style={styles.metricValue}>{trip.current_speed_kmh != null ? `${trip.current_speed_kmh} km/h` : "--"}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Onboard</Text>
            <Text style={styles.metricValue}>{boardedCount}/{activeCount}</Text>
          </View>
        </View>

        <TripMap trip={trip} />

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>Quick actions</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickCard} onPress={handleMarkAbsent} disabled={marking}>
            <Text style={styles.quickIcon}>{isAbsent ? "\u21A9\uFE0F" : "\u270B"}</Text>
            <Text style={styles.quickLabel}>{isAbsent ? "Undo absence" : "Mark absent"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={handleContactDriver}>
            <Text style={styles.quickIcon}>{"\uD83D\uDCDE"}</Text>
            <Text style={styles.quickLabel}>Contact driver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={handleViewFullRoute}>
            <Text style={styles.quickIcon}>{"\uD83D\uDDFA\uFE0F"}</Text>
            <Text style={styles.quickLabel}>View full route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={handleSafety}>
            <Text style={styles.quickIcon}>{"\uD83D\uDEE1\uFE0F"}</Text>
            <Text style={styles.quickLabel}>Safety</Text>
          </TouchableOpacity>
        </View>

        {/* Enriched stop timeline */}
        <Text style={styles.sectionLabel}>Today's stops</Text>
        {trip.trip_stops
          .slice()
          .sort((a, b) => a.stop.sequence - b.stop.sequence)
          .map((ts, index) => {
            const isNext = nextStop?.id === ts.id;
            const isOrigin = index === 0;
            let icon = "\u25CB"; // upcoming
            let statusText = "Upcoming";
            if (ts.status === "arrived") {
              icon = "\u2713";
              statusText = isOrigin
                ? `Departed${ts.arrived_at ? " " + formatClockTime(ts.arrived_at) : ""}`
                : `Completed${ts.arrived_at ? " " + formatClockTime(ts.arrived_at) : ""}`;
            } else if (ts.status === "skipped") {
              icon = "\u2715";
              statusText = "Skipped -- no passengers today";
            } else if (isNext) {
              icon = "\u25CF";
              statusText = `Next stop \u00B7 ETA ${formatClockTime(ts.live_arrival_at)}`;
            } else if (ts.scheduled_arrival_at) {
              statusText = `Upcoming \u00B7 ${formatClockTime(ts.scheduled_arrival_at)}`;
            }
            return (
              <View key={ts.id} style={styles.stopRow}>
                <View style={[
                  styles.stopDot,
                  ts.status === "arrived" && styles.stopDotDone,
                  ts.status === "skipped" && styles.stopDotSkipped,
                  isNext && styles.stopDotNext,
                ]}>
                  <Text style={styles.stopDotIcon}>{icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stopName, ts.status === "skipped" && styles.stopNameSkipped]}>
                    {ts.stop.name}
                  </Text>
                  <Text style={[styles.stopStatus, isNext && styles.stopStatusNext]}>{statusText}</Text>
                </View>
              </View>
            );
          })}
      </ScrollView>
      <SOSButton bottomOffset={78} />
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
  vehicleCard: { backgroundColor: colors.plum, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  vehicleTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  vehicleName: { color: colors.cream, fontSize: 18, fontWeight: "700" },
  vehicleSub: { color: "#D8C6C3", fontSize: 11.5, marginTop: 2 },
  statusChip: { backgroundColor: "rgba(232,210,196,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  statusChipActive: { backgroundColor: colors.good },
  statusChipText: { color: "#F1E4DD", fontSize: 10.5, fontWeight: "700" },
  driverText: { color: "#D8C6C3", fontSize: 11.5, marginTop: spacing.sm },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md },
  metricBox: { flexBasis: "48%", flexGrow: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, padding: 10 },
  metricLabel: { fontSize: 9.5, fontWeight: "700", color: colors.inkFaint, textTransform: "uppercase", letterSpacing: 0.4 },
  metricValue: { fontSize: 14, fontWeight: "700", color: colors.plum, marginTop: 3 },
  metricDelay: { fontSize: 10, fontWeight: "600", color: colors.good, marginTop: 2 },
  metricDelayWarn: { color: colors.warn },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: colors.inkFaint, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: spacing.sm },
  quickCard: { flexBasis: "47%", flexGrow: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14, alignItems: "center" },
  quickIcon: { fontSize: 20, marginBottom: 6 },
  quickLabel: { fontSize: 11.5, fontWeight: "600", color: colors.plum, textAlign: "center" },
  stopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  stopDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.roseLight, marginTop: 1, alignItems: "center", justifyContent: "center" },
  stopDotDone: { backgroundColor: colors.good },
  stopDotSkipped: { backgroundColor: colors.inkFaint },
  stopDotNext: { backgroundColor: colors.plum },
  stopDotIcon: { fontSize: 10, color: "#fff" },
  stopName: { fontSize: 13.5, fontWeight: "600", color: colors.plum },
  stopNameSkipped: { textDecorationLine: "line-through", color: colors.inkFaint },
  stopStatus: { fontSize: 11, color: colors.inkFaint, marginTop: 1 },
  stopStatusNext: { color: colors.plum, fontWeight: "600" },
});