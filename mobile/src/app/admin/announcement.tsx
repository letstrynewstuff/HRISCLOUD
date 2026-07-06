// // src/app/admin/announcements.tsx
// // Announcements hub — mirrors src/app/admin/leave.tsx.
// // Tabs (History, Create) render as full-screen child components,
// // switched via `activeView` state — no router involved.

// import { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   TextInput,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   Megaphone,
//   FileText,
//   Search,
//   ArrowUpRight,
//   ChevronLeft,
// } from "lucide-react-native";

// import C from "../../styles/colors";
// import { announcementApi } from "../../api/service/announcementApi";
// import { deriveStatus } from "../../components/admin/announcement/announcementsShared";

// import StatPill from "../../components/admin/employee/StatPill";
// import TabButton from "../../components/admin/employee/TabButton";
// import ModuleCard from "../../components/admin/employee/ModuleCard";

// import AnnouncementsHistoryView from "../../components/admin/announcement/AnnouncementsHistoryView";
// import AnnouncementsCreateView from "../../components/admin/announcement/AnnouncementsCreateView";

// // ─── Tabs config ──────────────────────────────────────────────
// const TABS = [
//   {
//     id: "history",
//     label: "History",
//     icon: FileText,
//     desc: "View, search, and manage everything you've sent",
//   },
//   {
//     id: "create",
//     label: "Compose New",
//     icon: Megaphone,
//     desc: "Write and publish an announcement to employees",
//   },
// ] as const;

// // ─── Live stats ─────────────────────────────────────────────
// function useAnnouncementStats() {
//   const [stats, setStats] = useState({
//     active: 0,
//     scheduled: 0,
//     totalViews: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   const fetchStats = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await announcementApi.list({ limit: 200 });
//       const items = res?.data ?? [];
//       const active = items.filter(
//         (a: any) => deriveStatus(a) === "active",
//       ).length;
//       const scheduled = items.filter(
//         (a: any) => deriveStatus(a) === "scheduled",
//       ).length;
//       const totalViews = items.reduce(
//         (s: number, a: any) => s + (a.views ?? 0),
//         0,
//       );
//       setStats({ active, scheduled, totalViews });
//     } catch (err) {
//       console.error("Failed to fetch announcement stats:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);

//   return { stats, loading, refresh: fetchStats };
// }

// // ════════════════════ MAIN SCREEN ════════════════════
// export default function AdminAnnouncementsScreen() {
//   const insets = useSafeAreaInsets();
//   const { stats, loading: statsLoading, refresh } = useAnnouncementStats();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);

//   const [activeView, setActiveView] = useState<"hub" | "history" | "create">(
//     "hub",
//   );

//   const activeTabId = "history";
//   const activeTabData = TABS.find((t) => t.id === activeTabId) || TABS[0];

//   // ── History ──
//   if (activeView === "history") {
//     return (
//       <AnnouncementsHistoryView
//         onClose={() => {
//           refresh();
//           setActiveView("hub");
//         }}
//         onCreateNew={() => setActiveView("create")}
//       />
//     );
//   }

//   // ── Create ──
//   if (activeView === "create") {
//     return (
//       <AnnouncementsCreateView
//         onClose={() => {
//           refresh();
//           setActiveView("hub");
//         }}
//         onPublished={() => {
//           refresh();
//           setActiveView("history");
//         }}
//       />
//     );
//   }

//   // ── Hub UI ──
//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Announcements</Text>
//           <Text style={styles.headerSubtitle}>Broadcast center</Text>
//         </View>
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ── Hero Banner ── */}
//         <View style={styles.hero}>
//           <View style={styles.heroTop}>
//             <View style={styles.heroIconWrap}>
//               <Megaphone size={24} color="#fff" />
//             </View>
//             <View>
//               <Text style={styles.heroTitle}>Announcements</Text>
//               <Text style={styles.heroSubtitle}>
//                 Company-wide broadcast center
//               </Text>
//             </View>
//           </View>

