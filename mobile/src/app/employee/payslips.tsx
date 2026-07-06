


// // src/app/employee/payslips.tsx
// // Employee Payslips screen — connected to backend API.
// // Mirrors the web PayslipsPage: hero with YTD stats + year selector,
// // Payslips / Tax & Deductions tabs, list, and a detail modal.
// // Download is stubbed (toast) since PDF generation is a web-only concern.

// import { useMemo, useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   RefreshControl,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import { ArrowLeft, Wallet, Eye, EyeOff, FileText } from "lucide-react-native";
// import Toast from "react-native-toast-message";

// import C from "../../styles/colors";
// import Card from "../../components/ui/Card";
// import SectionHeader from "../../components/ui/SectionHeader";
// import PayslipListItem from "../../components/payslip/PayslipListItem";
// import PayslipDetailModal from "../../components/payslip/PayslipDetailModal";

// import { getMyPayslip } from "../../api/service/payrollApi";
// import { authApi } from "../../api/service/authApi";

// /* ─── Helpers ─── */
// const fmt = (n?: number) =>
//   new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     maximumFractionDigits: 0,
//   }).format(n ?? 0);

// const fmtShort = (n?: number) => {
//   if (!n) return "₦0";
//   if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
//   if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
//   return `₦${n}`;
// };

// const mask = () => "₦ ••••••";

// const MONTHS = [
//   { label: "Jan", value: 1 },
//   { label: "Feb", value: 2 },
//   { label: "Mar", value: 3 },
//   { label: "Apr", value: 4 },
//   { label: "May", value: 5 },
//   { label: "Jun", value: 6 },
//   { label: "Jul", value: 7 },
//   { label: "Aug", value: 8 },
//   { label: "Sep", value: 9 },
//   { label: "Oct", value: 10 },
//   { label: "Nov", value: 11 },
//   { label: "Dec", value: 12 },
// ];

// const MONTH_NAMES = [
//   "",
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

// const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
//   draft:      { label: "Draft",      bg: "#F1F5F9", color: "#64748B" },
//   processing: { label: "Processing", bg: "#FEF3C7", color: "#F59E0B" },
//   approved:   { label: "Approved",   bg: "#DBEAFE", color: "#2563EB" },
//   paid:       { label: "Paid",       bg: "#D1FAE5", color: "#10B981" },
// };

// type TabKey = "payslips" | "tax";

// const TABS: { id: TabKey; label: string }[] = [
//   { id: "payslips", label: "Payslips" },
//   { id: "tax", label: "Tax & Deductions" },
// ];

// const YEARS = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

// /* ─── Payslip type (matches API response) ─── */
// type Payslip = {
//   id: string;
//   month: number;
//   year: number;
//   employeeName?: string;
//   employeeCode?: string;
//   departmentName?: string;
//   jobRoleName?: string;
//   basicSalary?: number;
//   housingAllowance?: number;
//   transportAllowance?: number;
//   utilityAllowance?: number;
//   mealAllowance?: number;
//   overtime?: number;
//   bonus?: number;
//   grossSalary?: number;
//   payeTax?: number;
//   pensionEmployee?: number;
//   nhfDeduction?: number;
//   totalDeductions?: number;
//   netSalary?: number;
//   runStatus?: string;
//   status?: string;
//   paymentDate?: string;
//   paymentMethod?: string;
//   accountNumber?: string;
//   bankName?: string;
//   isManuallyEdited?: boolean;
// };

// export default function PayslipsScreen() {
//   const insets = useSafeAreaInsets();

//   const [employee, setEmployee] = useState<any>(null);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [payslips, setPayslips] = useState<Payslip[]>([]);
//   const [activeTab, setActiveTab] = useState<TabKey>("payslips");
//   const [masked, setMasked] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

//   /* ─── Load employee profile ─── */
//   useEffect(() => {
//     authApi
//       .getMe()
//       .then((me) => setEmployee(me))
//       .catch(() => setError("Failed to load profile."));
//   }, []);

//   /* ─── Load payslips for selected year ─── */
//   const loadPayslips = useCallback(async () => {
//     if (!employee) return;
//     setLoading(true);
//     setError(null);

