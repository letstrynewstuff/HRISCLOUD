// // src/components/admin/training/CertificationTrackerView.tsx
// // Mobile equivalent of CertificationTracker.jsx — certifications as cards
// // with an expiring-soon banner, mirroring the web table row-by-row.

// import { useCallback, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   ActivityIndicator,
// } from "react-native";
// import {
//   AlertTriangle,
//   AlertCircle,
//   RefreshCw,
//   Award,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { getCertifications } from "../../../api/service/trainingApi";
// import StatusChip from "../attendance/StatusChip";
// import { CERT_STATUS_CFG, fmtDate } from "../../../hooks/trainingHelpers";

// export default function CertificationTrackerView() {
//   const [certs, setCerts] = useState<any[]>([]);
//   const [expiringCount, setExpiringCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetch = useCallback(() => {
//     setLoading(true);
//     setError(null);
//     getCertifications()
//       .then((res: any) => {
//         setCerts(res.data ?? []);
//         setExpiringCount(res.expiringCount ?? 0);
//       })
//       .catch((e: any) =>
//         setError(
//           e?.response?.data?.message ?? "Failed to load certifications.",
//         ),
//       )
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     fetch();
//   }, [fetch]);

//   return (
//     <View style={{ gap: 14 }}>
//       {expiringCount > 0 && (
//         <View style={s.warningBanner}>
//           <AlertTriangle size={18} color="#D97706" />
//           <Text style={s.warningText}>
//             <Text style={{ fontWeight: "800" }}>{expiringCount}</Text>{" "}
//             certification{expiringCount !== 1 ? "s" : ""} expiring in the next
//             60 days
//           </Text>
//         </View>
//       )}

//       <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
//         <Pressable onPress={fetch} style={s.refreshBtn}>
//           <RefreshCw size={12} color={C.textSecondary} />
//           <Text style={s.refreshBtnText}>Refresh</Text>
//         </Pressable>
//       </View>

//       {error ? (
//         <View style={s.errorBox}>
//           <AlertCircle size={16} color={C.danger} />
//           <Text style={s.errorText}>{error}</Text>
//           <Pressable onPress={fetch} style={s.retryBtn}>
//             <Text style={s.retryBtnText}>Retry</Text>
//           </Pressable>
//         </View>
//       ) : null}

//       {loading ? (
//         <View style={s.center}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       ) : certs.length === 0 ? (
//         <View style={s.center}>
//           <Award size={28} color={C.textMuted} />
//           <Text style={s.emptyText}>No certifications issued yet.</Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {certs.map((cert, i) => {
//             const cfg =
//               CERT_STATUS_CFG[cert.cert_status] ?? CERT_STATUS_CFG.Valid;
//             return (
//               <View key={i} style={s.card}>
//                 <View style={s.cardTop}>
//                   <View style={{ flex: 1, minWidth: 0 }}>
//                     <Text style={s.name} numberOfLines={1}>
//                       {cert.employee_name}
//                     </Text>
//                     <Text style={s.training} numberOfLines={1}>
//                       {cert.training_title}
//                     </Text>
//                   </View>
//                   <StatusChip
//                     label={cert.cert_status}
//                     color={cfg.color}
//                     bg={cfg.bg}
//                   />
//                 </View>
//                 <View style={s.metaRow}>
//                   <Text
//                     style={[
//                       s.expiryText,
//                       { color: cert.expiry_date ? cfg.color : C.textMuted },
//                     ]}
//                   >
//                     {cert.expiry_date
//                       ? `Expires ${fmtDate(cert.expiry_date)}`
//                       : "No expiry"}
//                   </Text>
//                   <View style={s.issuedPill}>
//                     <Text style={s.issuedPillText}>Issued</Text>
//                   </View>
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       )}
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   warningBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: "#FFFBEB",
//     borderWidth: 1,
//     borderColor: "#FDE68A",
//   },
//   warningText: { flex: 1, fontSize: 12, color: "#B45309", lineHeight: 17 },

//   refreshBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 10,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   refreshBtnText: { fontSize: 11, fontWeight: "700", color: C.textSecondary },

//   errorBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: "#FEF2F2",
//   },
//   errorText: { fontSize: 12, color: C.danger, flex: 1 },
//   retryBtn: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     backgroundColor: C.danger,
//   },
//   retryBtnText: { fontSize: 11, fontWeight: "800", color: "#fff" },

