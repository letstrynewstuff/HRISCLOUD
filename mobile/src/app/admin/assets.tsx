// src/app/admin/assets.tsx
import { useState, useEffect, useCallback } from "react";
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
  Package,
  FileText,
  History,
  Search,
  ArrowUpRight,
  ChevronLeft,
} from "lucide-react-native";

import C from "../../styles/colors";
import { assetApi } from "../../api/service/assetApi";

import AssetsListView from "../../components/admin/assets/AssetsListView";
// import AssetRequestsView from "../../components/admin/assets/AssetRequestsView";
// import ActivityLogView from "../../components/admin/assets/ActivityLogView";

const TABS = [
  {
    id: "assets",
    label: "All Assets",
    icon: Package,
    desc: "Manage inventory, assign, return and retire assets",
  },
  // {
  //   id: "requests",
  //   label: "Requests",
  //   icon: FileText,
  //   desc: "Review and approve employee asset requests",
  // },
  // {
  //   id: "activity",
  //   label: "Activity Log",
  //   icon: History,
  //   desc: "Track recent assignments, returns and changes",
  // },
] as const;

function useAssetStats() {
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    pendingRequests: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      // Defensive: if the backend 500s or methods are missing, fall back to 0
      const hasGetMyRequests = typeof assetApi?.getMyRequests === "function";
      const hasGetAll = typeof assetApi?.getAll === "function";

      let total = 0;
      let assigned = 0;
      let pendingRequests = 0;

      if (hasGetAll) {
        const assetsRes = await assetApi.getAll({ limit: 200 });
        const assets = assetsRes?.data ?? [];
        total = assetsRes?.meta?.total ?? assets.length;
        assigned = assets.filter((a: any) => a.status === "assigned").length;
      }

      if (hasGetMyRequests) {
        const reqRes = await assetApi.getMyRequests();
        const requests = reqRes?.data ?? [];
        pendingRequests = requests.filter(
          (r: any) => r.status === "pending",
        ).length;
      }

      setStats({ total, assigned, pendingRequests });
    } catch (err) {
      console.error("Failed to fetch asset stats:", err);
      // Keep previous stats or zeros on error
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, refresh: fetchStats };
}

export default function AdminAssetsScreen() {
  const insets = useSafeAreaInsets();
  const { stats, refresh } = useAssetStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeView, setActiveView] = useState<
    "hub" | "assets" | "requests" | "activity"
  >("hub");

  const activeTabId = "assets";
  const activeTabData = TABS.find((t) => t.id === activeTabId) || TABS[0];

  if (activeView === "assets") {
    return (
      <AssetsListView
        onClose={() => {
          refresh();
          setActiveView("hub");
        }}
      />
    );
  }

  // if (activeView === "requests") {
  //   return (
  //     <AssetRequestsView
  //       onClose={() => {
  //         refresh();
  //         setActiveView("hub");
  //       }}
  //     />
  //   );
  // }

  // if (activeView === "activity") {
  //   return (
  //     <ActivityLogView
  //       onClose={() => {
  //         refresh();
  //         setActiveView("hub");
  //       }}
  //     />
  //   );
  // }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Asset Management</Text>
          <Text style={styles.headerSubtitle}>
            Inventory, requests & activity
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Package size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Asset Management</Text>
              <Text style={styles.heroSubtitle}>
                Real-time inventory visibility
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatPill label="Total" value={stats.total} color="#A5F3FC" />
            <StatPill label="Assigned" value={stats.assigned} color="#C4B5FD" />
            <StatPill
              label="Pending"
              value={stats.pendingRequests}
              color="#FCD34D"
            />
          </View>
        </View>

        <View
          style={[styles.searchRow, searchFocused && styles.searchRowFocused]}
        >
          <Search size={14} color={searchFocused ? C.primary : C.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search assets, employees…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabStrip}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTabId === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveView(tab.id as any)}
                style={[
                  styles.tabBtn,
                  active && { backgroundColor: C.primary },
                ]}
              >
                <Icon size={14} color={active ? "#fff" : C.textSecondary} />
                <Text
                  style={[
                    styles.tabText,
                    active && { color: "#fff", fontWeight: "700" },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

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
          <Pressable
            onPress={() => setActiveView(activeTabData.id as any)}
            style={({ pressed }) => [
              styles.openBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.openBtnText}>Open</Text>
            <ArrowUpRight size={12} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>All Modules</Text>
        <View style={styles.modulesGrid}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveView(tab.id as any)}
              style={({ pressed }) => [
                styles.moduleCard,
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={styles.moduleIconWrap}>
                <tab.icon size={18} color={C.primary} />
              </View>
              <Text style={styles.moduleLabel}>{tab.label}</Text>
              <Text style={styles.moduleDesc}>{tab.desc}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
    gap: 16,
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
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    minWidth: 70,
    alignItems: "center",
  },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 },
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
  tabStrip: { flexDirection: "row", gap: 8, paddingVertical: 4, marginTop: 14 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabText: { fontSize: 12, fontWeight: "500", color: C.textSecondary },
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
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  openBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 22,
    marginBottom: 10,
  },
  modulesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  moduleCard: {
    width: "47%",
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 8,
  },
  moduleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  moduleLabel: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  moduleDesc: { fontSize: 11, color: C.textMuted, lineHeight: 15 },
});
