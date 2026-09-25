import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";

import { Api } from "../../api/endpoints";
import { colors, radius, spacing } from "../../theme";
import { FleetTrip } from "../../types";

const POLL_INTERVAL_MS = 8000;

const STATUS_COLOR: Record<string, string> = {
  active: colors.good,
  scheduled: colors.warn,
  completed: colors.inkFaint,
  cancelled: colors.alert,
};

export default function OrgFleetScreen() {
  const [trips, setTrips] = useState<FleetTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FleetTrip | null>(null);
  const mapRef = useRef<MapView>(null);

  const load = useCallback(async () => {
    try {
      setTrips(await Api.orgLiveFleet());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]));

  const withPosition = trips.filter((t) => t.last_lat && t.last_lng);
  const initialRegion = withPosition.length
    ? {
        latitude: parseFloat(withPosition[0].last_lat as string),
        longitude: parseFloat(withPosition[0].last_lng as string),
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }
    : { latitude: 17.4126, longitude: 78.4483, latitudeDelta: 0.15, longitudeDelta: 0.15 };

  function focusTrip(trip: FleetTrip) {
    setSelected(trip);
    if (trip.last_lat && trip.last_lng) {
      mapRef.current?.animateToRegion({
        latitude: parseFloat(trip.last_lat),
        longitude: parseFloat(trip.last_lng),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 400);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.plum} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LIVE OPERATIONS</Text>
        <Text style={styles.title}>Fleet \u2014 {trips.length} trip{trips.length === 1 ? "" : "s"} today</Text>
      </View>

      <View style={styles.mapWrap}>
        <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
          {withPosition.map((t) => (
            <Marker
              key={t.trip_id}
              coordinate={{ latitude: parseFloat(t.last_lat as string), longitude: parseFloat(t.last_lng as string) }}
              title={t.vehicle_label || "Vehicle"}
              description={t.route_name}
              pinColor={STATUS_COLOR[t.status] || colors.rose}
              onPress={() => focusTrip(t)}
            />
          ))}
        </MapView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {trips.length === 0 && <Text style={styles.empty}>No trips today.</Text>}
        {trips.map((t) => (
          <TouchableOpacity
            key={t.trip_id}
            style={[styles.tripCard, selected?.trip_id === t.trip_id && styles.tripCardActive]}
            onPress={() => focusTrip(t)}
          >
            <View style={styles.tripTop}>
              <Text style={styles.vehicleLabel}>{t.vehicle_label || "Unassigned"}</Text>
              <View style={[styles.statusChip, { backgroundColor: (STATUS_COLOR[t.status] || colors.rose) + "22" }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[t.status] || colors.rose }]}>{t.status}</Text>
              </View>
            </View>
            <Text style={styles.routeLabel}>{t.route_name}</Text>
            <Text style={styles.metaLine}>
              {t.driver_name || "No driver"}{t.is_replacement_driver ? " (Replacement)" : ""}
            </Text>
            <Text style={styles.metaLine}>
              {t.passengers_boarded}/{t.passengers_total} boarded
              {t.passengers_absent > 0 ? ` \u00B7 ${t.passengers_absent} absent` : ""}
            </Text>
            {t.eta_minutes != null && (
              <Text style={styles.etaLine}>
                {t.eta_minutes} min to {t.next_stop_name}
                {t.traffic_detected && !t.alt_route_active ? " \u26A0\uFE0F" : ""}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.rose, textTransform: "uppercase" },
  title: { fontSize: 20, fontWeight: "700", color: colors.plum, marginTop: 4 },
  mapWrap: { height: 220, marginHorizontal: spacing.lg, borderRadius: radius.md, overflow: "hidden", marginBottom: spacing.sm },
  empty: { textAlign: "center", color: colors.inkFaint, marginTop: 40 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 60, gap: 10 },
  tripCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md },
  tripCardActive: { borderColor: colors.rose, borderWidth: 1.5 },
  tripTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  vehicleLabel: { fontSize: 14, fontWeight: "700", color: colors.plum },
  statusChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  routeLabel: { fontSize: 11.5, color: colors.inkSoft, marginBottom: 4 },
  metaLine: { fontSize: 11, color: colors.inkFaint },
  etaLine: { fontSize: 11.5, fontWeight: "700", color: colors.rose, marginTop: 4 },
});