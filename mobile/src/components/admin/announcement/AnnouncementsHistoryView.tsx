// // src/components/admin/announcements/AnnouncementsHistoryView.tsx
// // "History" tab — list, search, filter, view, delete.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   ActivityIndicator,
//   RefreshControl,
//   FlatList,
//   ScrollView,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   Megaphone,
//   Search,
//   ChevronLeft,
//   Eye,
//   Trash2,
//   Pin,
//   Plus,
//   RefreshCw,
//   AlertCircle,
//   X,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { announcementApi } from "../../../api/service/announcementApi";
// import {
//   AnnTypeBadge,
//   AnnStatusBadge,
//   deriveStatus,
//   fmtDate,
// } from "./announcementsShared";
// import AnnouncementViewModal from "./AnnouncementViewModal";
// import DeleteAnnouncementModal from "./DeleteAnnouncementModal";

// interface Props {
//   onClose: () => void;
//   onCreateNew?: () => void;
// }

// const STATUS_PILLS = ["all", "active", "scheduled", "expired"] as const;
// const SORT_OPTIONS = [
//   { id: "newest", label: "Newest" },
//   { id: "oldest", label: "Oldest" },
//   { id: "mostViewed", label: "Most Viewed" },
// ] as const;

// export default function AnnouncementsHistoryView({
//   onClose,
//   onCreateNew,
// }: Props) {
//   const insets = useSafeAreaInsets();

//   const [items, setItems] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [search, setSearch] = useState("");
//   const [filterStatus, setFilterStatus] =
//     useState<(typeof STATUS_PILLS)[number]>("all");
//   const [sortBy, setSortBy] =
//     useState<(typeof SORT_OPTIONS)[number]["id"]>("newest");

//   const [viewModal, setViewModal] = useState<any | null>(null);
//   const [deleteModal, setDeleteModal] = useState<any | null>(null);
//   const [deleting, setDeleting] = useState(false);
//   const [toast, setToast] = useState<{
//     msg: string;
//     type: "success" | "error";
//   } | null>(null);

//   const showToast = (msg: string, type: "success" | "error" = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 2800);
//   };

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await announcementApi.list({ limit: 200 });
//       setItems(res?.data ?? []);
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           err?.message ??
//           "Failed to load announcements.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await load();
//     setRefreshing(false);
//   }, [load]);

//   const handleDelete = async () => {
//     if (!deleteModal) return;
//     setDeleting(true);
//     try {
//       await announcementApi.remove(deleteModal.id);
//       setItems((p) => p.filter((a) => a.id !== deleteModal.id));
//       setDeleteModal(null);
//       showToast("Announcement deleted");
//     } catch (err: any) {
//       showToast(err?.response?.data?.message ?? "Failed to delete.", "error");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const filtered = useMemo(() => {
//     let list = [...items];
//     if (search) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         (a) =>
//           a.title?.toLowerCase().includes(q) ||
//           a.body
//             ?.replace(/<[^>]+>/g, "")
//             .toLowerCase()
//             .includes(q),
//       );
//     }
//     if (filterStatus !== "all") {
//       list = list.filter((a) => deriveStatus(a) === filterStatus);
//     }
//     if (sortBy === "newest") {
//       list.sort(
//         (a, b) =>
//           new Date(b.publishAt || b.createdAt || 0).getTime() -
//           new Date(a.publishAt || a.createdAt || 0).getTime(),
//       );
//     } else if (sortBy === "oldest") {
//       list.sort(
//         (a, b) =>
//           new Date(a.publishAt || a.createdAt || 0).getTime() -
//           new Date(b.publishAt || b.createdAt || 0).getTime(),
//       );
//     } else if (sortBy === "mostViewed") {
//       list.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
//     }
//     list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
//     return list;
//   }, [items, search, filterStatus, sortBy]);

