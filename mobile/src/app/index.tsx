


// src/app/index.tsx
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import C from "../styles/colors";
import { Loader } from "../hooks/loaderManager";

export default function Index() {
  useEffect(() => {
    Loader.show();

    (async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      // Keep loader visible for at least 1.4s so the animation plays once
      await new Promise((r) => setTimeout(r, 1400));
      Loader.hide();

      router.replace(token ? "/employee/dashboard" : "/(auth)/login");
    })();
  }, []);

  // Blank background — global loader overlay is the ONLY visual
  return (
    <View style={styles.container} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
});