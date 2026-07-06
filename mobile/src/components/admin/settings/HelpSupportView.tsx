// src/components/admin/settings/HelpSupportView.tsx

import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from "react-native";
import {
  Mail,
  Copy,
  LifeBuoy,
  BookOpen,
  MessageCircleQuestion,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../../ThemeContext";
import SettingsHeader from "./SettingsHeader";
import SettingsSection from "./SettingsSection";
import SettingsRow from "./SettingsRow";

const SUPPORT_EMAIL = "mavicmontez@bantahr.com";

type Props = { onClose: () => void };

export default function HelpSupportView({ onClose }: Props) {
  const { colors: C } = useTheme();

  const handleContactSupport = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("BantaHR Support Request")}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return;
      }
      throw new Error("no mail client");
    } catch {
      // No mail client configured (common on simulators) — show the address
      // directly so the admin can copy it instead.
      Alert.alert("Contact Support", SUPPORT_EMAIL, [
        {
          text: "Copy Email",
          onPress: async () => {
            await Clipboard.setStringAsync(SUPPORT_EMAIL);
          },
        },
        { text: "Close", style: "cancel" },
      ]);
    }
  };

  const handleCopyEmail = async () => {
    await Clipboard.setStringAsync(SUPPORT_EMAIL);
    Alert.alert("Copied", `${SUPPORT_EMAIL} copied to clipboard.`);
  };

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <SettingsHeader
        title="Help & Support"
        subtitle="Get help using the HRIS"
        onBack={onClose}
      />

      <View style={{ padding: 16 }}>
        <View style={[styles.supportCard, { backgroundColor: C.primary }]}>
          <View style={styles.supportIconWrap}>
            <LifeBuoy size={22} color="#fff" />
          </View>
          <Text style={styles.supportTitle}>Need a hand?</Text>
          <Text style={styles.supportSub}>
            Our team typically replies within one business day.
          </Text>

          <Pressable onPress={handleContactSupport} style={styles.contactBtn}>
            <Mail size={14} color={C.primary} />
            <Text style={[styles.contactBtnText, { color: C.primary }]}>
              Email {SUPPORT_EMAIL}
            </Text>
          </Pressable>

          <Pressable onPress={handleCopyEmail} style={styles.copyBtn}>
            <Copy size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.copyBtnText}>Copy address</Text>
          </Pressable>
        </View>

        <SettingsSection title="Resources">
          <SettingsRow
            icon={BookOpen}
            label="Knowledge Base"
            sub="Guides and how-tos for the HRIS"
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "The knowledge base isn't linked up yet.",
              )
            }
          />
          <SettingsRow
            icon={MessageCircleQuestion}
            label="FAQs"
            sub="Answers to common questions"
            onPress={() =>
              Alert.alert("Coming soon", "FAQs aren't linked up yet.")
            }
          />
        </SettingsSection>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  supportCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-start",
    marginBottom: 22,
  },
  supportIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 12,
  },
  supportTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  supportSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  contactBtnText: { fontSize: 13, fontWeight: "800" },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    alignSelf: "center",
  },
  copyBtnText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "700",
  },
});
