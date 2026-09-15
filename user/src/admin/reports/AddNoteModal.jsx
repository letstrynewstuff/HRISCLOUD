// src/admin/reports/AddNoteModal.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, X, Loader2 } from "lucide-react";
import { C } from "../employeemanagement/sharedData";

export default function AddNoteModal({ visible, saving, onSave, onClose }) {
  const [note, setNote] = useState("");
  const [visibleToReporter, setVisibleToReporter] = useState(false);

  const handleSave = () => {
    if (!note.trim()) return;
    onSave(note.trim(), visibleToReporter);
    setNote("");
    setVisibleToReporter(false);
  };

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
                  style={{ background: C.primaryLight }}
                >
                  <MessageSquarePlus size={16} color={C.primary} />
                </div>
                <p
                  className="font-bold text-sm flex-1"
                  style={{ color: C.textPrimary }}
                >
                  Add Investigation Note
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

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log findings, actions taken, or next steps…"
                rows={4}
                className="w-full px-3.5 py-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />

              <label
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex-1">
                  <p
                    className="text-xs font-bold"
                    style={{ color: C.textPrimary }}
                  >
                    Visible to reporter
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: C.textMuted }}
                  >
                    The employee will see this note on their report timeline
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={visibleToReporter}
                  onChange={(e) => setVisibleToReporter(e.target.checked)}
                  className="w-4 h-4 accent-current"
                  style={{ accentColor: C.primary }}
                />
              </label>

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
                  onClick={handleSave}
                  disabled={saving || !note.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{
                    background: C.primary,
                    opacity: saving || !note.trim() ? 0.7 : 1,
                    cursor: saving || !note.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Add Note"
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
