// // src/components/admin/training/TrainingBudgetView.tsx
// // Mobile equivalent of TrainingBudget.jsx — derives budget breakdown from
// // real training costs, same as the web version.

// import { useEffect, useState } from "react";
// import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import { AlertCircle } from "lucide-react-native";

// import C from "../../../styles/colors";
// import {
//   getTrainingDashboard,
//   listTrainings,
// } from "../../../api/service/trainingApi";
// import { fmtNairaPrecise } from "../../../hooks/trainingHelpers";

// export default function TrainingBudgetView() {
//   const [summary, setSummary] = useState<{
//     totalBudget: number;
//     spent: number;
//   } | null>(null);
//   const [byType, setByType] = useState<
//     { name: string; budget: number; spent: number }[]
//   >([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     Promise.all([getTrainingDashboard(), listTrainings({ limit: 200 })])
//       .then(([dash, all]: any[]) => {
//         setSummary({
//           totalBudget: dash.data.totalCost,
//           spent: dash.data.budgetSpent,
//         });

//         const trainings = all.data ?? [];
//         const grouped: Record<
//           string,
//           { name: string; budget: number; spent: number }
//         > = {};
//         trainings.forEach((t: any) => {
//           if (!grouped[t.type])
//             grouped[t.type] = { name: t.type, budget: 0, spent: 0 };
//           grouped[t.type].budget += t.cost ?? 0;
//           if (t.status === "completed") grouped[t.type].spent += t.cost ?? 0;
//         });
//         setByType(Object.values(grouped));
//       })
//       .catch((e: any) =>
//         setError(e?.response?.data?.message ?? "Failed to load budget data."),
//       )
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return (
//       <View style={s.center}>
//         <ActivityIndicator size="large" color={C.primary} />
//       </View>
//     );
//   }

//   if (error || !summary) {
//     return (
//       <View style={s.errorBox}>
//         <AlertCircle size={16} color={C.danger} />
//         <Text style={s.errorText}>
//           {error ?? "Failed to load budget data."}
//         </Text>
//       </View>
//     );
//   }

//   const utilization =
//     summary.totalBudget > 0
//       ? Math.round((summary.spent / summary.totalBudget) * 100)
//       : 0;

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Summary card */}
//       <View style={s.summaryCard}>
//         <View style={s.summaryTop}>
//           <View>
//             <Text style={s.summaryLabel}>Total Training Cost (All Time)</Text>
//             <Text style={s.summaryValueBig}>
//               {fmtNairaPrecise(summary.totalBudget)}
//             </Text>
//           </View>
//           <View style={{ alignItems: "flex-end" }}>
//             <Text style={s.summaryLabel}>Spent (Completed)</Text>
//             <Text style={[s.summaryValueBig, { color: "#F59E0B" }]}>
//               {fmtNairaPrecise(summary.spent)}
//             </Text>
//           </View>
//         </View>

//         <View style={s.barTrack}>
//           <View
//             style={[s.barFill, { width: `${Math.min(utilization, 100)}%` }]}
//           />
//         </View>
//         <Text style={s.utilizationText}>{utilization}% utilization</Text>
//       </View>

//       {/* By type */}
//       {byType.length > 0 && (
//         <View style={{ gap: 10 }}>
//           {byType.map((dept, i) => {
//             const pct =
//               dept.budget > 0
//                 ? Math.round((dept.spent / dept.budget) * 100)
//                 : 0;
//             return (
//               <View key={i} style={s.typeCard}>
//                 <Text style={s.typeName}>{dept.name}</Text>
//                 <View style={s.typeRow}>
//                   <Text style={s.typeRowLabel}>Total</Text>
//                   <Text style={s.typeRowValue}>
//                     {fmtNairaPrecise(dept.budget)}
//                   </Text>
//                 </View>
//                 <View style={s.typeRow}>
//                   <Text style={s.typeRowLabel}>Spent</Text>
//                   <Text style={[s.typeRowValue, { color: "#F59E0B" }]}>
//                     {fmtNairaPrecise(dept.spent)}
//                   </Text>
//                 </View>
//                 <View style={s.typeBarTrack}>
//                   <View
//                     style={[s.typeBarFill, { width: `${Math.min(pct, 100)}%` }]}
//                   />
//                 </View>
//                 <Text style={s.typePct}>{pct}%</Text>
//               </View>
//             );
//           })}
//         </View>
//       )}
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   center: { alignItems: "center", paddingVertical: 48 },
//   errorBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: "#FEF2F2",
//   },
//   errorText: { fontSize: 12, color: C.danger, flex: 1 },

//   summaryCard: {
//     borderRadius: 18,
//     padding: 18,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 14,
//   },
//   summaryTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   summaryLabel: { fontSize: 11, color: C.textMuted },
//   summaryValueBig: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginTop: 2,
//   },
//   barTrack: {
//     height: 10,
//     borderRadius: 999,
//     backgroundColor: "#F1F5F9",
//     overflow: "hidden",
//   },
//   barFill: { height: "100%", borderRadius: 999, backgroundColor: "#F59E0B" },
//   utilizationText: {
//     fontSize: 11,
//     color: C.textMuted,
//     textAlign: "right",
//   },

