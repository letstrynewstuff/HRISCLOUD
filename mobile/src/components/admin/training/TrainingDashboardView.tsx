// // src/components/admin/training/TrainingDashboardView.tsx
// // Mobile equivalent of TrainingDashboard.jsx.
// //
// // NOTE: TrainingDashboard.jsx's source wasn't available, so this is built
// // from what the other training files confirm about the API surface:
// //   - getTrainingDashboard() returns { data: { totalCost, budgetSpent, ... } }
// //     (TrainingBudget.jsx only reads totalCost/budgetSpent from it — the
// //     extra fields below, totalTrainings/activeEnrollments/upcomingCount,
// //     are a reasonable guess at what a dashboard summary would also expose;
// //     confirm against your actual API response shape).
// //   - getCertifications() returns { data, expiringCount } (CertificationTracker.jsx).
// //   - listTrainings() returns { data: [...] } with start_date/title/type/provider.
// // Swap in real field names once TrainingDashboard.jsx is available.

// import { useEffect, useState } from "react";
// import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import {
//   BookOpen,
//   Users,
//   AlertTriangle,
//   Wallet,
//   Calendar,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import {
//   getTrainingDashboard,
//   listTrainings,
// } from "../../../api/service/trainingApi";
// import { getCertifications } from "../../../api/service/trainingApi";
// import StatusChip from "../attendance/StatusChip";
// import {
//   TRAINING_TYPE_CFG,
//   fmtNairaCompact,
//   fmtShortDate,
// } from "../../../hooks/trainingHelpers";

// export default function TrainingDashboardView() {
//   const [dash, setDash] = useState<any | null>(null);
//   const [upcoming, setUpcoming] = useState<any[]>([]);
//   const [expiringCount, setExpiringCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     Promise.all([
//       getTrainingDashboard(),
//       listTrainings({ limit: 50 }),
//       getCertifications(),
//     ])
//       .then(([dashRes, trainingsRes, certsRes]: any[]) => {
//         setDash(dashRes.data);

//         const today = new Date().toISOString().split("T")[0];
//         const list = (trainingsRes.data ?? [])
//           .filter((t: any) => (t.start_date ?? "") >= today)
//           .sort((a: any, b: any) =>
//             (a.start_date ?? "").localeCompare(b.start_date ?? ""),
//           )
//           .slice(0, 5);
//         setUpcoming(list);

//         setExpiringCount(certsRes.expiringCount ?? 0);
//       })
//       .catch((e: any) =>
//         setError(e?.response?.data?.message ?? "Failed to load dashboard."),
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

//   if (error || !dash) {
//     return (
//       <View style={s.errorBox}>
//         <Text style={s.errorText}>{error ?? "Failed to load dashboard."}</Text>
//       </View>
//     );
//   }

//   const utilization =
//     dash.totalCost > 0
//       ? Math.round((dash.budgetSpent / dash.totalCost) * 100)
//       : 0;

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Stat cards */}
//       <View style={s.statsGrid}>
//         <View style={s.statCard}>
//           <View style={[s.statIconWrap, { backgroundColor: C.primaryLight }]}>
//             <BookOpen size={16} color={C.primary} />
//           </View>
//           <Text style={s.statValue}>
//             {dash.totalTrainings ?? upcoming.length}
//           </Text>
//           <Text style={s.statLabel}>Total Trainings</Text>
//         </View>
//         <View style={s.statCard}>
//           <View style={[s.statIconWrap, { backgroundColor: "#ECFEFF" }]}>
//             <Users size={16} color="#06B6D4" />
//           </View>
//           <Text style={s.statValue}>{dash.activeEnrollments ?? "—"}</Text>
//           <Text style={s.statLabel}>Active Enrollments</Text>
//         </View>
//         <View style={s.statCard}>
//           <View style={[s.statIconWrap, { backgroundColor: "#FEF3C7" }]}>
//             <Wallet size={16} color="#F59E0B" />
//           </View>
//           <Text style={s.statValue}>{utilization}%</Text>
//           <Text style={s.statLabel}>Budget Used</Text>
//         </View>
//         <View style={s.statCard}>
//           <View style={[s.statIconWrap, { backgroundColor: "#FEE2E2" }]}>
//             <AlertTriangle size={16} color="#EF4444" />
//           </View>
//           <Text style={s.statValue}>{expiringCount}</Text>
//           <Text style={s.statLabel}>Expiring Certs</Text>
//         </View>
//       </View>

