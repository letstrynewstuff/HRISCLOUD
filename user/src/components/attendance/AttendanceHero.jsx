// // src/components/attendance/AttendanceHero.jsx
// //
// // Mirrors mobile's AttendanceHero.tsx: status dot + label, date,
// // welcome text, in/out/timer chips, and the clock/break action
// // buttons. The break button hides once `breakCount` reaches 3 — unlike
// // the mobile version, this prop is actually wired up end-to-end (see
// // the backend/mobile diffs delivered alongside this file), so the
// // limit really takes effect here.

// import { motion as Motion } from "framer-motion";
// import {
//   LogIn,
//   LogOut,
//   CheckCircle2,
//   Timer,
//   RefreshCw,
//   Coffee,
//   Play,
// } from "lucide-react";
// import { C } from "./attendanceTheme";
// import LiveTimer from "./LiveTimer";

// function statusMeta(dayStatus) {
//   if (dayStatus === "active") return { color: "#34D399", label: "Clocked In" };
//   if (dayStatus === "on-break") return { color: "#F59E0B", label: "On Break" };
//   if (dayStatus === "done") return { color: C.accent, label: "Day Complete" };
//   return { color: "#F87171", label: "Not Clocked In" };
// }

// function fmtTime(d) {
//   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// }

// export default function AttendanceHero({
//   employeeFirstName,
//   dayStatus,
//   clockInTime,
//   clockOutTime,
//   breakStartTime,
//   breakCount = 0,
//   actionLoading,
//   onPressClock,
//   onPressBreak,
// }) {
//   const { color: statusColor, label: statusLabel } = statusMeta(dayStatus);
//   const clockedIn = dayStatus === "active";
//   const onBreak = dayStatus === "on-break";
//   const done = dayStatus === "done";

//   const today = new Date().toLocaleDateString(undefined, {
//     weekday: "long",
//     month: "long",
//     day: "numeric",
//   });

//   const canShowBreak = breakCount < 3;

//   return (
//     <div
//       className="rounded-[20px] p-[18px] flex flex-col gap-4"
//       style={{ background: C.navy }}
//     >
//       <div className="flex items-center gap-[7px]">
//         <Motion.div
//           animate={{ scale: [1, 1.2, 1] }}
//           transition={{ duration: 2, repeat: Infinity }}
//           className="w-[7px] h-[7px] rounded-full"
//           style={{ background: statusColor }}
//         />
//         <span
//           className="text-[11px] font-bold tracking-widest"
//           style={{ color: statusColor }}
//         >
//           {statusLabel.toUpperCase()}
//         </span>
//       </div>

//       <div>
//         <h1 className="text-white text-[21px] font-extrabold m-0">{today}</h1>
//         <p
//           className="text-[13px] mt-0.5"
//           style={{ color: "rgba(224,225,255,0.85)" }}
//         >
//           {employeeFirstName
//             ? `Welcome back, ${employeeFirstName}`
//             : "Track your working hours"}
//         </p>
//       </div>

