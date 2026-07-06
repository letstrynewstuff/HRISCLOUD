// // src/app/employee/announcements.tsx
// // Employee Announcements feed — fully wired to the production API.
// // Uses getAnnouncementFeed (audience-scoped) and recordAnnouncementView.
// // Zero mock data. Filters by audience (all / department / role).

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   RefreshControl,
//   TextInput,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   ArrowLeft,
//   Megaphone,
//   Search,
//   Pin,
//   AlertCircle,
//   RefreshCw,
// } from "lucide-react-native";

// import C from "../../styles/colors";
// import AnnouncementCard from "../../components/announcements/AnnouncementCard";
// import AnnouncementDetailModal from "../../components/announcements/AnnouncementDetailModal";
// import {
//   getAnnouncementFeed,
//   recordAnnouncementView,
// } from "../../api/service/announcementApi";
// import {
//   Announcement,
//   Audience,
//   AUDIENCE_CONFIG,
//   audienceConfig,
// } from "../../data/announcementConfig";

// // "all" here means "no audience filter applied" — show every item from the feed
// type FilterKey = "all" | Audience;

// // const AUDIENCE_FILTERS: FilterKey[] = [
// //   "all",
// //   ...Object.keys(AUDIENCE_CONFIG) as Audience[],
// // ];

// const AUDIENCE_FILTERS: FilterKey[] = [
//   "all",
//   ...(Object.keys(AUDIENCE_CONFIG) as Audience[]).filter((k) => k !== "all"),
// ];

// export default function AnnouncementsScreen() {
//   const insets = useSafeAreaInsets();

//   const [announcements, setAnnouncements] = useState<Announcement[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [search, setSearch] = useState("");
//   const [filterAudience, setFilterAudience] = useState<FilterKey>("all");
//   const [selected, setSelected] = useState<Announcement | null>(null);

//   // Track which ids the employee has already viewed this session.
//   // On open we fire the view API call; the local set prevents duplicate calls.
//   const [viewed, setViewed] = useState<Set<string>>(new Set());

