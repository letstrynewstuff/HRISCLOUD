// src/admin/documents/DocumentTemplates.jsx
// Route: /admin/documents
// Production-ready version with Header + Loader integrated

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import AdminSideNavbar from "../AdminSideNavbar";
import Header from "../../components/Header";
import {
  FileText,
  Plus,
  Eye,
  Send,
  Upload,
  X,
  Loader2,
  AlertTriangle,
  Trash2,
  BookOpen,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { documentApi } from "../../api/service/documentApi";

// ─────────────────────────────────────────────
// CATEGORY OPTIONS
// ─────────────────────────────────────────────
const CATEGORIES = [
  "Contract",
  "NDA",
  "Offer Letter",
  "Policy",
  "Onboarding",
  "Compliance",
  "Other",
];

// ═════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════

export default function DocumentTemplates() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // ─────────────────────────────────────────
  // LOAD TEMPLATES
  // ─────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentApi.getTemplates();
      setTemplates(res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ─────────────────────────────────────────
  // FILTERED DATA
  // ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const q = search.toLowerCase();

      const matchSearch =
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "all" || t.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [templates, search, categoryFilter]);

  // ─────────────────────────────────────────
  // HEADER STATS
  // ─────────────────────────────────────────
  const headerStats = [
    { label: "Total Templates", value: templates.length },
    {
      label: "Categories",
      value: [...new Set(templates.map((t) => t.category))].length,
      color: C.accent,
    },
  ];

  // ─────────────────────────────────────────
  // DELETE TEMPLATE
  // ─────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template? This cannot be undone.")) return;

    try {
      await documentApi.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete template.");
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

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
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ✅ HEADER WITH LOADER */}
          <Header
            title="Document Templates"
            subtitle="Create templates · Send to employees · Track approvals"
            icon={FileText}
            loading={loading}
            searchQuery={search}
            setSearchQuery={setSearch}
            setSidebarOpen={setSidebarOpen}
            stats={headerStats}
          />

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* CATEGORY FILTER */}
            <div className="flex gap-2 flex-wrap">
              {["all", ...CATEGORIES].map((c) => {
                const active = categoryFilter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{
                      background: active ? C.primary : C.surface,
                      color: active ? "#fff" : C.textSecondary,
                      border: `1px solid ${active ? C.primary : C.border}`,
                    }}
                  >
                    {c === "all" ? "All Categories" : c}
                  </button>
                );
              })}
            </div>

            {/* ERROR */}
            {error && (
              <div
                className="rounded-xl p-4 flex items-center gap-2"
                style={{ background: C.dangerLight }}
              >
                <AlertTriangle size={15} color={C.danger} />
                <p className="text-sm" style={{ color: C.danger }}>
                  {error}
                </p>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && filtered.length === 0 && (
              <div
                className="rounded-2xl p-16 flex flex-col items-center gap-3"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <BookOpen size={36} color={C.textMuted} />
                <p className="font-semibold" style={{ color: C.textSecondary }}>
                  No templates found
                </p>
              </div>
            )}

            {/* TEMPLATE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 12px 28px rgba(79,70,229,0.12)",
                  }}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: C.primaryLight }}
                    >
                      <FileText size={16} color={C.primary} />
                    </div>
                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{ color: C.textPrimary }}
                      >
                        {t.name}
                      </p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: C.accentLight,
                          color: C.accent,
                        }}
                      >
                        {t.category}
                      </span>
                    </div>
                  </div>

                  {t.content && (
                    <p
                      className="text-xs line-clamp-2 font-mono"
                      style={{ color: C.textSecondary }}
                    >
                      {t.content.slice(0, 120)}…
                    </p>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <button
                      className="flex-1 py-2 rounded-xl text-xs font-semibold"
                      style={{
                        background: C.surfaceAlt,
                        border: `1px solid ${C.border}`,
                        color: C.textSecondary,
                      }}
                    >
                      <Eye size={12} className="inline mr-1" />
                      Preview
                    </button>

                    <button
                      onClick={() => handleDelete(t.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: C.dangerLight }}
                    >
                      <Trash2 size={12} color={C.danger} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
