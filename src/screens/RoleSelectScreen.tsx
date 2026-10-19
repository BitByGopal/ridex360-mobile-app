import React, { useRef } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../theme";

export type Role = "parent" | "passenger" | "driver" | "organization";

interface Props {
  onSelect: (role: Role) => void;
}

const ROLES: {
  key: Role;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  tags: string;
  image: number;
}[] = [
  {
    key: "parent",
    icon: "people",
    title: "Parent",
    subtitle: "Track your child's journey",
    tags: "Live tracking · Alerts · Safety",
    image: require("../assets/role-parent.jpg"),
  },
  {
    key: "passenger",
    icon: "person",
    title: "Employee / Passenger",
    subtitle: "Track your own transport",
    tags: "Live location · ETA · Stop alerts",
    image: require("../assets/role-employee.jpg"),
  },
  {
    key: "driver",
    icon: "bus",
    title: "Driver",
    subtitle: "Run today's route",
    tags: "Passenger list · Navigation · Trip updates",
    image: require("../assets/role-driver.jpg"),
  },
  {
    key: "organization",
    icon: "business",
    title: "Organization",
    subtitle: "Manage fleet and routes",
    tags: "Fleet overview · Operations · Insights",
    image: require("../assets/role-organization.jpg"),
  },
];

export default function RoleSelectScreen({ onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  function handleGetStarted() {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require("../assets/logo.png")} style={styles.logoMark} />
          <Text style={styles.brand}>RideX360</Text>
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.eyebrow}>TRACK · CONNECT · MOVE SAFER</Text>
          <Text style={styles.heading}>
            <Text style={styles.headingNavy}>One platform.{"\n"}</Text>
            <Text style={styles.headingGreen}>Every journey.</Text>
          </Text>
          <Text style={styles.subheading}>Connect people, vehicles and places in real time.</Text>
        </View>

        <Text style={styles.question}>How will you use RideX360?</Text>
        <Text style={styles.questionSub}>Choose your role to get started.</Text>

        <View style={styles.grid}>
          {ROLES.map((r) => (
            <TouchableOpacity key={r.key} style={styles.card} onPress={() => onSelect(r.key)} activeOpacity={0.85}>
              <Image source={r.image} style={styles.cardImage} />
              <View style={styles.cardIconWrap}>
                <Ionicons name={r.icon} size={14} color={colors.rose} />
              </View>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward" size={11} color={colors.plum} />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle} numberOfLines={1}>{r.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{r.subtitle}</Text>
                <Text style={styles.cardTags} numberOfLines={1}>{r.tags}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.cta} onPress={handleGetStarted} activeOpacity={0.9}>
          <Text style={styles.ctaText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.footnote}>
          People · Vehicles · Places{"  —  "}
          <Text style={styles.footnoteBold}>A Safer Tomorrow</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 18 },
  logoMark: { width: 32, height: 32, resizeMode: "contain" },
  brand: { fontSize: 18, fontWeight: "700", color: colors.plum },

  headingBlock: { marginBottom: 22 },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.3, color: colors.inkFaint, marginBottom: 6 },
  heading: { fontSize: 26, fontWeight: "800", lineHeight: 30 },
  headingNavy: { color: colors.plum },
  headingGreen: { color: colors.rose },
  subheading: { fontSize: 12.5, color: colors.inkSoft, lineHeight: 17, marginTop: 6, maxWidth: "92%" },

  question: { fontSize: 16.5, fontWeight: "700", color: colors.plum, textAlign: "center" },
  questionSub: { fontSize: 11.5, color: colors.inkFaint, textAlign: "center", marginTop: 2, marginBottom: 14 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  card: {
    width: "48%", borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.line, height: 160,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardImage: { position: "absolute", bottom: 0, left: 0, right: 0, height: 68, width: "100%" },
  cardIconWrap: {
    position: "absolute", top: 9, left: 9, width: 26, height: 26, borderRadius: 9,
    backgroundColor: colors.beige, alignItems: "center", justifyContent: "center",
  },
  cardArrow: {
    position: "absolute", top: 9, right: 9, width: 21, height: 21, borderRadius: 11,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
  },
  cardTextWrap: { position: "absolute", top: 42, left: 9, right: 9 },
  cardTitle: { fontSize: 12, fontWeight: "700", color: colors.plum },
  cardSubtitle: { fontSize: 9.5, color: colors.inkFaint, marginTop: 1 },
  cardTags: { fontSize: 8, color: colors.inkSoft, marginTop: 3, fontWeight: "600" },

  cta: {
    flexDirection: "row", backgroundColor: colors.rose, borderRadius: radius.md,
    paddingVertical: 15, alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  footnote: { textAlign: "center", fontSize: 10.5, color: colors.inkFaint },
  footnoteBold: { color: colors.plum, fontWeight: "700" },
});