// // src/components/admin/payroll/PayrollHistoryView.tsx
// // RN port of PayrollHistory.jsx — HTML <table> becomes a scrollable list
// // of run cards; CSV export uses the OS share sheet instead of a browser
// // download link.

// import React, { useCallback, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   ChevronLeft,
//   RefreshCw,
//   Download,
//   FileText,
//   AlertCircle,
//   ChevronLeft as PrevIcon,
//   ChevronRight,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { listRuns, getPaymentFile } from "../../../api/service/payrollApi";
// import StatusBadge from "./StatusBadge";
// import { downloadBlobOrText } from "./downloadFile";

// const MONTHS = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];
// const PAGE_SIZE = 20;

// const fmt = (n: any) => {
//   const v = Number(n ?? 0);
//   if (v === 0) return "₦0";
//   if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(2)}M`;
//   if (v >= 1_000) return `₦${(v / 1_000).toFixed(1)}K`;
//   return `₦${v.toLocaleString("en-NG")}`;
// };
// const field = (obj: any, camel: string, snake: string) =>
//   obj?.[camel] ?? obj?.[snake] ?? 0;

// type Props = { onClose: () => void };

// export default function PayrollHistoryView({ onClose }: Props) {
//   const insets = useSafeAreaInsets();
//   const [runs, setRuns] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [downloading, setDownloading] = useState<string | null>(null);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await listRuns({ page, limit: PAGE_SIZE });
//       setRuns(res.data ?? []);
//       setTotal(res.total ?? res.meta?.total ?? res.data?.length ?? 0);
//     } catch (e: any) {
//       setError(e?.response?.data?.message ?? "Failed to load payroll history.");
//     } finally {
//       setLoading(false);
//     }
//   }, [page]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const handleDownload = async (run: any) => {
//     setDownloading(run.id);
//     setError(null);
//     try {
//       const data = await getPaymentFile(run.id);
//       const periodSlug = run.period
//         ? run.period.replace(/\s+/g, "-")
//         : `${run.year}-${String(field(run, "month", "month")).padStart(2, "0")}`;
//       await downloadBlobOrText(data, `Payroll-${periodSlug}.csv`);
//     } catch {
//       setError(
//         "Download failed for this run. Ensure the run has been processed.",
//       );
//     } finally {
//       setDownloading(null);
//     }
//   };

//   const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={onClose} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Payroll History</Text>
//           <Text style={styles.headerSub}>
//             {total} total run{total !== 1 ? "s" : ""}
//           </Text>
//         </View>
//         <Pressable onPress={load} style={styles.refreshBtn}>
//           <RefreshCw size={13} color={C.textSecondary} />
//         </Pressable>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {error && (
//           <View style={styles.errorBanner}>
//             <AlertCircle size={14} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}

//         {loading ? (
//           <View style={styles.center}>
//             <ActivityIndicator size="large" color={C.primary} />
//           </View>
//         ) : runs.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <FileText size={32} color={C.textMuted} />
//             <Text style={styles.emptyTitle}>No payroll runs found.</Text>
//             <Text style={styles.muted}>
//               Run your first payroll to see it here.
//             </Text>
//           </View>
//         ) : (
//           <View style={{ gap: 12 }}>
//             {runs.map((run) => {
//               const gross = field(run, "totalGross", "total_gross");
//               const deductions = field(
//                 run,
//                 "totalDeductions",
//                 "total_deductions",
//               );
//               const net = field(run, "totalNet", "total_net");
//               const empCount = field(run, "employeeCount", "employee_count");
//               const month = run.month ?? 1;
//               const year = run.year ?? new Date().getFullYear();
//               const canDownload = ["processed", "approved", "paid"].includes(
//                 run.status,
//               );

//               return (
//                 <View key={run.id} style={styles.runCard}>
//                   <View style={styles.runHeader}>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.runPeriod}>
//                         {run.period ?? `${MONTHS[month - 1]} ${year}`}
//                       </Text>
//                       <Text style={styles.runDate}>
//                         {run.created_at
//                           ? new Date(run.created_at).toLocaleDateString(
//                               "en-GB",
//                               {
//                                 day: "numeric",
//                                 month: "short",
//                                 year: "numeric",
//                               },
//                             )
//                           : "—"}
//                         {" · "}
//                         {empCount > 0 ? `${empCount} emp.` : "—"}
//                       </Text>
//                     </View>
//                     <StatusBadge status={run.status} />
//                   </View>

//                   <View style={styles.runTotals}>
//                     <Totals
//                       label="Gross"
//                       value={gross > 0 ? fmt(gross) : "—"}
//                       color={C.textPrimary}
//                     />
//                     <Totals
//                       label="Deductions"
//                       value={deductions > 0 ? fmt(deductions) : "—"}
//                       color={C.danger}
//                     />
//                     <Totals
//                       label="Net Pay"
//                       value={net > 0 ? fmt(net) : "—"}
//                       color={C.success}
//                       bold
//                     />
//                   </View>

