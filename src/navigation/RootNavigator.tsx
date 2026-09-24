import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";
import RoleSelectScreen, { Role } from "../screens/RoleSelectScreen";
import LoginScreen from "../screens/LoginScreen";
import ParentNavigator from "./ParentNavigator";
import DriverNavigator from "./DriverNavigator";
import { colors } from "../theme";

export default function RootNavigator() {
  const { me, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.plum} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!me ? (
        selectedRole ? (
          <LoginScreen intendedRole={selectedRole} onBack={() => setSelectedRole(null)} />
        ) : (
          <RoleSelectScreen onSelect={setSelectedRole} />
        )
      ) : me.role === "parent" ? (
        <ParentNavigator />
      ) : me.role === "driver" ? (
        <DriverNavigator />
      ) : (
        // org_admin: no dedicated mobile screens yet -- use Django Admin (see backend README)
        <LoginScreen />
      )}
    </NavigationContainer>
  );
}