//           <View style={styles.statsRow}>
//             <StatPill
//               label="Active"
//               value={stats.active}
//               color="#6EE7B7"
//               loading={statsLoading}
//             />
//             <StatPill
//               label="Scheduled"
//               value={stats.scheduled}
//               color="#7DD3FC"
//               loading={statsLoading}
//             />
//             <StatPill
//               label="Total Views"
//               value={stats.totalViews}
//               color="#FCD34D"
//               loading={statsLoading}
//             />
//           </View>
//         </View>

//         {/* ── Search ── */}
//         <View
//           style={[styles.searchRow, searchFocused && styles.searchRowFocused]}
//         >
//           <Search size={14} color={searchFocused ? C.primary : C.textMuted} />
//           <TextInput
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             onFocus={() => setSearchFocused(true)}
//             onBlur={() => setSearchFocused(false)}
//             onSubmitEditing={() => setActiveView("history")}
//             placeholder="Search announcements…"
//             placeholderTextColor={C.textMuted}
//             style={styles.searchInput}
//           />
//         </View>

//         {/* ── Tab Strip ── */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.tabStrip}
//         >
//           {TABS.map((tab) => {
//             const Icon = tab.icon;
//             const active = activeTabId === tab.id;
//             return (
//               <TabButton
//                 key={tab.id}
//                 label={tab.label}
//                 icon={
//                   <Icon size={14} color={active ? "#fff" : C.textSecondary} />
//                 }
//                 active={active}
//                 onPress={() => setActiveView(tab.id as any)}
//               />
//             );
//           })}
//         </ScrollView>

//         {/* ── Active Tab Card ── */}
//         <View style={styles.activeTabCard}>
//           <View style={styles.activeTabLeft}>
//             <View
//               style={[
//                 styles.activeTabIcon,
//                 { backgroundColor: C.primaryLight },
//               ]}
//             >
//               <activeTabData.icon size={16} color={C.primary} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.activeTabTitle}>{activeTabData.label}</Text>
//               <Text style={styles.activeTabDesc}>{activeTabData.desc}</Text>
//             </View>
//           </View>
//           <Pressable
//             onPress={() => setActiveView(activeTabData.id as any)}
//             style={({ pressed }) => [
//               styles.openBtn,
//               pressed && { opacity: 0.85 },
//             ]}
//           >
//             <Text style={styles.openBtnText}>Open</Text>
//             <ArrowUpRight size={12} color="#fff" />
//           </Pressable>
//         </View>

//         {/* ── All Modules Grid ── */}
//         <Text style={styles.sectionLabel}>All Modules</Text>
//         <View style={styles.modulesGrid}>
//           {TABS.map((tab) => (
//             <ModuleCard
//               key={tab.id}
//               label={tab.label}
//               desc={tab.desc}
//               icon={<tab.icon size={18} color={C.primary} />}
//               onPress={() => setActiveView(tab.id as any)}
//             />
//           ))}
//         </View>

//         <View style={{ height: 24 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//     backgroundColor: C.bg,
//   },
//   headerBack: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   headerTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
//   headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },

//   scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

//   hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy, gap: 16 },
//   heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
//   heroIconWrap: {
//     width: 48,
//     height: 48,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   heroTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
//   heroSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
//   statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

//   searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginTop: 16,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     backgroundColor: C.surface,
//     borderRadius: 16,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   searchRowFocused: {
//     borderColor: C.primary,
//     shadowColor: C.primary,
//     shadowOpacity: 0.12,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 0 },
//     elevation: 2,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: C.textPrimary,
//     paddingVertical: 0,
//   },

//   tabStrip: { flexDirection: "row", gap: 8, paddingVertical: 4, marginTop: 14 },

//   activeTabCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginTop: 16,
//     padding: 14,
//     backgroundColor: C.surface,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   activeTabLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     flex: 1,
//   },
//   activeTabIcon: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   activeTabTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
//   activeTabDesc: {
//     fontSize: 11,
//     color: C.textMuted,
//     marginTop: 2,
//     lineHeight: 15,
//   },
//   openBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 12,
//     backgroundColor: C.primary,
//   },
//   openBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//     marginTop: 22,
//     marginBottom: 10,
//   },

