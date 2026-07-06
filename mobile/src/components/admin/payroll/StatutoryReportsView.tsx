// // src/components/admin/payroll/StatutoryReportsView.tsx
// // RN port of StatutoryReports.jsx.

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { ChevronLeft, Download } from "lucide-react-native";

// import C from "../../../styles/colors";
// import API from "../../../api/axios";
// import SelectField from "./SelectField";
// import { downloadBlobOrText } from "./downloadFile";

// const MONTHS = [
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
// const now = new Date();

// const REPORTS = [
//   {
//     key: "paye",
//     title: "PAYE Schedule (LIRS/FIRS)",
//     desc: "Monthly income tax remittance report for FIRS/state IRS submission.",
//   },
//   {
//     key: "pension",
//     title: "Pension Contribution Schedule",
//     desc: "PENCOM/PFA employee and employer pension remittance.",
//   },
//   {
//     key: "nhf",
//     title: "NHF Schedule",
//     desc: "National Housing Fund monthly remittance to FMBN.",
//   },
// ];

// type Props = { onClose: () => void };

// export default function StatutoryReportsView({ onClose }: Props) {
//   const insets = useSafeAreaInsets();
//   const [month, setMonth] = useState(now.getMonth() + 1);
//   const [year, setYear] = useState(now.getFullYear());
//   const [loading, setLoading] = useState<Record<string, boolean>>({});
//   const [error, setError] = useState<string | null>(null);

//   const MONTH_OPTIONS = MONTHS.map((m, i) => ({ label: m, value: i + 1 }));
//   const YEAR_OPTIONS = [year - 1, year].map((y) => ({
//     label: String(y),
//     value: y,
//   }));

//   const handleGenerate = async (reportKey: string) => {
//     setLoading((p) => ({ ...p, [reportKey]: true }));
//     setError(null);
//     try {
//       const res = await API.get(`/reports/statutory`, {
//         params: { type: reportKey, month, year },
//         responseType: "text",
//       });
//       const filename = `${reportKey}-${year}-${String(month).padStart(2, "0")}.csv`;
//       await downloadBlobOrText(res.data, filename, "text/csv");
//     } catch {
//       setError(`Failed to generate ${reportKey} report.`);
//     } finally {
//       setLoading((p) => ({ ...p, [reportKey]: false }));
//     }
//   };

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={onClose} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Statutory Reports</Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.periodCard}>
//           <Text style={styles.periodLabel}>Report Period</Text>
//           <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
//             <SelectField
//               value={month}
//               options={MONTH_OPTIONS}
//               onChange={(v) => setMonth(Number(v))}
//             />
//             <SelectField
//               value={year}
//               options={YEAR_OPTIONS}
//               onChange={(v) => setYear(Number(v))}
//             />
//           </View>
//           <Text style={styles.muted}>
//             Reports are generated from finalised payroll runs.
//           </Text>
//         </View>

//         {error && (
//           <View style={styles.errorBanner}>
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}

//         <View style={{ gap: 14, marginTop: 16 }}>
//           {REPORTS.map((r) => (
//             <View key={r.key} style={styles.reportCard}>
//               <Text style={styles.reportTitle}>{r.title}</Text>
//               <Text style={styles.reportDesc}>{r.desc}</Text>
//               <Pressable
//                 onPress={() => handleGenerate(r.key)}
//                 disabled={loading[r.key]}
//                 style={[styles.genBtn, { opacity: loading[r.key] ? 0.7 : 1 }]}
//               >
//                 {loading[r.key] ? (
//                   <ActivityIndicator color="#fff" size="small" />
//                 ) : (
//                   <Download size={13} color="#fff" />
//                 )}
//                 <Text style={styles.genBtnText}>
//                   {loading[r.key] ? "Generating…" : "Generate CSV"}
//                 </Text>
//               </Pressable>
//             </View>
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
//   scrollContent: { padding: 16 },
//   periodCard: {
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 18,
//     padding: 16,
//   },
//   periodLabel: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
//   muted: { fontSize: 11, color: C.textMuted, marginTop: 10 },
//   errorBanner: {
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     marginTop: 14,
//   },
//   errorText: { fontSize: 12, color: C.danger },
//   reportCard: {
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 18,
//     padding: 18,
//   },
//   reportTitle: {
//     fontSize: 14,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginBottom: 6,
//   },
//   reportDesc: {
//     fontSize: 12,
//     color: C.textSecondary,
//     marginBottom: 16,
//     lineHeight: 17,
//   },
//   genBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     backgroundColor: C.primary,
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignSelf: "flex-start",
//     paddingHorizontal: 18,
//   },
//   genBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
// });