//       {/* Budget summary strip */}
//       <View style={s.budgetCard}>
//         <View>
//           <Text style={s.budgetLabel}>Total Cost</Text>
//           <Text style={s.budgetValue}>{fmtNairaCompact(dash.totalCost)}</Text>
//         </View>
//         <View style={s.budgetDivider} />
//         <View>
//           <Text style={s.budgetLabel}>Spent</Text>
//           <Text style={[s.budgetValue, { color: "#F59E0B" }]}>
//             {fmtNairaCompact(dash.budgetSpent)}
//           </Text>
//         </View>
//       </View>

//       {/* Upcoming trainings */}
//       <Text style={s.sectionLabel}>Upcoming Trainings</Text>
//       {upcoming.length === 0 ? (
//         <View style={s.center}>
//           <Calendar size={24} color={C.textMuted} />
//           <Text style={s.emptyText}>No upcoming trainings scheduled.</Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {upcoming.map((t) => {
//             const cfg = TRAINING_TYPE_CFG[t.type] ?? TRAINING_TYPE_CFG.Internal;
//             return (
//               <View key={t.id} style={s.upcomingCard}>
//                 <View style={{ flex: 1, minWidth: 0 }}>
//                   <Text style={s.upcomingTitle} numberOfLines={1}>
//                     {t.title}
//                   </Text>
//                   <Text style={s.upcomingMeta} numberOfLines={1}>
//                     {t.provider} · {fmtShortDate(t.start_date)}
//                   </Text>
//                 </View>
//                 <StatusChip label={t.type} color={cfg.color} bg={cfg.bg} />
//               </View>
//             );
//           })}
//         </View>
//       )}
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   center: { alignItems: "center", gap: 10, paddingVertical: 32 },
//   emptyText: { fontSize: 12, color: C.textMuted, textAlign: "center" },
//   errorBox: {
//     padding: 14,
//     borderRadius: 12,
//     backgroundColor: "#FEF2F2",
//   },
//   errorText: { fontSize: 12, color: C.danger },

//   statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
//   statCard: {
//     flexBasis: "47%",
//     flexGrow: 1,
//     borderRadius: 16,
//     padding: 14,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 6,
//   },
//   statIconWrap: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   statValue: { fontSize: 18, fontWeight: "800", color: C.textPrimary },
//   statLabel: { fontSize: 11, color: C.textMuted },

//   budgetCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 16,
//     padding: 16,
//     backgroundColor: C.navy,
//   },
//   budgetLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
//   budgetValue: { fontSize: 18, fontWeight: "800", color: "#fff", marginTop: 2 },
//   budgetDivider: {
//     width: 1,
//     height: 32,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     marginHorizontal: 24,
//   },

//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     letterSpacing: 0.6,
//   },

//   upcomingCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     borderRadius: 14,
//     padding: 12,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   upcomingTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   upcomingMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },
// });


// src/components/admin/training/TrainingDashboardView.tsx
// Mobile equivalent of TrainingDashboard.jsx.
//
// NOTE: TrainingDashboard.jsx's source wasn't available, so this is built
// from what the other training files confirm about the API surface:
//   - getTrainingDashboard() returns { data: { totalCost, budgetSpent, ... } }
//     (TrainingBudget.jsx only reads totalCost/budgetSpent from it — the
//     extra fields below, totalTrainings/activeEnrollments/upcomingCount,
//     are a reasonable guess at what a dashboard summary would also expose;
//     confirm against your actual API response shape).
//   - getCertifications() returns { data, expiringCount } (CertificationTracker.jsx).
//   - listTrainings() returns { data: [...] } with start_date/title/type/provider.
// Swap in real field names once TrainingDashboard.jsx is available.

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import {
  BookOpen,
  Users,
  AlertTriangle,
  Wallet,
  Calendar,
} from "lucide-react-native";

import C from "../../../styles/colors";
import {
  getTrainingDashboard,
  listTrainings,
} from "../../../api/service/trainingApi";
import { getCertifications } from "../../../api/service/trainingApi";
import StatusChip from "../attendance/StatusChip";
import {
  TRAINING_TYPE_CFG,
  fmtNairaCompact,
  fmtShortDate,
} from "../../../hooks/trainingHelpers";
import { Loader } from "../../../hooks/loaderManager";

