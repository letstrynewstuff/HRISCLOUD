// src/admin/reports/AssignReportModal.jsx

// Assumes companyApi.listAdmins() already exists at
// src/api/service/companyApi.js (same convention as employeeApi /
// departmentApi) — adjust the import path below if yours differs.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, X, Check, Loader2 } from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { companyApi } from "../../api/service/companyApi";
import { ReportAvatar, getInitials } from "./reportShared";

export default function AssignReportModal({
  visible,
  currentAssignedId,
  saving,
  onSave,
  onClose,
}) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(currentAssignedId ?? null);

  useEffect(() => {
    if (!visible) return;
    setSelected(currentAssignedId ?? null);
    setLoading(true);
    companyApi
      .listAdmins()
      .then((res) => setAdmins(res?.data ?? res ?? []))
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false));
  }, [visible, currentAssignedId]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
          >
            <div
              className="rounded-2xl bg-white shadow-2xl p-5 space-y-3"
              style={{ border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.primaryLight }}
                >
                  <UserCheck size={16} color={C.primary} />
                </div>
                <p
                  className="font-bold text-sm flex-1"
                  style={{ color: C.textPrimary }}
                >
                  Assign Report
                </p>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: C.surfaceAlt,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <X size={13} color={C.textSecondary} />
                </button>
              </div>

              {loading ? (
                <div className="py-8 flex justify-center">
                  <Loader2
                    size={20}
                    className="animate-spin"
                    color={C.primary}
                  />
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-1.5">
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left"
                    style={{
                      background: !selected ? C.primaryLight : "transparent",
                    }}
                  >
                    <ReportAvatar initials="—" color={C.textMuted} size={32} />
                    <span
                      className="text-xs font-bold flex-1"
                      style={{ color: C.textPrimary }}
                    >
                      Unassigned
                    </span>
                    {!selected && <Check size={15} color={C.primary} />}
                  </button>

                  {admins.map((a) => {
                    const name =
                      `${a.firstName ?? a.first_name ?? ""} ${a.lastName ?? a.last_name ?? ""}`.trim();
                    const active = selected === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelected(a.id)}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left"
                        style={{
                          background: active ? C.primaryLight : "transparent",
                        }}
                      >
                        <ReportAvatar
                          initials={getInitials(name)}
                          color={C.primary}
                          size={32}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-bold truncate"
                            style={{ color: C.textPrimary }}
                          >
                            {name || "HR Admin"}
                          </p>
                          <p
                            className="text-[10px] mt-0.5 truncate"
                            style={{ color: C.textMuted }}
                          >
                            {a.email}
                          </p>
                        </div>
                        {active && <Check size={15} color={C.primary} />}
                      </button>
                    );
                  })}

                  {admins.length === 0 && (
                    <p
                      className="text-xs text-center py-3"
                      style={{ color: C.textMuted }}
                    >
                      No other HR admins found.
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: C.surfaceAlt,
                    color: C.textSecondary,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSave(selected)}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: C.primary, opacity: saving ? 0.85 : 1 }}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
