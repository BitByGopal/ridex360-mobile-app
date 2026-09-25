import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import OrgDashboardScreen from "../screens/org/OrgDashboardScreen";
import OrgFleetScreen from "../screens/org/OrgFleetScreen";
import OrgProfileScreen from "../screens/org/OrgProfileScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

function TabIcon(emoji: string) {
  return ({ color }: { color: string }) => <Text style={{ fontSize: 18, color }}>{emoji}</Text>;
}

/**
 * Org mobile experience scoped to what's actually real: Dashboard and
 * Live Fleet, both backed by the same /api/org/dashboard/ and
 * /api/org/fleet/live/ endpoints already proven with the web
 * dashboard. Routes/Alerts/employee-vehicle-driver CRUD stay on the
 * web Admin for now -- no backend exists yet for a mobile version of
 * those, so they're not faked here.
 */
export default function OrgNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
      }}
    >
      <Tab.Screen name="Dashboard" component={OrgDashboardScreen} options={{ tabBarIcon: TabIcon("\uD83C\uDFE0") }} />
      <Tab.Screen name="Fleet" component={OrgFleetScreen} options={{ tabBarIcon: TabIcon("\uD83D\uDE8C") }} />
      <Tab.Screen name="Profile" component={OrgProfileScreen} options={{ tabBarIcon: TabIcon("\uD83D\uDC64") }} />
    </Tab.Navigator>
  );
}