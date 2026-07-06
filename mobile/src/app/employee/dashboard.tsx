// // src/app/employee/dashboard.tsx
// // Employee home dashboard — connected to live backend data.
// // Header pulls from AuthContext (already populated post-login via
// // authApi.getMe()). Glance cards, attendance, and announcements pull
// // from useDashboardData(), which fires all reads in parallel.

// import { useState, useCallback } from "react";
// import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import Toast from "react-native-toast-message";
// import {
//   Palmtree,
//   FileText,
//   Clock,
//   FolderOpen,
//   MessageSquare,
//   GraduationCap,
//   Heart,
//   Star,
//   MoreHorizontal,
//   Wallet,
//   CheckCircle2,
// } from "lucide-react-native";

// import C from "../../styles/colors";
// import { useAuth } from "../../hooks/useAuth";
// import { useDashboardData } from "../../hooks/useDashboardData";
// import { attendanceApi } from "../../api/service/attendanceApi";

// import DashboardHeader from "../../components/dashboard/DashboardHeader";
// import ClockInCard from "../../components/dashboard/ClockInCard";
// import GlanceCard from "../../components/dashboard/GlanceCard";
// import QuickActionTile from "../../components/dashboard/QuickActionTile";
// import AnnouncementCard from "../../components/dashboard/AnnouncementCard";
// import UpcomingEventCard from "../../components/dashboard/UpcomingEventCard";
// import SectionHeader from "../../components/ui/SectionHeader";
// import BottomTabBar, { TabKey } from "../../components/ui/BottomTabBar";
// import { ClockStatus } from "../../components/dashboard/ClockInCard";

// // ─── Quick actions (static — just navigation, no data needed) ──────────
// const QUICK_ACTIONS: {
//   key: string;
//   label: string;
//   icon: React.ReactNode;
//   iconBg: string;
//   route?:
//     | "/employee/leave"
//     | "/employee/timesheets"
//     | "/employee/payslips"
//     | "/employee/documents"
//     | "/employee/training"
//     | "/employee/benefits"
//     | "/employee/performance"
//     | "/employee/reports";

// }[] = [
//   {
//     key: "leave",
//     label: "Leave",
//     icon: <Palmtree size={22} color={C.leafGreen} />,
//     iconBg: C.leafBg,
//     route: "/employee/leave",
//   },
//   {
//     key: "payslips",
//     label: "Payslips",
//     icon: <FileText size={22} color={C.violet} />,
//     iconBg: C.violetBg,
//     route: "/employee/payslips",
//   },
//   {
//     key: "timesheet",
//     label: "Timesheet",
//     icon: <Clock size={22} color={C.blue} />,
//     iconBg: C.blueBg,
//     route: "/employee/timesheets",
//   },
//   {
//     key: "documents",
//     label: "Documents",
//     icon: <FolderOpen size={22} color={C.orange} />,
//     iconBg: C.orangeBg,
//     route: "/employee/documents",
//   },
//   {
//     key: "team-chat",
//     label: "Reports",
//     icon: <MessageSquare size={22} color={C.leafGreen} />,
//     iconBg: C.leafBg,
//     route: "/employee/reports",
//   },
//   {
//     key: "training",
//     label: "Training",
//     icon: <GraduationCap size={22} color={C.blue} />,
//     iconBg: C.blueBg,
//     route: "/employee/training",
//   },
//   {
//     key: "benefits",
//     label: "Benefits",
//     icon: <Heart size={22} color={C.rose} />,
//     iconBg: C.roseBg,
//     route: "/employee/benefits",
//   },
//   {
//     key: "performance",
//     label: "Performance",
//     icon: <Star size={22} color={C.amber} />,
//     iconBg: C.amberBg,
//     route: "/employee/performance",
//   },
//   {
//     key: "more",
//     label: "More",
//     icon: <MoreHorizontal size={22} color={C.textSecondary} />,
//     iconBg: C.surfaceAlt,
//   },
// ];

