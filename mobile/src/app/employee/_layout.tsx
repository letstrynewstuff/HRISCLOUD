

// src/app/employee/_layout.tsx
// Guards every screen under /employee/*.
// Standalone admins are NOT allowed here — they have no employee record.

import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { isStandaloneAdmin } from "../../context/AuthContext";
import C from "../../styles/colors";

export default function EmployeeLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/(auth)/login");
      } else {
        // Standalone admins have no employee dashboard
        const isAdmin = isStandaloneAdmin(user?.role);
        if (isAdmin) {
          router.replace("/admin/dashboard");
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
  if (isAdmin) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="attendance" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="profile" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="team-manager" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="timesheets" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="leave" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="payslips" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="documents" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="performance" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="training" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="announcements" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="reports" options={{ animation: "slide_from_right" }} />
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