// src/admin/approvals/Approvals.jsx
// Route: /admin/approvals

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import AdminSideNavbar from "../AdminSideNavbar";
import Header from "../../components/Header"; // ✅ IMPORT YOUR HEADER
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { C } from "./sharedData";
import { approvalApi } from "../../api/service/approvalApi";

// ─────────────────────────────────────────────────────────────
// TYPE + STATUS CONFIG (unchanged)
// ─────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  leave: { label: "Leave" },
  profile_change: { label: "Profile Change" },
  payroll: { label: "Payroll" },
  document: { label: "Document" },
  loan: { label: "Loan" },
};

const STATUS_CONFIG = {
  pending: { label: "Pending" },
  approved: { label: "Approved" },
  rejected: { label: "Rejected" },
};

// ─────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────

function Avatar({ name, size = 36 }) {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.33,
        background: `linear-gradient(135deg,${C.primary},#6366F1)`,
      }}
    >
      {initials}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ApprovalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  // ─────────────────────────────────────────────
  // LOAD DATA
  // ─────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await approvalApi.getAll({ limit: 100 });
      setApprovals(res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ─────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────

  const stats = useMemo(() => {
    return {
      all: approvals.length,
      pending: approvals.filter((a) => a.status === "pending").length,
      approved: approvals.filter((a) => a.status === "approved").length,
      rejected: approvals.filter((a) => a.status === "rejected").length,
    };
  }, [approvals]);

  // ─────────────────────────────────────────────
  // FILTERED DATA
  // ─────────────────────────────────────────────

  const filtered = useMemo(() => {
    return approvals.filter((a) => {
      const q = search.toLowerCase();

      const matchSearch =
        !q ||
        a.employee_name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q);

      const matchStatus =
        statusTab === "all" || a.status?.toLowerCase() === statusTab;

      return matchSearch && matchStatus;
    });
  }, [approvals, search, statusTab]);

  // ─────────────────────────────────────────────
  // HEADER STATS (for Hero section)
  // ─────────────────────────────────────────────

  const headerStats = [
    {
      label: "Total",
      value: stats.all,
    },
    {
      label: "Pending",
      value: stats.pending,
      color: C.warning,
    },
    {
      label: "Approved",
      value: stats.approved,
      color: C.success,
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: C.danger,
    },
  ];

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          pendingApprovals={stats.pending}
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ✅ USING YOUR HEADER COMPONENT */}
          <Header
            title="Approval Center"
            subtitle="Review and action all requests across modules"
            icon={ClipboardCheck}
            loading={loading}
            searchQuery={search}
            setSearchQuery={setSearch}
            setSidebarOpen={setSidebarOpen}
            pendingCount={stats.pending}
            stats={headerStats}
          />

          {/* ───────── MAIN CONTENT ───────── */}
          <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Status Filter Buttons */}
            <div className="flex gap-3 flex-wrap">
              {["all", "pending", "approved", "rejected"].map((s) => {
                const active = statusTab === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusTab(s)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{
                      background: active ? C.primary : C.surface,
                      color: active ? "#fff" : C.textSecondary,
                      border: `1px solid ${active ? C.primary : C.border}`,
                    }}
                  >
                    {STATUS_CONFIG[s]?.label ?? "All"}
                  </button>
                );
              })}
            </div>

            {/* Approval List */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {loading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <CheckCircle2 size={40} color={C.success} />
                  <p className="mt-3 font-semibold">
                    {statusTab === "pending"
                      ? "No pending approvals 🎉"
                      : "No approvals found"}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map((req) => (
                    <div
                      key={req.id}
                      className="px-5 py-4 flex items-center gap-4"
                    >
                      <Avatar name={req.employee_name} size={38} />

                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {req.employee_name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {req.description ?? "—"}
                        </p>
                      </div>

                      <div className="text-xs font-semibold capitalize">
                        {req.status}
                      </div>

                      <ChevronRight size={16} color={C.textMuted} />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-4 text-red-500 text-sm flex items-center gap-2">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