// // ─── Screen ───────────────────────────────────────────────────────────
// export default function EmployeeDashboard() {
//   const { employee } = useAuth();
//   const { data, loading, refreshing, refresh } = useDashboardData();
//   const [activeTab, setActiveTab] = useState<TabKey>("home");
//   const [clockBusy, setClockBusy] = useState(false);

//   // ── Clock in/out — real API call, then refetch dashboard state ──────
//   const handleClockToggle = useCallback(async () => {
//     if (clockBusy) return;
//     setClockBusy(true);
//     try {
//       if (data.attendance?.clockedIn) {
//         await attendanceApi.clockOut();
//       } else {
//         await attendanceApi.clockIn();
//       }
//       await refresh();
//     } catch (err: any) {
//       console.warn("[dashboard] clock toggle failed:", err?.message ?? err);
//     } finally {
//       setClockBusy(false);
//     }
//   }, [clockBusy, data.attendance?.clockedIn, refresh]);
//   // Derive status from dashboard data
//   const clockStatus: ClockStatus = data.attendance?.onBreak
//     ? "on-break"
//     : data.attendance?.clockedIn
//       ? "active"
//       : data.attendance?.clockOutTime
//         ? "done"
//         : "not-started";

//   function handleTabChange(key: TabKey) {
//     setActiveTab(key);
//     // Wire these up to real routes as screens are built:
//     // if (key === "attendance") router.push("/employee/attendance");
//     // if (key === "team") router.push("/employee/team");
//     // if (key === "updates") router.push("/employee/updates");
//     // if (key === "profile") router.push("/employee/profile");
//   }

//   // First announcement only, for the single-card slot in this layout
//   const firstAnnouncement = data.announcements[0];

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["top"]}>
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={refresh}
//             tintColor={C.primary}
//           />
//         }
//       >
//         {/* Header — real logged-in user */}
//         <DashboardHeader
//           name={employee?.name ?? "—"}
//           role={employee?.jobTitle ?? ""}
//           avatarUri={employee?.avatar ?? undefined}
//           notificationCount={3}
//           hasNewMessages
//           onPressNotifications={() => {}}
//           onPressChat={() => {}}
//         />

//         {/* Clock In hero */}
//         <View style={styles.section}>
//           <ClockInCard
//             status={clockStatus}
//             clockInTime={data.attendance?.clockInTime ?? null}
//             clockOutTime={data.attendance?.clockOutTime ?? null}
//             officeName={data.attendance?.officeName ?? "—"}
//             onPressClockIn={handleClockToggle}
//             onPressBreak={async () => {
//               // Handle break toggle
//               try {
//                 if (data.attendance?.onBreak) {
//                   await attendanceApi.endBreak();
//                 } else {
//                   await attendanceApi.startBreak();
//                 }
//                 await refresh();
//               } catch (err: any) {
//                 Toast.show({
//                   type: "error",
//                   text1: err?.response?.data?.message ?? "Break action failed",
//                 });
//               }
//             }}
//             onPressOffice={() => {}}
//           />
//         </View>

//         {/* Today at a glance */}
//         <View style={styles.section}>
//           <SectionHeader
//             title="Today at a glance"
//             actionLabel="View all"
//             onPressAction={() => {}}
//           />
//           <View style={styles.glanceGrid}>
//             <GlanceCard
//               label="Leave Balance"
//               value={
//                 data.leaveBalanceDays != null
//                   ? String(data.leaveBalanceDays)
//                   : "—"
//               }
//               subLabel="days available"
//               icon={<Palmtree size={14} color={C.leafGreen} />}
//               iconBg={C.leafBg}
//             />
//             <GlanceCard
//               label="Attendance"
//               value={data.attendance?.status ?? "—"}
//               valueColor={C.success}
//               subLabel="Today"
//               icon={<CheckCircle2 size={14} color={C.success} />}
//               iconBg={C.successBg}
//               tint={C.successBg}
//             />
//             <GlanceCard
//               label="Timesheet"
//               value={data.timesheetLoggedToday ?? "—"}
//               subLabel="Logged today"
//               icon={<Clock size={14} color={C.blue} />}
//               iconBg={C.blueBg}
//             />
//             <GlanceCard
//               label="Payslip"
//               value={data.latestPayslipLabel ?? "—"}
//               subLabel="Latest payslip"
//               icon={<Wallet size={14} color={C.violet} />}
//               iconBg={C.violetBg}
//             />
//           </View>
//         </View>

