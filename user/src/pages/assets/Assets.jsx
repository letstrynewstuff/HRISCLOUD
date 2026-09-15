

// src/pages/employee/Assets.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  Eye,
  X,
  Loader2,
  Briefcase,
  Calendar,
  MapPin,
  Shield,
} from "lucide-react";
import C from "../../styles/colors";
import { assetApi } from "../../api/service/assetApi";
import { authApi } from "../../api/service/authApi";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Skeleton = ({ className = "" }) => (
  <div
    className={`rounded-xl animate-pulse ${className}`}
    style={{ background: C.bgMid ?? "#E8EBF4" }}
  />
);

const Card = ({ children, className = "", style = {}, onClick }) => (
  <motion.div
    whileHover={
      onClick ? { y: -2, boxShadow: "0 12px 40px rgba(79,70,229,0.10)" } : {}
    }
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{ borderColor: C.border, ...style }}
  >
    {children}
  </motion.div>
);

function Toast({ msg, type = "success", onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{ background: C.navy ?? "#1E1B4B", color: "#fff", minWidth: 300 }}
    >
      {type === "error" ? (
        <AlertCircle size={15} color={C.danger} />
      ) : (
        <CheckCircle2 size={15} color={C.success} />
      )}
      <span className="text-sm font-medium flex-1">{msg}</span>
      <button onClick={onDismiss}>
        <X size={13} color="rgba(255,255,255,0.5)" />
      </button>
    </motion.div>
  );
}

const CATEGORY_META = {
  laptop:       { icon: Briefcase, color: C.primary,  bg: C.primaryLight,  label: "Laptop" },
  phone:        { icon: Package,   color: C.accent,   bg: C.accentLight,   label: "Phone / Tablet" },
  furniture:    { icon: MapPin,    color: C.warning,  bg: C.warningLight,  label: "Furniture" },
  vehicle:      { icon: ChevronDown, color: C.success, bg: C.successLight, label: "Vehicle" },
  electronics:  { icon: Shield,    color: C.info ?? "#3B82F6", bg: "#EFF6FF", label: "Electronics" },
  other:        { icon: Package,   color: C.textMuted, bg: C.surfaceAlt,    label: "Other" },
};
const getCatMeta = (cat) =>
  CATEGORY_META[cat?.toLowerCase()] ?? {
    icon: Package,
    color: C.primary,
    bg: C.primaryLight,
    label: cat ?? "Asset",
  };

