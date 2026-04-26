// // src/admin/attendance/ShiftManagement.jsx
// import { useState, useEffect } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import { Plus, Edit2, X, RefreshCw } from "lucide-react";
// import { attendanceApi } from "../../api/service/attendanceApi";
// import { C } from "../employeemanagement/sharedData";

// const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const EMPTY_FORM = {
//   name: "",
//   description: "",
//   startTime: "",
//   endTime: "",
//   days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
// };

// export default function ShiftManagement() {
//   const [shifts, setShifts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState(null); // shift object being edited
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [saving, setSaving] = useState(false);
//   const [formError, setFormError] = useState("");

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await attendanceApi.getShifts();
//       setShifts(res.shifts ?? []);
//     } catch {
//       setError("Failed to load shifts.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const openCreate = () => {
//     setEditing(null);
//     setForm(EMPTY_FORM);
//     setFormError("");
//     setShowModal(true);
//   };

//   const openEdit = (shift) => {
//     setEditing(shift);
//     setForm({
//       name: shift.name ?? "",
//       description: shift.description ?? "",
//       startTime: shift.start_time ?? shift.startTime ?? "",
//       endTime: shift.end_time ?? shift.endTime ?? "",
//       days: shift.days ?? [],
//     });
//     setFormError("");
//     setShowModal(true);
//   };

//   const toggleDay = (day) => {
//     setForm((f) => ({
//       ...f,
//       days: f.days.includes(day)
//         ? f.days.filter((d) => d !== day)
//         : [...f.days, day],
//     }));
//   };

//   const handleSave = async () => {
//     if (!form.name.trim() || !form.startTime || !form.endTime) {
//       setFormError("Name, start time and end time are required.");
//       return;
//     }
//     if (form.days.length === 0) {
//       setFormError("Select at least one working day.");
//       return;
//     }
//     setSaving(true);
//     setFormError("");
//     try {
//       if (editing) {
//         const res = await attendanceApi.updateShift(editing.id, form);
//         setShifts((prev) =>
//           prev.map((s) =>
//             s.id === editing.id ? (res.shift ?? { ...s, ...form }) : s,
//           ),
//         );
//       } else {
//         const res = await attendanceApi.createShift(form);
//         setShifts((prev) => [...prev, res.shift]);
//       }
//       setShowModal(false);
//     } catch (err) {
//       setFormError(err?.response?.data?.message ?? "Failed to save shift.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const shiftType = (shift) => {
//     const h = parseInt(
//       (shift.start_time ?? shift.startTime ?? "08:00").split(":")[0],
//       10,
//     );
//     if (h < 6) return { label: "Night", bg: "#FEE2E2", color: "#EF4444" };
//     if (h < 12) return { label: "Morning", bg: "#D1FAE5", color: "#10B981" };
//     if (h < 17) return { label: "Afternoon", bg: "#FEF3C7", color: "#F59E0B" };
//     return { label: "Evening", bg: "#EDE9FE", color: "#8B5CF6" };
//   };

//   return (
//     <Motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0 }}
//       className="space-y-4"
//     >
//       <div className="flex justify-between items-center">
//         <h2 className="text-base font-bold" style={{ color: C.textPrimary }}>
//           Shift Patterns
//         </h2>
//         <Motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           onClick={openCreate}
//           className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
//           style={{ background: C.primary, color: "#fff" }}
//         >
//           <Plus size={15} /> New Shift
//         </Motion.button>
//       </div>