//     const results: Payslip[] = [];
//     const now = new Date();
//     const currentYear = now.getFullYear();

//     const validMonths = selectedYear > currentYear ? [] : MONTHS;

//     await Promise.allSettled(
//       validMonths.map(async (m) => {
//         try {
//           const res = await getMyPayslip(m.value, selectedYear);
//           // API returns { data: payslip } or the payslip directly
//           const payslip = res?.data ?? res;
//           if (payslip) results.push(payslip);
//         } catch {
//           // 404 = no payslip for this month yet, skip silently
//         }
//       }),
//     );

//     setPayslips(results.sort((a, b) => b.month - a.month));
//     setLoading(false);
//   }, [employee, selectedYear]);

//   useEffect(() => {
//     loadPayslips();
//   }, [loadPayslips]);

//   function handleSelectYear(y: number) {
//     setSelectedYear(y);
//   }

//   function handleRefresh() {
//     setRefreshing(true);
//     loadPayslips().finally(() => setRefreshing(false));
//   }

//   function handleDownload(p: Payslip) {
//     Toast.show({
//       type: "info",
//       text1: "Download",
//       text2: `${MONTH_NAMES[p.month]} ${p.year} payslip — coming soon`,
//     });
//   }

//   const ytdGross = useMemo(
//     () => payslips.reduce((s, p) => s + (p.grossSalary ?? 0), 0),
//     [payslips],
//   );
//   const ytdDeductions = useMemo(
//     () => payslips.reduce((s, p) => s + (p.totalDeductions ?? 0), 0),
//     [payslips],
//   );
//   const ytdNet = useMemo(
//     () => payslips.reduce((s, p) => s + (p.netSalary ?? 0), 0),
//     [payslips],
//   );

//   const disp = (n?: number) => (masked ? mask() : fmt(n));
//   const dispShort = (n?: number) => (masked ? "••••" : fmtShort(n));

//   const statusBadge = (status?: string) =>
//     STATUS_CFG[status ?? ""] ?? { label: status ?? "—", bg: C.surfaceAlt, color: C.textMuted };

//   if (loading && !refreshing && payslips.length === 0) {
//     return (
//       <View style={[styles.screen, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
//         <Text style={{ color: C.textMuted }}>Loading payslips…</Text>
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
//         <Text style={styles.headerTitle}>Payslips</Text>
//         <Pressable
//           onPress={() => setMasked((p) => !p)}
//           hitSlop={8}
//           style={styles.maskBtn}
//         >
//           {masked ? (
//             <Eye size={17} color={C.textSecondary} />
//           ) : (
//             <EyeOff size={17} color={C.textSecondary} />
//           )}
//         </Pressable>
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
//               <Wallet size={20} color="#fff" />
//             </View>
//             <Text style={styles.heroTitle}>My Payslips</Text>
//           </View>

//           {/* Year selector */}
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={styles.yearRow}
//           >
//             <View style={{ flexDirection: "row", gap: 8 }}>
//               {YEARS.map((y) => {
//                 const active = selectedYear === y;
//                 return (
//                   <Pressable
//                     key={y}
//                     onPress={() => handleSelectYear(y)}
//                     style={[styles.yearChip, active && styles.yearChipActive]}
//                   >
//                     <Text
//                       style={[
//                         styles.yearChipLabel,
//                         active && styles.yearChipLabelActive,
//                       ]}
//                     >
//                       {y}
//                     </Text>
//                   </Pressable>
//                 );
//               })}
//             </View>
//           </ScrollView>

//           <View style={styles.heroStatsRow}>
//             {[
//               { label: "YTD Gross", value: dispShort(ytdGross) },
//               { label: "YTD Deductions", value: dispShort(ytdDeductions) },
//               { label: "YTD Net", value: dispShort(ytdNet) },
//             ].map((s) => (
//               <View key={s.label} style={styles.heroStatTile}>
//                 <Text style={styles.heroStatValue}>{s.value}</Text>
//                 <Text style={styles.heroStatLabel}>{s.label}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

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
//                 >
//                   {t.label}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>