//   const renderCard = ({ item: ann }: { item: any }) => {
//     const status = deriveStatus(ann);
//     return (
//       <View style={styles.card}>
//         <View style={styles.cardTop}>
//           <AnnTypeBadge type={ann.type} />
//           {ann.isPinned && (
//             <View style={styles.pinnedTag}>
//               <Pin size={9} color={C.warning} />
//               <Text style={styles.pinnedTagText}>Pinned</Text>
//             </View>
//           )}
//           <View style={{ marginLeft: "auto" }}>
//             <AnnStatusBadge status={status} />
//           </View>
//         </View>

//         <Text style={styles.cardTitle} numberOfLines={1}>
//           {ann.title}
//         </Text>
//         <Text style={styles.cardBody} numberOfLines={2}>
//           {(ann.body ?? "").replace(/<[^>]+>/g, " ")}
//         </Text>

//         <View style={styles.cardMetaRow}>
//           <Text style={styles.cardMeta}>
//             {ann.audience === "all"
//               ? "All Employees"
//               : (ann.departmentName ?? "Dept.")}
//           </Text>
//           <Text style={styles.cardMetaDot}>·</Text>
//           <Text style={styles.cardMeta}>
//             {status === "scheduled"
//               ? `Scheduled ${fmtDate(ann.publishAt)}`
//               : fmtDate(ann.publishAt || ann.createdAt)}
//           </Text>
//         </View>

