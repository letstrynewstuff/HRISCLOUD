// src/app/admin/_layout.tsx
// Guards every screen under /admin/*.
// ONLY standalone admins (hr_admin, super_admin) allowed.
// Employees (even managers/HR) are NOT allowed.

import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { isStandaloneAdmin } from "../../context/AuthContext";
import C from "../../styles/colors";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in → send to login
        router.replace("/(auth)/login");
      } else {
        // Logged in but not a standalone admin → send to employee dashboard
        const isAdmin = isStandaloneAdmin(user?.role);
        if (!isAdmin) {
          router.replace("/employee/dashboard");
        }
      }
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={C.primary} />
      </View>
    );
  }

  if (!user) return null;

  const isAdmin = isStandaloneAdmin(user?.role);
  if (!isAdmin) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />

      <Stack.Screen
        name="employees"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="departments"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="leave" options={{ animation: "slide_from_right" }} />

      <Stack.Screen
        name="announcement"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="benefits"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="training"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="performance"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="reports"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="settings"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
  },
});