//         {/* Payslips tab */}
//         {activeTab === "payslips" &&
//           (payslips.length === 0 ? (
//             <View style={styles.emptyState}>
//               <View style={styles.emptyIconWrap}>
//                 <FileText size={22} color={C.textMuted} />
//               </View>
//               <Text style={styles.emptyTitle}>
//                 No payslips found for {selectedYear}
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.list}>
//               {payslips.map((p) => (
//                 <PayslipListItem
//                   key={p.id ?? `${p.year}-${p.month}`}
//                   payslip={p}
//                   masked={masked}
//                   onPress={setSelectedPayslip}
//                 />
//               ))}
//             </View>
//           ))}

//         {/* Tax & Deductions tab */}
//         {activeTab === "tax" && (
//           <Card padded style={styles.taxCard}>
//             <SectionHeader
//               title={`Tax & Statutory — ${selectedYear} YTD`}
//               showChevron={false}
//             />
//             {payslips.length === 0 ? (
//               <Text style={styles.emptyInline}>
//                 No data for {selectedYear}.
//               </Text>
//             ) : (
//               <View style={styles.taxList}>
//                 {payslips.map((p) => (
//                   <View key={p.id ?? `${p.year}-${p.month}`} style={styles.taxRow}>
//                     <Text style={styles.taxMonth}>{MONTH_NAMES[p.month]}</Text>
//                     <View style={styles.taxValues}>
//                       <View style={styles.taxValueCell}>
//                         <Text style={styles.taxValueLabel}>PAYE</Text>
//                         <Text style={[styles.taxValue, { color: C.danger }]}>
//                           {masked ? "••••" : fmtShort(p.payeTax)}
//                         </Text>
//                       </View>
//                       <View style={styles.taxValueCell}>
//                         <Text style={styles.taxValueLabel}>Pension</Text>
//                         <Text style={[styles.taxValue, { color: C.warning }]}>
//                           {masked ? "••••" : fmtShort(p.pensionEmployee)}
//                         </Text>
//                       </View>
//                       <View style={styles.taxValueCell}>
//                         <Text style={styles.taxValueLabel}>NHF</Text>
//                         <Text style={[styles.taxValue, { color: "#8B5CF6" }]}>
//                           {masked ? "••••" : fmtShort(p.nhfDeduction)}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 ))}

//                 <View style={[styles.taxRow, styles.taxTotalRow]}>
//                   <Text style={[styles.taxMonth, { fontWeight: "800" }]}>
//                     Total
//                   </Text>
//                   <View style={styles.taxValues}>
//                     <View style={styles.taxValueCell}>
//                       <Text style={[styles.taxValue, { color: C.danger }]}>
//                         {dispShort(
//                           payslips.reduce((s, p) => s + (p.payeTax ?? 0), 0),
//                         )}
//                       </Text>
//                     </View>
//                     <View style={styles.taxValueCell}>
//                       <Text style={[styles.taxValue, { color: C.warning }]}>
//                         {dispShort(
//                           payslips.reduce(
//                             (s, p) => s + (p.pensionEmployee ?? 0),
//                             0,
//                           ),
//                         )}
//                       </Text>
//                     </View>
//                     <View style={styles.taxValueCell}>
//                       <Text style={[styles.taxValue, { color: "#8B5CF6" }]}>
//                         {dispShort(
//                           payslips.reduce(
//                             (s, p) => s + (p.nhfDeduction ?? 0),
//                             0,
//                           ),
//                         )}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>
//             )}
//           </Card>
//         )}

//         <View style={{ height: 24 }} />
//       </ScrollView>

