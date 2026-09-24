import React from "react";
import { Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { DriverTripProvider } from "../context/DriverTripContext";
import DriverHomeScreen from "../screens/driver/DriverHomeScreen";
import DriverRouteScreen from "../screens/driver/DriverRouteScreen";
import DriverPassengersScreen from "../screens/driver/DriverPassengersScreen";
import DriverMoreScreen from "../screens/driver/DriverMoreScreen";
import SOSButton from "../components/SOSButton";
import { colors } from "../theme";

export type DriverTabParamList = {
  Home: undefined;
  Route: undefined;
  Passengers: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<DriverTabParamList>();

function TabIcon(emoji: string) {
  return ({ color }: { color: string }) => <Text style={{ fontSize: 18, color }}>{emoji}</Text>;
}

/**
 * DriverTripProvider wraps the Tab.Navigator (not any single screen),
 * which is what keeps trip state and GPS pinging alive no matter
 * which of Home/Route/Passengers/More is currently visible.
 */
export default function DriverNavigator() {
  return (
    <DriverTripProvider>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.rose,
            tabBarInactiveTintColor: colors.inkFaint,
            tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
            tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
          }}
        >
          <Tab.Screen name="Home" component={DriverHomeScreen} options={{ tabBarIcon: TabIcon("\uD83C\uDFE0") }} />
          <Tab.Screen name="Route" component={DriverRouteScreen} options={{ tabBarIcon: TabIcon("\uD83E\uDDED") }} />
          <Tab.Screen name="Passengers" component={DriverPassengersScreen} options={{ tabBarIcon: TabIcon("\uD83D\uDC65") }} />
          <Tab.Screen name="More" component={DriverMoreScreen} options={{ tabBarIcon: TabIcon("\u22EF") }} />
        </Tab.Navigator>
        <SOSButton bottomOffset={78} />
      </View>
    </DriverTripProvider>
  );
}