//         {/* Quick Actions */}
//         <View style={styles.section}>
//           <SectionHeader
//             title="Quick Actions"
//             actionLabel="Edit"
//             showChevron={false}
//           />
//           <View style={styles.actionsGrid}>
//             {QUICK_ACTIONS.map((a) => (
//               <QuickActionTile
//                 key={a.key}
//                 label={a.label}
//                 icon={a.icon}
//                 iconBg={a.iconBg}
//                 onPress={() => {
//                   if (a.route) router.push(a.route);
//                 }}
//               />
//             ))}
//           </View>
//         </View>

//         {/* Announcements — real feed, first item shown */}
//         <View style={styles.section}>
//           <SectionHeader
//             title="Announcements"
//             actionLabel="View all"
//             onPressAction={() => router.push("/employee/announcements")}
//           />
//           {firstAnnouncement ? (
//             <AnnouncementCard
//               category={
//                 firstAnnouncement.audience === "all"
//                   ? "Company Update"
//                   : (firstAnnouncement.departmentName ?? "Update")
//               }
//               title={firstAnnouncement.title}
//               body={firstAnnouncement.body}
//               timeAgo={timeAgo(firstAnnouncement.createdAt)}
//               dotCount={data.announcements.length || 1}
//               activeDot={0}
//               onPress={() => router.push("/employee/announcements")}
//             />
//           ) : null}
//         </View>

//         {/* Upcoming — left static; wire to a training/events API when available */}
//         <View style={[styles.section, styles.lastSection]} />
//       </ScrollView>

//       <BottomTabBar active={activeTab} onChange={handleTabChange} teamBadge />
//     </SafeAreaView>
//   );
// }

// // ─── Helpers ─────────────────────────────────────────────────
// function timeAgo(iso?: string | null) {
//   if (!iso) return "";
//   const diffMs = Date.now() - new Date(iso).getTime();
//   const mins = Math.floor(diffMs / 60000);
//   if (mins < 1) return "just now";
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   const days = Math.floor(hrs / 24);
//   return `${days}d ago`;
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: C.bg },
//   scroll: { flex: 1 },
//   scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 },
//   section: { marginTop: 22 },
//   lastSection: { marginBottom: 8 },
//   glanceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
//   actionsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     rowGap: 18,
//     columnGap: 8,
//   },
// });



// src/app/employee/dashboard.tsx
// Employee home dashboard — connected to live backend data.
// Header pulls from AuthContext (already populated post-login via
// authApi.getMe()). Glance cards, attendance, and announcements pull
// from useDashboardData(), which fires all reads in parallel.

import { useState, useCallback, useEffect, useRef } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import {
  Palmtree,
  FileText,
  Clock,
  FolderOpen,
  MessageSquare,
  GraduationCap,
  Heart,
  Star,
  MoreHorizontal,
  Wallet,
  CheckCircle2,
} from "lucide-react-native";

import C from "../../styles/colors";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardData } from "../../hooks/useDashboardData";
import { attendanceApi } from "../../api/service/attendanceApi";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ClockInCard from "../../components/dashboard/ClockInCard";
import GlanceCard from "../../components/dashboard/GlanceCard";
import QuickActionTile from "../../components/dashboard/QuickActionTile";
import AnnouncementCard from "../../components/dashboard/AnnouncementCard";
import UpcomingEventCard from "../../components/dashboard/UpcomingEventCard";
import SectionHeader from "../../components/ui/SectionHeader";
import BottomTabBar, { TabKey } from "../../components/ui/BottomTabBar";
import { ClockStatus } from "../../components/dashboard/ClockInCard";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";

