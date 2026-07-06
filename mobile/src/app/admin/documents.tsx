

// // src/app/admin/documents.tsx
// // Document Management — sent documents list + 3-step send wizard.
// // Header + hero banner styled to match training.tsx pattern exactly.

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
// import { router } from "expo-router";
// import {
//   FileText,
//   PenLine,
//   Search,
//   ChevronLeft,
//   RefreshCw,
//   AlertTriangle,
//   Inbox,
//   Plus,
//   X,
// } from "lucide-react-native";

// import C from "../../styles/colors";
// import { documentApi } from "../../api/service/documentApi";

// import DocumentCard from "../../components/admin/documents/DocumentCard";
// import SendDocumentModal from "../../components/admin/documents/SendDocumentModal";
// import DocumentSuccessToast from "../../components/admin/documents/DocumentSuccessToast";

// const STATUS_PILLS = ["all", "sent", "signed", "pending", "rejected"] as const;

// export default function AdminDocumentsScreen() {
//   const insets = useSafeAreaInsets();

//   const [docs, setDocs] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] =
//     useState<(typeof STATUS_PILLS)[number]>("all");

//   const [showModal, setShowModal] = useState(false);
//   const [successCount, setSuccessCount] = useState<number | null>(null);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await documentApi.getAll({ limit: 200 });
//       const list = Array.isArray(res?.data) ? res.data : [];
//       setDocs(list);
//     } catch (e: any) {
//       setError(
//         e?.response?.data?.message ?? e?.message ?? "Failed to load documents.",
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

//   const handleSuccess = (count: number) => {
//     setShowModal(false);
//     setSuccessCount(count);
//     load();
//   };

//   const filtered = useMemo(() => {
//     const q = search.toLowerCase();
//     return docs.filter((d) => {
//       const name = (d.template_name ?? "").toLowerCase();
//       const emp = (d.employee_name ?? "").toLowerCase();
//       const cat = (d.category ?? "").toLowerCase();
//       return (
//         (!q || name.includes(q) || emp.includes(q) || cat.includes(q)) &&
//         (statusFilter === "all" || d.status?.toLowerCase() === statusFilter)
//       );
//     });
//   }, [docs, search, statusFilter]);

//   const pending = docs.filter((d) =>
//     ["sent", "pending"].includes(d.status?.toLowerCase()),
//   ).length;
//   const signed = docs.filter(
//     (d) => d.status?.toLowerCase() === "signed",
//   ).length;

//   const renderHeader = () => (
//     <>
//       {/* ── Hero Banner ── */}
//       <View style={styles.hero}>
//         <View style={styles.heroTop}>
//           <View style={styles.heroIconWrap}>
//             <FileText size={24} color="#fff" />
//           </View>
//           <View>
//             <Text style={styles.heroTitle}>Document Management</Text>
//             <Text style={styles.heroSubtitle}>
//               Send • Track • Sign • Store
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Stats row */}
//       <View style={styles.statsRow}>
//         {[
//           {
//             label: "Total Sent",
//             value: docs.length,
//             color: C.primary,
//             bg: C.primaryLight,
//           },
//           {
//             label: "Awaiting Sign",
//             value: pending,
//             color: "#D97706",
//             bg: "#FFF7ED",
//           },
//           { label: "Signed", value: signed, color: "#15803D", bg: "#F0FDF4" },
//         ].map((s) => (
//           <View
//             key={s.label}
//             style={[styles.statCard, { backgroundColor: s.bg }]}
//           >
//             <Text style={[styles.statValue, { color: s.color }]}>
//               {s.value}
//             </Text>
//             <Text style={styles.statLabel}>{s.label}</Text>
//           </View>
//         ))}
//       </View>

//       <View style={styles.searchBar}>
//         <View style={styles.searchInputWrap}>
//           <Search size={16} color={C.textMuted} />
//           <TextInput
//             value={search}
//             onChangeText={setSearch}
//             placeholder="Search document or employee…"
//             placeholderTextColor={C.textMuted}
//             style={styles.searchInput}
//           />
//           {search.length > 0 && (
//             <Pressable onPress={() => setSearch("")}>
//               <X size={16} color={C.textMuted} />
//             </Pressable>
//           )}
//         </View>
//         <Pressable onPress={() => setShowModal(true)} style={styles.newBtn}>
//           <Plus size={16} color="#fff" />
//         </Pressable>
//         <Pressable onPress={load} style={styles.iconBtn}>
//           <RefreshCw size={16} color={C.textMuted} />
//         </Pressable>
//       </View>

