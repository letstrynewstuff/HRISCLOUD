

// // src/app/employee/documents.tsx
// // Employee Documents screen — fully wired to the production API.
// // Documents are always sent by HR/Admin — employees only read and sign.
// // Zero mock data.

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
//   FileText,
//   Search,
//   Pen,
//   ChevronRight,
//   AlertCircle,
//   RefreshCw,
// } from "lucide-react-native";
// import Toast from "react-native-toast-message";

// import C from "../../styles/colors";
// import DocumentListItem from "../../components/documents/DocumentListItem";
// import DocumentPreviewModal from "../../components/documents/DocumentPreviewModal";
// import SignDocumentModal from "../../components/documents/SignDocumentModal";
// import { documentApi } from "../../api/service/documentApi";
// import { EmployeeDocument } from "../../types/document";

// type TabKey = "all" | "pending" | "signed";

// export default function DocumentsScreen() {
//   const insets = useSafeAreaInsets();

//   const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [activeTab, setActiveTab] = useState<TabKey>("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);
//   const [signDoc, setSignDoc] = useState<EmployeeDocument | null>(null);

//   const loadDocuments = useCallback(async () => {
//     setError(null);
//     try {
//       const res = await documentApi.getMyDocuments();
//       // API returns { data: [...] } or array directly — handle both
//       setDocuments(res?.data ?? res ?? []);
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           (err?.isNetworkError || err?.isTimeout
//             ? err.message
//             : "Failed to load documents. Please try again."),
//       );
//     }
//   }, []);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       await loadDocuments();
//       setLoading(false);
//     })();
//   }, [loadDocuments]);

//   const needSign = useMemo(
//     () => documents.filter((d) => d.status === "sent"),
//     [documents],
//   );
//   const signed = useMemo(
//     () => documents.filter((d) => d.status === "signed"),
//     [documents],
//   );

//   const TABS: { id: TabKey; label: string; count: number }[] = [
//     { id: "all", label: "All Documents", count: documents.length },
//     { id: "pending", label: "Needs Action", count: needSign.length },
//     { id: "signed", label: "Signed", count: signed.length },
//   ];

//   const filtered = useMemo(() => {
//     const q = searchQuery.toLowerCase();
//     return documents.filter((d) => {
//       const name = (d.document_name ?? d.template_name ?? "").toLowerCase();
//       const cat = (d.category ?? "").toLowerCase();
//       const matchSearch = !q || name.includes(q) || cat.includes(q);
//       const matchTab =
//         activeTab === "all"
//           ? true
//           : activeTab === "pending"
//             ? d.status === "sent"
//             : d.status === "signed";
//       return matchSearch && matchTab;
//     });
//   }, [documents, searchQuery, activeTab]);

//   async function handleRefresh() {
//     setRefreshing(true);
//     await loadDocuments();
//     setRefreshing(false);
//   }

//   // Called by SignDocumentModal after successful API sign — update local state
//   // so the row immediately reflects "signed" without a full reload.
//   function handleSigned(id: string) {
//     setDocuments((prev) =>
//       prev.map((d) =>
//         d.id === id
//           ? { ...d, status: "signed", signed_at: new Date().toISOString() }
//           : d,
//       ),
//     );
//     setSignDoc(null);
//     Toast.show({
//       type: "success",
//       text1: "Document signed",
//       text2: "HR has been notified.",
//     });
//   }

//   if (loading) {
//     return (
//       <View
//         style={[
//           styles.screen,
//           {
//             paddingTop: insets.top,
//             alignItems: "center",
//             justifyContent: "center",
//           },
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
//         <Text style={styles.headerTitle}>Documents</Text>
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
//               <FileText size={20} color="#fff" />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.heroTitle}>My Documents</Text>
//               <Text style={styles.heroSubtitle}>
//                 {documents.length} document{documents.length !== 1 ? "s" : ""}
//                 {needSign.length > 0
//                   ? ` · ${needSign.length} need${needSign.length === 1 ? "s" : ""} your signature`
//                   : documents.length > 0
//                     ? " · All up to date ✓"
//                     : ""}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Error banner */}
//         {error ? (
//           <View style={styles.errorBanner}>
//             <AlertCircle size={15} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//             <Pressable onPress={loadDocuments} hitSlop={8}>
//               <RefreshCw size={14} color={C.danger} />
//             </Pressable>
//           </View>
//         ) : null}

//         {/* Search */}
//         <View style={styles.searchRow}>
//           <Search size={14} color={C.textMuted} />
//           <TextInput
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             placeholder="Search documents…"
//             placeholderTextColor={C.textMuted}
//             style={styles.searchInput}
//           />
//           {searchQuery.length > 0 && (
//             <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
//               <Text style={styles.clearBtn}>✕</Text>
//             </Pressable>
//           )}
//         </View>

//         {/* Needs signature alert */}
//         {needSign.length > 0 && (
//           <Pressable
//             onPress={() => setActiveTab("pending")}
//             style={({ pressed }) => [
//               styles.alertCard,
//               pressed && { opacity: 0.9 },
//             ]}
//           >
//             <View style={styles.alertIconWrap}>
//               <Pen size={15} color="#fff" />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.alertTitle}>
//                 {needSign.length} document{needSign.length === 1 ? "" : "s"}{" "}
//                 awaiting your signature
//               </Text>
//               <Text style={styles.alertSubtitle}>
//                 Tap here to review and sign
//               </Text>
//             </View>
//             <ChevronRight size={16} color="#F59E0B" />
//           </Pressable>
//         )}

//         {/* Tabs */}
//         <View style={styles.tabsRow}>
//           {TABS.map((t) => {
//             const active = activeTab === t.id;
//             return (
//               <Pressable
//                 key={t.id}
//                 onPress={() => setActiveTab(t.id)}
//                 style={[styles.tabBtn, active && styles.tabBtnActive]}
//               >
//                 <Text
//                   style={[
//                     styles.tabLabel,
//                     { color: active ? "#fff" : C.textSecondary },
//                   ]}
//                   numberOfLines={1}
//                 >
//                   {t.label}
//                 </Text>
//                 {t.count > 0 && (
//                   <View
//                     style={[
//                       styles.tabCount,
//                       {
//                         backgroundColor: active
//                           ? "rgba(255,255,255,0.25)"
//                           : C.primaryLight,
//                       },
//                     ]}
//                   >
//                     <Text
//                       style={[
//                         styles.tabCountLabel,
//                         { color: active ? "#fff" : C.primary },
//                       ]}
//                     >
//                       {t.count}
//                     </Text>
//                   </View>
//                 )}
//               </Pressable>
//             );
//           })}
//         </View>

//         {/* Document list */}
//         {filtered.length === 0 ? (
//           <View style={styles.emptyState}>
//             <View style={styles.emptyIconWrap}>
//               <FileText size={22} color={C.textMuted} />
//             </View>
//             <Text style={styles.emptyTitle}>
//               {searchQuery
//                 ? "No documents match your search"
//                 : activeTab === "pending"
//                   ? "No documents awaiting signature"
//                   : activeTab === "signed"
//                     ? "No signed documents yet"
//                     : "No documents sent to you yet"}
//             </Text>
//           </View>
//         ) : (
//           <View style={styles.list}>
//             {filtered.map((doc) => (
//               <DocumentListItem
//                 key={doc.id}
//                 doc={doc}
//                 onPress={setPreviewDoc}
//                 onSign={setSignDoc}
//               />
//             ))}
//           </View>
//         )}

//         <View style={{ height: 24 }} />
//       </ScrollView>

//       <DocumentPreviewModal
//         doc={previewDoc}
//         onClose={() => setPreviewDoc(null)}
//         onSign={(doc) => {
//           setPreviewDoc(null);
//           setSignDoc(doc);
//         }}
//       />

//       <SignDocumentModal
//         doc={signDoc}
//         onClose={() => setSignDoc(null)}
//         onSigned={handleSigned}
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
//   headerTitle: {
//     flex: 1,
//     fontSize: 17,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   scrollContent: { paddingHorizontal: 16, gap: 14, paddingBottom: 12 },
//   hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy },
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
//   heroSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 },
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
//   alertCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     backgroundColor: "#FFF7ED",
//     borderWidth: 1,
//     borderColor: "#FCD34D55",
//     borderRadius: 16,
//     padding: 13,
//   },
//   alertIconWrap: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#F59E0B",
//   },
//   alertTitle: { fontSize: 12.5, fontWeight: "700", color: C.textPrimary },
//   alertSubtitle: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
//   tabsRow: {
//     flexDirection: "row",
//     gap: 4,
//     padding: 4,
//     borderRadius: 14,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   tabBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//     paddingVertical: 9,
//     paddingHorizontal: 4,
//     borderRadius: 10,
//   },
//   tabBtnActive: { backgroundColor: C.primary },
//   tabLabel: { fontSize: 11, fontWeight: "700", flexShrink: 1 },
//   tabCount: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999 },
//   tabCountLabel: { fontSize: 9.5, fontWeight: "800" },
//   list: { gap: 8 },
//   emptyState: { alignItems: "center", gap: 8, paddingVertical: 36 },
//   emptyIconWrap: {
//     width: 50,
//     height: 50,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//   },
//   emptyTitle: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.textSecondary,
//     textAlign: "center",
//     paddingHorizontal: 24,
//   },
// });



// src/app/employee/documents.tsx
// Employee Documents screen — fully wired to the production API.
// Documents are always sent by HR/Admin — employees only read and sign.
// Zero mock data.

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
  FileText,
  Search,
  Pen,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import C from "../../styles/colors";
import DocumentListItem from "../../components/documents/DocumentListItem";
import DocumentPreviewModal from "../../components/documents/DocumentPreviewModal";
import SignDocumentModal from "../../components/documents/SignDocumentModal";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";
import { documentApi } from "../../api/service/documentApi";
import { EmployeeDocument } from "../../types/document";

type TabKey = "all" | "pending" | "signed";

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);
  const [signDoc, setSignDoc] = useState<EmployeeDocument | null>(null);

  const loadDocuments = useCallback(async () => {
    setError(null);
    try {
      const res = await documentApi.getMyDocuments();
      // API returns { data: [...] } or array directly — handle both
      setDocuments(res?.data ?? res ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          (err?.isNetworkError || err?.isTimeout
            ? err.message
            : "Failed to load documents. Please try again."),
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      loaderRef.current?.show();
      try {
        await loadDocuments();
      } finally {
        loaderRef.current?.hide();
      }
    })();
  }, [loadDocuments]);

  const needSign = useMemo(
    () => documents.filter((d) => d.status === "sent"),
    [documents],
  );
  const signed = useMemo(
    () => documents.filter((d) => d.status === "signed"),
    [documents],
  );

  const TABS: { id: TabKey; label: string; count: number }[] = [
    { id: "all", label: "All Documents", count: documents.length },
    { id: "pending", label: "Needs Action", count: needSign.length },
    { id: "signed", label: "Signed", count: signed.length },
  ];

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return documents.filter((d) => {
      const name = (d.document_name ?? d.template_name ?? "").toLowerCase();
      const cat = (d.category ?? "").toLowerCase();
      const matchSearch = !q || name.includes(q) || cat.includes(q);
      const matchTab =
        activeTab === "all"
          ? true
          : activeTab === "pending"
            ? d.status === "sent"
            : d.status === "signed";
      return matchSearch && matchTab;
    });
  }, [documents, searchQuery, activeTab]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  }

  // Called by SignDocumentModal after successful API sign — update local state
  // so the row immediately reflects "signed" without a full reload.
  function handleSigned(id: string) {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "signed", signed_at: new Date().toISOString() }
          : d,
      ),
    );
    setSignDoc(null);
    Toast.show({
      type: "success",
      text1: "Document signed",
      text2: "HR has been notified.",
    });
  }

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
        <Text style={styles.headerTitle}>Documents</Text>
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
              <FileText size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>My Documents</Text>
              <Text style={styles.heroSubtitle}>
                {documents.length} document{documents.length !== 1 ? "s" : ""}
                {needSign.length > 0
                  ? ` · ${needSign.length} need${needSign.length === 1 ? "s" : ""} your signature`
                  : documents.length > 0
                    ? " · All up to date ✓"
                    : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Error banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadDocuments} hitSlop={8}>
              <RefreshCw size={14} color={C.danger} />
            </Pressable>
          </View>
        ) : null}

        {/* Search */}
        <View style={styles.searchRow}>
          <Search size={14} color={C.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search documents…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Needs signature alert */}
        {needSign.length > 0 && (
          <Pressable
            onPress={() => setActiveTab("pending")}
            style={({ pressed }) => [
              styles.alertCard,
              pressed && { opacity: 0.9 },
            ]}
          >
            <View style={styles.alertIconWrap}>
              <Pen size={15} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {needSign.length} document{needSign.length === 1 ? "" : "s"}{" "}
                awaiting your signature
              </Text>
              <Text style={styles.alertSubtitle}>
                Tap here to review and sign
              </Text>
            </View>
            <ChevronRight size={16} color="#F59E0B" />
          </Pressable>
        )}

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? "#fff" : C.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {t.label}
                </Text>
                {t.count > 0 && (
                  <View
                    style={[
                      styles.tabCount,
                      {
                        backgroundColor: active
                          ? "rgba(255,255,255,0.25)"
                          : C.primaryLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabCountLabel,
                        { color: active ? "#fff" : C.primary },
                      ]}
                    >
                      {t.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Document list */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <FileText size={22} color={C.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? "No documents match your search"
                : activeTab === "pending"
                  ? "No documents awaiting signature"
                  : activeTab === "signed"
                    ? "No signed documents yet"
                    : "No documents sent to you yet"}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((doc) => (
              <DocumentListItem
                key={doc.id}
                doc={doc}
                onPress={setPreviewDoc}
                onSign={setSignDoc}
              />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <DocumentPreviewModal
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onSign={(doc) => {
          setPreviewDoc(null);
          setSignDoc(doc);
        }}
      />

      <SignDocumentModal
        doc={signDoc}
        onClose={() => setSignDoc(null)}
        onSigned={handleSigned}
      />

      {/* Global loader — the only loader in this screen */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading documents..."
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
  hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy },
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
  heroSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 },
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
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FCD34D55",
    borderRadius: 16,
    padding: 13,
  },
  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F59E0B",
  },
  alertTitle: { fontSize: 12.5, fontWeight: "700", color: C.textPrimary },
  alertSubtitle: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
  tabsRow: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: C.primary },
  tabLabel: { fontSize: 11, fontWeight: "700", flexShrink: 1 },
  tabCount: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999 },
  tabCountLabel: { fontSize: 9.5, fontWeight: "800" },
  list: { gap: 8 },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 36 },
  emptyIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textSecondary,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});