// src/app/admin/attendance.tsx
// Attendance Management hub — mirrors src/app/admin/leave.tsx for the
// header/hero/search/tab-strip shell, but keeps tab content mounted
// inline (like the web AdminAttendancePage.jsx) rather than swapping to
// full-screen views, since the attendance view components don't expose
// an `onClose` prop — they're designed to live inside this shell.

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
  Clock,
  Edit3,
  CalendarClock,
  TrendingUp,
  ClipboardCheck,
  Search,
  ChevronLeft,
} from "lucide-react-native";

import C from "../../styles/colors";
import { attendanceApi } from "../../api/service/attendanceApi";
import { Loader } from "../../hooks/loaderManager";

import StatPill from "../../components/admin/employee/StatPill";
import TabButton from "../../components/admin/employee/TabButton";

import AttendanceLogView from "../../components/admin/attendance/AttendanceLogView";
import AttendanceCorrectionsView from "../../components/admin/attendance/AttendanceCorrectionsView";
import ShiftManagementView from "../../components/admin/attendance/ShiftManagementView";
import OvertimeManagementView from "../../components/admin/attendance/OvertimeManagementView";
import TimesheetApprovalView from "../../components/admin/attendance/TimesheetApprovalView";
import AttendanceToastStack, {
  ToastItem,
} from "../../components/admin/attendance/AttendanceToast";

// ─── Tabs config ──────────────────────────────────────────────
const TABS = [
  {
    id: "log",
    label: "Attendance Log",
    icon: Clock,
    desc: "Search daily clock-in / clock-out records across the team",
  },
  {
    id: "corrections",
    label: "Corrections",
    icon: Edit3,
    desc: "Review and approve employee attendance correction requests",
  },
  {
    id: "shifts",
    label: "Shift Management",
    icon: CalendarClock,
    desc: "Configure shift patterns, hours, and working days",
  },
  {
    id: "overtime",
    label: "Overtime",
    icon: TrendingUp,
    desc: "Track and approve overtime hours before payroll",
  },
  {
    id: "timesheets",
    label: "Timesheets",
    icon: ClipboardCheck,
    desc: "Approve submitted timesheets ready for payroll",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Live "today" stats ─────────────────────────────────────
function useTodayStats() {
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    onLeave: 0,
  });
  const [loading, setLoading] = useState(true);

  // const fetchStats = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const d = await attendanceApi.getToday();
  //     setStats({
  //       present: d?.present ?? 0,
  //       late: d?.late ?? 0,
  //       absent: d?.absent ?? 0,
  //       onLeave: d?.onLeave ?? 0,
  //     });
  //   } catch (err) {
  //     console.error("Failed to fetch today's attendance stats:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);
const fetchStats = useCallback(async () => {
  setLoading(true);
  Loader.show();
  try {
    const d = await attendanceApi.getToday();
    setStats({
      present: d?.present ?? 0,
      late: d?.late ?? 0,
      absent: d?.absent ?? 0,
      onLeave: d?.onLeave ?? 0,
    });
  } catch (err) {
    console.error("Failed to fetch today's attendance stats:", err);
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
export default function AdminAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const { stats, loading: statsLoading, refresh } = useTodayStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("log");

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
          <Text style={styles.headerTitle}>Attendance Management</Text>
          <Text style={styles.headerSubtitle}>
            Real-time workforce time tracking
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
              <Clock size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Attendance Management</Text>
              <Text style={styles.heroSubtitle}>
                Live workforce time tracking • Payroll ready
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
            placeholder="Search employee..."
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
          {activeTab === "log" && (
            <AttendanceLogView
              searchQuery={searchQuery}
              showToast={showToast}
            />
          )}
          {activeTab === "corrections" && (
            <AttendanceCorrectionsView showToast={showToast} />
          )}
          {activeTab === "shifts" && (
            <ShiftManagementView showToast={showToast} />
          )}
          {activeTab === "overtime" && (
            <OvertimeManagementView showToast={showToast} />
          )}
          {activeTab === "timesheets" && (
            <TimesheetApprovalView showToast={showToast} onApproved={refresh} />
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <AttendanceToastStack toasts={toasts} />
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
