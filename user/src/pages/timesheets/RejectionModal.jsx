// src/components/timesheets/RejectionModal.jsx
import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { C } from "../../admin/employeemanagement/sharedData";

export default function RejectionModal({
  open,
  entryId,
  onConfirm,
  onClose,
  loading,
}) {
  const [reason, setReason] = useState("");

  function handleClose() {
    setReason("");
    onClose();
  }

  function handleConfirm() {
    if (!reason.trim()) return;
    onConfirm(entryId, reason.trim());
  }

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
          }}
          onClick={handleClose}
        >
          <Motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#FEE2E2" }}
                >
                  <AlertCircle size={20} color="#DC2626" />
                </div>
                <div>
                  <h3
                    className="font-bold text-base"
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    Reject Entry
                  </h3>
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    The employee will see this reason and can resubmit.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={16} color={C.textMuted} />
              </button>
            </div>

            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: C.textSecondary }}
            >
              Reason for rejection <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Description too vague — please add more detail about the task and project."
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{
                background: C.surfaceAlt ?? "#F8F9FC",
                border: `1.5px solid ${reason.trim() ? C.primary : C.border}`,
                color: C.textPrimary,
                fontFamily: "DM Sans, sans-serif",
              }}
            />
            {!reason.trim() && (
              <p className="text-xs mt-1" style={{ color: "#DC2626" }}>
                Rejection reason is required.
              </p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: C.surfaceAlt ?? "#F3F4F6",
                  color: C.textSecondary,
                  border: `1px solid ${C.border}`,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!reason.trim() || loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: !reason.trim() || loading ? "#F3F4F6" : "#DC2626",
                  color: !reason.trim() || loading ? C.textMuted : "#fff",
                  cursor: !reason.trim() || loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
