// src/admin/performance/AppraisalReview.jsx
// Fully API-connected — no mock data. C from shared colors.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  RefreshCw,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import {
  getAllReviews,
  submitManagerAssessment,
  finalizeReview,
} from "../../api/service/performanceApi";

const fadeUp = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({ opacity: 1, transition: { delay: i * 0.04 } }),
};

function StatusBadge({ status }) {
  const cfg = {
    pending: { bg: C.warningLight, color: C.warning },
    self_completed: { bg: C.accentLight, color: C.accent },
    manager_completed: { bg: C.primaryLight, color: C.primary },
    finalized: { bg: C.successLight, color: C.success },
    rejected: { bg: C.dangerLight, color: C.danger },
  }[status?.toLowerCase()] ?? { bg: C.surfaceAlt, color: C.textMuted };
  return (
    <span
      className="px-3 py-1 text-xs rounded-full font-semibold capitalize"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status?.replace("_", " ")}
    </span>
  );
}

function ReviewModal({ review, onClose, onSaved }) {
  const [managerScore, setManagerScore] = useState(
    review.manager_score ?? review.managerScore ?? "",
  );
  const [managerComment, setManagerComment] = useState(
    review.manager_comment ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!managerScore) {
      setError("Manager score is required.");
      return;
    }
    setSaving(true);
    try {
      await submitManagerAssessment(review.id, {
        managerComment,
        finalRating: parseFloat(managerScore),
        sections: review.sections ?? [],
      });
      onSaved("Manager assessment saved.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save assessment.");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await finalizeReview(review.id, {
        managerScore: parseFloat(managerScore),
        managerComment,
      });
      onSaved("Review finalized and locked.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to finalize review.");
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div>
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              Review — {review.employee_name ?? review.employee}
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
              Cycle: {review.cycle_name ?? review.cycle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ background: C.surfaceAlt }}
          >
            <X size={14} color={C.textMuted} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: C.dangerLight }}
            >
              <AlertTriangle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>
                {error}
              </p>
            </div>
          )}

          {/* Self score (read-only) */}
          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <span className="text-sm" style={{ color: C.textSecondary }}>
              Self Assessment Score
            </span>
            <span className="font-bold text-lg" style={{ color: C.primary }}>
              {review.self_score ?? review.selfScore ?? "—"}
            </span>
          </div>

          {/* Manager score */}
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Manager Score <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={managerScore}
              onChange={(e) => setManagerScore(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>

          {/* Manager comment */}
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Manager Comment
            </label>
            <textarea
              rows={4}
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              placeholder="Provide detailed feedback for the employee..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              color: C.textSecondary,
              border: `1px solid ${C.border}`,
            }}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : (
              "Save Score"
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFinalize}
            disabled={finalizing}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.success, opacity: finalizing ? 0.8 : 1 }}
          >
            {finalizing ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Locking…
              </>
            ) : (
              "Finalize & Lock"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AppraisalReview() {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllReviews({
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setAppraisals(res.data ?? []);
    } catch {
      setError("Failed to load appraisals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-semibold text-lg" style={{ color: C.textPrimary }}>
          Appraisal Reviews
        </h2>
        <div className="flex gap-2 flex-wrap items-center">
          {[
            "",
            "pending",
            "self_completed",
            "manager_completed",
            "finalized",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full"
              style={{
                background: statusFilter === s ? C.primary : C.surface,
                color: statusFilter === s ? "#fff" : C.textSecondary,
                border: `1px solid ${statusFilter === s ? C.primary : C.border}`,
              }}
            >
              {s ? s.replace("_", " ") : "All"}
            </button>
          ))}
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={load}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            <RefreshCw size={12} />
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-2xl animate-pulse"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="rounded-2xl p-6 flex items-center gap-3"
          style={{ background: C.dangerLight }}
        >
          <AlertTriangle size={18} color={C.danger} />
          <p className="text-sm" style={{ color: C.danger }}>
            {error}
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {[
                  "Employee",
                  "Department",
                  "Cycle",
                  "Self Score",
                  "Manager Score",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-bold uppercase"
                    style={{ color: C.textMuted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appraisals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: C.textMuted }}
                  >
                    No appraisals found.
                  </td>
                </tr>
              ) : (
                appraisals.map((app, i) => (
                  <motion.tr
                    key={app.id ?? i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="border-b"
                    style={{ borderColor: C.border }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.surfaceAlt)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      className="px-5 py-4 font-medium text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {app.employee_name ?? app.employee}
                    </td>
                    <td
                      className="px-5 py-4 text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {app.department_name ?? app.department ?? "—"}
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: C.textSecondary }}
                    >
                      {app.cycle_name ?? app.cycle}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: C.textPrimary }}
                      >
                        {app.self_score ?? app.selfScore ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: C.textPrimary }}
                      >
                        {app.manager_score ?? app.managerScore ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelected(app)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl"
                        style={{ background: C.primaryLight, color: C.primary }}
                        disabled={app.status === "finalized"}
                      >
                        <Eye size={13} />
                        {app.status === "finalized" ? "Locked" : "Review"}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ReviewModal
            review={selected}
            onClose={() => setSelected(null)}
            onSaved={(msg) => {
              setSelected(null);
              showToast(msg);
              load();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{
              background: "#1E1B4B",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: 260,
            }}
          >
            <CheckCircle2 size={14} color="#10B981" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
