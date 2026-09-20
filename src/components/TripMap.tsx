import React, { useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";

import { colors, radius } from "../theme";
import { Trip } from "../types";

interface Props {
  trip: Trip;
  height?: number;
}

/**
 * Renders the route's stops, connecting line, and the vehicle's last
 * known GPS position (if any). Includes a recenter button (jumps back
 * to the vehicle) and a full-screen toggle (opens the same map in a
 * full-screen Modal) -- both share the same renderMapContent() so the
 * inline and full-screen views never drift out of sync.
 */
export default function TripMap({ trip, height = 220 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const mapRef = useRef<MapView>(null);
  const fullscreenMapRef = useRef<MapView>(null);

  const stops = trip.route.stops;

  const initialRegion: Region = useMemo(() => {
    const lats = stops.map((s) => parseFloat(s.latitude));
    const lngs = stops.map((s) => parseFloat(s.longitude));
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
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

  function recenter(ref: React.RefObject<MapView | null>) {
    if (!hasVehiclePosition) {
      ref.current?.animateToRegion(initialRegion, 400);
      return;
    }
    ref.current?.animateToRegion({
      latitude: parseFloat(trip.last_lat as string),
      longitude: parseFloat(trip.last_lng as string),
      latitudeDelta: 0.006,
      longitudeDelta: 0.006, 
    }, 400);
  }

  function renderMapContent(ref: React.RefObject<MapView | null>, isFullscreen: boolean) {
    const sizeStyle = isFullscreen
      ? { flex: 1, borderRadius: 0, marginBottom: 0 }
      : { height, borderRadius: radius.md };

    return (
      <View style={[styles.wrap, sizeStyle]}>
        <MapView
          ref={ref}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          zoomEnabled
          zoomControlEnabled
          pitchEnabled
          rotateEnabled
        >
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

        <Pressable style={styles.recenterBtn} onPress={() => recenter(ref)}>
          <Text style={styles.controlIcon}>{"\u2316"}</Text>
        </Pressable>

        <Pressable
          style={[styles.fullscreenBtn, isFullscreen && styles.fullscreenBtnActive]}
          onPress={() => setExpanded(!isFullscreen)}
        >
          <Text style={styles.controlIcon}>{isFullscreen ? "\u2715" : "\u26F6"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      {renderMapContent(mapRef, false)}
      <Modal visible={expanded} animationType="fade" onRequestClose={() => setExpanded(false)}>
        {renderMapContent(fullscreenMapRef, true)}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
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
  recenterBtn: {
    position: "absolute", bottom: 12, right: 12,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fullscreenBtn: {
    position: "absolute", top: 12, right: 12,
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fullscreenBtnActive: {
    top: 48, // clears the status bar when shown inside the full-screen Modal
  },
  controlIcon: { fontSize: 16, color: colors.plum },
});