//                   {canDownload ? (
//                     <Pressable
//                       onPress={() => handleDownload(run)}
//                       disabled={downloading === run.id}
//                       style={styles.exportBtn}
//                     >
//                       {downloading === run.id ? (
//                         <ActivityIndicator size="small" color={C.primary} />
//                       ) : (
//                         <Download size={12} color={C.primary} />
//                       )}
//                       <Text style={styles.exportBtnText}>Export CSV</Text>
//                     </Pressable>
//                   ) : (
//                     <Text style={styles.notReady}>
//                       {run.status === "draft"
//                         ? "Process first"
//                         : "Export unavailable"}
//                     </Text>
//                   )}
//                 </View>
//               );
//             })}
//           </View>
//         )}

//         {totalPages > 1 && (
//           <View style={styles.pagination}>
//             <Text style={styles.muted}>
//               Page {page} of {totalPages}
//             </Text>
//             <View style={{ flexDirection: "row", gap: 8 }}>
//               <Pressable
//                 onPress={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 style={[styles.pageBtn, { opacity: page === 1 ? 0.4 : 1 }]}
//               >
//                 <PrevIcon size={14} color={C.textSecondary} />
//               </Pressable>
//               <Pressable
//                 onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 style={[
//                   styles.pageBtn,
//                   { opacity: page === totalPages ? 0.4 : 1 },
//                 ]}
//               >
//                 <ChevronRight size={14} color={C.textSecondary} />
//               </Pressable>
//             </View>
//           </View>
//         )}

//         <View style={{ height: 24 }} />
//       </ScrollView>
//     </View>
//   );
// }

// function Totals({
//   label,
//   value,
//   color,
//   bold,
// }: {
//   label: string;
//   value: string;
//   color: string;
//   bold?: boolean;
// }) {
//   return (
//     <View style={{ flex: 1 }}>
//       <Text style={styles.totalsLabel}>{label}</Text>
//       <Text
//         style={[
//           styles.totalsValue,
//           { color, fontWeight: bold ? "800" : "700" },
//         ]}
//       >
//         {value}
//       </Text>
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
//   headerSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
//   refreshBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   scrollContent: { padding: 16 },
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     borderWidth: 1,
//     borderColor: `${C.danger}33`,
//     marginBottom: 14,
//   },
//   errorText: { flex: 1, fontSize: 12, color: C.danger },
//   center: { paddingVertical: 60, alignItems: "center" },
//   emptyCard: {
//     alignItems: "center",
//     gap: 6,
//     paddingVertical: 50,
//     borderRadius: 18,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   emptyTitle: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.textSecondary,
//     marginTop: 6,
//   },
//   muted: { fontSize: 12, color: C.textMuted },
//   runCard: {
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 18,
//     padding: 16,
//     gap: 12,
//   },
//   runHeader: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//   },
//   runPeriod: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
//   runDate: { fontSize: 11, color: C.textMuted, marginTop: 3 },
//   runTotals: {
//     flexDirection: "row",
//     gap: 8,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   totalsLabel: {
//     fontSize: 10,
//     color: C.textMuted,
//     fontWeight: "700",
//     textTransform: "uppercase",
//   },
//   totalsValue: { fontSize: 13, marginTop: 3 },
//   exportBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 9,
//     borderRadius: 12,
//     backgroundColor: C.primaryLight,
//     borderWidth: 1,
//     borderColor: `${C.primary}30`,
//   },
//   exportBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },
//   notReady: { fontSize: 11, color: C.textMuted, textAlign: "center" },
//   pagination: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 16,
//     paddingHorizontal: 4,
//   },
//   pageBtn: {
//     width: 34,
//     height: 34,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
// });


// src/components/admin/payroll/PayrollHistoryView.tsx
// RN port of PayrollHistory.jsx — HTML <table> becomes a scrollable list
// of run cards; CSV export uses the OS share sheet instead of a browser
// download link.

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  RefreshCw,
  Download,
  FileText,
  AlertCircle,
  ChevronLeft as PrevIcon,
  ChevronRight,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { Loader } from "../../../hooks/loaderManager";
import { listRuns, getPaymentFile } from "../../../api/service/payrollApi";
import StatusBadge from "./StatusBadge";
import { downloadBlobOrText } from "./downloadFile";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const PAGE_SIZE = 20;

