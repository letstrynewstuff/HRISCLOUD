// src/components/timesheets/ConfirmSubmitModal.jsx
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { C } from "../../admin/employeemanagement/sharedData";

export default function ConfirmSubmitModal({
  open,
  count,
  onConfirm,
  onClose,
  loading,
}) {
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
          onClick={onClose}
        >
          <Motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: C.primaryLight }}
              >
                <Send size={22} color={C.primary} />
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} color={C.textMuted} />
              </button>
            </div>

            <h3
              className="text-lg mb-1"
              style={{ color: C.textPrimary }}
            >
              Submit {count} {count === 1 ? "entry" : "entries"}?
            </h3>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: C.textSecondary }}
            >
              You're about to submit <strong>{count}</strong>{" "}
              {count === 1 ? "entry" : "entries"} for approval. You won't be
              able to edit {count === 1 ? "it" : "them"} after submitting.
              Continue?
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold"
                style={{
                  background: C.bgMid,
                  color: C.textSecondary,
                  border: `1px solid ${C.border}`,
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
                style={{
                  background: loading ? "#C7D2FE" : C.primary,
                  color: "#fff",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: !loading
                    ? "0 2px 8px rgba(79,70,229,0.3)"
                    : "none",
                }}
              >
                <Send size={14} />
                {loading ? "Submitting…" : "Submit for Approval"}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
