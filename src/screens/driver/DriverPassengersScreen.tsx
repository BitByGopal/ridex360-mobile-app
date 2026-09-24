import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDriverTrip } from "../../context/DriverTripContext";
import { colors, radius, spacing } from "../../theme";
import { formatClockTime } from "../../utils/format";
import { TripPassenger } from "../../types";

export default function DriverPassengersScreen() {
  const { trip, loading, boardPassenger, dropOffPassenger } = useDriverTrip();
  const [selectedPax, setSelectedPax] = useState<TripPassenger | null>(null);

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

  const selectedPaxStop = selectedPax
    ? trip.trip_stops.find((ts) => ts.stop.id === selectedPax.pickup_stop_id)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{trip.trip_passengers.length} TOTAL</Text>
        <Text style={styles.title}>Passengers</Text>

        {trip.trip_passengers.map((tp) => {
          const isAbsent = tp.status === "absent" || tp.status === "no_show";
          return (
            <View key={tp.id} style={[styles.paxRow, isAbsent && styles.paxRowRemoved]}>
              <TouchableOpacity style={styles.paxInfoTouchable} onPress={() => setSelectedPax(tp)}>
                <View style={styles.paxAvatar}>
                  <Text style={styles.paxAvatarText}>
                    {tp.passenger_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </Text>
                </View>
                <Text style={[styles.paxName, isAbsent && styles.paxNameRemoved]}>{tp.passenger_name}</Text>
              </TouchableOpacity>
              {!isAbsent && trip.status === "active" && (
                <View style={styles.paxActions}>
                  {tp.status !== "boarded" && tp.status !== "dropped_off" && (
                    <TouchableOpacity style={styles.paxActionBtn} onPress={() => boardPassenger(tp.id)}>
                      <Text style={styles.paxActionText}>Board</Text>
                    </TouchableOpacity>
                  )}
                  {tp.status === "boarded" && (
                    <TouchableOpacity style={styles.paxActionBtn} onPress={() => dropOffPassenger(tp.id)}>
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
      </ScrollView>

      <Modal visible={!!selectedPax} transparent animationType="fade" onRequestClose={() => setSelectedPax(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedPax(null)}>
          <View style={styles.modalSheet}>
            {selectedPax && (
              <>
                <View style={styles.modalHandle} />
                <Text style={styles.modalName}>{selectedPax.passenger_name}</Text>
                {!!selectedPax.passenger_detail && (
                  <Text style={styles.modalDetail}>{selectedPax.passenger_detail}</Text>
                )}

                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Stop</Text>
                  <Text style={styles.modalRowValue}>{selectedPax.pickup_stop_name || "Not assigned"}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Status</Text>
                  <Text style={styles.modalRowValue}>{selectedPax.status.replace("_", " ")}</Text>
                </View>
                {selectedPaxStop?.eta_minutes != null && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalRowLabel}>ETA to stop</Text>
                    <Text style={styles.modalRowValue}>{formatClockTime(selectedPaxStop.live_arrival_at)}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedPax(null)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
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
  paxRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, padding: 10, marginBottom: 8 },
  paxRowRemoved: { opacity: 0.5 },
  paxInfoTouchable: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  paxAvatar: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.beige, alignItems: "center", justifyContent: "center" },
  paxAvatarText: { fontSize: 11, fontWeight: "700", color: colors.mauve },
  paxName: { flex: 1, fontSize: 12.5, fontWeight: "600", color: colors.plum },
  paxNameRemoved: { textDecorationLine: "line-through" },
  paxActions: { flexDirection: "row" },
  paxActionBtn: { backgroundColor: colors.plum, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  paxActionText: { color: colors.cream, fontSize: 11, fontWeight: "700" },
  paxDone: { fontSize: 11, color: colors.good, fontWeight: "700" },
  paxAbsentTag: { fontSize: 10, fontWeight: "700", color: colors.alert, backgroundColor: colors.alertSoft, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(51,42,47,0.45)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: colors.cream, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, paddingBottom: 34 },
  modalHandle: { width: 38, height: 4, borderRadius: 99, backgroundColor: colors.roseLight, alignSelf: "center", marginBottom: 14 },
  modalName: { fontSize: 17, fontWeight: "700", color: colors.plum, textAlign: "center" },
  modalDetail: { fontSize: 12, color: colors.inkFaint, textAlign: "center", marginTop: 2, marginBottom: 14 },
  modalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  modalRowLabel: { fontSize: 12, color: colors.inkSoft },
  modalRowValue: { fontSize: 12.5, fontWeight: "600", color: colors.plum, textTransform: "capitalize" },
  modalCloseBtn: { marginTop: 16, alignItems: "center", paddingVertical: 12, backgroundColor: colors.plum, borderRadius: radius.pill },
  modalCloseText: { color: colors.cream, fontWeight: "700", fontSize: 13 },
});