export default function EmployeeAssetsPage() {
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [myAssets, setMyAssets] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("assets");
  const [detailAsset, setDetailAsset] = useState(null);
  const [detailRequest, setDetailRequest] = useState(null);

  const [reqForm, setReqForm] = useState({
    category: "",
    name: "",
    reason: "",
    priority: "normal",
  });
  const [reqErrors, setReqErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => setToast({ msg, type });

  useEffect(() => {
    authApi
      .getMe()
      .then((res) => setProfile(res.data ?? res))
      .catch(() => setProfile(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const loadData = async () => {
    setDataLoading(true);
    setError(null);
    try {
      const [assetsRes, requestsRes] = await Promise.all([
        assetApi.getMyAssets(),
        assetApi.getMyRequests(),
      ]);
      setMyAssets(assetsRes.data ?? []);
      setMyRequests(requestsRes.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          "Failed to load asset data. Please refresh.",
      );
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCategories([
      { id: "laptop", name: "Laptop / Computer" },
      { id: "phone", name: "Phone / Tablet" },
      { id: "furniture", name: "Furniture / Desk" },
      { id: "electronics", name: "Electronics / Peripherals" },
      { id: "vehicle", name: "Vehicle" },
      { id: "other", name: "Other" },
    ]);
  }, []);

  const activeCount = myAssets.filter((a) => a.status === "assigned").length;
  const pendingCount = myRequests.filter((r) => r.status === "pending").length;

  const initials = profile
    ? ((profile.firstName?.[0] ?? "") + (profile.lastName?.[0] ?? "")).toUpperCase()
    : "..";
  const displayName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : "Loading…";

  const validateRequest = () => {
    const errs = {};
    if (!reqForm.category) errs.category = "Select a category";
    if (!reqForm.name.trim()) errs.name = "Enter asset name / description";
    if (!reqForm.reason.trim()) errs.reason = "Provide a reason";
    setReqErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRequestSubmit = async () => {
    if (!validateRequest()) return;
    setSubmitting(true);
    try {
      await assetApi.requestAsset({
        category: reqForm.category,
        name: reqForm.name.trim(),
        reason: reqForm.reason.trim(),
        priority: reqForm.priority,
      });
      showToast("Asset request submitted successfully.");
      setReqForm({ category: "", name: "", reason: "", priority: "normal" });
      setReqErrors({});
      await loadData();
      setActiveTab("history");
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? "Failed to submit request.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── TOP NAV ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div className="flex items-center gap-2 flex-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: C.primaryLight }}
              >
                <Package size={15} color={C.primary} />
              </div>
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "Sora,sans-serif" }}
              >
                My Assets
              </span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadData}
                className="p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
                title="Refresh"
              >
                <RefreshCw size={14} color={C.textSecondary} />
              </motion.button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#6366F1,#06B6D4)",
                }}
              >
                {authLoading ? "…" : initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* ── HERO ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="relative rounded-2xl overflow-hidden p-6"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
                minHeight: 120,
              }}
            >
              <div className="relative flex items-center justify-between">
                <div>
                  <h1
                    className="text-white text-2xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Asset Hub
                  </h1>
                  <p className="text-indigo-300 text-sm mt-0.5">
                    {authLoading ? "Loading…" : displayName}
                  </p>
                </div>
                <div className="flex gap-3">
                  {[
                    { label: "Assigned", value: dataLoading ? "—" : activeCount, color: "#A5F3FC" },
                    { label: "Pending", value: dataLoading ? "—" : pendingCount, color: "#FDE68A" },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="px-4 py-2.5 rounded-xl text-center"
                      style={{ background: "rgba(255,255,255,0.10)" }}
                    >
                      <p
                        className="text-xl font-bold"
                        style={{ color, fontFamily: "Sora,sans-serif" }}
                      >
                        {value}
                      </p>
                      <p className="text-[11px] text-white/60">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── TABS ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.4}
            >
              <div
                className="flex gap-1 p-1 rounded-xl w-full"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                {[
                  { id: "assets",  label: "My Assets",  icon: Package },
                  { id: "request",  label: "Request",    icon: Plus },
                  { id: "history",  label: "History",    icon: Clock },
                ].map(({ id, label, icon: Icon }) => (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
                    style={{
                      background: activeTab === id ? C.primary : "transparent",
                      color: activeTab === id ? "#fff" : C.textSecondary,
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* ── Error banner ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{
                    background: C.dangerLight,
                    border: `1px solid ${C.danger}33`,
                  }}
                >
                  <AlertCircle size={15} color={C.danger} />
                  <p className="text-sm" style={{ color: C.danger }}>
                    {error}
                  </p>
                  <button
                    onClick={loadData}
                    className="ml-auto text-xs font-semibold flex items-center gap-1"
                    style={{ color: C.danger }}
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ══ MY ASSETS TAB ══ */}
              {activeTab === "assets" && (
                <motion.div
                  key="assets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {dataLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-36" />
                      ))}
                    </div>
                  ) : myAssets.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20">
                      <Package size={40} color={C.textMuted} />
                      <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                        No assigned assets
                      </p>
                      <p className="text-xs" style={{ color: C.textMuted }}>
                        Assets assigned to you by HR will appear here.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab("request")}
                        className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: C.primary, color: "#fff" }}
                      >
                        Request an Asset
                      </motion.button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {myAssets.map((asset, i) => {
                        const meta = getCatMeta(asset.category);
                        return (
                          <motion.div
                            key={asset.id}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={i}
                          >
                            <Card
                              className="p-4"
                              onClick={() => setDetailAsset(asset)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                                  style={{ background: meta.bg }}
                                >
                                  <meta.icon size={18} color={meta.color} />
                                </div>
                              </div>

                              <p
                                className="font-bold text-sm mb-0.5 truncate"
                                style={{ color: C.textPrimary }}
                              >
                                {asset.name}
                              </p>
                              <p
                                className="text-[11px] mb-3"
                                style={{ color: C.textMuted }}
                              >
                                {asset.brand} {asset.model}
                              </p>

                              <div className="space-y-2">
                                {asset.assignedAt && (
                                  <div className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
                                    <Calendar size={11} />
                                    <span>Assigned {new Date(asset.assignedAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</span>
                                  </div>
                                )}
                                {asset.condition && (
                                  <div className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
                                    <Shield size={11} />
                                    <span>Condition: {asset.condition}</span>
                                  </div>
                                )}
                                {asset.location && (
                                  <div className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
                                    <MapPin size={11} />
                                    <span>{asset.location}</span>
                                  </div>
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ══ REQUEST TAB ══ */}
              {activeTab === "request" && (
                <motion.div
                  key="request"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="max-w-xl mx-auto p-5 sm:p-6 space-y-5">
                    <div>
                      <h2
                        className="text-lg font-bold mb-0.5"
                        style={{ fontFamily: "Sora,sans-serif", color: C.textPrimary }}
                      >
                        Request an Asset
                      </h2>
                      <p className="text-sm" style={{ color: C.textSecondary }}>
                        Submit a request to HR. You'll be notified once reviewed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textPrimary }}>
                        Category *
                      </label>
                      <div className="relative">
                        <select
                          value={reqForm.category}
                          onChange={(e) =>
                            setReqForm((f) => ({ ...f, category: e.target.value }))
                          }
                          className="w-full appearance-none px-4 py-3 rounded-xl text-sm outline-none"
                          style={{
                            background: C.surfaceAlt,
                            border: `1.5px solid ${reqErrors.category ? C.danger : reqForm.category ? C.primary : C.border}`,
                            color: reqForm.category ? C.textPrimary : C.textMuted,
                          }}
                        >
                          <option value="">Select category…</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          color={C.textMuted}
                        />
                      </div>
                      {reqErrors.category && (
                        <p className="text-xs mt-1" style={{ color: C.danger }}>
                          {reqErrors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textPrimary }}>
                        Asset Name / Description *
                      </label>
                      <input
                        type="text"
                        value={reqForm.name}
                        onChange={(e) =>
                          setReqForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="e.g. MacBook Pro M3, 16GB RAM"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{
                          background: C.surfaceAlt,
                          border: `1.5px solid ${reqErrors.name ? C.danger : reqForm.name ? C.primary : C.border}`,
                          color: C.textPrimary,
                        }}
                      />
                      {reqErrors.name && (
                        <p className="text-xs mt-1" style={{ color: C.danger }}>
                          {reqErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textPrimary }}>
                        Priority
                      </label>
                      <div className="flex gap-2">
                        {["low", "normal", "high"].map((p) => (
                          <motion.button
                            key={p}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setReqForm((f) => ({ ...f, priority: p }))}
                            className="flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize"
                            style={{
                              background: reqForm.priority === p ? C.primary : C.surfaceAlt,
                              color: reqForm.priority === p ? "#fff" : C.textSecondary,
                              border: `1px solid ${reqForm.priority === p ? C.primary : C.border}`,
                            }}
                          >
                            {p}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textPrimary }}>
                        Reason *
                      </label>
                      <textarea
                        value={reqForm.reason}
                        onChange={(e) =>
                          setReqForm((f) => ({ ...f, reason: e.target.value }))
                        }
                        placeholder="Why do you need this asset?"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                        style={{
                          background: C.surfaceAlt,
                          border: `1.5px solid ${reqErrors.reason ? C.danger : reqForm.reason ? C.primary : C.border}`,
                          color: C.textPrimary,
                        }}
                      />
                      {reqErrors.reason && (
                        <p className="text-xs mt-1" style={{ color: C.danger }}>
                          {reqErrors.reason}
                        </p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRequestSubmit}
                      disabled={submitting}
                      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                      style={{
                        background: C.primary,
                        color: "#fff",
                        boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                        opacity: submitting ? 0.8 : 1,
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Submitting…
                        </>
                      ) : (
                        <>
                          <Plus size={15} /> Submit Request
                        </>
                      )}
                    </motion.button>
                  </Card>
                </motion.div>
              )}

              {/* ══ HISTORY TAB ══ */}
              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {dataLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  ) : myRequests.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20">
                      <Clock size={40} color={C.textMuted} />
                      <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                        No requests yet
                      </p>
                      <p className="text-xs" style={{ color: C.textMuted }}>
                        Your asset request history will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myRequests.map((req, i) => {
                        const meta = getCatMeta(req.category);
                        return (
                          <motion.div
                            key={req.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer"
                            style={{
                              background: C.surfaceAlt,
                              border: `1px solid ${C.border}`,
                            }}
                            onClick={() => setDetailRequest(req)}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: meta.bg }}
                            >
                              <meta.icon size={16} color={meta.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p
                                  className="font-semibold text-sm truncate"
                                  style={{ color: C.textPrimary }}
                                >
                                  {req.assetName ?? req.name ?? meta.label}
                                </p>
                                {req.priority && req.priority !== "normal" && (
                                  <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                                    style={{
                                      background: req.priority === "high" ? C.dangerLight : C.warningLight,
                                      color: req.priority === "high" ? C.danger : C.warning,
                                    }}
                                  >
                                    {req.priority}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                                {new Date(req.createdAt).toLocaleDateString("en-NG", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                {" · "}
                                {req.reason}
                              </p>
                            </div>
                            <Eye size={14} color={C.textMuted} />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-6" />
          </main>
        </div>
      </div>

      {/* ── Asset Detail Modal ── */}
      <AnimatePresence>
        {detailAsset && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setDetailAsset(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
            >
              <div
                className="rounded-2xl bg-white shadow-2xl overflow-hidden"
                style={{ border: `1px solid ${C.border}` }}
              >
                {(() => {
                  const meta = getCatMeta(detailAsset.category);
                  return (
                    <>
                      <div
                        className="p-5 flex items-start justify-between"
                        style={{ background: meta.bg }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.6)" }}
                          >
                            <meta.icon size={22} color={meta.color} />
                          </div>
                          <div>
                            <p className="font-bold" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
                              {detailAsset.name}
                            </p>
                            <p className="text-xs" style={{ color: C.textSecondary }}>
                              {detailAsset.brand} {detailAsset.model}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDetailAsset(null)}
                          className="p-1.5 rounded-lg"
                          style={{ background: "rgba(0,0,0,0.08)" }}
                        >
                          <X size={16} color={C.textSecondary} />
                        </button>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Category", value: meta.label },
                            { label: "Serial", value: detailAsset.serialNumber ?? "—" },
                            { label: "Condition", value: detailAsset.condition ?? "—" },
                            { label: "Location", value: detailAsset.location ?? "—" },
                            { label: "Assigned", value: detailAsset.assignedAt ? new Date(detailAsset.assignedAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "—" },
                            { label: "Notes", value: detailAsset.notes ?? "—" },
                          ].map(({ label, value }) => (
                            <div key={label} className="p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                              <p className="text-[10px]" style={{ color: C.textMuted }}>{label}</p>
                              <p className="text-sm font-semibold mt-0.5" style={{ color: C.textPrimary }}>{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Request Detail Modal ── */}
      <AnimatePresence>
        {detailRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setDetailRequest(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
            >
              <div
                className="rounded-2xl bg-white shadow-2xl p-5"
                style={{ border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
                    Request Details
                  </p>
                  <button
                    onClick={() => setDetailRequest(null)}
                    className="p-1.5 rounded-lg"
                    style={{ background: C.surfaceAlt }}
                  >
                    <X size={15} color={C.textMuted} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Asset", value: detailRequest.assetName ?? detailRequest.name ?? "—" },
                      { label: "Category", value: getCatMeta(detailRequest.category).label },
                      { label: "Priority", value: detailRequest.priority ?? "normal" },
                      { label: "Submitted", value: new Date(detailRequest.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>{label}</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: C.textPrimary }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                    <p className="text-[10px] mb-1" style={{ color: C.textMuted }}>Reason</p>
                    <p className="text-sm" style={{ color: C.textPrimary }}>{detailRequest.reason}</p>
                  </div>
                  {detailRequest.rejectionReason && (
                    <div
                      className="flex items-start gap-2 p-3 rounded-xl"
                      style={{ background: C.dangerLight }}
                    >
                      <AlertCircle size={13} color={C.danger} className="mt-0.5 shrink-0" />
                      <p className="text-xs" style={{ color: C.danger }}>
                        {detailRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
