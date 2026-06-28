// // src/components/timesheets/EntryCard.jsx
// import { motion as Motion } from "framer-motion";
// import { Edit2, Trash2, Lock, AlertCircle, Tag } from "lucide-react";
// import StatusBadge from "./StatusBadge";
// import { C } from "../../admin/employeemanagement/sharedData";

// function fmtTime(t) {
//   if (!t) return "—";
//   const [h, m] = t.slice(0, 5).split(":").map(Number);
//   const ampm = h >= 12 ? "PM" : "AM";
//   const h12 = h % 12 || 12;
//   return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
// }

// function fmtDuration(mins) {
//   if (!mins) return "—";
//   const h = Math.floor(mins / 60);
//   const m = mins % 60;
//   return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
// }

// export default function EntryCard({
//   entry,
//   selected,
//   onSelect,
//   onEdit,
//   onDelete,
// }) {
//   const isDraft = entry.status === "Draft";
//   const isRejected = entry.status === "Rejected";
//   const canEdit = isDraft || isRejected;
//   const isLocked = entry.status === "Submitted" || entry.status === "Approved";

//   return (
//     <Motion.div
//       layout
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.97 }}
//       className="rounded-xl p-4 relative"
//       style={{
//         background: C.surface,
//         border: `1.5px solid ${selected ? C.primary : isRejected ? "#FECACA" : C.border}`,
//         boxShadow: selected
//           ? `0 0 0 3px ${C.primary}22`
//           : "0 1px 3px rgba(0,0,0,0.06)",
//         transition: "border-color 0.15s, box-shadow 0.15s",
//       }}
//     >
//       {/* Rejection reason banner */}
//       {isRejected && entry.rejectionReason && (
//         <div
//           className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg text-xs"
//           style={{ background: "#FEE2E2", color: "#DC2626" }}
//         >
//           <AlertCircle size={13} className="shrink-0 mt-0.5" />
//           <span>
//             <strong>Rejected:</strong> {entry.rejectionReason}
//           </span>
//         </div>
//       )}

//       <div className="flex items-start gap-3">
//         {/* Checkbox — only for draft entries */}
//         {isDraft && (
//           <input
//             type="checkbox"
//             checked={selected}
//             onChange={() => onSelect(entry.id)}
//             className="mt-1 cursor-pointer accent-indigo-600"
//             style={{ width: 16, height: 16, flexShrink: 0 }}
//           />
//         )}

//         <div className="flex-1 min-w-0">
//           {/* Time + duration row */}
//           <div className="flex flex-wrap items-center gap-2 mb-1.5">
//             <span
//               className="text-sm font-bold"
//               style={{ color: C.textPrimary }}
//             >
//               {fmtTime(entry.startTime)} — {fmtTime(entry.endTime)}
//             </span>
//             <span
//               className="text-xs px-2 py-0.5 rounded-full font-medium"
//               style={{ background: "#F3F4F6", color: C.textSecondary }}
//             >
//               {fmtDuration(entry.durationMinutes)}
//             </span>
//           </div>

//           {/* Description */}
//           <p
//             className="text-sm leading-relaxed mb-2"
//             style={{ color: C.textSecondary }}
//           >
//             {entry.description}
//           </p>

//           {/* Tags + badge row */}
//           <div className="flex flex-wrap items-center gap-2">
//             <StatusBadge status={entry.status} size="xs" />
//             {entry.projectTag && (
//               <span
//                 className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
//                 style={{ background: "#EEF2FF", color: C.primary }}
//               >
//                 <Tag size={10} />
//                 {entry.projectTag}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex items-center gap-1.5 shrink-0 ml-2">
//           {isLocked && (
//             <div
//               title="Submitted entries cannot be edited"
//               className="w-7 h-7 rounded-lg flex items-center justify-center"
//               style={{ background: "#F9FAFB", cursor: "not-allowed" }}
//             >
//               <Lock size={13} color={C.textMuted} />
//             </div>
//           )}
//           {canEdit && (
//             <>
//               <Motion.button
//                 whileHover={{ scale: 1.08 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => onEdit(entry)}
//                 className="w-7 h-7 rounded-lg flex items-center justify-center"
//                 style={{ background: "#EEF2FF" }}
//                 title="Edit entry"
//               >
//                 <Edit2 size={13} color={C.primary} />
//               </Motion.button>
//               {isDraft && (
//                 <Motion.button
//                   whileHover={{ scale: 1.08 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => onDelete(entry.id)}
//                   className="w-7 h-7 rounded-lg flex items-center justify-center"
//                   style={{ background: "#FEE2E2" }}
//                   title="Delete entry"
//                 >
//                   <Trash2 size={13} color="#DC2626" />
//                 </Motion.button>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </Motion.div>
//   );
// }