//       <div
//         className="rounded-2xl overflow-hidden"
//         style={{ background: C.surface, border: `1px solid ${C.border}` }}
//       >
//         {loading ? (
//           <div className="flex items-center justify-center py-16">
//             <RefreshCw
//               size={22}
//               className="animate-spin"
//               style={{ color: C.primary }}
//             />
//           </div>
//         ) : error ? (
//           <div
//             className="py-12 text-center text-sm"
//             style={{ color: C.danger }}
//           >
//             {error}
//           </div>
//         ) : shifts.length === 0 ? (
//           <div
//             className="py-12 text-center text-sm"
//             style={{ color: C.textMuted }}
//           >
//             No shifts created yet.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr
//                   style={{
//                     background: C.surfaceAlt,
//                     borderBottom: `1px solid ${C.border}`,
//                   }}
//                 >
//                   {[
//                     "Shift Name",
//                     "Start",
//                     "End",
//                     "Days",
//                     "Type",
//                     "Actions",
//                   ].map((h) => (
//                     <th
//                       key={h}
//                       className="px-4 py-3 text-left text-xs font-bold uppercase"
//                       style={{ color: C.textMuted }}
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {shifts.map((shift) => {
//                   const type = shiftType(shift);
//                   return (
//                     <tr
//                       key={shift.id}
//                       className="border-b"
//                       style={{ borderColor: C.border }}
//                     >
//                       <td
//                         className="px-4 py-3 font-semibold text-sm"
//                         style={{ color: C.textPrimary }}
//                       >
//                         {shift.name}
//                       </td>
//                       <td className="px-4 py-3 font-mono text-sm">
//                         {shift.start_time ?? shift.startTime}
//                       </td>
//                       <td className="px-4 py-3 font-mono text-sm">
//                         {shift.end_time ?? shift.endTime}
//                       </td>
//                       <td
//                         className="px-4 py-3 text-sm"
//                         style={{ color: C.textSecondary }}
//                       >
//                         {(shift.days ?? []).join(", ")}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className="text-xs px-2.5 py-1 rounded-full font-semibold"
//                           style={{ background: type.bg, color: type.color }}
//                         >
//                           {type.label}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <Motion.button
//                           whileHover={{ scale: 1.05 }}
//                           onClick={() => openEdit(shift)}
//                           className="p-2 rounded-lg"
//                           style={{
//                             background: C.primaryLight,
//                             color: C.primary,
//                           }}
//                         >
//                           <Edit2 size={14} />
//                         </Motion.button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       <AnimatePresence>
//         {showModal && (
//           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <Motion.div
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               className="w-full max-w-md rounded-2xl p-6 space-y-4"
//               style={{ background: C.surface, border: `1px solid ${C.border}` }}
//             >
//               <div className="flex items-center justify-between">
//                 <h3
//                   className="font-bold text-lg"
//                   style={{ color: C.textPrimary }}
//                 >
//                   {editing ? "Edit Shift" : "New Shift"}
//                 </h3>
//                 <button onClick={() => setShowModal(false)}>
//                   <X size={18} color={C.textMuted} />
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 <div>
//                   <label
//                     className="block text-xs font-semibold mb-1"
//                     style={{ color: C.textPrimary }}
//                   >
//                     Shift Name <span style={{ color: C.danger }}>*</span>
//                   </label>
//                   <input
//                     value={form.name}
//                     onChange={(e) =>
//                       setForm((f) => ({ ...f, name: e.target.value }))
//                     }
//                     placeholder="e.g. Morning Shift"
//                     className="w-full p-2.5 rounded-xl outline-none text-sm"
//                     style={{
//                       background: C.surfaceAlt,
//                       border: `1.5px solid ${C.border}`,
//                       color: C.textPrimary,
//                     }}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label
//                       className="block text-xs font-semibold mb-1"
//                       style={{ color: C.textPrimary }}
//                     >
//                       Start Time <span style={{ color: C.danger }}>*</span>
//                     </label>
//                     <input
//                       type="time"
//                       value={form.startTime}
//                       onChange={(e) =>
//                         setForm((f) => ({ ...f, startTime: e.target.value }))
//                       }
//                       className="w-full p-2.5 rounded-xl outline-none text-sm"
//                       style={{
//                         background: C.surfaceAlt,
//                         border: `1.5px solid ${C.border}`,
//                         color: C.textPrimary,
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label
//                       className="block text-xs font-semibold mb-1"
//                       style={{ color: C.textPrimary }}
//                     >
//                       End Time <span style={{ color: C.danger }}>*</span>
//                     </label>
//                     <input
//                       type="time"
//                       value={form.endTime}
//                       onChange={(e) =>
//                         setForm((f) => ({ ...f, endTime: e.target.value }))
//                       }
//                       className="w-full p-2.5 rounded-xl outline-none text-sm"
//                       style={{
//                         background: C.surfaceAlt,
//                         border: `1.5px solid ${C.border}`,
//                         color: C.textPrimary,
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     className="block text-xs font-semibold mb-2"
//                     style={{ color: C.textPrimary }}
//                   >
//                     Working Days
//                   </label>
//                   <div className="flex flex-wrap gap-2">
//                     {DAYS.map((day) => {
//                       const active = form.days.includes(day);
//                       return (
//                         <button
//                           key={day}
//                           type="button"
//                           onClick={() => toggleDay(day)}
//                           className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
//                           style={{
//                             background: active ? C.primary : C.surfaceAlt,
//                             color: active ? "#fff" : C.textSecondary,
//                             border: `1px solid ${active ? C.primary : C.border}`,
//                           }}
//                         >
//                           {day}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     className="block text-xs font-semibold mb-1"
//                     style={{ color: C.textPrimary }}
//                   >
//                     Description
//                   </label>
//                   <textarea
//                     value={form.description}
//                     onChange={(e) =>
//                       setForm((f) => ({ ...f, description: e.target.value }))
//                     }
//                     rows={2}
//                     placeholder="Optional description..."
//                     className="w-full p-2.5 rounded-xl outline-none text-sm resize-none"
//                     style={{
//                       background: C.surfaceAlt,
//                       border: `1.5px solid ${C.border}`,
//                       color: C.textPrimary,
//                     }}
//                   />
//                 </div>
//               </div>

//               {formError && (
//                 <p className="text-xs font-medium" style={{ color: C.danger }}>
//                   {formError}
//                 </p>
//               )}

//               <div className="flex gap-3 pt-1">
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="flex-1 py-3 rounded-xl font-semibold text-sm"
//                   style={{ background: C.surfaceAlt, color: C.textSecondary }}
//                 >
//                   Cancel
//                 </button>
//                 <Motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
//                   style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
//                 >
//                   {saving ? (
//                     <>
//                       <RefreshCw size={14} className="animate-spin" /> Saving...
//                     </>
//                   ) : editing ? (
//                     "Update Shift"
//                   ) : (
//                     "Create Shift"
//                   )}
//                 </Motion.button>
//               </div>
//             </Motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </Motion.div>
//   );
// }



// src/admin/attendance/ShiftManagement.jsx
import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, X, RefreshCw } from "lucide-react";
import { attendanceApi } from "../../api/service/attendanceApi";
import { C } from "../employeemanagement/sharedData";
import Loader from "../../components/Loader";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EMPTY_FORM = {
  name: "",
  description: "",
  startTime: "",
  endTime: "",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
};

export default function ShiftManagement() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.getShifts();
      setShifts(res.shifts ?? []);
    } catch {
      setError("Failed to load shifts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (shift) => {
    setEditing(shift);
    setForm({
      name: shift.name ?? "",
      description: shift.description ?? "",
      startTime: shift.start_time ?? shift.startTime ?? "",
      endTime: shift.end_time ?? shift.endTime ?? "",
      days: shift.days ?? [],
    });
    setFormError("");
    setShowModal(true);
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day)
        ? f.days.filter((d) => d !== day)
        : [...f.days, day],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.startTime || !form.endTime) {
      setFormError("Name, start time and end time are required.");
      return;
    }
    if (form.days.length === 0) {
      setFormError("Select at least one working day.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        const res = await attendanceApi.updateShift(editing.id, form);
        setShifts((prev) =>
          prev.map((s) =>
            s.id === editing.id ? (res.shift ?? { ...s, ...form }) : s,
          ),
        );
      } else {
        const res = await attendanceApi.createShift(form);
        setShifts((prev) => [...prev, res.shift]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err?.response?.data?.message ?? "Failed to save shift.");
    } finally {
      setSaving(false);
    }
  };

  const shiftType = (shift) => {
    const h = parseInt(
      (shift.start_time ?? shift.startTime ?? "08:00").split(":")[0],
      10,
    );
    if (h < 6) return { label: "Night", bg: "#FEE2E2", color: "#EF4444" };
    if (h < 12) return { label: "Morning", bg: "#D1FAE5", color: "#10B981" };
    if (h < 17) return { label: "Afternoon", bg: "#FEF3C7", color: "#F59E0B" };
    return { label: "Evening", bg: "#EDE9FE", color: "#8B5CF6" };
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold" style={{ color: C.textPrimary }}>
          Shift Patterns
        </h2>
        <Motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
          style={{ background: C.primary, color: "#fff" }}
        >
          <Plus size={15} /> New Shift
        </Motion.button>
      </div>

      {/* <div
        className="rounded-2xl overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      > */}
            <div
              className="rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
        {loading ? (
          <Loader />   
        ) : error ? (
          <div
            className="py-12 text-center text-sm"
            style={{ color: C.danger }}
          >
            {error}
          </div>
        ) : shifts.length === 0 ? (
          <div
            className="py-12 text-center text-sm"
            style={{ color: C.textMuted }}
          >
            No shifts created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: C.surfaceAlt,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {[
                    "Shift Name",
                    "Start",
                    "End",
                    "Days",
                    "Type",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold uppercase"
                      style={{ color: C.textMuted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => {
                  const type = shiftType(shift);
                  return (
                    <tr
                      key={shift.id}
                      className="border-b"
                      style={{ borderColor: C.border }}
                    >
                      <td
                        className="px-4 py-3 font-semibold text-sm"
                        style={{ color: C.textPrimary }}
                      >
                        {shift.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {shift.start_time ?? shift.startTime}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {shift.end_time ?? shift.endTime}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: C.textSecondary }}
                      >
                        {(shift.days ?? []).join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{ background: type.bg, color: type.color }}
                        >
                          {type.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => openEdit(shift)}
                          className="p-2 rounded-lg"
                          style={{
                            background: C.primaryLight,
                            color: C.primary,
                          }}
                        >
                          <Edit2 size={14} />
                        </Motion.button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Unchanged */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6 space-y-4"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center justify-between">
                <h3
                  className="font-bold text-lg"
                  style={{ color: C.textPrimary }}
                >
                  {editing ? "Edit Shift" : "New Shift"}
                </h3>
                <button onClick={() => setShowModal(false)}>
                  <X size={18} color={C.textMuted} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: C.textPrimary }}
                  >
                    Shift Name <span style={{ color: C.danger }}>*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Morning Shift"
                    className="w-full p-2.5 rounded-xl outline-none text-sm"
                    style={{
                      background: C.surfaceAlt,
                      border: `1.5px solid ${C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1"
                      style={{ color: C.textPrimary }}
                    >
                      Start Time <span style={{ color: C.danger }}>*</span>
                    </label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startTime: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl outline-none text-sm"
                      style={{
                        background: C.surfaceAlt,
                        border: `1.5px solid ${C.border}`,
                        color: C.textPrimary,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1"
                      style={{ color: C.textPrimary }}
                    >
                      End Time <span style={{ color: C.danger }}>*</span>
                    </label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endTime: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl outline-none text-sm"
                      style={{
                        background: C.surfaceAlt,
                        border: `1.5px solid ${C.border}`,
                        color: C.textPrimary,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-2"
                    style={{ color: C.textPrimary }}
                  >
                    Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => {
                      const active = form.days.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
                          style={{
                            background: active ? C.primary : C.surfaceAlt,
                            color: active ? "#fff" : C.textSecondary,
                            border: `1px solid ${active ? C.primary : C.border}`,
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: C.textPrimary }}
                  >
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={2}
                    placeholder="Optional description..."
                    className="w-full p-2.5 rounded-xl outline-none text-sm resize-none"
                    style={{
                      background: C.surfaceAlt,
                      border: `1.5px solid ${C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs font-medium" style={{ color: C.danger }}>
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: C.surfaceAlt, color: C.textSecondary }}
                >
                  Cancel
                </button>
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Saving...
                    </>
                  ) : editing ? (
                    "Update Shift"
                  ) : (
                    "Create Shift"
                  )}
                </Motion.button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}