//   center: { alignItems: "center", gap: 10, paddingVertical: 48 },
//   emptyText: { fontSize: 13, color: C.textMuted },

//   card: {
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     padding: 14,
//     gap: 10,
//   },
//   cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
//   name: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   training: { fontSize: 12, color: C.textSecondary, marginTop: 1 },

//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   expiryText: { fontSize: 12, fontWeight: "600" },
//   issuedPill: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 999,
//     backgroundColor: "#D1FAE5",
//   },
//   issuedPillText: { fontSize: 11, fontWeight: "700", color: "#059669" },
// });



// src/components/admin/training/CertificationTrackerView.tsx
// Mobile equivalent of CertificationTracker.jsx — certifications as cards
// with an expiring-soon banner, mirroring the web table row-by-row.

import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { AlertTriangle, AlertCircle, RefreshCw, Award } from "lucide-react-native";

import C from "../../../styles/colors";
import { getCertifications } from "../../../api/service/trainingApi";
import StatusChip from "../attendance/StatusChip";
import { CERT_STATUS_CFG, fmtDate } from "../../../hooks/trainingHelpers";
import { Loader } from "../../../hooks/loaderManager";

export default function CertificationTrackerView() {
  const [certs, setCerts] = useState<any[]>([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    Loader.show();
    getCertifications()
      .then((res: any) => {
        setCerts(res.data ?? []);
        setExpiringCount(res.expiringCount ?? 0);
      })
      .catch((e: any) =>
        setError(
          e?.response?.data?.message ?? "Failed to load certifications.",
        ),
      )
      .finally(() => {
        setLoading(false);
        Loader.hide();
      });
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <View style={{ gap: 14 }}>
      {expiringCount > 0 && (
        <View style={s.warningBanner}>
          <AlertTriangle size={18} color="#D97706" />
          <Text style={s.warningText}>
            <Text style={{ fontWeight: "800" }}>{expiringCount}</Text>{" "}
            certification{expiringCount !== 1 ? "s" : ""} expiring in the
            next 60 days
          </Text>
        </View>
      )}

      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Pressable onPress={fetch} style={s.refreshBtn}>
          <RefreshCw size={12} color={C.textSecondary} />
          <Text style={s.refreshBtnText}>Refresh</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={s.errorBox}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={s.errorText}>{error}</Text>
          <Pressable onPress={fetch} style={s.retryBtn}>
            <Text style={s.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : certs.length === 0 ? (
        <View style={s.center}>
          <Award size={28} color={C.textMuted} />
          <Text style={s.emptyText}>No certifications issued yet.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {certs.map((cert, i) => {
            const cfg =
              CERT_STATUS_CFG[cert.cert_status] ?? CERT_STATUS_CFG.Valid;
            return (
              <View key={i} style={s.card}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.name} numberOfLines={1}>
                      {cert.employee_name}
                    </Text>
                    <Text style={s.training} numberOfLines={1}>
                      {cert.training_title}
                    </Text>
                  </View>
                  <StatusChip
                    label={cert.cert_status}
                    color={cfg.color}
                    bg={cfg.bg}
                  />
                </View>
                <View style={s.metaRow}>
                  <Text
                    style={[
                      s.expiryText,
                      { color: cert.expiry_date ? cfg.color : C.textMuted },
                    ]}
                  >
                    {cert.expiry_date
                      ? `Expires ${fmtDate(cert.expiry_date)}`
                      : "No expiry"}
                  </Text>
                  <View style={s.issuedPill}>
                    <Text style={s.issuedPillText}>Issued</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: { flex: 1, fontSize: 12, color: "#B45309", lineHeight: 17 },

  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  refreshBtnText: { fontSize: 11, fontWeight: "700", color: C.textSecondary },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  errorText: { fontSize: 12, color: C.danger, flex: 1 },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: C.danger,
  },
  retryBtnText: { fontSize: 11, fontWeight: "800", color: "#fff" },

  center: { alignItems: "center", gap: 10, paddingVertical: 48 },
  emptyText: { fontSize: 13, color: C.textMuted },

  card: {
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  training: { fontSize: 12, color: C.textSecondary, marginTop: 1 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expiryText: { fontSize: 12, fontWeight: "600" },
  issuedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#D1FAE5",
  },
  issuedPillText: { fontSize: 11, fontWeight: "700", color: "#059669" },
});