//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.chipRow}
//       >
//         {STATUS_PILLS.map((s) => {
//           const active = statusFilter === s;
//           return (
//             <Pressable
//               key={s}
//               onPress={() => setStatusFilter(s)}
//               style={[styles.chip, active && styles.chipActive]}
//             >
//               <Text style={[styles.chipText, active && { color: "#fff" }]}>
//                 {s === "all"
//                   ? "All Status"
//                   : s === "sent"
//                     ? "Awaiting Sig."
//                     : s[0].toUpperCase() + s.slice(1)}
//               </Text>
//             </Pressable>
//           );
//         })}
//       </ScrollView>

//       {error && (
//         <View style={styles.errorBanner}>
//           <AlertTriangle size={15} color={C.danger} />
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
//       <View style={styles.emptyIconWrap}>
//         <Inbox size={30} color={C.primary} />
//       </View>
//       <Text style={styles.emptyTitle}>
//         {docs.length === 0
//           ? "No documents sent yet"
//           : "No documents match your filters"}
//       </Text>
//       <Text style={styles.emptyDesc}>
//         {docs.length === 0
//           ? "Send a document to get started"
//           : "Try adjusting your search or status filter"}
//       </Text>
//       {docs.length === 0 && (
//         <Pressable onPress={() => setShowModal(true)} style={styles.emptyBtn}>
//           <PenLine size={14} color="#fff" />
//           <Text style={styles.emptyBtnText}>Send Your First Document</Text>
//         </Pressable>
//       )}
//     </View>
//   );

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       {/* Header — matches training.tsx exactly */}
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Documents</Text>
//           <Text style={styles.headerSubtitle}>
//             {loading ? "Loading…" : `${filtered.length} documents`}
//           </Text>
//         </View>
//       </View>

//       <FlatList
//         data={filtered}
//         keyExtractor={(item, i) => item.id ?? String(i)}
//         renderItem={({ item }) => <DocumentCard doc={item} />}
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

//       {loading && docs.length === 0 && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       )}

//       <SendDocumentModal
//         visible={showModal}
//         onClose={() => setShowModal(false)}
//         onSuccess={handleSuccess}
//       />

//       {successCount !== null && (
//         <DocumentSuccessToast
//           count={successCount}
//           onDone={() => setSuccessCount(null)}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: C.bg },

//   // Header — matches training.tsx exactly
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

//   // Hero banner — matches training.tsx
//   hero: {
//     borderRadius: 20,
//     padding: 18,
//     backgroundColor: C.navy,
//     marginBottom: 16,
//   },
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

//   listContent: { padding: 16, paddingBottom: 24 },

//   statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
//   statCard: { flex: 1, borderRadius: 16, padding: 13 },
//   statValue: { fontSize: 22, fontWeight: "800" },
//   statLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: C.textMuted,
//     marginTop: 3,
//   },

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
//   iconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },

//   chipRow: { flexDirection: "row", gap: 8, paddingBottom: 14 },
//   chip: {
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 20,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   chipActive: { backgroundColor: C.primary, borderColor: C.primary },
//   chipText: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textSecondary,
//     textTransform: "capitalize",
//   },

//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     borderWidth: 1,
//     borderColor: C.danger + "33",
//     marginBottom: 14,
//   },
//   errorBannerText: {
//     flex: 1,
//     fontSize: 13,
//     fontWeight: "600",
//     color: C.danger,
//   },

//   emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
//   emptyIconWrap: {
//     width: 64,
//     height: 64,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//   },
//   emptyTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: C.textPrimary,
//     textAlign: "center",
//   },
//   emptyDesc: { fontSize: 12, color: C.textMuted, textAlign: "center" },
//   emptyBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 16,
//     paddingVertical: 11,
//     borderRadius: 14,
//     backgroundColor: C.primary,
//     marginTop: 4,
//   },
//   emptyBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.bg + "cc",
//   },
// });


// src/app/admin/documents.tsx
// Document Management — sent documents list + 3-step send wizard.
// Header + hero banner styled to match training.tsx pattern exactly.

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
import { router } from "expo-router";
import {
  FileText,
  PenLine,
  Search,
  ChevronLeft,
  RefreshCw,
  AlertTriangle,
  Inbox,
  Plus,
  X,
} from "lucide-react-native";

import C from "../../styles/colors";
import { documentApi } from "../../api/service/documentApi";
import { Loader } from "../../hooks/loaderManager";

import DocumentCard from "../../components/admin/documents/DocumentCard";
import SendDocumentModal from "../../components/admin/documents/SendDocumentModal";
import DocumentSuccessToast from "../../components/admin/documents/DocumentSuccessToast";