//   const loadFeed = useCallback(async () => {
//     setError(null);
//     try {
//       const res = await getAnnouncementFeed({ limit: 50 });
//       const raw: Announcement[] = res.data ?? [];
//       // Deduplicate by id — API occasionally returns the same announcement twice
//       const seen = new Set<string>();
//       const deduped = raw.filter((a) => {
//         if (seen.has(a.id)) return false;
//         seen.add(a.id);
//         return true;
//       });
//       setAnnouncements(deduped);
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           (err?.isNetworkError || err?.isTimeout
//             ? err.message
//             : "Failed to load announcements. Please try again."),
//       );
//     }
//   }, []);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       await loadFeed();
//       setLoading(false);
//     })();
//   }, [loadFeed]);

//   async function handleRefresh() {
//     setRefreshing(true);
//     await loadFeed();
//     setRefreshing(false);
//   }

//   async function handleOpen(a: Announcement) {
//     setSelected(a);
//     if (!viewed.has(a.id)) {
//       // Optimistically mark viewed and increment count locally
//       setViewed((prev) => new Set(prev).add(a.id));
//       setAnnouncements((prev) =>
//         prev.map((x) =>
//           x.id === a.id ? { ...x, views: (x.views ?? 0) + 1 } : x,
//         ),
//       );
//       // Fire-and-forget — don't block UI on this
//       recordAnnouncementView(a.id).catch(() => {});
//     }
//   }

//   const filtered = useMemo(() => {
//     const q = search.toLowerCase();
//     return announcements.filter((a) => {
//       const matchSearch =
//         !search ||
//         a.title.toLowerCase().includes(q) ||
//         a.body.toLowerCase().includes(q);
//       const matchAudience =
//         filterAudience === "all" || a.audience === filterAudience;
//       return matchSearch && matchAudience;
//     });
//   }, [announcements, search, filterAudience]);

//   const pinned = filtered.filter((a) => a.isPinned);
//   const regular = filtered.filter((a) => !a.isPinned);

//   if (loading) {
//     return (
//       <View
//         style={[
//           styles.screen,
//           { paddingTop: insets.top, alignItems: "center", justifyContent: "center" },
//         ]}
//       >
//         <ActivityIndicator size="small" color={C.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable
//           onPress={() => router.back()}
//           hitSlop={8}
//           style={styles.backBtn}
//         >
//           <ArrowLeft size={18} color={C.textSecondary} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Announcements</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={C.primary}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Hero */}
//         <View style={styles.hero}>
//           <View style={styles.heroTopRow}>
//             <View style={styles.heroIconWrap}>
//               <Megaphone size={20} color="#fff" />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.heroTitle}>Announcements</Text>
//               <Text style={styles.heroSubtitle}>
//                 Stay up to date with what's happening
//               </Text>
//             </View>
//           </View>

//           <View style={styles.heroChipsRow}>
//             <View style={styles.heroChip}>
//               <Megaphone size={11} color="rgba(255,255,255,0.7)" />
//               <Text style={styles.heroChipText}>
//                 <Text style={styles.heroChipBold}>{announcements.length}</Text>{" "}
//                 total
//               </Text>
//             </View>
//             {announcements.filter((a) => a.isPinned).length > 0 && (
//               <View style={styles.heroChip}>
//                 <Pin size={11} color="rgba(255,255,255,0.7)" />
//                 <Text style={styles.heroChipText}>
//                   <Text style={styles.heroChipBold}>
//                     {announcements.filter((a) => a.isPinned).length}
//                   </Text>{" "}
//                   pinned
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>

//         {/* Error banner */}
//         {error ? (
//           <View style={styles.errorBanner}>
//             <AlertCircle size={15} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//             <Pressable onPress={loadFeed} hitSlop={8}>
//               <RefreshCw size={14} color={C.danger} />
//             </Pressable>
//           </View>
//         ) : null}

//         {/* Search */}
//         <View style={styles.searchRow}>
//           <Search size={14} color={C.textMuted} />
//           <TextInput
//             value={search}
//             onChangeText={setSearch}
//             placeholder="Search announcements…"
//             placeholderTextColor={C.textMuted}
//             style={styles.searchInput}
//           />
//           {search.length > 0 && (
//             <Pressable onPress={() => setSearch("")} hitSlop={8}>
//               <Text style={styles.clearBtn}>✕</Text>
//             </Pressable>
//           )}
//         </View>

//         {/* Audience filter chips */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={{ flexGrow: 0 }}
//         >
//           <View style={{ flexDirection: "row", gap: 6 }}>
//             {AUDIENCE_FILTERS.map((f) => {
//               const active = filterAudience === f;
//               const cfg = f === "all" ? null : audienceConfig(f);
//               return (
//                 <Pressable
//                   key={f}
//                   onPress={() => setFilterAudience(f)}
//                   style={[
//                     styles.filterChip,
//                     active && {
//                       backgroundColor: cfg?.color ?? C.primary,
//                       borderColor: cfg?.color ?? C.primary,
//                     },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.filterChipLabel,
//                       { color: active ? "#fff" : C.textSecondary },
//                     ]}
//                   >
//                     {f === "all" ? "All" : `${cfg!.icon} ${cfg!.label}`}
//                   </Text>
//                 </Pressable>
//               );
//             })}
//           </View>
//         </ScrollView>

//         {!error && (
//           <Text style={styles.countText}>
//             {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
//           </Text>
//         )}

//         {/* Content */}
//         {filtered.length === 0 && !error ? (
//           <View style={styles.emptyState}>
//             <View style={styles.emptyIconWrap}>
//               <Megaphone size={22} color={C.textMuted} />
//             </View>
//             <Text style={styles.emptyTitle}>No announcements</Text>
//             <Text style={styles.emptySubtitle}>
//               {search
//                 ? "No results match your search."
//                 : filterAudience !== "all"
//                   ? "No announcements for this audience yet."
//                   : "Nothing to show right now. Check back later."}
//             </Text>
//             {search ? (
//               <Pressable onPress={() => setSearch("")} hitSlop={8}>
//                 <Text style={styles.clearSearchLink}>Clear search</Text>
//               </Pressable>
//             ) : null}
//           </View>
//         ) : (
//           <>
//             {pinned.length > 0 && (
//               <View style={{ gap: 10 }}>
//                 <View style={styles.sectionLabelRow}>
//                   <Pin size={12} color={C.warning} />
//                   <Text style={[styles.sectionLabel, { color: C.warning }]}>
//                     Pinned
//                   </Text>
//                 </View>
//                 <View style={styles.grid}>

//                   {pinned.map((a, i) => (
//                     <AnnouncementCard
//                       key={`pinned-${a.id}-${i}`}
//                       announcement={a}
//                       viewed={viewed.has(a.id)}
//                       onPress={handleOpen}
//                     />
//                   ))}
//                 </View>
//               </View>
//             )}

//             {regular.length > 0 && (
//               <View style={{ gap: 10 }}>
//                 {pinned.length > 0 && (
//                   <View style={styles.sectionLabelRow}>
//                     <Text style={styles.sectionLabel}>Recent</Text>
//                   </View>
//                 )}
//                 <View style={styles.grid}>

//                   {regular.map((a, i) => (
//                     <AnnouncementCard
//                       key={`regular-${a.id}-${i}`}
//                       announcement={a}
//                       viewed={viewed.has(a.id)}
//                       onPress={handleOpen}
//                     />
//                   ))}
//                 </View>
//               </View>
//             )}
//           </>
//         )}

//         <View style={{ height: 24 }} />
//       </ScrollView>

//       <AnnouncementDetailModal
//         announcement={selected}
//         onClose={() => setSelected(null)}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 12,
//   },
//   backBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: C.textPrimary },
//   scrollContent: { paddingHorizontal: 16, gap: 14, paddingBottom: 12 },
//   hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy, gap: 14 },
//   heroTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
//   heroIconWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   heroTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
//   heroSubtitle: { fontSize: 11.5, color: "rgba(255,255,255,0.65)", marginTop: 2 },
//   heroChipsRow: { flexDirection: "row", gap: 8 },
//   heroChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 11,
//     paddingVertical: 7,
//     borderRadius: 12,
//     backgroundColor: "rgba(255,255,255,0.10)",
//   },
//   heroChipText: { fontSize: 11.5, color: "rgba(255,255,255,0.75)" },
//   heroChipBold: { fontWeight: "800", color: "#fff" },
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//   },
//   errorText: { flex: 1, fontSize: 12, color: C.danger, fontWeight: "600" },
//   searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: C.surface,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     borderRadius: 14,
//     paddingHorizontal: 13,
//     paddingVertical: 11,
//   },
//   searchInput: { flex: 1, fontSize: 13.5, color: C.textPrimary, padding: 0 },
//   clearBtn: { fontSize: 13, color: C.textMuted, paddingHorizontal: 2 },
//   filterChip: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   filterChipLabel: { fontSize: 11.5, fontWeight: "700" },
//   countText: { fontSize: 11, color: C.textMuted, textAlign: "right" },
//   grid: { gap: 10 },
//   sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: "800",
//     textTransform: "uppercase",
//     letterSpacing: 0.4,
//     color: C.textMuted,
//   },
//   emptyState: { alignItems: "center", gap: 6, paddingVertical: 48 },
//   emptyIconWrap: {
//     width: 56,
//     height: 56,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     marginBottom: 6,
//   },
//   emptyTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
//   emptySubtitle: {
//     fontSize: 12,
//     color: C.textMuted,
//     textAlign: "center",
//     paddingHorizontal: 24,
//   },
//   clearSearchLink: { fontSize: 12.5, fontWeight: "700", color: C.primary, marginTop: 6 },
// });

// src/app/employee/announcements.tsx
// Employee Announcements feed — fully wired to the production API.
// Uses getAnnouncementFeed (audience-scoped) and recordAnnouncementView.
// Zero mock data. Filters by audience (all / department / role).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  Megaphone,
  Search,
  Pin,
  AlertCircle,
  RefreshCw,
} from "lucide-react-native";

