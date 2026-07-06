// // src/app/admin/reports.tsx
// // HR Admin Reports screen — thin router that switches between the report
// // list and the report detail view, mirroring the view-switching pattern
// // used in src/app/admin/employees.tsx and src/app/admin/departments.tsx.
// //
// // The heavy lifting already lives in the existing components:
// //   src/components/admin/reports/ReportsListView.tsx
// //   src/components/admin/reports/ReportDetailView.tsx
// // (which itself owns StatusUpdateModal, AssignReportModal, AddNoteModal,
// // and RevealIdentityModal) — so this file just wires them together.

// import { useState } from "react";
// import { View, StyleSheet } from "react-native";
// import { router } from "expo-router";

// import C from "../../styles/colors";
// import ReportsListView from "../../components/admin/reports/ReportsListView";
// import ReportDetailView from "../../components/admin/reports/ReportDetailView";

// export default function AdminReportsScreen() {
//   const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

//   if (selectedReportId) {
//     return (
//       <View style={styles.screen}>
//         <ReportDetailView
//           reportId={selectedReportId}
//           onClose={() => setSelectedReportId(null)}
//         />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.screen}>
//       <ReportsListView
//         onClose={() => router.back()}
//         onViewReport={(id) => setSelectedReportId(id)}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
// });


// src/app/admin/reports.tsx
// HR Admin Reports screen — thin router that switches between the report
// list and the report detail view, mirroring the view-switching pattern
// used in src/app/admin/employees.tsx and src/app/admin/departments.tsx.
//
// The heavy lifting already lives in the existing components:
//   src/components/admin/reports/ReportsListView.tsx
//   src/components/admin/reports/ReportDetailView.tsx
// (which itself owns StatusUpdateModal, AssignReportModal, AddNoteModal,
// and RevealIdentityModal) — so this file just wires them together.

import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";

import C from "../../styles/colors";
import { Loader } from "../../hooks/loaderManager";

import ReportsListView from "../../components/admin/reports/ReportsListView";
import ReportDetailView from "../../components/admin/reports/ReportDetailView";

export default function AdminReportsScreen() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  if (selectedReportId) {
    return (
      <View style={styles.screen}>
        <ReportDetailView
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ReportsListView
        onClose={() => router.back()}
        onViewReport={(id) => setSelectedReportId(id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
});