//         <View style={styles.cardFooter}>
//           <View style={styles.viewsPill}>
//             <Eye size={12} color={C.primary} />
//             <Text style={styles.viewsPillText}>{ann.views ?? 0} views</Text>
//           </View>
//           <View style={{ flexDirection: "row", gap: 8, marginLeft: "auto" }}>
//             <Pressable
//               onPress={() => setViewModal(ann)}
//               style={[styles.iconBtn, { backgroundColor: C.primaryLight }]}
//             >
//               <Eye size={14} color={C.primary} />
//             </Pressable>
//             <Pressable
//               onPress={() => setDeleteModal(ann)}
//               style={[styles.iconBtn, { backgroundColor: C.dangerLight }]}
//             >
//               <Trash2 size={14} color={C.danger} />
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const renderHeader = () => (
//     <>
//       <View style={styles.searchBar}>
//         <View style={styles.searchInputWrap}>
//           <Search size={16} color={C.textMuted} />
//           <TextInput
//             value={search}
//             onChangeText={setSearch}
//             placeholder="Search title or body…"
//             placeholderTextColor={C.textMuted}
//             style={styles.searchInput}
//           />
//           {search.length > 0 && (
//             <Pressable onPress={() => setSearch("")}>
//               <X size={16} color={C.textMuted} />
//             </Pressable>
//           )}
//         </View>
//         {onCreateNew && (
//           <Pressable onPress={onCreateNew} style={styles.newBtn}>
//             <Plus size={16} color="#fff" />
//           </Pressable>
//         )}
//         <Pressable onPress={load} style={styles.iconBtnOutline}>
//           <RefreshCw size={16} color={C.textMuted} />
//         </Pressable>
//       </View>

//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.chipRow}
//       >
//         {STATUS_PILLS.map((s) => (
//           <Pressable
//             key={s}
//             onPress={() => setFilterStatus(s)}
//             style={[styles.chip, filterStatus === s && styles.chipActive]}
//           >
//             <Text
//               style={[
//                 styles.chipText,
//                 filterStatus === s && styles.chipTextActive,
//               ]}
//             >
//               {s === "all" ? "All Status" : s[0].toUpperCase() + s.slice(1)}
//             </Text>
//           </Pressable>
//         ))}
//       </ScrollView>

//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={[styles.chipRow, { marginBottom: 12 }]}
//       >
//         {SORT_OPTIONS.map((s) => (
//           <Pressable
//             key={s.id}
//             onPress={() => setSortBy(s.id)}
//             style={[styles.sortChip, sortBy === s.id && styles.sortChipActive]}
//           >
//             <Text
//               style={[
//                 styles.sortChipText,
//                 sortBy === s.id && styles.sortChipTextActive,
//               ]}
//             >
//               {s.label}
//             </Text>
//           </Pressable>
//         ))}
//       </ScrollView>

//       {error && (
//         <View style={styles.errorBanner}>
//           <AlertCircle size={16} color={C.danger} />
//           <Text style={styles.errorBannerText}>{error}</Text>
//           <Pressable onPress={load}>
//             <RefreshCw size={14} color={C.danger} />
//           </Pressable>
//         </View>
//       )}
//     </>
//   );

//   const renderEmpty = () => (
//     <View style={styles.emptyState}>
//       <Megaphone size={44} color={C.textMuted} />
//       <Text style={styles.emptyTitle}>No announcements found</Text>
//       <Text style={styles.emptyDesc}>
//         {search || filterStatus !== "all"
//           ? "Try a different search or filter"
//           : "Create your first announcement to get started"}
//       </Text>
//     </View>
//   );

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={onClose} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>History</Text>
//           <Text style={styles.headerSubtitle}>
//             {loading ? "Loading…" : `${filtered.length} announcements`}
//           </Text>
//         </View>
//       </View>

//       <FlatList
//         data={filtered}
//         keyExtractor={(item) => item.id}
//         renderItem={renderCard}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={!loading ? renderEmpty : null}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={C.primary}
//           />
//         }
//       />

//       {loading && items.length === 0 && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       )}

//       {viewModal && (
//         <AnnouncementViewModal
//           visible={!!viewModal}
//           announcement={viewModal}
//           onClose={() => setViewModal(null)}
//         />
//       )}

//       <DeleteAnnouncementModal
//         visible={!!deleteModal}
//         announcement={deleteModal}
//         loading={deleting}
//         onConfirm={handleDelete}
//         onCancel={() => setDeleteModal(null)}
//       />

//       {toast && (
//         <View
//           style={[
//             styles.toast,
//             { backgroundColor: toast.type === "error" ? C.danger : C.navy },
//           ]}
//         >
//           <Text style={styles.toastText}>{toast.msg}</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: C.bg },
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

//   listContent: { padding: 16, paddingBottom: 24 },

//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 12,
//   },
//   searchInputWrap: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 14,
//     backgroundColor: C.surface,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: C.textPrimary,
//     paddingVertical: 0,
//   },
//   newBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   iconBtnOutline: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },

//   chipRow: { flexDirection: "row", gap: 8, paddingBottom: 10 },
//   chip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   chipActive: { backgroundColor: C.primary, borderColor: C.primary },
//   chipText: { fontSize: 11, fontWeight: "700", color: C.textSecondary },
//   chipTextActive: { color: "#fff" },

//   sortChip: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   sortChipActive: {
//     backgroundColor: C.primaryLight,
//     borderColor: C.primary + "44",
//   },
//   sortChipText: { fontSize: 10, fontWeight: "700", color: C.textMuted },
//   sortChipTextActive: { color: C.primary },

//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     borderWidth: 1,
//     borderColor: C.danger + "33",
//     marginBottom: 12,
//   },
//   errorBannerText: {
//     flex: 1,
//     fontSize: 13,
//     fontWeight: "600",
//     color: C.danger,
//   },

//   card: {
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     marginBottom: 10,
//     gap: 8,
//   },
//   cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
//   pinnedTag: { flexDirection: "row", alignItems: "center", gap: 3 },
//   pinnedTagText: { fontSize: 10, fontWeight: "800", color: C.warning },
//   cardTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
//   cardBody: { fontSize: 12, color: C.textSecondary, lineHeight: 17 },
//   cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
//   cardMeta: { fontSize: 11, color: C.textMuted },
//   cardMetaDot: { fontSize: 11, color: C.textMuted },
//   cardFooter: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   viewsPill: { flexDirection: "row", alignItems: "center", gap: 4 },
//   viewsPillText: { fontSize: 11, fontWeight: "700", color: C.primary },
//   iconBtn: {
//     width: 30,
//     height: 30,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
//   emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
//   emptyDesc: { fontSize: 13, color: C.textMuted, textAlign: "center" },

//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.bg + "cc",
//   },

//   toast: {
//     position: "absolute",
//     bottom: 24,
//     left: 20,
//     right: 20,
//     padding: 14,
//     borderRadius: 16,
//   },
//   toastText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "600",
//     textAlign: "center",
//   },
// });


// src/components/admin/announcements/AnnouncementsHistoryView.tsx
// "History" tab — list, search, filter, view, delete.

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  RefreshControl,
  FlatList,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Megaphone,
  Search,
  ChevronLeft,
  Eye,
  Trash2,
  Pin,
  Plus,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { announcementApi } from "../../../api/service/announcementApi";
import { Loader } from "../../../hooks/loaderManager";
import {
  AnnTypeBadge,
  AnnStatusBadge,
  deriveStatus,
  fmtDate,
} from "./announcementsShared";
import AnnouncementViewModal from "./AnnouncementViewModal";
import DeleteAnnouncementModal from "./DeleteAnnouncementModal";

interface Props {
  onClose: () => void;
  onCreateNew?: () => void;
}

const STATUS_PILLS = ["all", "active", "scheduled", "expired"] as const;
const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "mostViewed", label: "Most Viewed" },
] as const;

