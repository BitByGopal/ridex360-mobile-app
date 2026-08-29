import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChildrenListScreen from "../screens/parent/ChildrenListScreen";
import ChildTripScreen from "../screens/parent/ChildTripScreen";
import { colors } from "../theme";

export type ParentStackParamList = {
  ChildrenList: undefined;
  ChildTrip: { passengerId: string; childName: string };
};

const Stack = createNativeStackNavigator<ParentStackParamList>();

export default function ParentNavigator() {
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
