import React, { useState } from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme";

/**
 * India's emergency numbers. Real tel: links -- this places an actual
 * phone call via the device's dialer, not a simulated action.
 */
const EMERGENCY_CONTACTS = [
  { label: "Police", number: "100", icon: "\uD83D\uDC6E" },
  { label: "Fire", number: "101", icon: "\uD83D\uDE92" },
  { label: "Ambulance / Hospital", number: "102", icon: "\uD83C\uDFE5" },
];

export default function SOSButton() {
  const [open, setOpen] = useState(false);

  function call(number: string) {
    setOpen(false);
    Linking.openURL(`tel:${number}`);
  }

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Text style={styles.fabText}>SOS</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Emergency</Text>
            <Text style={styles.subtitle}>This calls the real number on your phone.</Text>

            {EMERGENCY_CONTACTS.map((c) => (
              <Pressable key={c.number} style={styles.contactRow} onPress={() => call(c.number)}>
                <Text style={styles.contactIcon}>{c.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactLabel}>{c.label}</Text>
                  <Text style={styles.contactNumber}>{c.number}</Text>
                </View>
                <Text style={styles.callText}>Call</Text>
              </Pressable>
            ))}

            <Pressable style={styles.cancelBtn} onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute", right: 18, bottom: 18, zIndex: 50,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.alert, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 0.5 },
  backdrop: { flex: 1, backgroundColor: "rgba(51,42,47,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.cream, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, paddingBottom: 34 },
  handle: { width: 38, height: 4, borderRadius: 99, backgroundColor: colors.roseLight, alignSelf: "center", marginBottom: 14 },
  title: { fontSize: 18, fontWeight: "700", color: colors.plum, textAlign: "center" },
  subtitle: { fontSize: 12, color: colors.inkFaint, textAlign: "center", marginTop: 4, marginBottom: spacing.md },
  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.md, padding: 14, marginBottom: 10,
  },
  contactIcon: { fontSize: 22 },
  contactLabel: { fontSize: 14, fontWeight: "600", color: colors.plum },
  contactNumber: { fontSize: 12, color: colors.inkFaint, marginTop: 1 },
  callText: { fontSize: 12.5, fontWeight: "700", color: colors.alert },
  cancelBtn: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  cancelText: { color: colors.inkSoft, fontSize: 13, fontWeight: "600" },
});