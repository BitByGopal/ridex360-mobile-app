import React, { useRef } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../theme";

export type Role = "parent" | "passenger" | "driver" | "organization";

interface Props {
  onSelect: (role: Role) => void;
}

const CAPABILITIES: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string }[] = [
  { icon: "location", label: "Live\nTracking" },
  { icon: "git-network", label: "Smart\nRoutes" },
  { icon: "notifications", label: "Real-Time\nAlerts" },
  { icon: "shield-checkmark", label: "Enhanced\nSafety" },
];

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
    tags: "Live tracking \u00B7 Alerts \u00B7 Safety",
    image: require("../assets/role-parent.jpg"),
  },
  {
    key: "passenger",
    icon: "person",
    title: "Employee / Passenger",
    subtitle: "Track your own transport",
    tags: "Live location \u00B7 ETA \u00B7 Stop alerts",
    image: require("../assets/role-employee.jpg"),
  },
  {
    key: "driver",
    icon: "bus",
    title: "Driver",
    subtitle: "Run today's route",
    tags: "Passenger list \u00B7 Navigation \u00B7 Trip updates",
    image: require("../assets/role-driver.jpg"),
  },
  {
    key: "organization",
    icon: "business",
    title: "Organization",
    subtitle: "Manage fleet and routes",
    tags: "Fleet overview \u00B7 Operations \u00B7 Insights",
    image: require("../assets/role-organization.jpg"),
  },
];

/**
 * Home / role-selection screen. Doesn't gate any real backend logic on
 * its own -- Parent and Employee/Passenger both route to the same
 * Login screen (the backend's role field decides what the person
 * actually sees), and Driver/Organization likewise reach their own
 * existing login flow. This screen's only job is first impressions.
 */
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

        <View style={styles.heroWrap}>
          <Image source={require("../assets/hero-passenger.jpg")} style={styles.hero} />
          <View style={styles.heroScrim} />
          <View style={styles.heroTextBlock}>
            <Text style={styles.eyebrow}>TRACK {"\u00B7"} CONNECT {"\u00B7"} MOVE SAFER</Text>
            <Text style={styles.heading}>
              <Text style={styles.headingNavy}>One platform.{"\n"}</Text>
              <Text style={styles.headingGreen}>Every journey.</Text>
            </Text>
            <Text style={styles.subheading}>Connect people, vehicles and places in real time.</Text>
          </View>
        </View>

        <View style={styles.capabilityStrip}>
          {CAPABILITIES.map((c, i) => (
            <React.Fragment key={c.icon}>
              <View style={styles.capabilityItem}>
                <Ionicons name={c.icon} size={17} color={colors.rose} />
                <Text style={styles.capabilityLabel}>{c.label}</Text>
              </View>
              {i < CAPABILITIES.length - 1 && <View style={styles.capabilityDivider} />}
            </React.Fragment>
          ))}
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
          People {"\u00B7"} Vehicles {"\u00B7"} Places {"  \u2014  "}
          <Text style={styles.footnoteBold}>A Safer Tomorrow</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: 2 },
  header: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  logoMark: { width: 24, height: 24, resizeMode: "contain" },
  brand: { fontSize: 15, fontWeight: "700", color: colors.plum },

  heroWrap: { borderRadius: radius.lg, overflow: "hidden", marginBottom: 10, height: 220 },
  hero: { width: "100%", height: "100%", position: "absolute" },
  heroScrim: {
    position: "absolute", top: 0, left: 0, right: 0, height: 118,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  heroTextBlock: { padding: 14 },
  eyebrow: { fontSize: 9.5, fontWeight: "700", letterSpacing: 1.2, color: colors.inkSoft, marginBottom: 4 },
  heading: { fontSize: 21, fontWeight: "800", lineHeight: 24 },
  headingNavy: { color: colors.plum },
  headingGreen: { color: colors.rose },
  subheading: { fontSize: 11, color: colors.inkSoft, lineHeight: 14, marginTop: 4, maxWidth: "92%" },

  capabilityStrip: {
    flexDirection: "row", backgroundColor: colors.beige, borderRadius: radius.md,
    paddingVertical: 9, paddingHorizontal: 4, marginBottom: 12, alignItems: "center",
  },
  capabilityItem: { flex: 1, alignItems: "center", gap: 3 },
  capabilityLabel: { fontSize: 8.5, fontWeight: "600", color: colors.plum, textAlign: "center", lineHeight: 10 },
  capabilityDivider: { width: 1, height: 24, backgroundColor: "rgba(15,23,42,0.08)" },

  question: { fontSize: 15.5, fontWeight: "700", color: colors.plum, textAlign: "center" },
  questionSub: { fontSize: 11, color: colors.inkFaint, textAlign: "center", marginTop: 1, marginBottom: 8 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  card: {
    width: "48%", borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.line, height: 138,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardImage: { position: "absolute", bottom: 0, left: 0, right: 0, height: 56, width: "100%" },
  cardIconWrap: {
    position: "absolute", top: 8, left: 8, width: 24, height: 24, borderRadius: 8,
    backgroundColor: colors.beige, alignItems: "center", justifyContent: "center",
  },
  cardArrow: {
    position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
  },
  cardTextWrap: { position: "absolute", top: 38, left: 8, right: 8 },
  cardTitle: { fontSize: 11.5, fontWeight: "700", color: colors.plum },
  cardSubtitle: { fontSize: 9, color: colors.inkFaint, marginTop: 1 },
  cardTags: { fontSize: 7.5, color: colors.inkSoft, marginTop: 2, fontWeight: "600" },

  cta: {
    flexDirection: "row", backgroundColor: colors.rose, borderRadius: radius.md,
    paddingVertical: 12, alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 8,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  footnote: { textAlign: "center", fontSize: 10, color: colors.inkFaint },
  footnoteBold: { color: colors.plum, fontWeight: "700" },
});