// src/components/timesheets/EntryCard.jsx
import { motion as Motion } from "framer-motion";
import { Edit2, Trash2, Lock, AlertCircle, Tag, Send } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { C } from "../../admin/employeemanagement/sharedData";

function fmtTime(t) {
  if (!t) return "—";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function fmtDuration(mins) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
}

export default function EntryCard({
  entry,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSubmit,   // ✅ NEW: inline submit handler for single Draft entry
}) {
  const isDraft    = entry.status === "Draft";
  const isRejected = entry.status === "Rejected";
  const canEdit    = isDraft || isRejected;
  const isLocked   = entry.status === "Submitted" || entry.status === "Approved";

  return (
    <Motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-xl p-4 relative"
      style={{
        background: C.surface,
        border: `1.5px solid ${
          selected        ? C.primary  :
          isRejected      ? "#FECACA"  :
          C.border
        }`,
        boxShadow: selected
          ? `0 0 0 3px ${C.primary}22`
          : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      {/* Rejection reason banner */}
      {isRejected && entry.rejectionReason && (
        <div
          className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg text-xs"
          style={{ background: "#FEE2E2", color: "#DC2626" }}
        >
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>
            <strong>Rejected:</strong> {entry.rejectionReason}
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Checkbox — only for draft entries */}
        {isDraft && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(entry.id)}
            className="mt-1 cursor-pointer accent-indigo-600"
            style={{ width: 16, height: 16, flexShrink: 0 }}
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Time + duration row */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-bold" style={{ color: C.textPrimary }}>
              {fmtTime(entry.startTime)} — {fmtTime(entry.endTime)}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#F3F4F6", color: C.textSecondary }}
            >
              {fmtDuration(entry.durationMinutes)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-2" style={{ color: C.textSecondary }}>
            {entry.description}
          </p>

          {/* Tags + badge row */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.status} size="xs" />
            {entry.projectTag && (
              <span
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#EEF2FF", color: C.primary }}
              >
                <Tag size={10} />
                {entry.projectTag}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* Locked indicator for Submitted/Approved */}
          {isLocked && (
            <div
              title={`${entry.status} — cannot be edited`}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#F9FAFB", cursor: "not-allowed" }}
            >
              <Lock size={13} color={C.textMuted} />
            </div>
          )}

          {/* Draft actions: submit inline, edit, delete */}
          {isDraft && (
            <>
              {/* ✅ NEW: Inline submit button — makes it obvious entries need submitting */}
              <Motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSubmit(entry.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#EEF2FF" }}
                title="Submit for approval"
              >
                <Send size={13} color={C.primary} />
              </Motion.button>

              <Motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(entry)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#F3F4F6" }}
                title="Edit entry"
              >
                <Edit2 size={13} color={C.textSecondary} />
              </Motion.button>

              <Motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(entry.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#FEE2E2" }}
                title="Delete entry"
              >
                <Trash2 size={13} color="#DC2626" />
              </Motion.button>
            </>
          )}

          {/* Rejected actions: edit only (re-submit happens via edit modal) */}
          {isRejected && (
            <Motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(entry)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#EEF2FF" }}
              title="Edit and resubmit"
            >
              <Edit2 size={13} color={C.primary} />
            </Motion.button>
          )}
        </div>
      </div>
    </Motion.div>
  );
}