import C from "../../styles/colors";
import AnnouncementCard from "../../components/announcements/AnnouncementCard";
import AnnouncementDetailModal from "../../components/announcements/AnnouncementDetailModal";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";
import {
  getAnnouncementFeed,
  recordAnnouncementView,
} from "../../api/service/announcementApi";
import {
  Announcement,
  Audience,
  AUDIENCE_CONFIG,
  audienceConfig,
} from "../../data/announcementConfig";

// "all" here means "no audience filter applied" — show every item from the feed
type FilterKey = "all" | Audience;

const AUDIENCE_FILTERS: FilterKey[] = [
  "all",
  ...(Object.keys(AUDIENCE_CONFIG) as Audience[]).filter((k) => k !== "all"),
];

export default function AnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filterAudience, setFilterAudience] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Announcement | null>(null);

  // Track which ids the employee has already viewed this session.
  // On open we fire the view API call; the local set prevents duplicate calls.
  const [viewed, setViewed] = useState<Set<string>>(new Set());

  const loadFeed = useCallback(async () => {
    setError(null);
    try {
      const res = await getAnnouncementFeed({ limit: 50 });
      const raw: Announcement[] = res.data ?? [];
      // Deduplicate by id — API occasionally returns the same announcement twice
      const seen = new Set<string>();
      const deduped = raw.filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
      setAnnouncements(deduped);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          (err?.isNetworkError || err?.isTimeout
            ? err.message
            : "Failed to load announcements. Please try again."),
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      loaderRef.current?.show();
      try {
        await loadFeed();
      } finally {
        loaderRef.current?.hide();
      }
    })();
  }, [loadFeed]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }

  async function handleOpen(a: Announcement) {
    setSelected(a);
    if (!viewed.has(a.id)) {
      // Optimistically mark viewed and increment count locally
      setViewed((prev) => new Set(prev).add(a.id));
      setAnnouncements((prev) =>
        prev.map((x) =>
          x.id === a.id ? { ...x, views: (x.views ?? 0) + 1 } : x,
        ),
      );
      // Fire-and-forget — don't block UI on this
      recordAnnouncementView(a.id);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return announcements.filter((a) => {
      const matchSearch =
        !search ||
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q);
      const matchAudience =
        filterAudience === "all" || a.audience === filterAudience;
      return matchSearch && matchAudience;
    });
  }, [announcements, search, filterAudience]);

  const pinned = filtered.filter((a) => a.isPinned);
  const regular = filtered.filter((a) => !a.isPinned);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <ArrowLeft size={18} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Announcements</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Megaphone size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Announcements</Text>
              <Text style={styles.heroSubtitle}>
                Stay up to date with what's happening
              </Text>
            </View>
          </View>

          <View style={styles.heroChipsRow}>
            <View style={styles.heroChip}>
              <Megaphone size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroChipText}>
                <Text style={styles.heroChipBold}>{announcements.length}</Text>{" "}
                total
              </Text>
            </View>
            {announcements.filter((a) => a.isPinned).length > 0 && (
              <View style={styles.heroChip}>
                <Pin size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroChipText}>
                  <Text style={styles.heroChipBold}>
                    {announcements.filter((a) => a.isPinned).length}
                  </Text>{" "}
                  pinned
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Error banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadFeed} hitSlop={8}>
              <RefreshCw size={14} color={C.danger} />
            </Pressable>
          </View>
        ) : null}

        {/* Search */}
        <View style={styles.searchRow}>
          <Search size={14} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search announcements…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Audience filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
        >
          <View style={{ flexDirection: "row", gap: 6 }}>
            {AUDIENCE_FILTERS.map((f) => {
              const active = filterAudience === f;
              const cfg = f === "all" ? null : audienceConfig(f);
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilterAudience(f)}
                  style={[
                    styles.filterChip,
                    active && {
                      backgroundColor: cfg?.color ?? C.primary,
                      borderColor: cfg?.color ?? C.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipLabel,
                      { color: active ? "#fff" : C.textSecondary },
                    ]}
                  >
                    {f === "all" ? "All" : `${cfg!.icon} ${cfg!.label}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {!error && (
          <Text style={styles.countText}>
            {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
          </Text>
        )}

        {/* Content */}
        {filtered.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Megaphone size={22} color={C.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No announcements</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? "No results match your search."
                : filterAudience !== "all"
                  ? "No announcements for this audience yet."
                  : "Nothing to show right now. Check back later."}
            </Text>
            {search ? (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Text style={styles.clearSearchLink}>Clear search</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <>
            {pinned.length > 0 && (
              <View style={{ gap: 10 }}>
                <View style={styles.sectionLabelRow}>
                  <Pin size={12} color={C.warning} />
                  <Text style={[styles.sectionLabel, { color: C.warning }]}>
                    Pinned
                  </Text>
                </View>
                <View style={styles.grid}>
                  {pinned.map((a, i) => (
                    <AnnouncementCard
                      key={`pinned-${a.id}-${i}`}
                      announcement={a}
                      viewed={viewed.has(a.id)}
                      onPress={handleOpen}
                    />
                  ))}
                </View>
              </View>
            )}

            {regular.length > 0 && (
              <View style={{ gap: 10 }}>
                {pinned.length > 0 && (
                  <View style={styles.sectionLabelRow}>
                    <Text style={styles.sectionLabel}>Recent</Text>
                  </View>
                )}
                <View style={styles.grid}>
                  {regular.map((a, i) => (
                    <AnnouncementCard
                      key={`regular-${a.id}-${i}`}
                      announcement={a}
                      viewed={viewed.has(a.id)}
                      onPress={handleOpen}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <AnnouncementDetailModal
        announcement={selected}
        onClose={() => setSelected(null)}
      />

      {/* Global loader — the only loader in this screen */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading announcements..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
  },
  scrollContent: { paddingHorizontal: 16, gap: 14, paddingBottom: 12 },
  hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy, gap: 14 },
  heroTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  heroSubtitle: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  heroChipsRow: { flexDirection: "row", gap: 8 },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  heroChipText: { fontSize: 11.5, color: "rgba(255,255,255,0.75)" },
  heroChipBold: { fontWeight: "800", color: "#fff" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
  },
  errorText: { flex: 1, fontSize: 12, color: C.danger, fontWeight: "600" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 13.5, color: C.textPrimary, padding: 0 },
  clearBtn: { fontSize: 13, color: C.textMuted, paddingHorizontal: 2 },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipLabel: { fontSize: 11.5, fontWeight: "700" },
  countText: { fontSize: 11, color: C.textMuted, textAlign: "right" },
  grid: { gap: 10 },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: C.textMuted,
  },
  emptyState: { alignItems: "center", gap: 6, paddingVertical: 48 },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  emptySubtitle: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  clearSearchLink: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.primary,
    marginTop: 6,
  },
});
