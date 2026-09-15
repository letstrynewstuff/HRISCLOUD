// src/admin/reports/StatusUpdateModal.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X, Loader2 } from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { STATUS_OPTIONS, getStatusConfig } from "./reportShared";
import SelectField from "../../components/reports/SelectField";

export default function StatusUpdateModal({
  visible,
  currentStatus,
  saving,
  onSave,
  onClose,
}) {
  const [status, setStatus] = useState(currentStatus ?? "submitted");
  const [note, setNote] = useState("");
  const cfg = getStatusConfig(status);
  const isResolving = status === "resolved" || status === "dismissed";

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
                  style={{ background: cfg.light }}
                >
                  <RefreshCw size={16} color={cfg.color} />
                </div>
                <p
                  className="font-bold text-sm flex-1"
                  style={{ color: C.textPrimary }}
                >
                  Update Status
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

              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: C.textSecondary }}
                >
                  New Status
                </label>
                <SelectField
                  value={status}
                  onChange={setStatus}
                  options={STATUS_OPTIONS}
                  placeholder="Select status…"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: C.textSecondary }}
                >
                  {isResolving
                    ? "Resolution Note (recommended)"
                    : "Note (optional)"}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    isResolving
                      ? "Summarize the outcome and any action taken…"
                      : "Add context for this status change…"
                  }
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
                  onClick={() => onSave(status, note)}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: cfg.color, opacity: saving ? 0.85 : 1 }}
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
