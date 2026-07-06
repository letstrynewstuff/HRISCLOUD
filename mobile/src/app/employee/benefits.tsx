

// // src/app/employee/benefits.tsx
// // Employee Benefits screen — connected to backend API.
// // Mirrors the web BenefitsPage exactly.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   RefreshControl,
//   TextInput,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   ArrowLeft,
//   Heart,
//   Search,
//   Award,
//   RefreshCw,
//   AlertTriangle,
//   Loader2,
//   ChevronDown,
//   Phone,
//   FileText,
// } from "lucide-react-native";
// import Toast from "react-native-toast-message";

// import C from "../../styles/colors";
// import Card from "../../components/ui/Card";
// import FeaturedBenefitCard from "../../components/benefits/FeaturedBenefitCard";
// import BenefitCard from "../../components/benefits/BenefitCard";

// import { benefitsApi } from "../../api/service/benefitsApi";
// import { authApi } from "../../api/service/authApi";

// export default function BenefitsScreen() {
//   const insets = useSafeAreaInsets();

//   // ── Data state (exact same as web) ────────────────────────
//   const [user, setUser] = useState<any>(null);
//   const [employee, setEmployee] = useState<any>(null);
//   const [benefits, setBenefits] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // ── UI state ────────────────────────────────────────────────
//   const [searchQuery, setSearchQuery] = useState("");
//   const [expandedHowTo, setExpandedHowTo] = useState(false);

//   // ── Data fetch (exact same pattern as web) ────────────────
//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // 1. Fetch current user from /auth/me
//       const me = await authApi.getMe();
//       setUser(me);

//       // 2. Extract employee ID (same as web)
//       const empId = me.employee_id ?? me.employeeId;
//       if (!empId) {
//         throw new Error("No employee profile linked to this account.");
//       }

//       setEmployee({
//         id: empId,
//         name: `${me.firstName ?? me.first_name} ${me.lastName ?? me.last_name}`,
//         initials: `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
//         role: me.role,
//         department: me.company?.name ?? "",
//         email: me.email,
//       });

//       // 3. Fetch this employee's benefits (same as web)
//       const benRes = await benefitsApi.getForEmployee(empId);
//       setBenefits(benRes.data ?? []);
//     } catch (err: any) {
//       console.log("Benefits error:", err?.response?.status, err?.response?.config?.url);
//       setError(
//         err?.response?.data?.message ?? err.message ?? "Failed to load benefits.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   // ── Derived (same as web) ───────────────────────────────────
//   const insuranceBenefit = benefits.find(
//     (b) =>
//       b.is_insurance ||
//       b.type?.toLowerCase() === "insurance" ||
//       b.type?.toLowerCase() === "health",
//   );

//   const otherBenefits = benefits.filter((b) => b.id !== insuranceBenefit?.id);

//   const filtered = benefits.filter((b) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       !q ||
//       b.benefit_name?.toLowerCase().includes(q) ||
//       b.type?.toLowerCase().includes(q) ||
//       b.provider?.toLowerCase().includes(q)
//     );
//   });

//   // ── Handlers ────────────────────────────────────────────────
//   async function handleRefresh() {
//     setRefreshing(true);
//     await load();
//     setRefreshing(false);
//   }

//   function handleContactProvider() {
//     if (insuranceBenefit?.provider) {
//       Toast.show({
//         type: "info",
//         text1: "Contact Provider",
//         text2: `Reach out to ${insuranceBenefit.provider} for support.`,
//       });
//     }
//   }

//   function handleViewDetails() {
//     Toast.show({
//       type: "info",
//       text1: "Full details",
//       text2: "Detailed benefit documentation coming soon.",
//     });
//   }

//   // ── Loading state ───────────────────────────────────────────
//   if (loading) {
//     return (
//       <View style={[styles.screen, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
//         <RefreshCw size={28} color={C.primary} style={{ transform: [{ rotate: "45deg" }] }} />
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
//           <ArrowLeft size={18} color={C.textSecondary} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Benefits</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Hero */}
//         <View style={styles.hero}>
//           <View style={styles.heroTopRow}>
//             <View style={styles.heroIconWrap}>
//               <Heart size={20} color="#fff" />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.heroTitle}>Your Benefits</Text>
//               <Text style={styles.heroSubtitle}>
//                 {employee?.name ?? "Employee"} · {benefits.length} active benefit{benefits.length !== 1 ? "s" : ""}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Error state */}
//         {error && (
//           <View style={styles.errorBanner}>
//             <AlertTriangle size={16} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}