//   typeCard: {
//     borderRadius: 16,
//     padding: 14,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 6,
//   },
//   typeName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   typeRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 2,
//   },
//   typeRowLabel: { fontSize: 12, color: C.textSecondary },
//   typeRowValue: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
//   typeBarTrack: {
//     height: 6,
//     borderRadius: 999,
//     backgroundColor: "#F1F5F9",
//     overflow: "hidden",
//     marginTop: 6,
//   },
//   typeBarFill: {
//     height: "100%",
//     borderRadius: 999,
//     backgroundColor: C.primary,
//   },
//   typePct: {
//     fontSize: 10,
//     color: C.textMuted,
//     textAlign: "right",
//     marginTop: 2,
//   },
// });



// src/components/admin/training/TrainingBudgetView.tsx
// Mobile equivalent of TrainingBudget.jsx — derives budget breakdown from
// real training costs, same as the web version.

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { AlertCircle } from "lucide-react-native";

import C from "../../../styles/colors";
import {
  getTrainingDashboard,
  listTrainings,
} from "../../../api/service/trainingApi";
import { fmtNairaPrecise } from "../../../hooks/trainingHelpers";
import { Loader } from "../../../hooks/loaderManager";

export default function TrainingBudgetView() {
  const [summary, setSummary] = useState<{
    totalBudget: number;
    spent: number;
  } | null>(null);
  const [byType, setByType] = useState<
    { name: string; budget: number; spent: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Loader.show();
    Promise.all([getTrainingDashboard(), listTrainings({ limit: 200 })])
      .then(([dash, all]: any[]) => {
        setSummary({
          totalBudget: dash.data.totalCost,
          spent: dash.data.budgetSpent,
        });

        const trainings = all.data ?? [];
        const grouped: Record<string, { name: string; budget: number; spent: number }> = {};
        trainings.forEach((t: any) => {
          if (!grouped[t.type])
            grouped[t.type] = { name: t.type, budget: 0, spent: 0 };
          grouped[t.type].budget += t.cost ?? 0;
          if (t.status === "completed") grouped[t.type].spent += t.cost ?? 0;
        });
        setByType(Object.values(grouped));
      })
      .catch((e: any) =>
        setError(e?.response?.data?.message ?? "Failed to load budget data."),
      )
      .finally(() => {
        setLoading(false);
        Loader.hide();
      });
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View style={s.errorBox}>
        <AlertCircle size={16} color={C.danger} />
        <Text style={s.errorText}>{error ?? "Failed to load budget data."}</Text>
      </View>
    );
  }

  const utilization =
    summary.totalBudget > 0
      ? Math.round((summary.spent / summary.totalBudget) * 100)
      : 0;

  return (
    <View style={{ gap: 14 }}>
      {/* Summary card */}
      <View style={s.summaryCard}>
        <View style={s.summaryTop}>
          <View>
            <Text style={s.summaryLabel}>Total Training Cost (All Time)</Text>
            <Text style={s.summaryValueBig}>
              {fmtNairaPrecise(summary.totalBudget)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.summaryLabel}>Spent (Completed)</Text>
            <Text style={[s.summaryValueBig, { color: "#F59E0B" }]}>
              {fmtNairaPrecise(summary.spent)}
            </Text>
          </View>
        </View>

        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${Math.min(utilization, 100)}%` }]} />
        </View>
        <Text style={s.utilizationText}>{utilization}% utilization</Text>
      </View>

      {/* By type */}
      {byType.length > 0 && (
        <View style={{ gap: 10 }}>
          {byType.map((dept, i) => {
            const pct =
              dept.budget > 0 ? Math.round((dept.spent / dept.budget) * 100) : 0;
            return (
              <View key={i} style={s.typeCard}>
                <Text style={s.typeName}>{dept.name}</Text>
                <View style={s.typeRow}>
                  <Text style={s.typeRowLabel}>Total</Text>
                  <Text style={s.typeRowValue}>
                    {fmtNairaPrecise(dept.budget)}
                  </Text>
                </View>
                <View style={s.typeRow}>
                  <Text style={s.typeRowLabel}>Spent</Text>
                  <Text style={[s.typeRowValue, { color: "#F59E0B" }]}>
                    {fmtNairaPrecise(dept.spent)}
                  </Text>
                </View>
                <View style={s.typeBarTrack}>
                  <View
                    style={[
                      s.typeBarFill,
                      { width: `${Math.min(pct, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={s.typePct}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: { alignItems: "center", paddingVertical: 48 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  errorText: { fontSize: 12, color: C.danger, flex: 1 },

  summaryCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 14,
  },
  summaryTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  summaryLabel: { fontSize: 11, color: C.textMuted },
  summaryValueBig: {
    fontSize: 22,
    fontWeight: "800",
    color: C.textPrimary,
    marginTop: 2,
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999, backgroundColor: "#F59E0B" },
  utilizationText: {
    fontSize: 11,
    color: C.textMuted,
    textAlign: "right",
  },

  typeCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  typeName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  typeRowLabel: { fontSize: 12, color: C.textSecondary },
  typeRowValue: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
  typeBarTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
    marginTop: 6,
  },
  typeBarFill: { height: "100%", borderRadius: 999, backgroundColor: C.primary },
  typePct: { fontSize: 10, color: C.textMuted, textAlign: "right", marginTop: 2 },
});