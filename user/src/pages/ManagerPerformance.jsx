



// src/pages/ManagerPerformance.jsx
//
// Dedicated Performance + Appraisals page for MANAGERS ONLY.
// Access enforced at route level via ProtectedRoute requireManager.
//
// KEY FIX: StarPicker now uses plain inline SVG path — not lucide Star —
// so fill/unfill state is always visible regardless of Tailwind/CSS resets.
// A live score preview shows the blended appraisal score as the manager
// rates each criterion, using the same weighted formula as the backend.

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, Target, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Eye, Menu, RefreshCw, AlertTriangle, Loader2,
  ClipboardList, Plus, Users, Lock, Send, X, Shield,
  Sparkles, Trophy, Info, ArrowUpRight, ArrowDownRight, Minus,
  Star, ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import C from "../styles/colors";
import { useAuth } from "../components/useAuth";
import {
  getEmployeeScores,
  getMyGoals,
  getTrends,
  getInsights,
} from "../api/service/performanceApi";
import { getEmployees } from "../api/service/employeeApi";
import {
  listAppraisals,
  createAppraisal,
  updateAppraisal,
  submitAppraisal,
  listTemplates,
} from "../api/service/appraisal.api";

// ── Constants ─────────────────────────────────────────────────
const TABS = [
  { id: "overview",   label: "Overview"        },
  { id: "goals",      label: "My Goals"        },
  { id: "appraisals", label: "Team Appraisals" },
  { id: "history",    label: "History"         },
];

const RATING_MAP = {
  Outstanding:          { color: "#047857", bg: C.successLight },
  "High Performer":     { color: C.primary, bg: C.primaryTint },
  "Meets Expectations": { color: "#92400E", bg: C.warningLight },
  "Needs Improvement":  { color: "#B91C1C", bg: C.dangerLight },
  Underperforming:      { color: C.primary, bg: C.primaryTint },
};

const APPRAISAL_STATUS = {
  draft:     { label: "Draft",        color: C.textSecondary, bg: C.bgMid  },
  submitted: { label: "Under Review", color: "#92400E", bg: C.warningLight  },
  hr_scored: { label: "HR Scored",    color: C.primary, bg: C.primaryTint  },
  completed: { label: "Completed",    color: "#047857", bg: C.successLight  },
  rejected:  { label: "Returned",     color: "#B91C1C", bg: C.dangerLight  },
};

const CRITERIA_DEFAULTS = [
  { label: "Job Knowledge",   weight: 20, maxScore: 5 },
  { label: "Quality of Work", weight: 20, maxScore: 5 },
  { label: "Communication",   weight: 15, maxScore: 5 },
  { label: "Teamwork",        weight: 15, maxScore: 5 },
  { label: "Initiative",      weight: 15, maxScore: 5 },
  { label: "Professionalism", weight: 15, maxScore: 5 },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Score blending (mirrors backend formula) ──────────────────
// managerRatings → weighted 0-100 score (same as computeWeightedScore in controller)
function computeAppraisalScore(ratings = []) {
  const rated = ratings.filter((r) => r.score > 0);
  if (rated.length === 0) return null;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const r of rated) {
    const w = Number(r.weight ?? 1);
    const s = Number(r.score ?? 0);
    const m = Number(r.maxScore ?? 5);
    weightedSum += (s / m) * 100 * w;
    totalWeight += w;
  }
  return totalWeight === 0 ? null : Math.round(weightedSum / totalWeight);
}

// Rating label from score (mirrors backend getRatingLabel)
function getRatingLabel(score) {
  if (score == null) return null;
  if (score >= 90) return "Outstanding";
  if (score >= 75) return "High Performer";
  if (score >= 60) return "Meets Expectations";
  if (score >= 40) return "Needs Improvement";
  return "Underperforming";
}

// ══════════════════════════════════════════════════════════════
// ATOMS
// ══════════════════════════════════════════════════════════════
function Chip({ label, color, bg }) {
  return (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: bg ?? "#EEF2FF", color: color ?? "#4F46E5" }}>
      {label}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: C.surface, border: "1px solid #E4E7F0", boxShadow: C.shadow.card }}>
      {children}
    </div>
  );
}

function CardHead({ icon: Icon, title, sub, color, bg, action }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #E4E7F0" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: bg ?? "#EEF2FF" }}>
        <Icon size={15} color={color ?? "#4F46E5"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: C.textPrimary }}>{title}</p>
        {sub && <p className="text-[11px]" style={{ color: C.textMuted }}>{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  const color = type === "success" ? "#10B981" : C.danger;
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 40, x: "-50%" }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{ background: "#334155", boxShadow: C.shadow.lift, minWidth: 260 }}>
      {type === "success"
        ? <CheckCircle2 size={16} color={color} />
        : <AlertCircle size={16} color={color} />}
      <span className="text-white text-sm font-semibold">{msg}</span>
    </Motion.div>
  );
}

function ScoreRing({ score, size = 120 }) {
  const r    = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = ((score ?? 0) / 100) * circ;
  const color = score >= 85 ? "#10B981" : score >= 60 ? "#4F46E5" : score >= 40 ? "#92400E" : "#B91C1C";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={10} stroke={C.border} />
        <Motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={10} stroke={color}
          strokeLinecap="round" strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black" style={{ color: C.textPrimary }}>{score ?? "—"}</span>
        <span className="text-[10px] font-semibold" style={{ color: C.textMuted }}>/ 100</span>
      </div>
    </div>
  );
}