//       <div className="flex flex-wrap gap-2">
//         {clockInTime && (
//           <div
//             className="flex items-center gap-1.5 px-2.5 py-[7px] rounded-xl"
//             style={{ background: "rgba(255,255,255,0.10)" }}
//           >
//             <LogIn size={12} color="rgba(255,255,255,0.7)" />
//             <span
//               className="text-xs"
//               style={{ color: "rgba(255,255,255,0.8)" }}
//             >
//               In:{" "}
//               <span className="text-white font-bold">
//                 {fmtTime(clockInTime)}
//               </span>
//             </span>
//           </div>
//         )}
//         {clockOutTime && (
//           <div
//             className="flex items-center gap-1.5 px-2.5 py-[7px] rounded-xl"
//             style={{ background: "rgba(255,255,255,0.10)" }}
//           >
//             <LogOut size={12} color="rgba(255,255,255,0.7)" />
//             <span
//               className="text-xs"
//               style={{ color: "rgba(255,255,255,0.8)" }}
//             >
//               Out:{" "}
//               <span className="text-white font-bold">
//                 {fmtTime(clockOutTime)}
//               </span>
//             </span>
//           </div>
//         )}
//         {clockedIn && clockInTime && (
//           <div
//             className="flex items-center gap-1.5 px-2.5 py-[7px] rounded-xl"
//             style={{
//               background: "rgba(16,185,129,0.2)",
//               border: "1px solid rgba(16,185,129,0.3)",
//             }}
//           >
//             <Timer size={12} color="#6EE7B7" />
//             <LiveTimer
//               startTime={clockInTime}
//               className="text-xs"
//               style={{ color: "#6EE7B7" }}
//             />
//           </div>
//         )}
//         {onBreak && breakStartTime && (
//           <div
//             className="flex items-center gap-1.5 px-2.5 py-[7px] rounded-xl"
//             style={{
//               background: "rgba(245,158,11,0.2)",
//               border: "1px solid rgba(245,158,11,0.3)",
//             }}
//           >
//             <Coffee size={12} color="#FCD34D" />
//             <LiveTimer
//               startTime={breakStartTime}
//               className="text-xs"
//               style={{ color: "#FCD34D" }}
//             />
//           </div>
//         )}
//       </div>

//       <div className="flex gap-2.5">
//         {(clockedIn || onBreak) && canShowBreak && (
//           <button
//             onClick={onPressBreak}
//             disabled={actionLoading}
//             className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl font-bold text-[12.5px] text-white"
//             style={{
//               background: onBreak
//                 ? "rgba(16,185,129,0.9)"
//                 : "rgba(245,158,11,0.9)",
//               border: "none",
//               cursor: actionLoading ? "not-allowed" : "pointer",
//               opacity: actionLoading ? 0.6 : 1,
//             }}
//           >
//             {actionLoading ? (
//               <RefreshCw size={14} className="animate-spin" />
//             ) : onBreak ? (
//               <Play size={14} />
//             ) : (
//               <Coffee size={14} />
//             )}
//             {onBreak ? "End Break" : "Start Break"}
//           </button>
//         )}

//         <button
//           onClick={onPressClock}
//           disabled={done || actionLoading}
//           className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl font-extrabold text-[13px] text-white"
//           style={{
//             background: done
//               ? "rgba(255,255,255,0.12)"
//               : onBreak
//                 ? "#10B981"
//                 : clockedIn
//                   ? "#EF4444"
//                   : "#10B981",
//             border: "none",
//             minWidth: 120,
//             flex: (clockedIn || onBreak) && canShowBreak ? 1 : undefined,
//             opacity: done || actionLoading ? 0.6 : 1,
//             cursor: done || actionLoading ? "not-allowed" : "pointer",
//           }}
//         >
//           {actionLoading ? (
//             <RefreshCw size={14} className="animate-spin" />
//           ) : done ? (
//             <CheckCircle2 size={14} />
//           ) : onBreak ? (
//             <LogIn size={14} />
//           ) : clockedIn ? (
//             <LogOut size={14} />
//           ) : (
//             <LogIn size={14} />
//           )}
//           {done
//             ? "Day Complete"
//             : onBreak
//               ? "Resume Work"
//               : clockedIn
//                 ? "Clock Out"
//                 : "Clock In"}
//         </button>
//       </div>
//     </div>
//   );
// }


// src/components/attendance/AttendanceHero.jsx
//
// Web-style hero banner that matches the rest of the dashboard
// (gradient background, icon header, info chips, action buttons).
// Uses the shared admin theme for colors.

import { motion as Motion } from "framer-motion";
import {
  LogIn,
  LogOut,
  CheckCircle2,
  Timer,
  RefreshCw,
  Coffee,
  Play,
  Clock,
} from "lucide-react";
import { C } from "../../admin/employeemanagement/sharedData";
import LiveTimer from "./LiveTimer";

function statusMeta(dayStatus) {
  if (dayStatus === "active") return { color: "#34D399", label: "Clocked In" };
  if (dayStatus === "on-break") return { color: "#FBBF24", label: "On Break" };
  if (dayStatus === "done") return { color: "#22D3EE", label: "Day Complete" };
  return { color: "#F87171", label: "Not Clocked In" };
}

