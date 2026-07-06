// src/app/admin/training.tsx
// Training & Development hub — mirrors src/app/admin/attendance.tsx: a
// single screen shell (header, hero, search, tab strip) with tab content
// mounted inline, matching how the web AdminTrainingPage.jsx switches tabs
// with AnimatePresence rather than full-screen navigation.

import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  GraduationCap,
  LayoutGrid,
  BookOpen,
  ClipboardCheck,
  Wallet,
  Award,
  Search,
  ChevronLeft,
} from "lucide-react-native";

import C from "../../styles/colors";

import TabButton from "../../components/admin/employee/TabButton";

import TrainingDashboardView from "../../components/admin/training/TrainingDashboardView";
import TrainingCatalogView from "../../components/admin/training/TrainingCatalogView";
import TrainingAttendanceView from "../../components/admin/training/TrainingAttendanceView";
import TrainingBudgetView from "../../components/admin/training/TrainingBudgetView";
import CertificationTrackerView from "../../components/admin/training/CertificationTrackerView";
import TrainingToastStack, {
  ToastItem,
} from "../../components/admin/training/TrainingToast";

// ─── Tabs config ──────────────────────────────────────────────
const TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    desc: "Overview of trainings, enrollments, and budget health",
  },
  {
    id: "catalog",
    label: "Training Catalog",
    icon: BookOpen,
    desc: "Create programs and assign employees to trainings",
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: ClipboardCheck,
    desc: "Mark session attendance and issue certificates",
  },
  {
    id: "budget",
    label: "Budget",
    icon: Wallet,
    desc: "Track training spend and utilization by type",
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: Award,
    desc: "Monitor issued certifications and upcoming expiries",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ════════════════════ MAIN SCREEN ════════════════════
export default function AdminTrainingScreen() {
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  // ── Toasts ──
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [],
  );

  const activeTabData = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Training & Development</Text>
          <Text style={styles.headerSubtitle}>
            Build skills • Track compliance • Drive growth
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ── */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <GraduationCap size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Training & Development</Text>
              <Text style={styles.heroSubtitle}>
                Build skills • Track compliance • Drive growth
              </Text>
            </View>
          </View>
        </View>

        {/* ── Search ── */}
        <View
          style={[styles.searchRow, searchFocused && styles.searchRowFocused]}
        >
          <Search size={14} color={searchFocused ? C.primary : C.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search trainings..."
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* ── Tab Strip ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabStrip}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <TabButton
                key={tab.id}
                label={tab.label}
                icon={
                  <Icon size={14} color={active ? "#fff" : C.textSecondary} />
                }
                active={active}
                onPress={() => setActiveTab(tab.id)}
              />
            );
          })}
        </ScrollView>

        {/* ── Active Tab Description ── */}
        <View style={styles.activeTabCard}>
          <View style={styles.activeTabLeft}>
            <View
              style={[
                styles.activeTabIcon,
                { backgroundColor: C.primaryLight },
              ]}
            >
              <activeTabData.icon size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTabTitle}>{activeTabData.label}</Text>
              <Text style={styles.activeTabDesc}>{activeTabData.desc}</Text>
            </View>
          </View>
        </View>

        {/* ── Tab Content ── */}
        <View style={styles.tabContent}>
          {activeTab === "dashboard" && <TrainingDashboardView />}
          {activeTab === "catalog" && (
            <TrainingCatalogView
              searchQuery={searchQuery}
              showToast={showToast}
            />
          )}
          {activeTab === "attendance" && (
            <TrainingAttendanceView showToast={showToast} />
          )}
          {activeTab === "budget" && <TrainingBudgetView />}
          {activeTab === "certifications" && <CertificationTrackerView />}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <TrainingToastStack toasts={toasts} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
  headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  // Hero
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  heroSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchRowFocused: {
    borderColor: C.primary,
    shadowColor: C.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
    paddingVertical: 0,
  },

  // Tab strip
  tabStrip: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    marginTop: 14,
  },

  // Active tab description card
  activeTabCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    padding: 14,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  activeTabLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activeTabIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  activeTabDesc: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },

  // Tab content
  tabContent: { marginTop: 16 },
});