function TrendLine({ data }) {
  if (!data?.length) return null;
  const W = 220; const H = 60; const PAD = 8;
  const scores = data.map((d) => d.score ?? d.final_score ?? 0);
  const min = Math.min(...scores);
  const max = Math.max(...scores, min + 1);
  const pts = scores.map((s, i) => {
    const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(" ");
  const last = scores.at(-1);
  const prev = scores.at(-2);
  const trend = prev == null ? "new" : last > prev + 2 ? "up" : last < prev - 2 ? "down" : "stable";
  const color = trend === "up" ? "#10B981" : trend === "down" ? "#B91C1C" : C.primary;
  return (
    <div className="flex items-center gap-3">
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {scores.map((s, i) => {
          const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
          const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
          return <g key={i}><circle cx={x} cy={y} r={4} fill={color} /></g>;
        })}
      </svg>
      <div className="flex items-center gap-1">
        {trend === "up"     && <ArrowUpRight size={16} color={C.success} />}
        {trend === "down"   && <ArrowDownRight size={16} color="#B91C1C" />}
        {trend === "stable" && <Minus size={16} color={C.textMuted} />}
        <span className="text-xs font-semibold" style={{ color }}>
          {trend === "new" ? "First score" : trend === "stable" ? "Stable"
            : `${trend === "up" ? "+" : ""}${(last - (prev ?? last)).toFixed(0)}`}
        </span>
      </div>
    </div>
  );
}

function GoalBar({ progress }) {
  const color = progress >= 100 ? "#10B981" : progress >= 60 ? "#4F46E5" : progress >= 30 ? "#92400E" : "#B91C1C";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: C.textSecondary }}>{progress}% complete</span>
        <span className="text-xs font-bold" style={{ color }}>{progress}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: C.bgMid }}>
        <Motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }} style={{ background: color }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STAR PICKER — pure inline SVG, no lucide dependency on fill
// Clicking a star sets that star's index+1 as the value.
// Clicking the same star again clears it (toggles to 0).
// ══════════════════════════════════════════════════════════════
function StarPicker({ value, max = 5, onChange }) {
  const [hovered, setHovered] = useState(0);

  // SVG path for a 5-pointed star (20x20 viewBox)
  const STAR_PATH = "M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.25l-4.94 2.46.94-5.5-4-3.9 5.53-.8z";

  return (
    <div className="flex gap-1.5" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: max }).map((_, i) => {
        const starNum   = i + 1;
        const active    = starNum <= (hovered || value);
        const fillColor = active ? "#F59E0B" : "none";
        const strokeColor = active ? "#F59E0B" : "#CBD5E1";
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(starNum)}
            onClick={() => onChange(value === starNum ? 0 : starNum)}
            style={{
              background: "none",
              border: "none",
              padding: "2px",
              cursor: "pointer",
              lineHeight: 0,
              transform: hovered === starNum ? "scale(1.2)" : "scale(1)",
              transition: "transform 0.1s ease",
            }}
            title={`Rate ${starNum} out of ${max}`}
          >
            <svg
              width="24" height="24"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block" }}
            >
              <path
                d={STAR_PATH}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// Read-only star display
function StarDisplay({ score, max = 5 }) {
  const STAR_PATH = "M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.25l-4.94 2.46.94-5.5-4-3.9 5.53-.8z";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d={STAR_PATH}
            fill={i < score ? "#F59E0B" : "none"}
            stroke={i < score ? "#F59E0B" : "#CBD5E1"}
            strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LIVE SCORE PREVIEW PANEL
// Shows the running weighted appraisal score as the manager rates.
// Also shows how this feeds into the final performance score.
// ══════════════════════════════════════════════════════════════
function LiveScorePreview({ ratings }) {
  const appraisalScore = computeAppraisalScore(ratings);
  const ratedCount = ratings.filter((r) => r.score > 0).length;
  const totalCount  = ratings.length;
  const ratingLabel = getRatingLabel(appraisalScore);
  const ratingCfg   = RATING_MAP[ratingLabel] ?? null;

  // Show how this appraisal score feeds into the final performance score
  // Backend formula (when appraisal exists): KPI 40% | ATT 20% | TRN 20% | APR 20%
  // We show the appraisal contribution portion only here
  const appraisalContribution = appraisalScore != null ? Math.round(appraisalScore * 0.20) : null;

  if (ratedCount === 0) {
    return (
      <div className="rounded-xl p-4 flex items-center gap-3"
        style={{ background: C.surfaceAlt, border: "1px solid #E4E7F0" }}>
        <Star size={16} color={C.textMuted} />
        <p className="text-xs" style={{ color: C.textMuted }}>
          Rate the criteria above to see the live appraisal score.
        </p>
      </div>
    );
  }

  const pct = Math.round((ratedCount / totalCount) * 100);
  const barColor = appraisalScore >= 75 ? "#10B981" : appraisalScore >= 50 ? "#4F46E5" : appraisalScore >= 30 ? "#92400E" : "#B91C1C";

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: C.surfaceAlt, border: "1px solid #E4E7F0" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold" style={{ color: C.textPrimary }}>Live Appraisal Score</p>
        <p className="text-[10px]" style={{ color: C.textMuted }}>{ratedCount}/{totalCount} criteria rated</p>
      </div>

      {/* Big score */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0"
          style={{ background: ratingCfg?.bg ?? "#F0F2F8", color: ratingCfg?.color ?? "#5F6D7E" }}>
          {appraisalScore ?? "—"}
        </div>
        <div className="flex-1">
          {ratingLabel && (
            <Chip label={ratingLabel} color={ratingCfg?.color} bg={ratingCfg?.bg} />
          )}
          <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${appraisalScore ?? 0}%`, background: barColor }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: C.textMuted }}>
            {pct < 100 ? `${100 - pct}% of criteria still unrated` : "All criteria rated"}
          </p>
        </div>
      </div>

      {/* Performance score impact */}
      {appraisalContribution != null && (
        <div className="rounded-lg p-3" style={{ background: C.primaryLight, border: "1px solid #C7D2FE" }}>
          <p className="text-[10px] font-bold mb-1.5" style={{ color: C.primary }}>
 Impact on Performance Score
          </p>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            {[
              { label: "KPI",        pct: "40%", note: "goals"      },
              { label: "Attendance", pct: "20%", note: "present"    },
              { label: "Training",   pct: "20%", note: "courses"    },
              { label: "Appraisal",  pct: "20%", note: `~${appraisalContribution}pts`, highlight: true },
            ].map((s) => (
              <div key={s.label} className="rounded-lg p-1.5"
                style={{ background: s.highlight ? "#4F46E5" : "white", border: `1px solid ${s.highlight ? "#4F46E5" : C.border}` }}>
                <p className="text-[9px] font-bold" style={{ color: s.highlight ? "white" : C.primary }}>{s.pct}</p>
                <p className="text-[8px]" style={{ color: s.highlight ? "#C7D2FE" : C.textMuted }}>{s.label}</p>
                <p className="text-[8px] font-semibold" style={{ color: s.highlight ? "white" : C.textSecondary }}>{s.note}</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] mt-2" style={{ color: C.accent }}>
            This appraisal contributes ~{appraisalContribution} points to the employee's final performance score once HR finalises it.
          </p>
        </div>
      )}

      {/* Per-criterion breakdown */}
      <div className="space-y-1.5">
        {ratings.filter((r) => r.score > 0).map((r, i) => {
          const contribution = Math.round((r.score / (r.maxScore ?? 5)) * 100 * (r.weight / 100));
          return (
            <div key={i} className="flex items-center gap-2">
              <p className="text-[10px] flex-1 truncate" style={{ color: "#334155" }}>{r.label}</p>
              <StarDisplay score={r.score} max={r.maxScore ?? 5} />
              <span className="text-[10px] font-bold w-10 text-right shrink-0" style={{ color: C.primary }}>
                +{contribution}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// APPRAISAL DETAIL MODAL (read-only for manager after submission)
// ══════════════════════════════════════════════════════════════
function AppraisalDetailModal({ appraisal, onClose }) {
  const statusCfg = APPRAISAL_STATUS[appraisal.status] ?? APPRAISAL_STATUS.draft;
  const empName   = appraisal.employee
    ? `${appraisal.employee.firstName} ${appraisal.employee.lastName}`
    : "Employee";

  return (
    <Motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[88vh] flex flex-col"
        style={{ background: C.surface, boxShadow: C.shadow.lift }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid #E4E7F0" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.primaryLight }}>
              <ClipboardList size={14} color={C.primary} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                {empName} — {appraisal.cycleName ?? appraisal.period}
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>Period: {appraisal.period}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip label={statusCfg.label} color={statusCfg.color} bg={statusCfg.bg} />
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C.bgMid }}>
              <X size={13} color={C.textMuted} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Score summary */}
          {(appraisal.appraisalScore != null || appraisal.managerOverall != null) && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Your Score",  value: appraisal.managerOverall  != null ? Math.round(appraisal.managerOverall)  : "—", color: C.primary, bg: C.primaryLight  },
                { label: "HR Score",    value: appraisal.hrOverall        != null ? Math.round(appraisal.hrOverall)        : "—", color: C.primary, bg: C.primaryTint  },
                { label: "Final Score", value: appraisal.appraisalScore   != null ? Math.round(appraisal.appraisalScore)   : "—", color: "#047857", bg: C.successLight  },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                  <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Your ratings breakdown */}
          {Array.isArray(appraisal.managerRatings) && appraisal.managerRatings.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: C.textMuted }}>Your Ratings</p>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E4E7F0" }}>
                {appraisal.managerRatings.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3"
                    style={{ background: i % 2 === 0 ? "#FFFFFF" : C.surfaceAlt, borderBottom: i < appraisal.managerRatings.length - 1 ? "1px solid #E4E7F0" : "none" }}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{r.label}</p>
                      {r.comment && <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>{r.comment}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StarDisplay score={r.score} max={r.maxScore ?? 5} />
                      <span className="text-xs font-bold w-8 text-right" style={{ color: C.primary }}>{r.score}/{r.maxScore ?? 5}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appraisal.managerFeedback && (
            <div className="rounded-xl p-4" style={{ background: C.primaryLight, border: "1px solid #C7D2FE" }}>
              <p className="text-xs font-bold mb-1" style={{ color: C.primary }}>Your Feedback</p>
              <p className="text-xs leading-relaxed" style={{ color: C.textPrimary }}>{appraisal.managerFeedback}</p>
            </div>
          )}

          {appraisal.status === "completed" && appraisal.hrFeedback && (
            <div className="rounded-xl p-4" style={{ background: C.primaryTint, border: "1px solid #C7D2FE" }}>
              <p className="text-xs font-bold mb-1" style={{ color: C.primary }}>HR Feedback</p>
              <p className="text-xs leading-relaxed" style={{ color: C.textPrimary }}>{appraisal.hrFeedback}</p>
            </div>
          )}

          {appraisal.status === "rejected" && appraisal.hrFeedback && (
            <div className="rounded-xl p-4" style={{ background: C.dangerLight, border: "1px solid #FEE2E2" }}>
              <p className="text-xs font-bold mb-1" style={{ color: "#B91C1C" }}>Returned — HR Notes</p>
              <p className="text-xs leading-relaxed" style={{ color: C.textPrimary }}>{appraisal.hrFeedback}</p>
            </div>
          )}

          {["submitted", "hr_scored"].includes(appraisal.status) && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: C.warningLight, border: "1px solid #FEF3C7" }}>
              <Clock size={14} color="#92400E" className="shrink-0" />
              <p className="text-xs" style={{ color: C.warningInk }}>
                {appraisal.status === "submitted"
                  ? "Appraisal is in the HR review queue. You'll be notified when HR completes their review."
                  : "HR has completed their scoring. Awaiting final sign-off."}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-full text-sm font-semibold"
            style={{ background: C.bgMid, border: "1px solid #E4E7F0", color: C.textSecondary }}>
            Close
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// CREATE / EDIT APPRAISAL MODAL
// ══════════════════════════════════════════════════════════════
function CreateAppraisalModal({ deptEmployees, templates, editAppraisal, onClose, onSaved }) {
  const isEdit = !!editAppraisal;

  const [employeeId, setEmployeeId] = useState(editAppraisal?.employeeId ?? "");
  const [period,     setPeriod]     = useState(editAppraisal?.period ?? new Date().toISOString().slice(0, 7));
  const [cycleName,  setCycleName]  = useState(editAppraisal?.cycleName ?? "");
  const [templateId, setTemplateId] = useState(editAppraisal?.templateId ?? "");
  const [feedback,   setFeedback]   = useState(editAppraisal?.managerFeedback ?? "");
  const [ratings,    setRatings]    = useState(() =>
    editAppraisal?.managerRatings?.length
      ? editAppraisal.managerRatings.map((r) => ({ ...r, score: Number(r.score ?? 0), comment: r.comment ?? "" }))
      : CRITERIA_DEFAULTS.map((c) => ({ ...c, score: 0, comment: "" }))
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  // Swap criteria when template changes
  useEffect(() => {
    if (!templateId) {
      if (!editAppraisal?.managerRatings?.length) {
        setRatings(CRITERIA_DEFAULTS.map((c) => ({ ...c, score: 0, comment: "" })));
      }
      return;
    }
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl?.criteria?.length) {
      setRatings(
        tmpl.criteria.filter((c) => c?.label).map((c) => ({
          label: c.label,
          weight: c.weight ?? 100 / tmpl.criteria.length,
          maxScore: c.max_score ?? 5,
          score: 0,
          comment: "",
        }))
      );
    }
  }, [templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  const setRating = (i, field, val) =>
    setRatings((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const handleSave = async (andSubmit = false) => {
    if (!employeeId) { setError("Select an employee."); return; }
    if (!period)     { setError("Period is required."); return; }
    const hasContent = ratings.some((r) => r.score > 0) || feedback.trim().length > 0;
    if (andSubmit && !hasContent) {
      setError("Please rate at least one criterion or add feedback before submitting.");
      return;
    }
    setSaving(true); setError("");
    try {
      const payload = {
        period,
        cycleName:       cycleName  || undefined,
        templateId:      templateId || undefined,
        managerFeedback: feedback   || undefined,
        managerRatings:  ratings.filter((r) => r.score > 0),
      };
      let appraisal;
      if (isEdit) {
        const res = await updateAppraisal(editAppraisal.id, payload);
        appraisal = res.appraisal;
      } else {
        const res = await createAppraisal(employeeId, payload);
        appraisal = res.appraisal;
      }
      if (andSubmit && appraisal?.id) {
        await submitAppraisal(appraisal.id);
      }
      onSaved(andSubmit ? "Appraisal submitted to HR." : isEdit ? "Draft updated." : "Draft saved.");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to save appraisal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden max-h-[94vh] flex flex-col"
        style={{ background: C.surface, border: "1px solid #E4E7F0", boxShadow: C.shadow.lift }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid #E4E7F0" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.primaryLight }}>
              <ClipboardList size={14} color={C.primary} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>{isEdit ? "Edit Appraisal" : "New Appraisal"}</p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>Rate · Feedback · Submit to HR</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C.bgMid }}>
            <X size={13} color={C.textMuted} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: C.dangerLight }}>
              <AlertTriangle size={13} color="#B91C1C" />
              <p className="text-xs" style={{ color: "#B91C1C" }}>{error}</p>
            </div>
          )}

          {/* Dept scope notice */}
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: C.primaryLight, border: "1px solid #C7D2FE" }}>
            <Shield size={13} color={C.primary} className="shrink-0" />
            <p className="text-xs" style={{ color: C.primary }}>
              You can only appraise employees in your own department.
            </p>
          </div>

          {/* Employee + Period row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                Employee <span style={{ color: "#B91C1C" }}>*</span>
              </label>
              <select
                value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} disabled={isEdit}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: C.surfaceAlt, border: "1.5px solid #E4E7F0", color: C.textPrimary, opacity: isEdit ? 0.6 : 1 }}>
                <option value="">— Select employee —</option>
                {deptEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.first_name ?? e.firstName} {e.last_name ?? e.lastName}
                    {(e.job_role_name ?? e.jobRole) ? ` · ${e.job_role_name ?? e.jobRole}` : ""}
                  </option>
                ))}
              </select>
              {deptEmployees.length === 0 && (
                <p className="text-[10px] mt-1" style={{ color: C.textMuted }}>No employees found in your department.</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                Period <span style={{ color: "#B91C1C" }}>*</span>
              </label>
              <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: C.surfaceAlt, border: "1.5px solid #E4E7F0", color: C.textPrimary }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>Cycle Name (optional)</label>
              <input value={cycleName} onChange={(e) => setCycleName(e.target.value)}
                placeholder="e.g. H1 2025 Review"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: C.surfaceAlt, border: "1.5px solid #E4E7F0", color: C.textPrimary }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>Template (optional)</label>
              <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: C.surfaceAlt, border: "1.5px solid #E4E7F0", color: C.textPrimary }}>
                <option value="">— Default criteria —</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* ── CRITERIA WITH STAR PICKERS ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold" style={{ color: C.textPrimary }}>Performance Criteria</p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                Click stars to rate (1–5) · click again to clear
              </p>
            </div>
            <div className="space-y-3">
              {ratings.map((r, i) => (
                <div key={i} className="rounded-xl p-4"
                  style={{ background: r.score > 0 ? "#F7F8FC" : C.surfaceAlt, border: `1.5px solid ${r.score > 0 ? "#C7D2FE" : C.border}` }}>
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: label + weight */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{r.label}</p>
                      <p className="text-[10px]" style={{ color: C.textMuted }}>
                        Weight: {r.weight}% of appraisal score
                      </p>
                    </div>
                    {/* Right: star picker + score text */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <StarPicker
                        value={r.score}
                        max={r.maxScore ?? 5}
                        onChange={(v) => setRating(i, "score", v)}
                      />
                      <p className="text-[11px] font-bold"
                        style={{ color: r.score > 0 ? "#F59E0B" : "#CBD5E1" }}>
                        {r.score > 0
                          ? `${r.score} / ${r.maxScore ?? 5} stars`
                          : "Not rated yet"}
                      </p>
                    </div>
                  </div>
                  {/* Comment input */}
                  <input
                    value={r.comment}
                    onChange={(e) => setRating(i, "comment", e.target.value)}
                    placeholder={`Comment on ${r.label.toLowerCase()} (optional)…`}
                    className="mt-3 w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: C.surface, border: "1px solid #E4E7F0", color: C.textPrimary }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live score preview */}
          <LiveScorePreview ratings={ratings} />

          {/* Overall feedback */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
              Overall Feedback
            </label>
            <textarea
              rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)}
              placeholder="Summarise the employee's performance this period. This will be visible to the employee once the appraisal is finalised by HR."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ background: C.surfaceAlt, border: "1.5px solid #E4E7F0", color: C.textPrimary }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5 shrink-0" style={{ borderTop: "1px solid #E4E7F0", paddingTop: 16 }}>
          <button onClick={onClose} className="py-2.5 px-4 rounded-full text-sm font-semibold"
            style={{ background: C.surfaceAlt, color: C.textSecondary, border: "1px solid #E4E7F0" }}>
            Cancel
          </button>
          <Motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => handleSave(false)} disabled={saving}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: C.surfaceAlt, color: C.textPrimary, border: "1px solid #E4E7F0", opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            Save Draft
          </Motion.button>
          <Motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => handleSave(true)} disabled={saving}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Submit to HR
          </Motion.button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function ManagerPerformance() {
  const navigate = useNavigate();
  const { employee: authEmployee } = useAuth();

  const [scores,       setScores]       = useState([]);
  const [latestScore,  setLatestScore]  = useState(null);
  const [trends,       setTrends]       = useState([]);
  const [goals,        setGoals]        = useState([]);
  const [insights,     setInsights]     = useState([]);
  const [mgrAppraisals, setMgrAppraisals] = useState([]);
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [templates,    setTemplates]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState("overview");
  const [createModal,  setCreateModal]  = useState(null);
  const [detailModal,  setDetailModal]  = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const myId      = authEmployee?.id ?? authEmployee?.employeeId;
  const myDeptId  = authEmployee?.departmentId ?? authEmployee?.department_id;
  const myDeptName = authEmployee?.department ?? authEmployee?.department_name ?? "";
  const isAdmin   = authEmployee?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      if (!myId) throw new Error("No employee profile linked to this account.");

      const results = await Promise.allSettled([
        getEmployeeScores(myId),                                                   // 0
        getMyGoals(),                                                              // 1
        getTrends(myId),                                                           // 2
        getInsights(myId),                                                         // 3
        listAppraisals({ managerId: myId }),                                       // 4
        listTemplates(),                                                           // 5
        getEmployees(myDeptId ? { departmentId: myDeptId } : { limit: 200 }),     // 6
      ]);

      const g = (i) => results[i]?.status === "fulfilled" ? results[i].value : null;

      setScores(g(0)?.data ?? []);
      setLatestScore((g(0)?.data ?? [])[0] ?? null);
      setGoals(g(1)?.data ?? g(1)?.goals ?? []);
      setTrends(g(2)?.data ?? g(2)?.trends ?? []);
      setInsights(g(3)?.data ?? g(3) ?? []);
      setMgrAppraisals(g(4)?.appraisals ?? []);
      setTemplates(g(5)?.templates ?? []);

      const rawEmps = g(6)?.data ?? g(6)?.employees ?? [];
      const filtered = isAdmin || !myDeptId
        ? rawEmps
        : rawEmps.filter((e) => (e.department_id ?? e.departmentId) === myDeptId);
      setDeptEmployees(filtered.filter((e) => e.id !== myId));
    } catch (err) {
      setError(err?.response?.data?.message ?? err.message ?? "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [myId, myDeptId, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const completedGoals  = goals.filter((g) => g.status?.toLowerCase() === "completed" || g.progress >= 100);
  const inProgressGoals = goals.filter((g) => g.status?.toLowerCase() === "in_progress" && g.progress < 100);
  const pendingDrafts   = mgrAppraisals.filter((a) => ["draft", "rejected"].includes(a.status));
  const ratingCfg       = RATING_MAP[latestScore?.rating] ?? { color: C.textSecondary, bg: C.bgMid };

  const handleSubmitDraft = async (appraisal) => {
    try {
      await submitAppraisal(appraisal.id);
      showToast("Appraisal submitted to HR.");
      load();
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Submit failed.", "error");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bgMid }}>
        <Loader2 size={28} className="animate-spin" style={{ color: C.primary }} />
      </div>
    );

  return (
    <div className="min-h-screen" style={{ background: C.bgMid, color: C.textPrimary }}>
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* TOPBAR */}
          <header className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{ background: "rgba(240,242,248,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E4E7F0" }}>
            <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/managerprofile")}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold"
              style={{ background: C.surface, border: "1px solid #E4E7F0", color: C.textSecondary }}>
              <Menu size={14} /> Manager Dashboard
            </Motion.button>
            <div className="flex items-center gap-2 ml-auto">
              <Motion.button whileHover={{ scale: 1.05 }} onClick={load}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: C.surface, border: "1px solid #E4E7F0" }}>
                <RefreshCw size={14} color={C.textSecondary} />
              </Motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* HERO */}
            <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{ background: C.gradient.hero }}>
              <div className="relative flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
                  <BarChart2 size={30} />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl ">Manager Performance</h1>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    {authEmployee?.name ?? "Manager"}
                    <span className="ml-2 text-indigo-300 text-xs font-semibold">· {myDeptName || "Manager"}</span>
                    {latestScore && <span> · Score: <strong>{latestScore.final_score}</strong> — {latestScore.rating}</span>}
                  </p>
                </div>
                {latestScore && <div className="shrink-0"><Chip label={latestScore.rating} color={ratingCfg.color} bg={ratingCfg.bg} /></div>}
              </div>
            </Motion.div>

            {error && (
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: C.dangerLight }}>
                <AlertTriangle size={16} color="#B91C1C" />
                <p className="text-sm" style={{ color: "#B91C1C" }}>{error}</p>
              </div>
            )}

            {/* Drafts alert */}
            {pendingDrafts.length > 0 && (
              <Motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: C.primaryLight, border: "1px solid #C7D2FE" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.primary }}>
                  <ClipboardList size={15} color="#fff" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                    {pendingDrafts.length} appraisal draft{pendingDrafts.length > 1 ? "s" : ""} awaiting submission
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.primary }}>Submit to HR to complete the review cycle.</p>
                </div>
                <Motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab("appraisals")}
                  className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
                  style={{ background: C.primary, color: "#fff" }}>
                  View Drafts
                </Motion.button>
              </Motion.div>
            )}

            {/* TABS */}
            <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
              style={{ background: C.surface, border: "1px solid #E4E7F0", scrollbarWidth: "none" }}>
              {TABS.map((t) => {
                const active = activeTab === t.id;
                const badge  = t.id === "appraisals" ? mgrAppraisals.length : null;
                return (
                  <Motion.button key={t.id} whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(t.id)}
                    className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
                    style={{ background: active ? "#4F46E5" : "transparent", color: active ? "#fff" : C.textSecondary,
                      boxShadow: active ? "0 2px 8px rgba(79,70,229,0.25)" : "none" }}>
                    {t.label}
                    {badge > 0 && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: active ? "rgba(255,255,255,0.25)" : C.primaryLight, color: active ? "#fff" : C.primary }}>
                        {badge}
                      </span>
                    )}
                  </Motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <Motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Card className="p-6 flex items-center gap-6">
                      <ScoreRing score={latestScore?.final_score} />
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-xs" style={{ color: C.textSecondary }}>Current Rating</p>
                          {latestScore?.rating
                            ? <Chip label={latestScore.rating} color={ratingCfg.color} bg={ratingCfg.bg} />
                            : <p className="text-sm font-semibold" style={{ color: C.textMuted }}>No data</p>}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "KPI",        value: latestScore?.kpi_score        ?? "—" },
                            { label: "Attendance", value: latestScore?.attendance_score ?? "—" },
                            { label: "Training",   value: latestScore?.training_score   ?? "—" },
                          ].map((s) => (
                            <div key={s.label} className="rounded-xl p-2 text-center" style={{ background: C.surfaceAlt }}>
                              <p className="text-sm font-black" style={{ color: C.textPrimary }}>{s.value}</p>
                              <p className="text-[9px] font-semibold" style={{ color: C.textMuted }}>{s.label}</p>
                            </div>
                          ))}
                        </div>
                        {latestScore?.appraisal_score != null && (
                          <div className="rounded-xl p-2 text-center" style={{ background: C.primaryTint }}>
                            <p className="text-sm font-black" style={{ color: C.primary }}>{Math.round(latestScore.appraisal_score)}</p>
                            <p className="text-[9px] font-semibold" style={{ color: C.primary }}>Appraisal</p>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <CardHead icon={TrendingUp} title="Score Trend" sub="Monthly performance history" color={C.success} bg={C.successLight} />
                      <div className="p-4">
                        {trends.length === 0
                          ? <p className="text-sm text-center py-6" style={{ color: C.textMuted }}>No trend data yet</p>
                          : <TrendLine data={trends.slice(-6)} />}
                      </div>
                    </Card>
                  </div>

                  {insights.length > 0 && (
                    <Card>
                      <CardHead icon={Sparkles} title="Performance Insights" sub="Auto-generated" color={C.primary} bg={C.primaryTint} />
                      <div className="p-4 space-y-2">
                        {insights.map((ins, i) => {
                          const cfg = {
                            positive:   { color: "#047857", bg: C.successLight, icon: TrendingUp    },
                            warning:    { color: "#B91C1C", bg: C.dangerLight, icon: AlertCircle   },
                            leadership: { color: C.primary, bg: C.primaryTint, icon: Trophy        },
                            pip:        { color: "#B91C1C", bg: C.dangerLight, icon: AlertTriangle },
                          }[ins.type] ?? { color: C.primary, bg: C.primaryLight, icon: Info };
                          const Icon = cfg.icon;
                          return (
                            <Motion.div key={i} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                              className="flex items-center gap-3 p-3 rounded-xl"
                              style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}>
                              <Icon size={14} color={cfg.color} className="shrink-0" />
                              <p className="text-xs font-medium" style={{ color: cfg.color }}>{ins.message}</p>
                            </Motion.div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Goals In Progress",  value: inProgressGoals.length, icon: Target,        color: C.primary, bg: C.primaryLight  },
                      { label: "Goals Completed",    value: completedGoals.length,  icon: CheckCircle2,  color: "#047857", bg: C.successLight  },
                      { label: "Team Appraisals",    value: mgrAppraisals.length,   icon: ClipboardList, color: C.primary, bg: C.primaryTint  },
                      { label: "Drafts Pending",     value: pendingDrafts.length,   icon: Clock,         color: "#92400E", bg: C.warningLight  },
                    ].map((s, i) => (
                      <Motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" animate="visible" whileHover={{ y: -2 }}
                        className="rounded-2xl p-4 flex items-center gap-3"
                        style={{ background: C.surface, border: "1px solid #E4E7F0" }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <s.icon size={16} color={s.color} />
                        </div>
                        <div>
                          <p className="text-xl font-black" style={{ color: C.textPrimary }}>{s.value}</p>
                          <p className="text-[11px]" style={{ color: C.textSecondary }}>{s.label}</p>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                </Motion.div>
              )}

              {/* ── GOALS ── */}
              {activeTab === "goals" && (
                <Motion.div key="goals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <Card>
                    <CardHead icon={Target} title="My Goals & KPIs"
                      sub={`${goals.length} goals · ${completedGoals.length} completed`}
                      action={<Chip label={`${inProgressGoals.length} active`} />}
                    />
                    <div className="p-4 space-y-3">
                      {goals.length === 0 ? (
                        <div className="py-12 text-center">
                          <Target size={36} color={C.textMuted} className="mx-auto mb-2" />
                          <p className="font-semibold text-sm" style={{ color: C.textSecondary }}>No goals assigned yet</p>
                        </div>
                      ) : goals.map((goal, i) => (
                        <Motion.div key={goal.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                          className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                          <p className="font-semibold text-sm mb-2" style={{ color: C.textPrimary }}>{goal.title}</p>
                          <GoalBar progress={goal.progress ?? 0} />
                          {goal.due_date && (
                            <p className="text-[10px] mt-2" style={{ color: C.textMuted }}>Due: {goal.due_date}</p>
                          )}
                        </Motion.div>
                      ))}
                    </div>
                  </Card>
                </Motion.div>
              )}

              {/* ── TEAM APPRAISALS ── */}
              {activeTab === "appraisals" && (
                <Motion.div key="appraisals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  <Card>
                    <CardHead icon={Users} title="My Team Appraisals"
                      sub={`Department: ${myDeptName || "—"}`}
                      color={C.primary} bg={C.primaryLight}
                      action={
                        <Motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setCreateModal("new")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                          style={{ background: C.primary }}>
                          <Plus size={13} /> New Appraisal
                        </Motion.button>
                      }
                    />
                    <div className="p-4 space-y-3">
                      {mgrAppraisals.length === 0 ? (
                        <div className="py-10 text-center">
                          <Users size={32} color={C.textMuted} className="mx-auto mb-2" />
                          <p className="font-semibold text-sm" style={{ color: C.textSecondary }}>No appraisals created yet</p>
                          <p className="text-xs mt-1 mb-4" style={{ color: C.textMuted }}>
                            Rate your team members to help HR assess their performance.
                          </p>
                          <Motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setCreateModal("new")}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
                            style={{ background: C.primary }}>
                            <Plus size={15} /> Create First Appraisal
                          </Motion.button>
                        </div>
                      ) : mgrAppraisals.map((apr, i) => {
                        const statusCfg  = APPRAISAL_STATUS[apr.status] ?? APPRAISAL_STATUS.draft;
                        const empName    = apr.employee
                          ? `${apr.employee.firstName} ${apr.employee.lastName}`
                          : apr.employeeId;
                        const isEditable = ["draft", "rejected"].includes(apr.status);
                        const isLocked   = apr.status === "completed";
                        const isWaiting  = ["submitted", "hr_scored"].includes(apr.status);

                        return (
                          <Motion.div key={apr.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                            className="rounded-2xl border overflow-hidden"
                            style={{ borderColor: apr.status === "rejected" ? "#FEE2E2" : C.border, background: C.surface }}>
                            <div className="flex items-center gap-4 p-4">
                              {/* Avatar initials */}
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
                                style={{ background: isLocked ? "#047857" : isWaiting ? "#92400E" : C.primary }}>
                                {empName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>{empName}</p>
                                  <Chip label={statusCfg.label} color={statusCfg.color} bg={statusCfg.bg} />
                                </div>
                                <div className="flex items-center gap-3 text-[11px] flex-wrap" style={{ color: C.textMuted }}>
                                  <span>{apr.cycleName ?? `Period ${apr.period}`}</span>
                                  {apr.employee?.department && <><span>·</span><span>{apr.employee.department}</span></>}
                                  {isLocked && apr.appraisalScore != null && (
                                    <span className="font-bold" style={{ color: "#047857" }}>
                                      Final: {Math.round(apr.appraisalScore)}/100
                                    </span>
                                  )}
                                  {apr.managerOverall != null && !isLocked && (
                                    <span style={{ color: C.primary }}>
                                      Your score: {Math.round(apr.managerOverall)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 shrink-0">
                                {isLocked && (
                                  <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl"
                                    style={{ background: C.bgMid, color: C.textMuted }}>
                                    <Lock size={11} /> Locked
                                  </span>
                                )}
                                {isEditable && (
                                  <>
                                    <Motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                      onClick={() => setCreateModal(apr)}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full"
                                      style={{ background: C.primaryLight, color: C.primary }}>
                                      <Eye size={12} /> Edit
                                    </Motion.button>
                                    <Motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                      onClick={() => handleSubmitDraft(apr)}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full text-white"
                                      style={{ background: C.primary }}>
                                      <Send size={11} /> Submit
                                    </Motion.button>
                                  </>
                                )}
                                {(isWaiting || isLocked) && (
                                  <Motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => setDetailModal(apr)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full"
                                    style={{ background: C.primaryLight, color: C.primary }}>
                                    <Eye size={12} /> View
                                  </Motion.button>
                                )}
                              </div>
                            </div>

                            {/* Rejected reason */}
                            {apr.status === "rejected" && apr.hrFeedback && (
                              <div className="px-4 pb-4">
                                <div className="p-3 rounded-xl text-xs" style={{ background: C.dangerLight, color: "#B91C1C" }}>
                                  <span className="font-bold">HR returned: </span>
                                  {apr.hrFeedback.slice(0, 160)}{apr.hrFeedback.length > 160 ? "…" : ""}
                                </div>
                              </div>
                            )}

                            {/* Progress stepper */}
                            {isWaiting && (
                              <div className="px-4 pb-4">
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                                  <div className="h-full rounded-full transition-all duration-500"
                                    style={{ width: apr.status === "submitted" ? "60%" : "85%", background: statusCfg.color }} />
                                </div>
                                <div className="flex justify-between mt-1.5 text-[9px] font-semibold">
                                  {["Draft", "Submitted", "HR Review", "Complete"].map((step, si) => {
                                    const stepIdx = ["draft", "submitted", "hr_scored", "completed"].indexOf(apr.status);
                                    return (
                                      <span key={step} style={{ color: si <= stepIdx ? statusCfg.color : C.textMuted }}>{step}</span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </Motion.div>
                        );
                      })}
                    </div>
                  </Card>
                </Motion.div>
              )}

              {/* ── HISTORY ── */}
              {activeTab === "history" && (
                <Motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <Card>
                    <CardHead icon={BarChart2} title="Score History" sub="All recorded performance scores" />
                    <div className="p-4 space-y-3">
                      {scores.length === 0 ? (
                        <div className="py-12 text-center">
                          <BarChart2 size={36} color={C.textMuted} className="mx-auto mb-2" />
                          <p className="font-semibold text-sm" style={{ color: C.textSecondary }}>No score history yet</p>
                        </div>
                      ) : scores.map((sc, i) => {
                        const rCfg = RATING_MAP[sc.rating] ?? { color: C.textSecondary, bg: C.bgMid };
                        return (
                          <Motion.div key={sc.id ?? i} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                            className="flex items-center gap-4 p-4 rounded-2xl"
                            style={{ background: C.surfaceAlt, border: "1px solid #E4E7F0" }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-lg"
                              style={{ background: rCfg.bg, color: rCfg.color }}>
                              {sc.final_score}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>{sc.period}</p>
                                <Chip label={sc.rating} color={rCfg.color} bg={rCfg.bg} />
                              </div>
                              <div className="flex gap-3 text-[11px] flex-wrap" style={{ color: C.textMuted }}>
                                <span>KPI: {sc.kpi_score}</span>
                                <span>·</span>
                                <span>Attendance: {sc.attendance_score}</span>
                                <span>·</span>
                                <span>Training: {sc.training_score}</span>
                                {sc.appraisal_score != null && (
                                  <><span>·</span><span style={{ color: C.primary, fontWeight: 700 }}>Appraisal: {Math.round(sc.appraisal_score)}</span></>
                                )}
                              </div>
                            </div>
                          </Motion.div>
                        );
                      })}
                    </div>
                  </Card>
                </Motion.div>
              )}
            </AnimatePresence>
            <div className="h-6" />
          </main>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {detailModal && (
          <AppraisalDetailModal appraisal={detailModal} onClose={() => setDetailModal(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createModal && (
          <CreateAppraisalModal
            deptEmployees={deptEmployees}
            templates={templates}
            editAppraisal={createModal === "new" ? null : createModal}
            onClose={() => setCreateModal(null)}
            onSaved={(msg) => { setCreateModal(null); showToast(msg); load(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}