// src/components/admin/payroll/StatutoryReportsView.tsx
// RN port of StatutoryReports.jsx.

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Download } from "lucide-react-native";

import C from "../../../styles/colors";
import { Loader } from "../../../hooks/loaderManager";
import API from "../../../api/axios";
import SelectField from "./SelectField";
import { downloadBlobOrText } from "./downloadFile";

const MONTHS = [
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
const now = new Date();

const REPORTS = [
  {
    key: "paye",
    title: "PAYE Schedule (LIRS/FIRS)",
    desc: "Monthly income tax remittance report for FIRS/state IRS submission.",
  },
  {
    key: "pension",
    title: "Pension Contribution Schedule",
    desc: "PENCOM/PFA employee and employer pension remittance.",
  },
  {
    key: "nhf",
    title: "NHF Schedule",
    desc: "National Housing Fund monthly remittance to FMBN.",
  },
];

type Props = { onClose: () => void };

export default function StatutoryReportsView({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const MONTH_OPTIONS = MONTHS.map((m, i) => ({ label: m, value: i + 1 }));
  const YEAR_OPTIONS = [year - 1, year].map((y) => ({
    label: String(y),
    value: y,
  }));

  const handleGenerate = async (reportKey: string) => {
    setLoading((p) => ({ ...p, [reportKey]: true }));
    setError(null);
    Loader.show();
    try {
      const res = await API.get(`/reports/statutory`, {
        params: { type: reportKey, month, year },
        responseType: "text",
      });
      const filename = `${reportKey}-${year}-${String(month).padStart(2, "0")}.csv`;
      await downloadBlobOrText(res.data, filename, "text/csv");
    } catch {
      setError(`Failed to generate ${reportKey} report.`);
    } finally {
      setLoading((p) => ({ ...p, [reportKey]: false }));
      Loader.hide();
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Statutory Reports</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.periodCard}>
          <Text style={styles.periodLabel}>Report Period</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <SelectField
              value={month}
              options={MONTH_OPTIONS}
              onChange={(v) => setMonth(Number(v))}
            />
            <SelectField
              value={year}
              options={YEAR_OPTIONS}
              onChange={(v) => setYear(Number(v))}
            />
          </View>
          <Text style={styles.muted}>
            Reports are generated from finalised payroll runs.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={{ gap: 14, marginTop: 16 }}>
          {REPORTS.map((r) => (
            <View key={r.key} style={styles.reportCard}>
              <Text style={styles.reportTitle}>{r.title}</Text>
              <Text style={styles.reportDesc}>{r.desc}</Text>
              <Pressable
                onPress={() => handleGenerate(r.key)}
                disabled={loading[r.key]}
                style={[styles.genBtn, { opacity: loading[r.key] ? 0.7 : 1 }]}
              >
                {loading[r.key] ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Download size={13} color="#fff" />
                )}
                <Text style={styles.genBtnText}>
                  {loading[r.key] ? "Generating…" : "Generate CSV"}
                </Text>
              </Pressable>
            </View>
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
  scrollContent: { padding: 16 },
  periodCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
  },
  periodLabel: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  muted: { fontSize: 11, color: C.textMuted, marginTop: 10 },
  errorBanner: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    marginTop: 14,
  },
  errorText: { fontSize: 12, color: C.danger },
  reportCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 18,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 6,
  },
  reportDesc: {
    fontSize: 12,
    color: C.textSecondary,
    marginBottom: 16,
    lineHeight: 17,
  },
  genBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 18,
  },
  genBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});