export default function TrainingDashboardView() {
  const [dash, setDash] = useState<any | null>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Loader.show();
    Promise.all([
      getTrainingDashboard(),
      listTrainings({ limit: 50 }),
      getCertifications(),
    ])
      .then(([dashRes, trainingsRes, certsRes]: any[]) => {
        setDash(dashRes.data);

        const today = new Date().toISOString().split("T")[0];
        const list = (trainingsRes.data ?? [])
          .filter((t: any) => (t.start_date ?? "") >= today)
          .sort((a: any, b: any) =>
            (a.start_date ?? "").localeCompare(b.start_date ?? ""),
          )
          .slice(0, 5);
        setUpcoming(list);

        setExpiringCount(certsRes.expiringCount ?? 0);
      })
      .catch((e: any) =>
        setError(e?.response?.data?.message ?? "Failed to load dashboard."),
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

  if (error || !dash) {
    return (
      <View style={s.errorBox}>
        <Text style={s.errorText}>{error ?? "Failed to load dashboard."}</Text>
      </View>
    );
  }

  const utilization =
    dash.totalCost > 0
      ? Math.round((dash.budgetSpent / dash.totalCost) * 100)
      : 0;

  return (
    <View style={{ gap: 14 }}>
      {/* Stat cards */}
      <View style={s.statsGrid}>
        <View style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: C.primaryLight }]}>
            <BookOpen size={16} color={C.primary} />
          </View>
          <Text style={s.statValue}>
            {dash.totalTrainings ?? upcoming.length}
          </Text>
          <Text style={s.statLabel}>Total Trainings</Text>
        </View>
        <View style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: "#ECFEFF" }]}>
            <Users size={16} color="#06B6D4" />
          </View>
          <Text style={s.statValue}>{dash.activeEnrollments ?? "—"}</Text>
          <Text style={s.statLabel}>Active Enrollments</Text>
        </View>
        <View style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: "#FEF3C7" }]}>
            <Wallet size={16} color="#F59E0B" />
          </View>
          <Text style={s.statValue}>{utilization}%</Text>
          <Text style={s.statLabel}>Budget Used</Text>
        </View>
        <View style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: "#FEE2E2" }]}>
            <AlertTriangle size={16} color="#EF4444" />
          </View>
          <Text style={s.statValue}>{expiringCount}</Text>
          <Text style={s.statLabel}>Expiring Certs</Text>
        </View>
      </View>

      {/* Budget summary strip */}
      <View style={s.budgetCard}>
        <View>
          <Text style={s.budgetLabel}>Total Cost</Text>
          <Text style={s.budgetValue}>{fmtNairaCompact(dash.totalCost)}</Text>
        </View>
        <View style={s.budgetDivider} />
        <View>
          <Text style={s.budgetLabel}>Spent</Text>
          <Text style={[s.budgetValue, { color: "#F59E0B" }]}>
            {fmtNairaCompact(dash.budgetSpent)}
          </Text>
        </View>
      </View>

      {/* Upcoming trainings */}
      <Text style={s.sectionLabel}>Upcoming Trainings</Text>
      {upcoming.length === 0 ? (
        <View style={s.center}>
          <Calendar size={24} color={C.textMuted} />
          <Text style={s.emptyText}>No upcoming trainings scheduled.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {upcoming.map((t) => {
            const cfg = TRAINING_TYPE_CFG[t.type] ?? TRAINING_TYPE_CFG.Internal;
            return (
              <View key={t.id} style={s.upcomingCard}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.upcomingTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={s.upcomingMeta} numberOfLines={1}>
                    {t.provider} · {fmtShortDate(t.start_date)}
                  </Text>
                </View>
                <StatusChip label={t.type} color={cfg.color} bg={cfg.bg} />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: { alignItems: "center", gap: 10, paddingVertical: 32 },
  emptyText: { fontSize: 12, color: C.textMuted, textAlign: "center" },
  errorBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  errorText: { fontSize: 12, color: C.danger },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 18, fontWeight: "800", color: C.textPrimary },
  statLabel: { fontSize: 11, color: C.textMuted },

  budgetCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    backgroundColor: C.navy,
  },
  budgetLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  budgetValue: { fontSize: 18, fontWeight: "800", color: "#fff", marginTop: 2 },
  budgetDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 24,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  upcomingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  upcomingTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  upcomingMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },
});