//       <PayslipDetailModal
//         payslip={selectedPayslip}
//         onClose={() => setSelectedPayslip(null)}
//         onDownload={handleDownload}
//       />
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
//   maskBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
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
//     gap: 14,
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
//   yearRow: {
//     flexGrow: 0,
//   },
//   yearChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 7,
//     borderRadius: 999,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderWidth: 1,
//     borderColor: "transparent",
//   },
//   yearChipActive: {
//     backgroundColor: "rgba(255,255,255,0.25)",
//     borderColor: "rgba(255,255,255,0.4)",
//   },
//   yearChipLabel: {
//     fontSize: 12.5,
//     fontWeight: "700",
//     color: "rgba(255,255,255,0.7)",
//   },
//   yearChipLabelActive: {
//     color: "#fff",
//   },
//   heroStatsRow: {
//     flexDirection: "row",
//     gap: 10,
//   },
//   heroStatTile: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     backgroundColor: "rgba(255,255,255,0.10)",
//   },
//   heroStatValue: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   heroStatLabel: {
//     fontSize: 10,
//     color: "rgba(255,255,255,0.6)",
//     marginTop: 2,
//   },
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
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 9,
//     borderRadius: 10,
//   },
//   tabBtnActive: {
//     backgroundColor: C.primary,
//   },
//   tabLabel: {
//     fontSize: 12.5,
//     fontWeight: "700",
//   },
//   list: {
//     gap: 8,
//   },
//   emptyState: {
//     alignItems: "center",
//     gap: 8,
//     paddingVertical: 36,
//   },
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
//   },
//   emptyInline: {
//     fontSize: 12.5,
//     color: C.textMuted,
//     textAlign: "center",
//     paddingVertical: 16,
//   },
//   taxCard: {
//     gap: 6,
//   },
//   taxList: {
//     gap: 4,
//   },
//   taxRow: {
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//     gap: 6,
//   },
//   taxTotalRow: {
//     borderBottomWidth: 0,
//     marginTop: 4,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   taxMonth: {
//     fontSize: 12.5,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   taxValues: {
//     flexDirection: "row",
//     gap: 10,
//   },
//   taxValueCell: {
//     flex: 1,
//   },
//   taxValueLabel: {
//     fontSize: 9.5,
//     color: C.textMuted,
//     marginBottom: 2,
//   },
//   taxValue: {
//     fontSize: 12,
//     fontWeight: "700",
//   },
// });


// src/app/employee/payslips.tsx
// Employee Payslips screen — connected to backend API.
// Mirrors the web PayslipsPage: hero with YTD stats + year selector,
// Payslips / Tax & Deductions tabs, list, and a detail modal.
// Download is stubbed (toast) since PDF generation is a web-only concern.

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Wallet, Eye, EyeOff, FileText } from "lucide-react-native";
import Toast from "react-native-toast-message";

import C from "../../styles/colors";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import PayslipListItem from "../../components/payslip/PayslipListItem";
import PayslipDetailModal from "../../components/payslip/PayslipDetailModal";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";

import { getMyPayslip } from "../../api/service/payrollApi";
import { authApi } from "../../api/service/authApi";

/* ─── Helpers ─── */
const fmt = (n?: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const fmtShort = (n?: number) => {
  if (!n) return "₦0";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
};

const mask = () => "₦ ••••••";

const MONTHS = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  draft:      { label: "Draft",      bg: "#F1F5F9", color: "#64748B" },
  processing: { label: "Processing", bg: "#FEF3C7", color: "#F59E0B" },
  approved:   { label: "Approved",   bg: "#DBEAFE", color: "#2563EB" },
  paid:       { label: "Paid",       bg: "#D1FAE5", color: "#10B981" },
};

type TabKey = "payslips" | "tax";

const TABS: { id: TabKey; label: string }[] = [
  { id: "payslips", label: "Payslips" },
  { id: "tax", label: "Tax & Deductions" },
];

const YEARS = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

/* ─── Payslip type (matches API response) ─── */
type Payslip = {
  id: string;
  month: number;
  year: number;
  employeeName?: string;
  employeeCode?: string;
  departmentName?: string;
  jobRoleName?: string;
  basicSalary?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  utilityAllowance?: number;
  mealAllowance?: number;
  overtime?: number;
  bonus?: number;
  grossSalary?: number;
  payeTax?: number;
  pensionEmployee?: number;
  nhfDeduction?: number;
  totalDeductions?: number;
  netSalary?: number;
  runStatus?: string;
  status?: string;
  paymentDate?: string;
  paymentMethod?: string;
  accountNumber?: string;
  bankName?: string;
  isManuallyEdited?: boolean;
};

