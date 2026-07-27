

// src/admin/performance/AppraisalReview.jsx
//
// HR & Admin ONLY — review, score, reject and finalise submitted appraisals.
//
// Scoring flow:
//   1. Manager submits appraisal with star ratings → managerOverall (0-100)
//   2. HR opens this panel, sees manager ratings (read-only)
//   3. HR can:
//        a) Add their own star ratings (optional) → hrOverall (0-100)
//        b) Set how much weight HR score carries (hrScoreWeight, default 20%)
//   4. Blended score = managerOverall × (100-hrWeight)% + hrOverall × hrWeight%
//      If HR adds no ratings, hrOverall defaults to managerOverall (full trust)
//   5. On "Save HR Review" → status: hr_scored, appraisal_score written to performance_scores
//   6. On "Finalise" → status: completed, rating label re-derived, record locked

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, AlertTriangle, X, Loader2, CheckCircle2,
  Star, ClipboardList, Shield, AlertCircle, ThumbsDown, Lock, Info,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import {
  listAppraisals,
  hrReviewAppraisal,
  finalizeAppraisal,
  rejectAppraisal,
} from "../../api/service/appraisal.api";

// ── constants ─────────────────────────────────────────────────
const STATUSES = ["", "submitted", "hr_scored", "completed", "rejected"];

const STATUS_CFG = {
  submitted: { label: "Submitted",  bg: C.warningLight, color: C.warning  },
  hr_scored: { label: "HR Scored",  bg: "#E0E7FF",      color: "#4F46E5"  },
  completed: { label: "Completed",  bg: C.successLight, color: C.success  },
  rejected:  { label: "Returned",   bg: C.dangerLight,  color: C.danger   },
};

const CRITERIA_DEFAULTS = [
  { label: "Job Knowledge",   weight: 20, maxScore: 5 },
  { label: "Quality of Work", weight: 20, maxScore: 5 },
  { label: "Communication",   weight: 15, maxScore: 5 },
  { label: "Teamwork",        weight: 15, maxScore: 5 },
  { label: "Initiative",      weight: 15, maxScore: 5 },
  { label: "Professionalism", weight: 15, maxScore: 5 },
];

const RATING_LABEL = (score) => {
  if (score >= 90) return { label: "Outstanding",        color: "#047857" };
  if (score >= 75) return { label: "High Performer",     color: "#4F46E5" };
  if (score >= 60) return { label: "Meets Expectations", color: C.warning };
  if (score >= 40) return { label: "Needs Improvement",  color: C.danger  };
  return                   { label: "Underperforming",   color: "#4F46E5" };
};

const fadeUp = {
  hidden:  { opacity: 0, y: 8 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04 } }),
};

// ── atoms ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] ?? { bg: C.surfaceAlt, color: C.textMuted, label: status };
  return (
    <span className="px-2.5 py-0.5 text-[10px] rounded-full font-bold capitalize"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label ?? status}
    </span>
  );
}

function StarDisplay({ score, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={12}
          fill={i < score ? C.warning : "none"}
          color={i < score ? C.warning : C.border} />
      ))}
    </div>
  );
}

function StarPicker({ value, max = 5, onChange, disabled }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <button key={i} type="button" disabled={disabled}
          onClick={() => !disabled && onChange(i + 1)}
          className="transition-transform hover:scale-110"
          style={{ cursor: disabled ? "default" : "pointer" }}>
          <Star size={18}
            fill={i < value ? C.warning : "none"}
            color={i < value ? C.warning : C.border} />
        </button>
      ))}
    </div>
  );
}

// ── score helpers ─────────────────────────────────────────────
function computeWeighted(ratings) {
  if (!ratings?.length) return null;
  const rated = ratings.filter((r) => r.score > 0);
  if (!rated.length) return null;
  const totalW = rated.reduce((s, r) => s + (Number(r.weight) || 1), 0);
  return rated.reduce((s, r) => {
    const pct = (r.score / (r.maxScore ?? 5)) * 100;
    return s + pct * ((Number(r.weight) || 1) / totalW);
  }, 0);
}