// ─── Quick actions (static — just navigation, no data needed) ──────────
const QUICK_ACTIONS: {
  key: string;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  route?:
    | "/employee/leave"
    | "/employee/timesheets"
    | "/employee/payslips"
    | "/employee/documents"
    | "/employee/training"
    | "/employee/benefits"
    | "/employee/performance"
    | "/employee/reports";

}[] = [
  {
    key: "leave",
    label: "Leave",
    icon: <Palmtree size={22} color={C.leafGreen} />,
    iconBg: C.leafBg,
    route: "/employee/leave",
  },
  {
    key: "payslips",
    label: "Payslips",
    icon: <FileText size={22} color={C.violet} />,
    iconBg: C.violetBg,
    route: "/employee/payslips",
  },
  {
    key: "timesheet",
    label: "Timesheet",
    icon: <Clock size={22} color={C.blue} />,
    iconBg: C.blueBg,
    route: "/employee/timesheets",
  },
  {
    key: "documents",
    label: "Documents",
    icon: <FolderOpen size={22} color={C.orange} />,
    iconBg: C.orangeBg,
    route: "/employee/documents",
  },
  {
    key: "team-chat",
    label: "Reports",
    icon: <MessageSquare size={22} color={C.leafGreen} />,
    iconBg: C.leafBg,
    route: "/employee/reports",
  },
  {
    key: "training",
    label: "Training",
    icon: <GraduationCap size={22} color={C.blue} />,
    iconBg: C.blueBg,
    route: "/employee/training",
  },
  {
    key: "benefits",
    label: "Benefits",
    icon: <Heart size={22} color={C.rose} />,
    iconBg: C.roseBg,
    route: "/employee/benefits",
  },
  {
    key: "performance",
    label: "Performance",
    icon: <Star size={22} color={C.amber} />,
    iconBg: C.amberBg,
    route: "/employee/performance",
  },
  {
    key: "more",
    label: "More",
    icon: <MoreHorizontal size={22} color={C.textSecondary} />,
    iconBg: C.surfaceAlt,
  },
];