//         {/* Insurance card */}
//         {!loading && insuranceBenefit && (
//           <FeaturedBenefitCard
//             benefit={insuranceBenefit}
//             onContactProvider={handleContactProvider}
//             onViewDetails={handleViewDetails}
//           />
//         )}

//         {/* All enrolled benefits */}
//         <Card padded style={styles.allCard}>
//           <View style={styles.allHeaderRow}>
//             <Award size={16} color={C.primary} />
//             <Text style={styles.allHeaderTitle}>All Enrolled Benefits</Text>
//             <View style={styles.allHeaderCount}>
//               <Text style={styles.allHeaderCountText}>{benefits.length}</Text>
//             </View>
//           </View>

//           <View style={styles.searchRow}>
//             <Search size={13} color={C.textMuted} />
//             <TextInput
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               placeholder="Search benefits..."
//               placeholderTextColor={C.textMuted}
//               style={styles.searchInput}
//             />
//           </View>

//           {filtered.length === 0 ? (
//             <View style={styles.emptyState}>
//               <View style={styles.emptyIconWrap}>
//                 <Heart size={22} color={C.textMuted} />
//               </View>
//               <Text style={styles.emptyTitle}>
//                 {searchQuery
//                   ? "No benefits match your search"
//                   : "No benefits enrolled yet"}
//               </Text>
//               <Text style={styles.emptySubtitle}>
//                 Contact HR to enrol in company benefit plans
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.grid}>
//               {filtered.map((b) => (
//                 <BenefitCard key={b.id} benefit={b} />
//               ))}
//             </View>
//           )}
//         </Card>

//         <View style={{ height: 24 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: C.bg,
//   },
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
//   scrollContent: {
//     paddingHorizontal: 16,
//     gap: 14,
//     paddingBottom: 12,
//   },
//   hero: {
//     borderRadius: 20,
//     padding: 18,
//     backgroundColor: C.navy,
//   },
//   heroTopRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   heroIconWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   heroTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   heroSubtitle: {
//     fontSize: 12,
//     color: "rgba(255,255,255,0.65)",
//     marginTop: 2,
//   },
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: 14,
//     padding: 14,
//     backgroundColor: C.dangerLight,
//   },
//   errorText: {
//     fontSize: 13,
//     color: C.danger,
//     flex: 1,
//   },
//   allCard: {
//     gap: 12,
//   },
//   allHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 7,
//   },
//   allHeaderTitle: {
//     fontSize: 14.5,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   allHeaderCount: {
//     marginLeft: "auto",
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 999,
//     backgroundColor: C.primaryLight,
//   },
//   allHeaderCountText: {
//     fontSize: 10.5,
//     fontWeight: "800",
//     color: C.primary,
//   },
//   searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: C.surface,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     borderRadius: 14,
//     paddingHorizontal: 13,
//     paddingVertical: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 13,
//     color: C.textPrimary,
//     padding: 0,
//   },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//     justifyContent: "space-between",
//   },
//   emptyState: {
//     alignItems: "center",
//     gap: 6,
//     paddingVertical: 28,
//   },
//   emptyIconWrap: {
//     width: 50,
//     height: 50,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     marginBottom: 4,
//   },
//   emptyTitle: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.textSecondary,
//     textAlign: "center",
//   },
//   emptySubtitle: {
//     fontSize: 11,
//     color: C.textMuted,
//     textAlign: "center",
//   },
// });


// src/app/employee/benefits.tsx
// Employee Benefits screen — connected to backend API.
// Mirrors the web BenefitsPage exactly.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Heart,
  Search,
  Award,
  AlertTriangle,
  ChevronDown,
  Phone,
  FileText,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import C from "../../styles/colors";
import Card from "../../components/ui/Card";
import FeaturedBenefitCard from "../../components/benefits/FeaturedBenefitCard";
import BenefitCard from "../../components/benefits/BenefitCard";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";

import { benefitsApi } from "../../api/service/benefitsApi";
import { authApi } from "../../api/service/authApi";