// ══════════════════════════════════════════════════════════════
// HR REVIEW MODAL
// ══════════════════════════════════════════════════════════════
function HRReviewModal({ appraisal, onClose, onSaved }) {
  // Seed HR ratings from existing hrRatings or mirror manager's criteria
  const [hrRatings, setHrRatings] = useState(() => {
    const source = appraisal.hrRatings?.length
      ? appraisal.hrRatings
      : appraisal.managerRatings?.length
        ? appraisal.managerRatings
        : CRITERIA_DEFAULTS;
    return source.map((r) => ({
      label:    r.label,
      weight:   r.weight   ?? (100 / source.length),
      maxScore: r.maxScore ?? 5,
      score:    appraisal.hrRatings?.length ? (r.score ?? 0) : 0,
      comment:  appraisal.hrRatings?.length ? (r.comment ?? "") : "",
    }));
  });

  const [hrFeedback,    setHrFeedback]    = useState(appraisal.hrFeedback ?? "");
  const [hrScoreWeight, setHrScoreWeight] = useState(appraisal.hrScoreWeight ?? 20);
  const [skipHrRating,  setSkipHrRating]  = useState(false);
  const [rejectMode,    setRejectMode]    = useState(false);
  const [rejectReason,  setRejectReason]  = useState("");
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");

  const isLocked   = appraisal.status === "completed";
  const isHrScored = appraisal.status === "hr_scored";

  const setRating = (i, field, val) =>
    setHrRatings((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  // ── live score preview ────────────────────────────────────
  // Define managerOverall first — everything else depends on it
  const managerOverall = Number(appraisal.managerOverall ?? 0);

  const hrOverall = (() => {
    if (skipHrRating) return managerOverall;
    const rated = hrRatings.filter((r) => Number(r.score ?? 0) > 0);
    if (!rated.length) return managerOverall; // trust manager if no HR ratings
    const totalW = rated.reduce((s, r) => s + (Number(r.weight) || 1), 0);
    return rated.reduce((s, r) => {
      return (
        s +
        (Number(r.score) / (r.maxScore ?? 5)) *
          100 *
          ((Number(r.weight) || 1) / totalW)
      );
    }, 0);
  })();

  const mgrWeight  = 100 - hrScoreWeight;
  const blended    = Math.round(managerOverall * (mgrWeight / 100) + hrOverall * (hrScoreWeight / 100));
  const ratingInfo = RATING_LABEL(blended);

  // ── actions ───────────────────────────────────────────────
  const handleSaveReview = async (andFinalize = false) => {
    setSaving(true); setError("");
    try {
      await hrReviewAppraisal(appraisal.id, {
        hrFeedback:    hrFeedback.trim() || undefined,
        hrRatings:     skipHrRating ? [] : hrRatings.filter((r) => r.score > 0),
        hrScoreWeight: hrScoreWeight,
      });
      if (andFinalize) {
        await finalizeAppraisal(appraisal.id);
        onSaved("Appraisal finalised — performance score updated.");
      } else {
        onSaved("HR review saved.");
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to save HR review.");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    setSaving(true); setError("");
    try {
      await finalizeAppraisal(appraisal.id);
      onSaved("Appraisal finalised — performance score updated.");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to finalise.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setError("Rejection reason is required."); return; }
    setSaving(true); setError("");
    try {
      await rejectAppraisal(appraisal.id, { reason: rejectReason.trim() });
      onSaved("Appraisal returned to manager for revision.");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to reject.");
    } finally {
      setSaving(false);
    }
  };

  const empName = appraisal.employee
    ? `${appraisal.employee.firstName} ${appraisal.employee.lastName}`
    : "Employee";
  const mgrName = appraisal.manager
    ? `${appraisal.manager.firstName} ${appraisal.manager.lastName}`
    : "Manager";

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadow.lift }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#E0E7FF" }}>
              <Shield size={14} color="#4F46E5" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                HR Review — {empName}
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                Period: {appraisal.period}
                {appraisal.cycleName ? ` · ${appraisal.cycleName}` : ""}
                {appraisal.employee?.department ? ` · ${appraisal.employee.department}` : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: C.surfaceAlt }}>
            <X size={13} color={C.textMuted} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: C.dangerLight }}>
              <AlertTriangle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>{error}</p>
            </div>
          )}

          {/* ── Live blended score preview ── */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
            <p className="text-xs font-bold" style={{ color: C.textPrimary }}>Live Score Preview</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Manager Score", value: Math.round(managerOverall), color: C.primary,         bg: C.primaryLight  },
                { label: "HR Score",      value: Math.round(hrOverall),      color: "#4F46E5",          bg: "#E0E7FF"       },
                { label: "Blended Score", value: blended,                    color: ratingInfo.color,   bg: C.successLight  },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Rating label */}
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: C.textSecondary }}>
                Projected rating:&nbsp;
                <span className="font-bold" style={{ color: ratingInfo.color }}>{ratingInfo.label}</span>
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                Manager {mgrWeight}% · HR {hrScoreWeight}%
              </p>
            </div>

            {/* ── HR weight slider ── */}
            {!isLocked && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold" style={{ color: C.textPrimary }}>
                    HR Score Weight
                  </label>
                  <span className="text-xs font-bold" style={{ color: "#4F46E5" }}>{hrScoreWeight}%</span>
                </div>
                <input type="range" min={0} max={50} step={5}
                  value={hrScoreWeight}
                  onChange={(e) => setHrScoreWeight(Number(e.target.value))}
                  className="w-full accent-violet-600" />
                <div className="flex justify-between text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                  <span>0% (full trust in manager)</span>
                  <span>50% (equal weight)</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Manager ratings (read-only) ── */}
          {Array.isArray(appraisal.managerRatings) && appraisal.managerRatings.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: C.textMuted }}>
                Manager Ratings — by {mgrName}
              </p>
              <div className="space-y-1.5">
                {appraisal.managerRatings.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
                    <div className="flex-1">
                      <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{r.label}</p>
                      {r.comment && <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>{r.comment}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StarDisplay score={r.score} max={r.maxScore ?? 5} />
                      <span className="text-xs font-bold w-10 text-right" style={{ color: C.primary }}>
                        {r.score}/{r.maxScore ?? 5}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {appraisal.managerFeedback && (
                <div className="mt-2 p-3 rounded-xl text-xs leading-relaxed"
                  style={{ background: C.primaryLight, color: C.textPrimary }}>
                  <span className="font-bold" style={{ color: C.primary }}>Manager feedback: </span>
                  {appraisal.managerFeedback}
                </div>
              )}
            </div>
          )}

          {/* ── HR ratings toggle + form ── */}
          {!rejectMode && !isLocked && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold" style={{ color: C.textPrimary }}>Your HR Ratings</p>
                <button
                  onClick={() => setSkipHrRating((v) => !v)}
                  className="text-[10px] font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: skipHrRating ? C.successLight : C.surfaceAlt,
                    color:      skipHrRating ? C.success      : C.textSecondary,
                    border:     `1px solid ${skipHrRating ? C.success : C.border}`,
                  }}>
                  {skipHrRating ? " Trusting manager ratings" : "Skip — trust manager ratings"}
                </button>
              </div>

              {!skipHrRating && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl"
                    style={{ background: "#E0E7FF", border: "1px solid #4F46E522" }}>
                    <Info size={12} color="#4F46E5" className="shrink-0" />
                    <p className="text-[10px]" style={{ color: "#4F46E5" }}>
                      Your ratings carry <strong>{hrScoreWeight}%</strong> of the final score.
                      Leave stars empty to exclude a criterion.
                    </p>
                  </div>
                  {hrRatings.map((r, i) => (
                    <div key={i} className="rounded-xl p-4"
                      style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{r.label}</p>
                          <p className="text-[10px]" style={{ color: C.textMuted }}>Weight: {r.weight}%</p>
                        </div>
                        <div className="shrink-0">
                          <StarPicker
                            value={r.score} max={r.maxScore ?? 5}
                            onChange={(v) => setRating(i, "score", v)} />
                          <p className="text-[10px] text-right mt-1"
                            style={{ color: r.score > 0 ? C.warning : C.textMuted }}>
                            {r.score > 0 ? `${r.score}/${r.maxScore ?? 5}` : "Not rated"}
                          </p>
                        </div>
                      </div>
                      <input
                        value={r.comment}
                        onChange={(e) => setRating(i, "comment", e.target.value)}
                        placeholder="Optional HR comment…"
                        className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HR ratings display when locked */}
          {isLocked && Array.isArray(appraisal.hrRatings) && appraisal.hrRatings.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: C.textMuted }}>HR Ratings (locked)</p>
              <div className="space-y-1.5">
                {appraisal.hrRatings.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
                    <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{r.label}</p>
                    <div className="flex items-center gap-2">
                      <StarDisplay score={r.score} max={r.maxScore ?? 5} />
                      <span className="text-xs font-bold" style={{ color: "#4F46E5" }}>
                        {r.score}/{r.maxScore ?? 5}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HR overall feedback */}
          {!rejectMode && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                HR Overall Feedback
              </label>
              <textarea rows={3} value={hrFeedback}
                onChange={(e) => setHrFeedback(e.target.value)}
                disabled={isLocked}
                placeholder="Provide your HR assessment and overall feedback…"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: C.surfaceAlt, border: `1.5px solid ${C.border}`,
                  color: C.textPrimary, opacity: isLocked ? 0.6 : 1,
                }} />
            </div>
          )}

          {/* Reject panel */}
          {rejectMode && (
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
              <p className="text-sm font-bold" style={{ color: C.danger }}>Return Appraisal to Manager</p>
              <p className="text-xs" style={{ color: C.textSecondary }}>
                Explain what needs to be corrected. The manager will revise and resubmit.
              </p>
              <textarea rows={3} value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Some criteria are unrated — please complete all ratings and add feedback."
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: C.surface, border: `1.5px solid ${C.danger}55`, color: C.textPrimary }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 shrink-0" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          {isLocked ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <Lock size={14} color={C.success} />
              <p className="text-sm font-semibold" style={{ color: C.success }}>
                This appraisal is finalised and locked.
              </p>
            </div>
          ) : rejectMode ? (
            <div className="flex gap-3">
              <button onClick={() => setRejectMode(false)}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold"
                style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}>
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleReject} disabled={saving}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: C.danger, opacity: saving ? 0.8 : 1 }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <ThumbsDown size={13} />}
                Return to Manager
              </motion.button>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <button onClick={onClose}
                className="py-2.5 px-4 rounded-full text-sm font-semibold"
                style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}>
                Cancel
              </button>

              {/* Return to manager — only for submitted */}
              {appraisal.status === "submitted" && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setRejectMode(true)}
                  className="py-2.5 px-4 rounded-full text-sm font-semibold flex items-center gap-2"
                  style={{ background: C.dangerLight, color: C.danger, border: `1px solid ${C.danger}33` }}>
                  <ThumbsDown size={13} /> Return to Manager
                </motion.button>
              )}

              {/* Save HR review (score only, don't lock yet) */}
              {appraisal.status === "submitted" && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleSaveReview(false)} disabled={saving}
                  className="flex-1 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: C.primaryLight, color: C.primary, border: `1px solid ${C.primary}33`, opacity: saving ? 0.8 : 1 }}>
                  {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                  Save HR Review
                </motion.button>
              )}

              {/* Finalise and lock */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={isHrScored ? handleFinalize : () => handleSaveReview(true)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: C.success, opacity: saving ? 0.8 : 1 }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                {isHrScored ? "Finalise & Lock" : "Review & Finalise"}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function AppraisalReview() {
  const [appraisals,   setAppraisals]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected,     setSelected]     = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let data = [];
      if (!statusFilter) {
        const [s1, s2] = await Promise.allSettled([
          listAppraisals({ status: "submitted" }),
          listAppraisals({ status: "hr_scored"  }),
        ]);
        data = [
          ...(s1.status === "fulfilled" ? s1.value?.appraisals ?? [] : []),
          ...(s2.status === "fulfilled" ? s2.value?.appraisals ?? [] : []),
        ];
      } else {
        const res = await listAppraisals({ status: statusFilter });
        data = res?.appraisals ?? [];
      }
      setAppraisals(data);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load appraisals.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const pendingCount = appraisals.filter((a) => a.status === "submitted").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg" style={{ color: C.textPrimary }}>Appraisal Reviews</h2>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            Review, score and finalise manager-submitted appraisals.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: statusFilter === s ? C.primary : C.surface,
                color:      statusFilter === s ? "#fff"    : C.textSecondary,
                border:     `1px solid ${statusFilter === s ? C.primary : C.border}`,
              }}>
              {s ? (STATUS_CFG[s]?.label ?? s) : "HR Inbox"}
            </button>
          ))}
          <motion.button whileHover={{ scale: 1.04 }} onClick={load}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
            <RefreshCw size={13} color={C.textSecondary} />
          </motion.button>
        </div>
      </div>

      {/* Pending banner */}
      {!statusFilter && pendingCount > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#E0E7FF", border: "1px solid #4F46E533" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#4F46E5" }}>
            <Shield size={15} color="#fff" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
              {pendingCount} appraisal{pendingCount > 1 ? "s" : ""} awaiting HR review
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
              Score each one to update the employee's performance record.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-2xl animate-pulse"
              style={{ background: C.surface, border: `1px solid ${C.border}` }} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl p-6 flex items-center gap-3" style={{ background: C.dangerLight }}>
          <AlertTriangle size={18} color={C.danger} />
          <p className="text-sm" style={{ color: C.danger }}>{error}</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: C.surface, borderColor: C.border }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr style={{ background: C.surfaceAlt }}>
                  {["Employee", "Department", "Period / Cycle", "Manager", "Mgr Score", "HR Score", "Blended", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: C.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appraisals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <ClipboardList size={32} color={C.textMuted} className="mx-auto mb-2" />
                      <p className="text-sm font-semibold" style={{ color: C.textSecondary }}>
                        {!statusFilter ? "No appraisals awaiting HR review." : "No appraisals found."}
                      </p>
                    </td>
                  </tr>
                ) : appraisals.map((app, i) => {
                  const empName = app.employee
                    ? `${app.employee.firstName} ${app.employee.lastName}`
                    : app.employeeId;
                  const mgrName = app.manager
                    ? `${app.manager.firstName} ${app.manager.lastName}`
                    : "—";
                  const isActionable = ["submitted", "hr_scored"].includes(app.status);

                  return (
                    <motion.tr key={app.id ?? i} custom={i} variants={fadeUp}
                      initial="hidden" animate="visible"
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>{empName}</p>
                        {app.employee?.jobRole && <p className="text-[10px]" style={{ color: C.textMuted }}>{app.employee.jobRole}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: C.textSecondary }}>
                        {app.employee?.department ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{app.period}</p>
                        {app.cycleName && <p className="text-[10px]" style={{ color: C.textMuted }}>{app.cycleName}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: C.textSecondary }}>{mgrName}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-sm" style={{ color: app.managerOverall != null ? C.primary : C.textMuted }}>
                          {app.managerOverall != null ? Math.round(app.managerOverall) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-sm" style={{ color: app.hrOverall != null ? "#4F46E5" : C.textMuted }}>
                          {app.hrOverall != null ? Math.round(app.hrOverall) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {app.appraisalScore != null ? (
                          <span className="font-black text-sm px-2 py-0.5 rounded-lg"
                            style={{ background: C.successLight, color: C.success }}>
                            {Math.round(app.appraisalScore)}
                          </span>
                        ) : <span style={{ color: C.textMuted, fontSize: 12 }}>—</span>}
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={app.status} /></td>
                      <td className="px-4 py-3.5">
                        {isActionable ? (
                          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setSelected(app)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full text-white"
                            style={{ background: app.status === "hr_scored" ? C.success : "#4F46E5" }}>
                            <Shield size={12} />
                            {app.status === "hr_scored" ? "Finalise" : "HR Review"}
                          </motion.button>
                        ) : app.status === "completed" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl"
                            style={{ background: C.surfaceAlt, color: C.textMuted }}>
                            <Lock size={11} /> Locked
                          </span>
                        ) : (
                          <motion.button whileHover={{ scale: 1.04 }}
                            onClick={() => setSelected(app)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full"
                            style={{ background: C.primaryLight, color: C.primary }}>
                            View
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <HRReviewModal
            appraisal={selected}
            onClose={() => setSelected(null)}
            onSaved={(msg) => { setSelected(null); showToast(msg); load(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0,  x: "-50%" }}
            exit={{    opacity: 0, y: 40, x: "-50%" }}
            className="fixed bottom-6 left-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{ background: "#1E1B4B", color: "#fff", boxShadow: C.shadow.lift, minWidth: 260 }}>
            {toast.type === "error"
              ? <AlertCircle size={14} color={C.danger} />
              : <CheckCircle2 size={14} color={C.success} />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}