const STATUS_PILLS = ["all", "sent", "signed", "pending", "rejected"] as const;

export default function AdminDocumentsScreen() {
  const insets = useSafeAreaInsets();

  const [docs, setDocs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_PILLS)[number]>("all");

  const [showModal, setShowModal] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    Loader.show();
    try {
      const res = await documentApi.getAll({ limit: 200 });
      const list = Array.isArray(res?.data) ? res.data : [];
      setDocs(list);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? e?.message ?? "Failed to load documents.",
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
    Loader.show();
    try {
      await load();
    } finally {
      setRefreshing(false);
      Loader.hide();
    }
  }, [load]);

  const handleSuccess = (count: number) => {
    setShowModal(false);
    setSuccessCount(count);
    load();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return docs.filter((d) => {
      const name = (d.template_name ?? "").toLowerCase();
      const emp = (d.employee_name ?? "").toLowerCase();
      const cat = (d.category ?? "").toLowerCase();
      return (
        (!q || name.includes(q) || emp.includes(q) || cat.includes(q)) &&
        (statusFilter === "all" || d.status?.toLowerCase() === statusFilter)
      );
    });
  }, [docs, search, statusFilter]);

  const pending = docs.filter((d) =>
    ["sent", "pending"].includes(d.status?.toLowerCase()),
  ).length;
  const signed = docs.filter(
    (d) => d.status?.toLowerCase() === "signed",
  ).length;

  const renderHeader = () => (
    <>
      {/* ── Hero Banner ── */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <FileText size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.heroTitle}>Document Management</Text>
            <Text style={styles.heroSubtitle}>
              Send • Track • Sign • Store
            </Text>
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          {
            label: "Total Sent",
            value: docs.length,
            color: C.primary,
            bg: C.primaryLight,
          },
          {
            label: "Awaiting Sign",
            value: pending,
            color: "#D97706",
            bg: "#FFF7ED",
          },
          { label: "Signed", value: signed, color: "#15803D", bg: "#F0FDF4" },
        ].map((s) => (
          <View
            key={s.label}
            style={[styles.statCard, { backgroundColor: s.bg }]}
          >
            <Text style={[styles.statValue, { color: s.color }]}>
              {s.value}
            </Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Search size={16} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search document or employee…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <X size={16} color={C.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => setShowModal(true)} style={styles.newBtn}>
          <Plus size={16} color="#fff" />
        </Pressable>
        <Pressable onPress={load} style={styles.iconBtn}>
          <RefreshCw size={16} color={C.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {STATUS_PILLS.map((s) => {
          const active = statusFilter === s;
          return (
            <Pressable
              key={s}
              onPress={() => setStatusFilter(s)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && { color: "#fff" }]}>
                {s === "all"
                  ? "All Status"
                  : s === "sent"
                    ? "Awaiting Sig."
                    : s[0].toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && (
        <View style={styles.errorBanner}>
          <AlertTriangle size={15} color={C.danger} />
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
      <View style={styles.emptyIconWrap}>
        <Inbox size={30} color={C.primary} />
      </View>
      <Text style={styles.emptyTitle}>
        {docs.length === 0
          ? "No documents sent yet"
          : "No documents match your filters"}
      </Text>
      <Text style={styles.emptyDesc}>
        {docs.length === 0
          ? "Send a document to get started"
          : "Try adjusting your search or status filter"}
      </Text>
      {docs.length === 0 && (
        <Pressable onPress={() => setShowModal(true)} style={styles.emptyBtn}>
          <PenLine size={14} color="#fff" />
          <Text style={styles.emptyBtnText}>Send Your First Document</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header — matches training.tsx exactly */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Documents</Text>
          <Text style={styles.headerSubtitle}>
            {filtered.length} documents
          </Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => item.id ?? String(i)}
        renderItem={({ item }) => <DocumentCard doc={item} />}
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

      <SendDocumentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />

      {successCount !== null && (
        <DocumentSuccessToast
          count={successCount}
          onDone={() => setSuccessCount(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header — matches training.tsx exactly
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

  // Hero banner — matches training.tsx
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
    marginBottom: 16,
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

  listContent: { padding: 16, paddingBottom: 24 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 13 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.textMuted,
    marginTop: 3,
  },

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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },

  chipRow: { flexDirection: "row", gap: 8, paddingBottom: 14 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "capitalize",
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
    textAlign: "center",
  },
  emptyDesc: { fontSize: 12, color: C.textMuted, textAlign: "center" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: C.primary,
    marginTop: 4,
  },
  emptyBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});