export default function BenefitsScreen() {
  const insets = useSafeAreaInsets();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  // ── Data state (exact same as web) ────────────────────────
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── UI state ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedHowTo, setExpandedHowTo] = useState(false);

  // ── Data fetch (exact same pattern as web) ────────────────
  const load = useCallback(async () => {
    setError(null);
    try {
      // 1. Fetch current user from /auth/me
      const me = await authApi.getMe();
      setUser(me);

      // 2. Extract employee ID (same as web)
      const empId = me.employee_id ?? me.employeeId;
      if (!empId) {
        throw new Error("No employee profile linked to this account.");
      }

      setEmployee({
        id: empId,
        name: `${me.firstName ?? me.first_name} ${me.lastName ?? me.last_name}`,
        initials: `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
        role: me.role,
        department: me.company?.name ?? "",
        email: me.email,
      });

      // 3. Fetch this employee's benefits (same as web)
      const benRes = await benefitsApi.getForEmployee(empId);
      setBenefits(benRes.data ?? []);
    } catch (err: any) {
      console.log("Benefits error:", err?.response?.status, err?.response?.config?.url);
      setError(
        err?.response?.data?.message ?? err.message ?? "Failed to load benefits.",
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      loaderRef.current?.show();
      try {
        await load();
      } finally {
        loaderRef.current?.hide();
      }
    })();
  }, [load]);

  // ── Derived (same as web) ───────────────────────────────────
  const insuranceBenefit = benefits.find(
    (b) =>
      b.is_insurance ||
      b.type?.toLowerCase() === "insurance" ||
      b.type?.toLowerCase() === "health",
  );

  const otherBenefits = benefits.filter((b) => b.id !== insuranceBenefit?.id);

  const filtered = benefits.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      b.benefit_name?.toLowerCase().includes(q) ||
      b.type?.toLowerCase().includes(q) ||
      b.provider?.toLowerCase().includes(q)
    );
  });

  // ── Handlers ────────────────────────────────────────────────
  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function handleContactProvider() {
    if (insuranceBenefit?.provider) {
      Toast.show({
        type: "info",
        text1: "Contact Provider",
        text2: `Reach out to ${insuranceBenefit.provider} for support.`,
      });
    }
  }

  function handleViewDetails() {
    Toast.show({
      type: "info",
      text1: "Full details",
      text2: "Detailed benefit documentation coming soon.",
    });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <ArrowLeft size={18} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Benefits</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Heart size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Your Benefits</Text>
              <Text style={styles.heroSubtitle}>
                {employee?.name ?? "Employee"} · {benefits.length} active benefit{benefits.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Error state */}
        {error && (
          <View style={styles.errorBanner}>
            <AlertTriangle size={16} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Insurance card */}
        {insuranceBenefit && (
          <FeaturedBenefitCard
            benefit={insuranceBenefit}
            onContactProvider={handleContactProvider}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* All enrolled benefits */}
        <Card padded style={styles.allCard}>
          <View style={styles.allHeaderRow}>
            <Award size={16} color={C.primary} />
            <Text style={styles.allHeaderTitle}>All Enrolled Benefits</Text>
            <View style={styles.allHeaderCount}>
              <Text style={styles.allHeaderCountText}>{benefits.length}</Text>
            </View>
          </View>

          <View style={styles.searchRow}>
            <Search size={13} color={C.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search benefits..."
              placeholderTextColor={C.textMuted}
              style={styles.searchInput}
            />
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Heart size={22} color={C.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? "No benefits match your search"
                  : "No benefits enrolled yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                Contact HR to enrol in company benefit plans
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((b) => (
                <BenefitCard key={b.id} benefit={b} />
              ))}
            </View>
          )}
        </Card>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Global loader — the only loader in this screen */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading benefits..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
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
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 12,
  },
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    padding: 14,
    backgroundColor: C.dangerLight,
  },
  errorText: {
    fontSize: 13,
    color: C.danger,
    flex: 1,
  },
  allCard: {
    gap: 12,
  },
  allHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  allHeaderTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  allHeaderCount: {
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: C.primaryLight,
  },
  allHeaderCountText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: C.primary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.textPrimary,
    padding: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  emptyState: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 28,
  },
  emptyIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textSecondary,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 11,
    color: C.textMuted,
    textAlign: "center",
  },
});