//   modulesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
// });



// src/app/admin/announcements.tsx
// Announcements hub — mirrors src/app/admin/leave.tsx.
// Tabs (History, Create) render as full-screen child components,
// switched via `activeView` state — no router involved.

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
  Megaphone,
  FileText,
  Search,
  ArrowUpRight,
  ChevronLeft,
} from "lucide-react-native";

import C from "../../styles/colors";
import { announcementApi } from "../../api/service/announcementApi";
import { Loader } from "../../hooks/loaderManager";
import { deriveStatus } from "../../components/admin/announcement/announcementsShared";

import StatPill from "../../components/admin/employee/StatPill";
import TabButton from "../../components/admin/employee/TabButton";
import ModuleCard from "../../components/admin/employee/ModuleCard";

import AnnouncementsHistoryView from "../../components/admin/announcement/AnnouncementsHistoryView";
import AnnouncementsCreateView from "../../components/admin/announcement/AnnouncementsCreateView";

// ─── Tabs config ──────────────────────────────────────────────
const TABS = [
  {
    id: "history",
    label: "History",
    icon: FileText,
    desc: "View, search, and manage everything you've sent",
  },
  {
    id: "create",
    label: "Compose New",
    icon: Megaphone,
    desc: "Write and publish an announcement to employees",
  },
] as const;

// ─── Live stats ─────────────────────────────────────────────
function useAnnouncementStats() {
  const [stats, setStats] = useState({
    active: 0,
    scheduled: 0,
    totalViews: 0,
  });

  const fetchStats = useCallback(async () => {
    Loader.show();
    try {
      const res = await announcementApi.list({ limit: 200 });
      const items = res?.data ?? [];
      const active = items.filter(
        (a: any) => deriveStatus(a) === "active",
      ).length;
      const scheduled = items.filter(
        (a: any) => deriveStatus(a) === "scheduled",
      ).length;
      const totalViews = items.reduce(
        (s: number, a: any) => s + (a.views ?? 0),
        0,
      );
      setStats({ active, scheduled, totalViews });
    } catch (err) {
      console.error("Failed to fetch announcement stats:", err);
    } finally {
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, refresh: fetchStats };
}

// ════════════════════ MAIN SCREEN ════════════════════
export default function AdminAnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const { stats, refresh } = useAnnouncementStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [activeView, setActiveView] = useState<"hub" | "history" | "create">(
    "hub",
  );

  const activeTabId = "history";
  const activeTabData = TABS.find((t) => t.id === activeTabId) || TABS[0];

  // ── History ──
  if (activeView === "history") {
    return (
      <AnnouncementsHistoryView
        onClose={() => {
          refresh();
          setActiveView("hub");
        }}
        onCreateNew={() => setActiveView("create")}
      />
    );
  }

  // ── Create ──
  if (activeView === "create") {
    return (
      <AnnouncementsCreateView
        onClose={() => {
          refresh();
          setActiveView("hub");
        }}
        onPublished={() => {
          refresh();
          setActiveView("history");
        }}
      />
    );
  }

  // ── Hub UI ──
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Announcements</Text>
          <Text style={styles.headerSubtitle}>Broadcast center</Text>
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
              <Megaphone size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Announcements</Text>
              <Text style={styles.heroSubtitle}>
                Company-wide broadcast center
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatPill
              label="Active"
              value={stats.active}
              color="#6EE7B7"
            />
            <StatPill
              label="Scheduled"
              value={stats.scheduled}
              color="#7DD3FC"
            />
            <StatPill
              label="Total Views"
              value={stats.totalViews}
              color="#FCD34D"
            />
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
            onSubmitEditing={() => setActiveView("history")}
            placeholder="Search announcements…"
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

  hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy, gap: 16 },
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
});