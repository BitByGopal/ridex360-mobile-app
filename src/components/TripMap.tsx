import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";

import { colors, radius } from "../theme";
import { Trip } from "../types";

interface Props {
  trip: Trip;
  height?: number;
}

/**
 * Renders the route's stops, connecting line, and the vehicle's last
 * known GPS position (if any). Auto-fits the map region to the stops
 * on first render rather than requiring a hardcoded center/zoom --
 * works for any org's route without per-deployment tuning.
 */
export default function TripMap({ trip, height = 220 }: Props) {
  const stops = trip.route.stops;

  const initialRegion: Region = useMemo(() => {
    const lats = stops.map((s) => parseFloat(s.latitude));
    const lngs = stops.map((s) => parseFloat(s.longitude));
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    // Pad the span so markers aren't flush against the map edges.
    const latDelta = Math.max((maxLat - minLat) * 1.6, 0.02);
    const lngDelta = Math.max((maxLng - minLng) * 1.6, 0.02);
    return { latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
  }, [stops]);

  const routeCoords = stops
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((s) => ({ latitude: parseFloat(s.latitude), longitude: parseFloat(s.longitude) }));

  const stopStatusById: Record<string, string> = {};
  trip.trip_stops.forEach((ts) => { stopStatusById[ts.stop.id] = ts.status; });

  const hasVehiclePosition = trip.last_lat != null && trip.last_lng != null;

  return (
    <View style={[styles.wrap, { height }]}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
        <Polyline coordinates={routeCoords} strokeColor={colors.roseLight} strokeWidth={4} />

        {stops.map((stop) => {
          const status = stopStatusById[stop.id];
          const pinColor =
            status === "arrived" ? colors.good :
            status === "skipped" ? colors.inkFaint :
            colors.rose;
          return (
            <Marker
              key={stop.id}
              coordinate={{ latitude: parseFloat(stop.latitude), longitude: parseFloat(stop.longitude) }}
              title={stop.name}
              description={status ? `Status: ${status}` : undefined}
              pinColor={pinColor}
            />
          );
        })}

        {hasVehiclePosition && (
          <Marker
            coordinate={{ latitude: parseFloat(trip.last_lat as string), longitude: parseFloat(trip.last_lng as string) }}
            title={trip.vehicle_label || "Vehicle"}
            description="Live position"
          >
            <View style={styles.vehiclePin}>
              <View style={styles.vehiclePinDot} />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: colors.beige,
  },
  vehiclePin: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.roseLight,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  vehiclePinDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.plum,
  },
});
