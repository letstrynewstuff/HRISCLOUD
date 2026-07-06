// // src/components/admin/payroll/PayslipLookupView.tsx
// // RN port of the PayslipViewer.jsx + PayslipLookup wrapper from
// // PayrollPage.jsx. HR enters an employee ID, picks a period, and views the
// // generated PayslipDetailCard. Employee self-service can reuse this same
// // view by passing `isEmployee` and omitting the ID field.

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   TextInput,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { ChevronLeft, AlertCircle } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { getPayslip, getMyPayslip } from "../../../api/service/payrollApi";
// import SelectField from "./SelectField";
// import PayslipDetailCard from "./PayslipDetailCard";

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

// type Props = {
//   onClose: () => void;
//   /** Omit to require a manual employee ID entry (HR view) */
//   employeeId?: string;
//   isEmployee?: boolean;
// };

// export default function PayslipLookupView({
//   onClose,
//   employeeId: presetEmployeeId,
//   isEmployee = false,
// }: Props) {
//   const insets = useSafeAreaInsets();
//   const now = new Date();
//   const [employeeId, setEmployeeId] = useState(presetEmployeeId ?? "");
//   const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
//   const [selYear, setSelYear] = useState(now.getFullYear());
//   const [slip, setSlip] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const currentYear = now.getFullYear();
//   const MONTH_OPTIONS = MONTHS.map((m, i) => ({ label: m, value: i + 1 }));
//   const YEAR_OPTIONS = [currentYear - 1, currentYear].map((y) => ({
//     label: String(y),
//     value: y,
//   }));

//   const fetchSlip = async () => {
//     if (!isEmployee && !employeeId.trim()) return;
//     setLoading(true);
//     setError(null);
//     setSlip(null);
//     try {
//       const res = isEmployee
//         ? await getMyPayslip(selMonth, selYear)
//         : await getPayslip(employeeId.trim(), selMonth, selYear);
//       setSlip(res.data ?? res);
//     } catch (e: any) {
//       setError(
//         e?.response?.data?.message ?? "Payslip not found for this period.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isEmployee) fetchSlip();
//     // HR mode fetches on explicit "Load Payslip" tap, matching web behavior.
//   }, []);

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={onClose} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Payslip Lookup</Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.card}>
//           {!isEmployee && (
//             <>
//               <Text style={styles.label}>Employee ID</Text>
//               <TextInput
//                 value={employeeId}
//                 onChangeText={setEmployeeId}
//                 placeholder="Enter Employee ID (UUID)"
//                 placeholderTextColor={C.textMuted}
//                 style={styles.input}
//                 autoCapitalize="none"
//               />
//             </>
//           )}

//           <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
//             <SelectField
//               label="Month"
//               value={selMonth}
//               options={MONTH_OPTIONS}
//               onChange={(v) => setSelMonth(Number(v))}
//             />
//             <SelectField
//               label="Year"
//               value={selYear}
//               options={YEAR_OPTIONS}
//               onChange={(v) => setSelYear(Number(v))}
//             />
//           </View>

//           <Pressable
//             onPress={fetchSlip}
//             disabled={loading || (!isEmployee && !employeeId.trim())}
//             style={[
//               styles.loadBtn,
//               {
//                 opacity:
//                   loading || (!isEmployee && !employeeId.trim()) ? 0.5 : 1,
//               },
//             ]}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.loadBtnText}>Load Payslip</Text>
//             )}
//           </Pressable>
//         </View>

//         {error && (
//           <View style={styles.errorBanner}>
//             <AlertCircle size={14} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}

//         {slip && !loading && (
//           <View style={{ marginTop: 16 }}>
//             <PayslipDetailCard slip={slip} month={selMonth} year={selYear} />
//           </View>
//         )}

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
//   card: {
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 18,
//     padding: 16,
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: C.textPrimary,
//     marginBottom: 6,
//   },
//   input: {
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     fontSize: 14,
//     color: C.textPrimary,
//   },
//   loadBtn: {
//     marginTop: 14,
//     backgroundColor: C.primary,
//     paddingVertical: 14,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   loadBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     borderWidth: 1,
//     borderColor: `${C.danger}33`,
//     marginTop: 14,
//   },
//   errorText: { flex: 1, fontSize: 12, color: C.danger },
// });


// src/components/admin/payroll/PayslipLookupView.tsx
// RN port of the PayslipViewer.jsx + PayslipLookup wrapper from
// PayrollPage.jsx. HR enters an employee ID, picks a period, and views the
// generated PayslipDetailCard. Employee self-service can reuse this same
// view by passing `isEmployee` and omitting the ID field.

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, AlertCircle } from "lucide-react-native";

import C from "../../../styles/colors";
import { Loader } from "../../../hooks/loaderManager";
import { getPayslip, getMyPayslip } from "../../../api/service/payrollApi";
import SelectField from "./SelectField";
import PayslipDetailCard from "./PayslipDetailCard";

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

type Props = {
  onClose: () => void;
  /** Omit to require a manual employee ID entry (HR view) */
  employeeId?: string;
  isEmployee?: boolean;
};

export default function PayslipLookupView({
  onClose,
  employeeId: presetEmployeeId,
  isEmployee = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [employeeId, setEmployeeId] = useState(presetEmployeeId ?? "");
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [slip, setSlip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = now.getFullYear();
  const MONTH_OPTIONS = MONTHS.map((m, i) => ({ label: m, value: i + 1 }));
  const YEAR_OPTIONS = [currentYear - 1, currentYear].map((y) => ({
    label: String(y),
    value: y,
  }));

  const fetchSlip = async () => {
    if (!isEmployee && !employeeId.trim()) return;
    setLoading(true);
    setError(null);
    setSlip(null);
    Loader.show();
    try {
      const res = isEmployee
        ? await getMyPayslip(selMonth, selYear)
        : await getPayslip(employeeId.trim(), selMonth, selYear);
      setSlip(res.data ?? res);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Payslip not found for this period.",
      );
    } finally {
      setLoading(false);
      Loader.hide();
    }
  };

  useEffect(() => {
    if (isEmployee) fetchSlip();
    // HR mode fetches on explicit "Load Payslip" tap, matching web behavior.
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Payslip Lookup</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {!isEmployee && (
            <>
              <Text style={styles.label}>Employee ID</Text>
              <TextInput
                value={employeeId}
                onChangeText={setEmployeeId}
                placeholder="Enter Employee ID (UUID)"
                placeholderTextColor={C.textMuted}
                style={styles.input}
                autoCapitalize="none"
              />
            </>
          )}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <SelectField
              label="Month"
              value={selMonth}
              options={MONTH_OPTIONS}
              onChange={(v) => setSelMonth(Number(v))}
            />
            <SelectField
              label="Year"
              value={selYear}
              options={YEAR_OPTIONS}
              onChange={(v) => setSelYear(Number(v))}
            />
          </View>

          <Pressable
            onPress={fetchSlip}
            disabled={loading || (!isEmployee && !employeeId.trim())}
            style={[
              styles.loadBtn,
              {
                opacity:
                  loading || (!isEmployee && !employeeId.trim()) ? 0.5 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loadBtnText}>Load Payslip</Text>
            )}
          </Pressable>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={14} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {slip && !loading && (
          <View style={{ marginTop: 16 }}>
            <PayslipDetailCard slip={slip} month={selMonth} year={selYear} />
          </View>
        )}

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
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textPrimary,
  },
  loadBtn: {
    marginTop: 14,
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  loadBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: `${C.danger}33`,
    marginTop: 14,
  },
  errorText: { flex: 1, fontSize: 12, color: C.danger },
});