

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../components/ThemeContext";
import C from "../styles/colors";
import BantaHRLetterLoader from "../components/BantaHRLetterLoader";
import { setLoaderRef } from "../hooks/loaderManager";
import type { BantaHRLetterLoaderRef } from "../components/BantaHRLetterLoader";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.bg },
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="employee" />
            <Stack.Screen name="admin" />
          </Stack>
          <Toast />
          <BantaHRLetterLoader
            ref={setLoaderRef}
            overlay
            overlayColor="rgba(11,22,40,0.92)"
            fontSize={32}
            subtitle="Loading..."
          />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}