// src/admin/reports/RevealIdentityModal.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Loader2 } from "lucide-react";
import { C } from "../employeemanagement/sharedData";

export default function RevealIdentityModal({
  visible,
  saving,
  onConfirm,
  onClose,
}) {
  const [reason, setReason] = useState("");

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
              className="rounded-2xl bg-white shadow-2xl p-5 space-y-4"
              style={{ border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.dangerLight }}
                >
                  <ShieldAlert size={17} color={C.danger} />
                </div>
                <p
                  className="font-bold text-sm flex-1"
                  style={{ color: C.textPrimary }}
                >
                  Reveal Reporter Identity
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

              <div
                className="p-3 rounded-xl"
                style={{
                  background: C.dangerLight,
                  border: `1px solid ${C.danger}33`,
                }}
              >
                <p
                  className="text-[11px] leading-relaxed font-semibold"
                  style={{ color: C.danger }}
                >
                  This action is permanently logged and cannot be undone. Only
                  do this for serious cases that genuinely require it.
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: C.textSecondary }}
                >
                  Reason (required)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why identity disclosure is necessary…"
                  rows={3}
                  className="w-full px-3.5 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    background: C.surfaceAlt,
                    border: `1.5px solid ${C.border}`,
                    color: C.textPrimary,
                  }}
                />
              </div>

              <div className="flex gap-3">
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
                  onClick={() => onConfirm(reason.trim())}
                  disabled={saving || !reason.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{
                    background: C.danger,
                    opacity: saving || !reason.trim() ? 0.7 : 1,
                    cursor:
                      saving || !reason.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Reveal Identity"
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
