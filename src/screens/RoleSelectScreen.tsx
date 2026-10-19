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

const FEATURES: {
  key: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}[] = [
  { key: "tracking", icon: "location-outline", label: "Live Tracking" },
  { key: "eta", icon: "time-outline", label: "Smart ETA" },
  { key: "safety", icon: "shield-checkmark-outline", label: "Journey Safety" },
];

export default function RoleSelectScreen({ onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  function handleGetStarted() {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topGroup}>
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
                  <Ionicons name={r.icon} size={17} color={colors.rose} />
                </View>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={13} color={colors.plum} />
                </View>
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{r.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{r.subtitle}</Text>
                  <Text style={styles.cardTags} numberOfLines={2}>{r.tags}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.featureStrip}>
            {FEATURES.map((f) => (
              <View key={f.key} style={styles.featureItem}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon} size={24} color={colors.rose} />
                </View>
                <Text style={styles.featureLabel} numberOfLines={1}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomGroup}>
          <TouchableOpacity style={styles.cta} onPress={handleGetStarted} activeOpacity={0.9}>
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.footnote}>
            People · Vehicles · Places{"  —  "}
            <Text style={styles.footnoteBold}>A Safer Tomorrow</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BG = "#F7F9F7";
const CARD_BG = "#FFFFFF";
const CARD_BORDER = "#E5EDE8";
const ICON_BG = "#DDF7E8";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    paddingBottom: 18,
  },
  topGroup: {},
  bottomGroup: { marginTop: 24 },

  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 22 },
  logoMark: { width: 38, height: 38, resizeMode: "contain" },
  brand: { fontSize: 21, fontWeight: "700", color: colors.plum },

  headingBlock: { marginBottom: 26 },
  eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 1.4, color: colors.inkFaint, marginBottom: 8 },
  heading: { fontSize: 31, fontWeight: "800", lineHeight: 36 },
  headingNavy: { color: colors.plum },
  headingGreen: { color: colors.rose },
  subheading: { fontSize: 14.5, color: colors.inkSoft, lineHeight: 21, marginTop: 8, maxWidth: "94%" },

  question: { fontSize: 19.5, fontWeight: "700", color: colors.plum, textAlign: "center" },
  questionSub: { fontSize: 13.5, color: colors.inkFaint, textAlign: "center", marginTop: 4, marginBottom: 18 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 13 },
  card: {
    width: "48%",
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    height: 196,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardImage: { position: "absolute", bottom: 0, left: 0, right: 0, height: 86, width: "100%" },
  cardIconWrap: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  cardArrow: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTextWrap: { position: "absolute", top: 54, left: 12, right: 12 },
  cardTitle: { fontSize: 14.5, fontWeight: "700", color: colors.plum },
  cardSubtitle: { fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
  cardTags: { fontSize: 10, color: colors.inkSoft, marginTop: 5, fontWeight: "600", lineHeight: 13 },

  featureStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 26,
    paddingHorizontal: 4,
  },
  featureItem: { flex: 1, alignItems: "center" },
  featureIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureLabel: { fontSize: 12.5, fontWeight: "600", color: colors.plum, textAlign: "center" },

  cta: {
    flexDirection: "row",
    backgroundColor: colors.rose,
    borderRadius: radius.md,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 16,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16.5 },
  footnote: { textAlign: "center", fontSize: 12, color: colors.inkFaint },
  footnoteBold: { color: colors.plum, fontWeight: "700" },
});