export default function AnnouncementsHistoryView({
  onClose,
  onCreateNew,
}: Props) {
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<(typeof STATUS_PILLS)[number]>("all");
  const [sortBy, setSortBy] =
    useState<(typeof SORT_OPTIONS)[number]["id"]>("newest");

  const [viewModal, setViewModal] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const load = useCallback(async () => {
    Loader.show();
    setError(null);
    try {
      const res = await announcementApi.list({ limit: 200 });
      setItems(res?.data ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load announcements.",
      );
    } finally {
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    Loader.show();
    try {
      await announcementApi.remove(deleteModal.id);
      setItems((p) => p.filter((a) => a.id !== deleteModal.id));
      setDeleteModal(null);
      showToast("Announcement deleted");
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to delete.", "error");
    } finally {
      Loader.hide();
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...items];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.body
            ?.replace(/<[^>]+>/g, "")
            .toLowerCase()
            .includes(q),
      );
    }
    if (filterStatus !== "all") {
      list = list.filter((a) => deriveStatus(a) === filterStatus);
    }
    if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.publishAt || b.createdAt || 0).getTime() -
          new Date(a.publishAt || a.createdAt || 0).getTime(),
      );
    } else if (sortBy === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.publishAt || a.createdAt || 0).getTime() -
          new Date(b.publishAt || b.createdAt || 0).getTime(),
      );
    } else if (sortBy === "mostViewed") {
      list.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }
    list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    return list;
  }, [items, search, filterStatus, sortBy]);

  const renderCard = ({ item: ann }: { item: any }) => {
    const status = deriveStatus(ann);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <AnnTypeBadge type={ann.type} />
          {ann.isPinned && (
            <View style={styles.pinnedTag}>
              <Pin size={9} color={C.warning} />
              <Text style={styles.pinnedTagText}>Pinned</Text>
            </View>
          )}
          <View style={{ marginLeft: "auto" }}>
            <AnnStatusBadge status={status} />
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {ann.title}
        </Text>
        <Text style={styles.cardBody} numberOfLines={2}>
          {(ann.body ?? "").replace(/<[^>]+>/g, " ")}
        </Text>

        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMeta}>
            {ann.audience === "all"
              ? "All Employees"
              : (ann.departmentName ?? "Dept.")}
          </Text>
          <Text style={styles.cardMetaDot}>·</Text>
          <Text style={styles.cardMeta}>
            {status === "scheduled"
              ? `Scheduled ${fmtDate(ann.publishAt)}`
              : fmtDate(ann.publishAt || ann.createdAt)}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.viewsPill}>
            <Eye size={12} color={C.primary} />
            <Text style={styles.viewsPillText}>{ann.views ?? 0} views</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginLeft: "auto" }}>
            <Pressable
              onPress={() => setViewModal(ann)}
              style={[styles.iconBtn, { backgroundColor: C.primaryLight }]}
            >
              <Eye size={14} color={C.primary} />
            </Pressable>
            <Pressable
              onPress={() => setDeleteModal(ann)}
              style={[styles.iconBtn, { backgroundColor: C.dangerLight }]}
            >
              <Trash2 size={14} color={C.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Search size={16} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search title or body…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <X size={16} color={C.textMuted} />
            </Pressable>
          )}
        </View>
        {onCreateNew && (
          <Pressable onPress={onCreateNew} style={styles.newBtn}>
            <Plus size={16} color="#fff" />
          </Pressable>
        )}
        <Pressable onPress={load} style={styles.iconBtnOutline}>
          <RefreshCw size={16} color={C.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {STATUS_PILLS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setFilterStatus(s)}
            style={[styles.chip, filterStatus === s && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                filterStatus === s && styles.chipTextActive,
              ]}
            >
              {s === "all" ? "All Status" : s[0].toUpperCase() + s.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipRow, { marginBottom: 12 }]}
      >
        {SORT_OPTIONS.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setSortBy(s.id)}
            style={[styles.sortChip, sortBy === s.id && styles.sortChipActive]}
          >
            <Text
              style={[
                styles.sortChipText,
                sortBy === s.id && styles.sortChipTextActive,
              ]}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={styles.errorBannerText}>{error}</Text>
          <Pressable onPress={load}>
            <RefreshCw size={14} color={C.danger} />
          </Pressable>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Megaphone size={44} color={C.textMuted} />
      <Text style={styles.emptyTitle}>No announcements found</Text>
      <Text style={styles.emptyDesc}>
        {search || filterStatus !== "all"
          ? "Try a different search or filter"
          : "Create your first announcement to get started"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>History</Text>
          <Text style={styles.headerSubtitle}>
            {`${filtered.length} announcements`}
          </Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      />

      {viewModal && (
        <AnnouncementViewModal
          visible={!!viewModal}
          announcement={viewModal}
          onClose={() => setViewModal(null)}
        />
      )}

      <DeleteAnnouncementModal
        visible={!!deleteModal}
        announcement={deleteModal}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(null)}
      />

      {toast && (
        <View
          style={[
            styles.toast,
            { backgroundColor: toast.type === "error" ? C.danger : C.navy },
          ]}
        >
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
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

  listContent: { padding: 16, paddingBottom: 24 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
    paddingVertical: 0,
  },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  iconBtnOutline: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },

  chipRow: { flexDirection: "row", gap: 8, paddingBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 11, fontWeight: "700", color: C.textSecondary },
  chipTextActive: { color: "#fff" },

  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  sortChipActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary + "44",
  },
  sortChipText: { fontSize: 10, fontWeight: "700", color: C.textMuted },
  sortChipTextActive: { color: C.primary },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    gap: 8,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  pinnedTag: { flexDirection: "row", alignItems: "center", gap: 3 },
  pinnedTagText: { fontSize: 10, fontWeight: "800", color: C.warning },
  cardTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  cardBody: { fontSize: 12, color: C.textSecondary, lineHeight: 17 },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardMeta: { fontSize: 11, color: C.textMuted },
  cardMetaDot: { fontSize: 11, color: C.textMuted },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  viewsPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewsPillText: { fontSize: 11, fontWeight: "700", color: C.primary },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptyDesc: { fontSize: 13, color: C.textMuted, textAlign: "center" },

  toast: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 16,
  },
  toastText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});