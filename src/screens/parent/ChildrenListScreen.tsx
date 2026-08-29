import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Api } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, spacing } from "../../theme";
import { Passenger } from "../../types";
import type { ParentStackParamList } from "../../navigation/ParentNavigator";

type Props = NativeStackScreenProps<ParentStackParamList, "ChildrenList">;

export default function ChildrenListScreen({ navigation }: Props) {
  const { me, logout } = useAuth();
  const [children, setChildren] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setChildren(await Api.myChildren());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Good morning</Text>
        <Text style={styles.title}>{me?.full_name || "Parent"}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.plum} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={children}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
          ListEmptyComponent={<Text style={styles.empty}>No children linked to your account yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("ChildTrip", { passengerId: item.id, childName: item.full_name })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.full_name}</Text>
                <Text style={styles.cardSub}>{item.detail}</Text>
              </View>
              <Text style={styles.chev}>{"\u203A"}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity onPress={logout} style={styles.logout}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.rose, textTransform: "uppercase" },
  title: { fontSize: 24, fontWeight: "700", color: colors.plum, marginTop: 4 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  empty: { textAlign: "center", color: colors.inkFaint, marginTop: 40 },
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.card,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.line,
    padding: spacing.md, gap: spacing.sm,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.beige,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: colors.mauve, fontWeight: "700", fontSize: 13 },
  cardTitle: { fontSize: 14.5, fontWeight: "600", color: colors.plum },
  cardSub: { fontSize: 12, color: colors.inkFaint, marginTop: 2 },
  chev: { fontSize: 20, color: colors.inkFaint },
  logout: { padding: spacing.lg, alignItems: "center" },
  logoutText: { color: colors.alert, fontSize: 13, fontWeight: "600" },
});