// ─── Screen ───────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const { employee } = useAuth();
  const { data, loading, refreshing, refresh } = useDashboardData();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [clockBusy, setClockBusy] = useState(false);

  // ── Drive the local loader from hook loading state ──────
  useEffect(() => {
    if (loading) {
      loaderRef.current?.show();
    } else {
      loaderRef.current?.hide();
    }
  }, [loading]);

  // ── Clock in/out — real API call, then refetch dashboard state ──────
  const handleClockToggle = useCallback(async () => {
    if (clockBusy) return;
    setClockBusy(true);
    try {
      if (data.attendance?.clockedIn) {
        await attendanceApi.clockOut();
      } else {
        await attendanceApi.clockIn();
      }
      await refresh();
    } catch (err: any) {
      console.warn("[dashboard] clock toggle failed:", err?.message ?? err);
    } finally {
      setClockBusy(false);
    }
  }, [clockBusy, data.attendance?.clockedIn, refresh]);

  // Derive status from dashboard data
  const clockStatus: ClockStatus = data.attendance?.onBreak
    ? "on-break"
    : data.attendance?.clockedIn
      ? "active"
      : data.attendance?.clockOutTime
        ? "done"
        : "not-started";

  function handleTabChange(key: TabKey) {
    setActiveTab(key);
    // Wire these up to real routes as screens are built:
    // if (key === "attendance") router.push("/employee/attendance");
    // if (key === "team") router.push("/employee/team");
    // if (key === "updates") router.push("/employee/updates");
    // if (key === "profile") router.push("/employee/profile");
  }

  // First announcement only, for the single-card slot in this layout
  const firstAnnouncement = data.announcements[0];

  // ── Loading: blank screen while loader is visible ────────
  if (loading) {
    return (
      <View style={styles.blank}>
        <BantaHRLetterLoader
          ref={loaderRef}
          overlay
          subtitle="Loading dashboard..."
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={C.primary}
          />
        }
      >
        {/* Header — real logged-in user */}
        <DashboardHeader
          name={employee?.name ?? "—"}
          role={employee?.jobTitle ?? ""}
          avatarUri={employee?.avatar ?? undefined}
          notificationCount={3}
          hasNewMessages
          onPressNotifications={() => {}}
          onPressChat={() => {}}
        />

        {/* Clock In hero */}
        <View style={styles.section}>
          <ClockInCard
            status={clockStatus}
            clockInTime={data.attendance?.clockInTime ?? null}
            clockOutTime={data.attendance?.clockOutTime ?? null}
            officeName={data.attendance?.officeName ?? "—"}
            onPressClockIn={handleClockToggle}
            onPressBreak={async () => {
              // Handle break toggle
              try {
                if (data.attendance?.onBreak) {
                  await attendanceApi.endBreak();
                } else {
                  await attendanceApi.startBreak();
                }
                await refresh();
              } catch (err: any) {
                Toast.show({
                  type: "error",
                  text1: err?.response?.data?.message ?? "Break action failed",
                });
              }
            }}
            onPressOffice={() => {}}
          />
        </View>

        {/* Today at a glance */}
        <View style={styles.section}>
          <SectionHeader
            title="Today at a glance"
            actionLabel="View all"
            onPressAction={() => {}}
          />
          <View style={styles.glanceGrid}>
            <GlanceCard
              label="Leave Balance"
              value={
                data.leaveBalanceDays != null
                  ? String(data.leaveBalanceDays)
                  : "—"
              }
              subLabel="days available"
              icon={<Palmtree size={14} color={C.leafGreen} />}
              iconBg={C.leafBg}
            />
            <GlanceCard
              label="Attendance"
              value={data.attendance?.status ?? "—"}
              valueColor={C.success}
              subLabel="Today"
              icon={<CheckCircle2 size={14} color={C.success} />}
              iconBg={C.successBg}
              tint={C.successBg}
            />
            <GlanceCard
              label="Timesheet"
              value={data.timesheetLoggedToday ?? "—"}
              subLabel="Logged today"
              icon={<Clock size={14} color={C.blue} />}
              iconBg={C.blueBg}
            />
            <GlanceCard
              label="Payslip"
              value={data.latestPayslipLabel ?? "—"}
              subLabel="Latest payslip"
              icon={<Wallet size={14} color={C.violet} />}
              iconBg={C.violetBg}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Actions"
            actionLabel="Edit"
            showChevron={false}
          />
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((a) => (
              <QuickActionTile
                key={a.key}
                label={a.label}
                icon={a.icon}
                iconBg={a.iconBg}
                onPress={() => {
                  if (a.route) router.push(a.route);
                }}
              />
            ))}
          </View>
        </View>

        {/* Announcements — real feed, first item shown */}
        <View style={styles.section}>
          <SectionHeader
            title="Announcements"
            actionLabel="View all"
            onPressAction={() => router.push("/employee/announcements")}
          />
          {firstAnnouncement ? (
            <AnnouncementCard
              category={
                firstAnnouncement.audience === "all"
                  ? "Company Update"
                  : (firstAnnouncement.departmentName ?? "Update")
              }
              title={firstAnnouncement.title}
              body={firstAnnouncement.body}
              timeAgo={timeAgo(firstAnnouncement.createdAt)}
              dotCount={data.announcements.length || 1}
              activeDot={0}
              onPress={() => router.push("/employee/announcements")}
            />
          ) : null}
        </View>

        {/* Upcoming — left static; wire to a training/events API when available */}
        <View style={[styles.section, styles.lastSection]} />
      </ScrollView>

      <BottomTabBar active={activeTab} onChange={handleTabChange} teamBadge />
    </SafeAreaView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────
function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  blank: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 },
  section: { marginTop: 22 },
  lastSection: { marginBottom: 8 },
  glanceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 18,
    columnGap: 8,
  },
});