const fmt = (n: any) => {
  const v = Number(n ?? 0);
  if (v === 0) return "₦0";
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(1)}K`;
  return `₦${v.toLocaleString("en-NG")}`;
};
const field = (obj: any, camel: string, snake: string) =>
  obj?.[camel] ?? obj?.[snake] ?? 0;

type Props = { onClose: () => void };

export default function PayrollHistoryView({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const res = await listRuns({ page, limit: PAGE_SIZE });
      setRuns(res.data ?? []);
      setTotal(res.total ?? res.meta?.total ?? res.data?.length ?? 0);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load payroll history.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownload = async (run: any) => {
    setDownloading(run.id);
    setError(null);
    Loader.show();
    try {
      const data = await getPaymentFile(run.id);
      const periodSlug = run.period
        ? run.period.replace(/\s+/g, "-")
        : `${run.year}-${String(field(run, "month", "month")).padStart(2, "0")}`;
      await downloadBlobOrText(data, `Payroll-${periodSlug}.csv`);
    } catch {
      setError(
        "Download failed for this run. Ensure the run has been processed.",
      );
    } finally {
      setDownloading(null);
      Loader.hide();
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Payroll History</Text>
          <Text style={styles.headerSub}>
            {total} total run{total !== 1 ? "s" : ""}
          </Text>
        </View>
        <Pressable onPress={load} style={styles.refreshBtn}>
          <RefreshCw size={13} color={C.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={14} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : runs.length === 0 ? (
          <View style={styles.emptyCard}>
            <FileText size={32} color={C.textMuted} />
            <Text style={styles.emptyTitle}>No payroll runs found.</Text>
            <Text style={styles.muted}>
              Run your first payroll to see it here.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {runs.map((run) => {
              const gross = field(run, "totalGross", "total_gross");
              const deductions = field(
                run,
                "totalDeductions",
                "total_deductions",
              );
              const net = field(run, "totalNet", "total_net");
              const empCount = field(run, "employeeCount", "employee_count");
              const month = run.month ?? 1;
              const year = run.year ?? new Date().getFullYear();
              const canDownload = ["processed", "approved", "paid"].includes(
                run.status,
              );

              return (
                <View key={run.id} style={styles.runCard}>
                  <View style={styles.runHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.runPeriod}>
                        {run.period ?? `${MONTHS[month - 1]} ${year}`}
                      </Text>
                      <Text style={styles.runDate}>
                        {run.created_at
                          ? new Date(run.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                        {" · "}
                        {empCount > 0 ? `${empCount} emp.` : "—"}
                      </Text>
                    </View>
                    <StatusBadge status={run.status} />
                  </View>

                  <View style={styles.runTotals}>
                    <Totals
                      label="Gross"
                      value={gross > 0 ? fmt(gross) : "—"}
                      color={C.textPrimary}
                    />
                    <Totals
                      label="Deductions"
                      value={deductions > 0 ? fmt(deductions) : "—"}
                      color={C.danger}
                    />
                    <Totals
                      label="Net Pay"
                      value={net > 0 ? fmt(net) : "—"}
                      color={C.success}
                      bold
                    />
                  </View>

                  {canDownload ? (
                    <Pressable
                      onPress={() => handleDownload(run)}
                      disabled={downloading === run.id}
                      style={styles.exportBtn}
                    >
                      {downloading === run.id ? (
                        <ActivityIndicator size="small" color={C.primary} />
                      ) : (
                        <Download size={12} color={C.primary} />
                      )}
                      <Text style={styles.exportBtnText}>Export CSV</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.notReady}>
                      {run.status === "draft"
                        ? "Process first"
                        : "Export unavailable"}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {totalPages > 1 && (
          <View style={styles.pagination}>
            <Text style={styles.muted}>
              Page {page} of {totalPages}
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={[styles.pageBtn, { opacity: page === 1 ? 0.4 : 1 }]}
              >
                <PrevIcon size={14} color={C.textSecondary} />
              </Pressable>
              <Pressable
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={[
                  styles.pageBtn,
                  { opacity: page === totalPages ? 0.4 : 1 },
                ]}
              >
                <ChevronRight size={14} color={C.textSecondary} />
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function Totals({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color: string;
  bold?: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.totalsLabel}>{label}</Text>
      <Text
        style={[
          styles.totalsValue,
          { color, fontWeight: bold ? "800" : "700" },
        ]}
      >
        {value}
      </Text>
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
  headerSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  scrollContent: { padding: 16 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: `${C.danger}33`,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 12, color: C.danger },
  center: { paddingVertical: 60, alignItems: "center" },
  emptyCard: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 50,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textSecondary,
    marginTop: 6,
  },
  muted: { fontSize: 12, color: C.textMuted },
  runCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  runHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  runPeriod: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  runDate: { fontSize: 11, color: C.textMuted, marginTop: 3 },
  runTotals: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  totalsLabel: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  totalsValue: { fontSize: 13, marginTop: 3 },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: `${C.primary}30`,
  },
  exportBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },
  notReady: { fontSize: 11, color: C.textMuted, textAlign: "center" },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 4,
  },
  pageBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
});