export default function PayslipsScreen() {
  const insets = useSafeAreaInsets();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  const [employee, setEmployee] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("payslips");
  const [masked, setMasked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  /* ─── Load employee profile ─── */
  useEffect(() => {
    authApi
      .getMe()
      .then((me) => setEmployee(me))
      .catch(() => setError("Failed to load profile."));
  }, []);

  /* ─── Load payslips for selected year ─── */
  const loadPayslips = useCallback(async () => {
    if (!employee) return;
    setError(null);

    const results: Payslip[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();

    const validMonths = selectedYear > currentYear ? [] : MONTHS;

    await Promise.allSettled(
      validMonths.map(async (m) => {
        try {
          const res = await getMyPayslip(m.value, selectedYear);
          // API returns { data: payslip } or the payslip directly
          const payslip = res?.data ?? res;
          if (payslip) results.push(payslip);
        } catch {
          // 404 = no payslip for this month yet, skip silently
        }
      }),
    );

    setPayslips(results.sort((a, b) => b.month - a.month));
  }, [employee, selectedYear]);

  useEffect(() => {
    (async () => {
      loaderRef.current?.show();
      try {
        await loadPayslips();
      } finally {
        loaderRef.current?.hide();
      }
    })();
  }, [loadPayslips]);

  function handleSelectYear(y: number) {
    setSelectedYear(y);
  }

  function handleRefresh() {
    setRefreshing(true);
    loadPayslips().finally(() => setRefreshing(false));
  }

  function handleDownload(p: Payslip) {
    Toast.show({
      type: "info",
      text1: "Download",
      text2: `${MONTH_NAMES[p.month]} ${p.year} payslip — coming soon`,
    });
  }

  const ytdGross = useMemo(
    () => payslips.reduce((s, p) => s + (p.grossSalary ?? 0), 0),
    [payslips],
  );
  const ytdDeductions = useMemo(
    () => payslips.reduce((s, p) => s + (p.totalDeductions ?? 0), 0),
    [payslips],
  );
  const ytdNet = useMemo(
    () => payslips.reduce((s, p) => s + (p.netSalary ?? 0), 0),
    [payslips],
  );

  const disp = (n?: number) => (masked ? mask() : fmt(n));
  const dispShort = (n?: number) => (masked ? "••••" : fmtShort(n));

  const statusBadge = (status?: string) =>
    STATUS_CFG[status ?? ""] ?? { label: status ?? "—", bg: C.surfaceAlt, color: C.textMuted };

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
        <Text style={styles.headerTitle}>Payslips</Text>
        <Pressable
          onPress={() => setMasked((p) => !p)}
          hitSlop={8}
          style={styles.maskBtn}
        >
          {masked ? (
            <Eye size={17} color={C.textSecondary} />
          ) : (
            <EyeOff size={17} color={C.textSecondary} />
          )}
        </Pressable>
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
              <Wallet size={20} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>My Payslips</Text>
          </View>

          {/* Year selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.yearRow}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {YEARS.map((y) => {
                const active = selectedYear === y;
                return (
                  <Pressable
                    key={y}
                    onPress={() => handleSelectYear(y)}
                    style={[styles.yearChip, active && styles.yearChipActive]}
                  >
                    <Text
                      style={[
                        styles.yearChipLabel,
                        active && styles.yearChipLabelActive,
                      ]}
                    >
                      {y}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.heroStatsRow}>
            {[
              { label: "YTD Gross", value: dispShort(ytdGross) },
              { label: "YTD Deductions", value: dispShort(ytdDeductions) },
              { label: "YTD Net", value: dispShort(ytdNet) },
            ].map((s) => (
              <View key={s.label} style={styles.heroStatTile}>
                <Text style={styles.heroStatValue}>{s.value}</Text>
                <Text style={styles.heroStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

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
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Payslips tab */}
        {activeTab === "payslips" &&
          (payslips.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <FileText size={22} color={C.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                No payslips found for {selectedYear}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {payslips.map((p) => (
                <PayslipListItem
                  key={p.id ?? `${p.year}-${p.month}`}
                  payslip={p}
                  masked={masked}
                  onPress={setSelectedPayslip}
                />
              ))}
            </View>
          ))}

        {/* Tax & Deductions tab */}
        {activeTab === "tax" && (
          <Card padded style={styles.taxCard}>
            <SectionHeader
              title={`Tax & Statutory — ${selectedYear} YTD`}
              showChevron={false}
            />
            {payslips.length === 0 ? (
              <Text style={styles.emptyInline}>
                No data for {selectedYear}.
              </Text>
            ) : (
              <View style={styles.taxList}>
                {payslips.map((p) => (
                  <View key={p.id ?? `${p.year}-${p.month}`} style={styles.taxRow}>
                    <Text style={styles.taxMonth}>{MONTH_NAMES[p.month]}</Text>
                    <View style={styles.taxValues}>
                      <View style={styles.taxValueCell}>
                        <Text style={styles.taxValueLabel}>PAYE</Text>
                        <Text style={[styles.taxValue, { color: C.danger }]}>
                          {masked ? "••••" : fmtShort(p.payeTax)}
                        </Text>
                      </View>
                      <View style={styles.taxValueCell}>
                        <Text style={styles.taxValueLabel}>Pension</Text>
                        <Text style={[styles.taxValue, { color: C.warning }]}>
                          {masked ? "••••" : fmtShort(p.pensionEmployee)}
                        </Text>
                      </View>
                      <View style={styles.taxValueCell}>
                        <Text style={styles.taxValueLabel}>NHF</Text>
                        <Text style={[styles.taxValue, { color: "#8B5CF6" }]}>
                          {masked ? "••••" : fmtShort(p.nhfDeduction)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

                <View style={[styles.taxRow, styles.taxTotalRow]}>
                  <Text style={[styles.taxMonth, { fontWeight: "800" }]}>
                    Total
                  </Text>
                  <View style={styles.taxValues}>
                    <View style={styles.taxValueCell}>
                      <Text style={[styles.taxValue, { color: C.danger }]}>
                        {dispShort(
                          payslips.reduce((s, p) => s + (p.payeTax ?? 0), 0),
                        )}
                      </Text>
                    </View>
                    <View style={styles.taxValueCell}>
                      <Text style={[styles.taxValue, { color: C.warning }]}>
                        {dispShort(
                          payslips.reduce(
                            (s, p) => s + (p.pensionEmployee ?? 0),
                            0,
                          ),
                        )}
                      </Text>
                    </View>
                    <View style={styles.taxValueCell}>
                      <Text style={[styles.taxValue, { color: "#8B5CF6" }]}>
                        {dispShort(
                          payslips.reduce(
                            (s, p) => s + (p.nhfDeduction ?? 0),
                            0,
                          ),
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </Card>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <PayslipDetailModal
        payslip={selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        onDownload={handleDownload}
      />

      {/* Global loader — the only loader in this screen */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading payslips..."
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
  maskBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
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
    gap: 14,
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
  yearRow: {
    flexGrow: 0,
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  yearChipActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderColor: "rgba(255,255,255,0.4)",
  },
  yearChipLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
  },
  yearChipLabelActive: {
    color: "#fff",
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  heroStatTile: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  heroStatLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: C.primary,
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  list: {
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 36,
  },
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
  },
  emptyInline: {
    fontSize: 12.5,
    color: C.textMuted,
    textAlign: "center",
    paddingVertical: 16,
  },
  taxCard: {
    gap: 6,
  },
  taxList: {
    gap: 4,
  },
  taxRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 6,
  },
  taxTotalRow: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  taxMonth: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  taxValues: {
    flexDirection: "row",
    gap: 10,
  },
  taxValueCell: {
    flex: 1,
  },
  taxValueLabel: {
    fontSize: 9.5,
    color: C.textMuted,
    marginBottom: 2,
  },
  taxValue: {
    fontSize: 12,
    fontWeight: "700",
  },
});