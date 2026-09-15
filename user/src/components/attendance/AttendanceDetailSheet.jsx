// // src/components/attendance/AttendanceDetailSheet.jsx
// //
// // Modal showing detail for one attendance entry. Mirrors mobile's
// // AttendanceDetailSheet.tsx — deliberately simpler than the previous
// // web modal (Status, Clock In, Clock Out, Hours Worked, and an
// // "Edited by HR" note if applicable). The old web modal also showed
// // Break Time, Overtime, and Clock-in Location — those are dropped here
// // to match mobile exactly. Say the word if you want any added back.

// import { AnimatePresence, motion as Motion } from "framer-motion";
// import { X } from "lucide-react";
// import StatusBadge from "./StatusBadge";
// import { C } from "./attendanceTheme";

// export default function AttendanceDetailSheet({ entry, onClose }) {
//   if (!entry) return null;

//   const rows = [
//     { label: "Status", value: <StatusBadge status={entry.status} /> },
//     { label: "Clock In", value: entry.clockIn ?? "—" },
//     { label: "Clock Out", value: entry.clockOut ?? "—" },
//     { label: "Hours Worked", value: entry.hoursLabel },
//   ];

//   if (entry.isManuallyEdited) {
//     rows.push({
//       label: "Note",
//       value: "This record was manually corrected by HR",
//     });
//   }

//   return (
//     <AnimatePresence>
//       <Motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center p-5"
//         style={{
//           background: "rgba(15,23,42,0.45)",
//           backdropFilter: "blur(4px)",
//         }}
//         onClick={onClose}
//       >
//         <Motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           className="w-full max-w-[380px] rounded-[22px] p-5"
//           style={{ background: C.surface }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="flex items-center justify-between mb-3.5">
//             <h3
//               className="text-base font-extrabold"
//               style={{ color: C.textPrimary }}
//             >
//               {entry.dateStr}
//             </h3>
//             <button
//               onClick={onClose}
//               className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
//               style={{
//                 background: C.surfaceAlt,
//                 border: "none",
//                 cursor: "pointer",
//               }}
//             >
//               <X size={18} color={C.textMuted} />
//             </button>
//           </div>

//           <div>
//             {rows.map(({ label, value }) => (
//               <div
//                 key={label}
//                 className="flex items-center justify-between py-2.5 border-b last:border-0"
//                 style={{ borderColor: C.border }}
//               >
//                 <span
//                   className="text-[13px]"
//                   style={{ color: C.textSecondary }}
//                 >
//                   {label}
//                 </span>
//                 {typeof value === "string" ? (
//                   <span
//                     className="text-[13px] font-bold"
//                     style={{ color: C.textPrimary }}
//                   >
//                     {value}
//                   </span>
//                 ) : (
//                   value
//                 )}
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={onClose}
//             className="w-full mt-4 py-3 rounded-2xl font-bold text-sm text-white"
//             style={{ background: C.primary, border: "none", cursor: "pointer" }}
//           >
//             Close
//           </button>
//         </Motion.div>
//       </Motion.div>
//     </AnimatePresence>
//   );
// }


// src/components/attendance/AttendanceDetailSheet.jsx
//
// Modal showing detail for one attendance entry. Mirrors mobile's
// AttendanceDetailSheet.tsx — deliberately simpler than the previous
// web modal (Status, Clock In, Clock Out, Hours Worked, and an
// "Edited by HR" note if applicable).

import { AnimatePresence, motion as Motion } from "framer-motion";
import { X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { C } from "../../admin/employeemanagement/sharedData";

export default function AttendanceDetailSheet({ entry, onClose }) {
  if (!entry) return null;

  const rows = [
    { label: "Status", value: <StatusBadge status={entry.status} /> },
    { label: "Clock In", value: entry.clockIn ?? "—" },
    { label: "Clock Out", value: entry.clockOut ?? "—" },
    { label: "Hours Worked", value: entry.hoursLabel },
  ];

  if (entry.isManuallyEdited) {
    rows.push({
      label: "Note",
      value: "This record was manually corrected by HR",
    });
  }

  return (
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-5"
        style={{
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        <Motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-[380px] rounded-[22px] p-5"
          style={{ background: C.surface }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3.5">
            <h3
              className="text-base font-extrabold"
              style={{ color: C.textPrimary }}
            >
              {entry.dateStr}
            </h3>
            <button
              onClick={onClose}
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
              style={{
                background: C.surfaceAlt,
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={18} color={C.textMuted} />
            </button>
          </div>

          <div>
            {rows.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: C.border }}
              >
                <span
                  className="text-[13px]"
                  style={{ color: C.textSecondary }}
                >
                  {label}
                </span>
                {typeof value === "string" ? (
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: C.textPrimary }}
                  >
                    {value}
                  </span>
                ) : (
                  value
                )}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 rounded-2xl font-bold text-sm text-white"
            style={{ background: C.primary, border: "none", cursor: "pointer" }}
          >
            Close
          </button>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
}