function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AttendanceHero({
  employeeFirstName,
  dayStatus,
  clockInTime,
  clockOutTime,
  breakStartTime,
  breakCount = 0,
  actionLoading,
  onPressClock,
  onPressBreak,
}) {
  const { color: statusColor, label: statusLabel } = statusMeta(dayStatus);
  const clockedIn = dayStatus === "active";
  const onBreak = dayStatus === "on-break";
  const done = dayStatus === "done";

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const canShowBreak = breakCount < 3;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg,#1E1B4B 0%,#312E81 55%,#1E40AF 100%)",
        minHeight: 140,
      }}
    >
      <div className="relative p-6 md:p-8 flex flex-col gap-5">
        {/* Header row: icon + status/date + welcome */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
              <Clock size={20} color="white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full"
                  style={{ background: statusColor }}
                />
                <span className="text-white/70 text-xs font-bold tracking-widest uppercase">
                  {statusLabel}
                </span>
              </div>
              <h1 className="text-white text-lg font-bold mt-0.5">
                {today}
              </h1>
            </div>
          </div>
          <p className="text-indigo-200 text-sm sm:text-right">
            {employeeFirstName
              ? `Welcome back, ${employeeFirstName}`
              : "Track your working hours"}
          </p>
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2">
          {clockInTime && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
              <LogIn size={12} color="rgba(255,255,255,0.7)" />
              <span className="text-white/80 text-xs">
                In: <strong className="text-white">{fmtTime(clockInTime)}</strong>
              </span>
            </div>
          )}
          {clockOutTime && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
              <LogOut size={12} color="rgba(255,255,255,0.7)" />
              <span className="text-white/80 text-xs">
                Out: <strong className="text-white">{fmtTime(clockOutTime)}</strong>
              </span>
            </div>
          )}
          {clockedIn && clockInTime && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: "rgba(16,185,129,0.2)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >
              <Timer size={12} color="#6EE7B7" />
              <LiveTimer
                startTime={clockInTime}
                className="text-xs"
                style={{ color: "#6EE7B7" }}
              />
            </div>
          )}
          {onBreak && breakStartTime && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: "rgba(245,158,11,0.2)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <Coffee size={12} color="#FCD34D" />
              <LiveTimer
                startTime={breakStartTime}
                className="text-xs"
                style={{ color: "#FCD34D" }}
              />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5">
          {(clockedIn || onBreak) && canShowBreak && (
            <Motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onPressBreak}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl font-bold text-[12.5px] text-white"
              style={{
                background: onBreak
                  ? "rgba(16,185,129,0.9)"
                  : "rgba(245,158,11,0.9)",
                border: "none",
                cursor: actionLoading ? "not-allowed" : "pointer",
                opacity: actionLoading ? 0.6 : 1,
              }}
            >
              {actionLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : onBreak ? (
                <Play size={14} />
              ) : (
                <Coffee size={14} />
              )}
              {onBreak ? "End Break" : "Start Break"}
            </Motion.button>
          )}

          <Motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPressClock}
            disabled={done || actionLoading}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl font-extrabold text-[13px] text-white"
            style={{
              background: done
                ? "rgba(255,255,255,0.12)"
                : onBreak
                  ? "#10B981"
                  : clockedIn
                    ? "#EF4444"
                    : "#10B981",
              border: "none",
              minWidth: 120,
              flex: (clockedIn || onBreak) && canShowBreak ? 1 : undefined,
              opacity: done || actionLoading ? 0.6 : 1,
              cursor: done || actionLoading ? "not-allowed" : "pointer",
            }}
          >
            {actionLoading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : done ? (
              <CheckCircle2 size={14} />
            ) : onBreak ? (
              <LogIn size={14} />
            ) : clockedIn ? (
              <LogOut size={14} />
            ) : (
              <LogIn size={14} />
            )}
            {done
              ? "Day Complete"
              : onBreak
                ? "Resume Work"
                : clockedIn
                  ? "Clock Out"
                  : "Clock In"}
          </Motion.button>
        </div>
      </div>
    </Motion.div>
  );
}