import React from "react";
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ChildrenListScreen from "../screens/parent/ChildrenListScreen";
import ChildTripScreen from "../screens/parent/ChildTripScreen";
import TripsScreen from "../screens/parent/TripsScreen";
import SafetyScreen from "../screens/parent/SafetyScreen";
import ProfileScreen from "../screens/parent/ProfileScreen";
import { colors } from "../theme";

export type ParentStackParamList = {
  ChildrenList: undefined;
  ChildTrip: { passengerId: string; childName: string };
};

const Stack = createNativeStackNavigator<ParentStackParamList>();
const Tab = createBottomTabNavigator();

/**
 * The "Home" tab is the original children-list -> child-trip stack,
 * unchanged -- just nested under a tab now instead of being the
 * whole Parent experience.
 */
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.plum,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="ChildrenList" component={ChildrenListScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ChildTrip"
        component={ChildTripScreen}
        options={({ route }) => ({ title: route.params.childName })}
      />
    </Stack.Navigator>
  );
}

function TabIcon(emoji: string) {
  return ({ color }: { color: string }) => <Text style={{ fontSize: 18, color }}>{emoji}</Text>;
}

export default function ParentNavigator() {
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
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarIcon: TabIcon("\uD83C\uDFE0") }} />
      <Tab.Screen name="Trips" component={TripsScreen} options={{ tabBarIcon: TabIcon("\uD83D\uDDD3\uFE0F") }} />
      <Tab.Screen name="Safety" component={SafetyScreen} options={{ tabBarIcon: TabIcon("\uD83D\uDEE1\uFE0F") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: TabIcon("\uD83D\uDC64") }} />
    </Tab.Navigator>
  );
}