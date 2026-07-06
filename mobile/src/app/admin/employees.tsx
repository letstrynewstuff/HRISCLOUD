// src/app/admin/employees.tsx
// Mobile Employee Management hub — with inline Add Employee form
// Header/footer now match the Departments / Leave / Payroll hubs:
// a fixed back-button + title header, and no AdminBottomTabBar.

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Users,
  UserPlus,
  User,
  LogOut,
  Search,
  ChevronRight,
  ArrowUpRight,
  ChevronLeft,
} from "lucide-react-native";

import C from "../../styles/colors";
import { getEmployees } from "../../api/service/employeeApi";

import StatPill from "../../components/admin/employee/StatPill";
import TabButton from "../../components/admin/employee/TabButton";
import ModuleCard from "../../components/admin/employee/ModuleCard";
import AddEmployeeForm from "../../components/admin/employee/AddEmployeeForm";
import EmployeeListView from "../../components/admin/employee/EmployeeListView";
import EmployeeProfileView from "../../components/admin/employee/EmployeeProfileView";
import OffboardingView from "../../components/admin/employee/OffboardingView";
import EditEmployeeView from "../../components/admin/employee/EditEmployeeView";
import { Loader } from "../../hooks/loaderManager";

// ─── Tabs config ──────────────────────────────────────────────
const TABS = [
  {
    id: "list",
    label: "All Employees",
    icon: Users,
    desc: "View, search and manage every employee record",
  },
  {
    id: "new",
    label: "Add Employee",
    icon: UserPlus,
    desc: "Onboard a new hire step-by-step",
  },
  {
    id: "profile",
    label: "Employee Profile",
    icon: User,
    desc: "View full employee details and history",
  },
  {
    id: "offboarding",
    label: "Offboarding",
    icon: LogOut,
    desc: "Manage employee exits and clearances",
  },
] as const;

// ─── Real stats from API ──────────────────────────────────────
function useStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    inactive: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    Loader.show();
    try {
      const res = await getEmployees({ limit: 500 });
      const list = res?.data ?? res?.employees ?? res ?? [];
      const employees = Array.isArray(list) ? list : [];

      setStats({
        total: employees.length,
        active: employees.filter((e: any) => e.employment_status === "active")
          .length,
        onLeave: employees.filter(
          (e: any) => e.employment_status === "on_leave",
        ).length,
        inactive: employees.filter((e: any) =>
          [
            "terminated",
            "resigned",
            "suspended",
            "retired",
            "offboarding",
          ].includes(e.employment_status),
        ).length,
        pending: 0,
      });
    } catch (err) {
      console.error("Failed to fetch employee stats:", err);
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}

// ════════════════════ MAIN SCREEN ════════════════════
export default function AdminEmployeeManagementScreen() {
  const insets = useSafeAreaInsets();
  const { stats, loading: statsLoading, refresh } = useStats();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<
    "hub" | "list" | "new" | "profile" | "offboarding" | "edit"
  >("hub");

  const [offboardingPrefill, setOffboardingPrefill] = useState<{
    employeeId?: string;
    exitType?: string;
  }>({});

  const activeTabId = "list";
  const activeTabData = TABS.find((t) => t.id === activeTabId) || TABS[0];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // ── Full-screen Add Employee form ──
  if (activeView === "new") {
    return (
      <AddEmployeeForm
        onClose={() => setActiveView("hub")}
        onSuccess={() => {
          refresh();
          setActiveView("hub");
        }}
      />
    );
  }

  // ── Employee List ──
  if (activeView === "list") {
    return (
      <EmployeeListView
        onClose={() => setActiveView("hub")}
        onViewEmployee={(id: string) => {
          setSelectedEmployeeId(id);
          setActiveView("profile");
        }}
        onAddEmployee={() => setActiveView("new")}
      />
    );
  }

  // ── Employee Profile ──
  if (activeView === "profile" && selectedEmployeeId) {
    return (
      <EmployeeProfileView
        employeeId={selectedEmployeeId}
        onClose={() => {
          setSelectedEmployeeId(null);
          setActiveView("hub");
        }}
        onEdit={(id) => {
          setSelectedEmployeeId(id);
          setActiveView("edit");
        }}
        onOffboarding={(id, exitType) => {
          setSelectedEmployeeId(id);
          setOffboardingPrefill({ employeeId: id, exitType });
          setActiveView("offboarding");
        }}
      />
    );
  }

  // ── Edit Employee ──
  if (activeView === "edit" && selectedEmployeeId) {
    return (
      <EditEmployeeView
        employeeId={selectedEmployeeId}
        onClose={() => {
          setSelectedEmployeeId(null);
          setActiveView("hub");
        }}
        onSuccess={() => {
          refresh();
          setSelectedEmployeeId(null);
          setActiveView("hub");
        }}
      />
    );
  }

  // ── Offboarding ──
  if (activeView === "offboarding") {
    return (
      <OffboardingView
        onClose={() => {
          setOffboardingPrefill({});
          setActiveView("hub");
        }}
        onSuccess={() => {
          refresh();
          setOffboardingPrefill({});
          setActiveView("hub");
        }}
        prefillEmployeeId={offboardingPrefill.employeeId}
        prefillExitType={offboardingPrefill.exitType}
      />
    );
  }

  // ── Hub UI ──
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header — back button + title, same pattern as Departments/Leave/Payroll */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Employee Management</Text>
          <Text style={styles.headerSubtitle}>
            Hire · Manage · Develop · Offboard
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ── */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Users size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Employee Management</Text>
              <Text style={styles.heroSubtitle}>
                Hire · Manage · Develop · Offboard
              </Text>
            </View>
          </View>

          {/* Live stats */}
          <View style={styles.statsRow}>
            <StatPill
              label="Total"
              value={stats.total}
              color="#fff"
              loading={statsLoading}
            />
            <StatPill
              label="Active"
              value={stats.active}
              color="#6EE7B7"
              loading={statsLoading}
            />
            <StatPill
              label="On Leave"
              value={stats.onLeave}
              color="#FCD34D"
              loading={statsLoading}
            />
            <StatPill
              label="Inactive"
              value={stats.inactive}
              color="#FCA5A5"
              loading={statsLoading}
            />
            {stats.pending > 0 && (
              <StatPill
                label="Pending"
                value={stats.pending}
                color="#FCD34D"
                loading={statsLoading}
              />
            )}
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
            placeholder="Search employees…"
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
            const active = activeTabId === tab.id;
            return (
              <TabButton
                key={tab.id}
                label={tab.label}
                icon={
                  <Icon size={14} color={active ? "#fff" : C.textSecondary} />
                }
                active={active}
                onPress={() => setActiveView(tab.id as any)}
              />
            );
          })}
        </ScrollView>

        {/* ── Active Tab Card ── */}
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

        {/* ── All Modules Grid ── */}
        <Text style={styles.sectionLabel}>All Modules</Text>
        <View style={styles.modulesGrid}>
          {TABS.map((tab) => (
            <ModuleCard
              key={tab.id}
              label={tab.label}
              desc={tab.desc}
              icon={<tab.icon size={18} color={C.primary} />}
              onPress={() => setActiveView(tab.id as any)}
            />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
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
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

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

  // Active tab card
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

  // Section
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 22,
    marginBottom: 10,
  },

  // Modules grid
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
