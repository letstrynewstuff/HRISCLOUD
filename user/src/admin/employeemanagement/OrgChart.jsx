// ─────────────────────────────────────────────────────────────
//  src/admin/employeemanagement/OrgChart.jsx
//  Route: /admin/employees/org-chart
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import {
  Users,
  ChevronDown,
  ChevronRight,
  Bell,
  Menu,
  Search,
  X,
  Check,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CornerDownRight,
  GitBranch,
  User,
  Building2,
  MapPin,
  Briefcase,
  AlertCircle,
  Move,
  CheckCircle2,
  Info,
  Download,
  Filter,
  RotateCcw,
  GripVertical,
  Crown,
  Star,
  ArrowRight,
  ChevronUp,
} from "lucide-react";

/* ─── Design tokens ─── */
const C = {
  bg: "#F0F2F8",
  bgMid: "#E8EBF4",
  surface: "#FFFFFF",
  surfaceHover: "#F7F8FC",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#3730A3",
  accent: "#06B6D4",
  accentLight: "#ECFEFF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  purple: "#8B5CF6",
  purpleLight: "#EDE9FE",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  navy: "#1E1B4B",
};

const ADMIN = {
  name: "Ngozi Adeleke",
  initials: "NA",
  role: "HR Administrator",
};

const DEPT_COLORS = {
  Executive: { bg: "#1E1B4B", light: "#EEF2FF", text: "#4F46E5" },
  Engineering: { bg: "#4F46E5", light: "#EEF2FF", text: "#4F46E5" },
  Product: { bg: "#06B6D4", light: "#ECFEFF", text: "#0891B2" },
  Finance: { bg: "#10B981", light: "#D1FAE5", text: "#059669" },
  HR: { bg: "#F59E0B", light: "#FEF3C7", text: "#D97706" },
  Marketing: { bg: "#8B5CF6", light: "#EDE9FE", text: "#7C3AED" },
  Operations: { bg: "#EC4899", light: "#FDF2F8", text: "#DB2777" },
  Sales: { bg: "#F97316", light: "#FFF7ED", text: "#EA580C" },
  Legal: { bg: "#EF4444", light: "#FEE2E2", text: "#DC2626" },
};

/* ─── Org tree data ─── */
const buildOrgTree = () => ({
  id: "EMP-CEO",
  name: "Olumide Adeyemi",
  role: "Chief Executive Officer",
  dept: "Executive",
  initials: "OA",
  location: "Lagos HQ",
  expanded: true,
  children: [
    {
      id: "EMP-CTO",
      name: "Chioma Okafor",
      role: "Chief Technology Officer",
      dept: "Engineering",
      initials: "CO",
      location: "Lagos HQ",
      expanded: true,
      children: [
        {
          id: "EMP-ENG01",
          name: "Emeka Okonkwo",
          role: "Senior Backend Engineer",
          dept: "Engineering",
          initials: "EO",
          location: "Lagos HQ",
          expanded: false,
          children: [
            {
              id: "EMP-006",
              name: "Tunde Bakare",
              role: "Backend Engineer",
              dept: "Engineering",
              initials: "TB",
              location: "Abuja",
              expanded: false,
              children: [],
            },
            {
              id: "EMP-009",
              name: "Fatima Bello",
              role: "DevOps Engineer",
              dept: "Engineering",
              initials: "FB",
              location: "Remote",
              expanded: false,
              children: [],
            },
          ],
        },
        {
          id: "EMP-ENG02",
          name: "Sade Okonkwo",
          role: "Frontend Engineer",
          dept: "Engineering",
          initials: "SO",
          location: "Lagos HQ",
          expanded: false,
          children: [
            {
              id: "EMP-FE01",
              name: "Adaeze Nwosu",
              role: "Junior Frontend Dev",
              dept: "Engineering",
              initials: "AN",
              location: "Lagos HQ",
              expanded: false,
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "EMP-CPO",
      name: "Bola Fashola",
      role: "Chief Product Officer",
      dept: "Product",
      initials: "BF",
      location: "Lagos HQ",
      expanded: true,
      children: [
        {
          id: "EMP-001",
          name: "Amara Johnson",
          role: "Senior Product Designer",
          dept: "Product",
          initials: "AJ",
          location: "Lagos HQ",
          expanded: false,
          children: [
            {
              id: "EMP-002",
              name: "Tunde Adeyemi",
              role: "UI/UX Designer",
              dept: "Product",
              initials: "TA",
              location: "Lagos HQ",
              expanded: false,
              children: [],
            },
            {
              id: "EMP-005",
              name: "Ngozi Eze",
              role: "Design Researcher",
              dept: "Product",
              initials: "NE",
              location: "Lagos HQ",
              expanded: false,
              children: [],
            },
          ],
        },
        {
          id: "EMP-PM01",
          name: "Chidi Nwachukwu",
          role: "Product Manager",
          dept: "Product",
          initials: "CN",
          location: "Lagos HQ",
          expanded: false,
          children: [],
        },
      ],
    },
    {
      id: "EMP-CFO",
      name: "Ibrahim Musa",
      role: "Chief Financial Officer",
      dept: "Finance",
      initials: "IM",
      location: "Abuja",
      expanded: true,
      children: [
        {
          id: "EMP-008",
          name: "Emeka Eze",
          role: "Financial Analyst",
          dept: "Finance",
          initials: "EE",
          location: "Lagos HQ",
          expanded: false,
          children: [],
        },
        {
          id: "EMP-FIN02",
          name: "Kemi Oladele",
          role: "Accountant",
          dept: "Finance",
          initials: "KO",
          location: "Lagos HQ",
          expanded: false,
          children: [],
        },
      ],
    },
    {
      id: "EMP-HRD",
      name: "Ngozi Adeleke",
      role: "HR Director",
      dept: "HR",
      initials: "NA",
      location: "Lagos HQ",
      expanded: true,
      children: [
        {
          id: "EMP-HR01",
          name: "Funke Adesola",
          role: "HR Generalist",
          dept: "HR",
          initials: "FA",
          location: "Lagos HQ",
          expanded: false,
          children: [],
        },
        {
          id: "EMP-HR02",
          name: "Tolu Ogunsanya",
          role: "Talent Acquisition",
          dept: "HR",
          initials: "TO",
          location: "Lagos HQ",
          expanded: false,
          children: [],
        },
      ],
    },
    {
      id: "EMP-CMO",
      name: "Yetunde Abiola",
      role: "Chief Marketing Officer",
      dept: "Marketing",
      initials: "YA",
      location: "Lagos HQ",
      expanded: false,
      children: [
        {
          id: "EMP-MKT01",
          name: "Seun Adebayo",
          role: "Digital Marketer",
          dept: "Marketing",
          initials: "SA",
          location: "Lagos HQ",
          expanded: false,
          children: [],
        },
        {
          id: "EMP-MKT02",
          name: "Dami Osei",
          role: "Content Strategist",
          dept: "Marketing",
          initials: "DO",
          location: "Lagos HQ",
          expanded: false,
          children: [],
        },
      ],
    },
  ],
});

/* ─── Tree helpers ─── */
const cloneTree = (node) => ({
  ...node,
  children: node.children.map(cloneTree),
});

const findNode = (tree, id) => {
  if (tree.id === id) return tree;
  for (const child of tree.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

const removeNode = (tree, id) => {
  return {
    ...tree,
    children: tree.children
      .filter((c) => c.id !== id)
      .map((c) => removeNode(c, id)),
  };
};

const addChildTo = (tree, parentId, node) => {
  if (tree.id === parentId)
    return { ...tree, children: [...tree.children, node], expanded: true };
  return {
    ...tree,
    children: tree.children.map((c) => addChildTo(c, parentId, node)),
  };
};

const toggleExpand = (tree, id) => {
  if (tree.id === id) return { ...tree, expanded: !tree.expanded };
  return { ...tree, children: tree.children.map((c) => toggleExpand(c, id)) };
};

const expandAll = (tree) => ({
  ...tree,
  expanded: true,
  children: tree.children.map(expandAll),
});
const collapseAll = (tree, keepRoot = true) => ({
  ...tree,
  expanded: keepRoot,
  children: tree.children.map((c) => collapseAll(c, false)),
});

const countDescendants = (node) =>
  node.children.reduce((acc, c) => acc + 1 + countDescendants(c), 0);

/* ─── Employee Card ─── */
function EmpCard({
  node,
  depth,
  selectedId,
  dragTargetId,
  onSelect,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}) {
  const deptStyle = DEPT_COLORS[node.dept] || DEPT_COLORS["Engineering"];
  const isSelected = selectedId === node.id;
  const isDragTarget = dragTargetId === node.id;
  const isRoot = depth === 0;

  return (
    <motion.div
      layout
      draggable={!isRoot}
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(node.id, e);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOver(node.id);
      }}
      onDrop={(e) => {
        e.stopPropagation();
        onDrop(node.id);
      }}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
      }}
      whileHover={{ y: -2, boxShadow: `0 8px 24px rgba(0,0,0,0.1)` }}
      className="relative cursor-pointer select-none"
      style={{
        width: 200,
        background: isSelected
          ? `linear-gradient(135deg, ${deptStyle.bg}, ${deptStyle.bg}dd)`
          : C.surface,
        border: `2px solid ${isDragTarget ? C.warning : isSelected ? deptStyle.bg : C.border}`,
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow: isSelected
          ? `0 8px 24px ${deptStyle.bg}44`
          : isDragTarget
            ? `0 0 0 3px ${C.warning}44`
            : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {/* Drag handle */}
      {!isRoot && (
        <div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-grab"
          style={{ color: isSelected ? "rgba(255,255,255,0.5)" : C.textMuted }}
        >
          <GripVertical size={12} />
        </div>
      )}

      {/* Crown for CEO */}
      {isRoot && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Crown size={16} color={C.warning} fill={C.warning} />
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{
            background: isSelected ? "rgba(255,255,255,0.25)" : deptStyle.bg,
            boxShadow: `0 2px 8px ${deptStyle.bg}55`,
          }}
        >
          {node.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-bold leading-tight truncate"
            style={{ color: isSelected ? "#fff" : C.textPrimary }}
          >
            {node.name}
          </p>
          <p
            className="text-[10px] leading-tight truncate mt-0.5"
            style={{
              color: isSelected ? "rgba(255,255,255,0.7)" : C.textMuted,
            }}
          >
            {node.role}
          </p>
        </div>
      </div>

      {/* Dept + location */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: isSelected ? "rgba(255,255,255,0.2)" : deptStyle.light,
            color: isSelected ? "#fff" : deptStyle.text,
          }}
        >
          {node.dept}
        </span>
        <div className="flex items-center gap-1">
          <MapPin
            size={9}
            color={isSelected ? "rgba(255,255,255,0.6)" : C.textMuted}
          />
          <span
            className="text-[9px]"
            style={{
              color: isSelected ? "rgba(255,255,255,0.6)" : C.textMuted,
            }}
          >
            {node.location.replace(" HQ", "")}
          </span>
        </div>
      </div>

      {/* Children count + expand toggle */}
      {node.children.length > 0 && (
        <div
          className="flex items-center justify-between mt-2.5 pt-2"
          style={{
            borderTop: `1px solid ${isSelected ? "rgba(255,255,255,0.15)" : C.border}`,
          }}
        >
          <span
            className="text-[10px]"
            style={{
              color: isSelected ? "rgba(255,255,255,0.6)" : C.textMuted,
            }}
          >
            {node.children.length} direct · {countDescendants(node)} total
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="w-5 h-5 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: isSelected ? "rgba(255,255,255,0.2)" : C.surfaceAlt,
            }}
          >
            {node.expanded ? (
              <ChevronUp size={11} color={isSelected ? "#fff" : C.textMuted} />
            ) : (
              <ChevronDown
                size={11}
                color={isSelected ? "#fff" : C.textMuted}
              />
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Recursive tree renderer ─── */
function OrgNode({
  node,
  depth = 0,
  selectedId,
  dragState,
  onSelect,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  return (
    <div
      className="flex flex-col items-center"
      style={{ position: "relative" }}
    >
      <EmpCard
        node={node}
        depth={depth}
        selectedId={selectedId}
        dragTargetId={dragState.targetId}
        isDragging={dragState.dragId === node.id}
        onSelect={onSelect}
        onToggle={onToggle}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />

      <AnimatePresence>
        {node.expanded && node.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* Vertical connector */}
            <div className="flex justify-center">
              <div style={{ width: 2, height: 24, background: C.border }} />
            </div>

            {/* Horizontal connector */}
            <div className="relative flex items-start justify-center gap-8">
              {node.children.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: `calc(${node.children.length} * 216px - 16px)`,
                    height: 2,
                    background: C.border,
                    maxWidth: "90%",
                  }}
                />
              )}

              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Short vertical before card */}
                  <div style={{ width: 2, height: 22, background: C.border }} />
                  <OrgNode
                    node={child}
                    depth={depth + 1}
                    selectedId={selectedId}
                    dragState={dragState}
                    onSelect={onSelect}
                    onToggle={onToggle}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onDragEnd={onDragEnd}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Confirm reassign modal ─── */
function ReassignModal({ draggedNode, targetNode, onConfirm, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onCancel}
      />
      <motion.div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        }}
      >
        <div className="p-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: C.warningLight }}
          >
            <GitBranch size={22} color={C.warning} />
          </div>
          <h3
            className="text-base font-bold mb-1"
            style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
          >
            Reassign Reporting Line?
          </h3>
          <p className="text-sm mb-4" style={{ color: C.textSecondary }}>
            This will change the reporting manager for this employee. The change
            will be logged in the audit trail.
          </p>

          {/* Visual */}
          <div
            className="rounded-xl p-3 mb-4 flex items-center gap-3"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: DEPT_COLORS[draggedNode?.dept]?.bg || C.primary,
              }}
            >
              {draggedNode?.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-bold truncate"
                style={{ color: C.textPrimary }}
              >
                {draggedNode?.name}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: C.textMuted }}
              >
                {draggedNode?.role}
              </p>
            </div>
            <ArrowRight size={14} color={C.warning} />
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: DEPT_COLORS[targetNode?.dept]?.bg || C.primary,
              }}
            >
              {targetNode?.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-bold truncate"
                style={{ color: C.textPrimary }}
              >
                {targetNode?.name}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: C.textMuted }}
              >
                {targetNode?.role}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 mb-1 text-xs"
            style={{ color: C.textMuted }}
          >
            <Info size={11} />
            <span>
              This action will be logged in the employee's audit trail.
            </span>
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: C.warning,
              boxShadow: `0 4px 12px ${C.warning}44`,
            }}
          >
            Confirm Reassignment
          </motion.button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              color: C.textSecondary,
              border: `1px solid ${C.border}`,
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════ ORG CHART PAGE ════════════════════ */
export default function OrgChart() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tree, setTree] = useState(buildOrgTree());
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, px: 0, py: 0 });
  const [dragState, setDragState] = useState({ dragId: null, targetId: null });
  const [pendingReassign, setPendingReassign] = useState(null);
  const [toast, setToast] = useState(null);
  const [deptFilter, setDeptFilter] = useState("all");
  const canvasRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ─── Search ─── */
  const searchTree = (node, q, path = []) => {
    const results = [];
    const fullPath = [...path, node.name];
    if (
      node.name.toLowerCase().includes(q) ||
      node.role.toLowerCase().includes(q)
    )
      results.push({ ...node, path: fullPath });
    for (const c of node.children) results.push(...searchTree(c, q, fullPath));
    return results;
  };

  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchResults(searchTree(tree, search.toLowerCase()));
  }, [search, tree]);

  /* ─── Pan ─── */
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("[draggable]") || e.target.closest("button")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY, px: pan.x, py: pan.y });
  };
  const handleMouseMove = useCallback(
    (e) => {
      if (!isPanning) return;
      setPan({
        x: panStart.px + (e.clientX - panStart.x),
        y: panStart.py + (e.clientY - panStart.y),
      });
    },
    [isPanning, panStart],
  );
  const handleMouseUp = () => setIsPanning(false);

  /* ─── Drag & drop ─── */
  const handleDragStart = (id) => setDragState({ dragId: id, targetId: null });
  const handleDragOver = (id) => {
    if (id !== dragState.dragId) setDragState((p) => ({ ...p, targetId: id }));
  };
  const handleDrop = (targetId) => {
    if (!dragState.dragId || dragState.dragId === targetId) {
      handleDragEnd();
      return;
    }
    const draggedNode = findNode(tree, dragState.dragId);
    const targetNode = findNode(tree, targetId);
    if (!draggedNode || !targetNode) {
      handleDragEnd();
      return;
    }
    // Don't allow dropping onto a descendant
    if (findNode(draggedNode, targetId)) {
      handleDragEnd();
      return;
    }
    setPendingReassign({
      dragId: dragState.dragId,
      targetId,
      draggedNode,
      targetNode,
    });
    setDragState({ dragId: null, targetId: null });
  };
  const handleDragEnd = () => setDragState({ dragId: null, targetId: null });

  const confirmReassign = () => {
    if (!pendingReassign) return;
    const { dragId, targetId, draggedNode } = pendingReassign;
    let newTree = cloneTree(tree);
    newTree = removeNode(newTree, dragId);
    newTree = addChildTo(newTree, targetId, { ...draggedNode });
    setTree(newTree);
    showToast(
      `${draggedNode.name} now reports to ${pendingReassign.targetNode.name}`,
    );
    setPendingReassign(null);
  };

  /* ─── Selected employee detail panel ─── */
  const renderDetailPanel = () => {
    if (!selected)
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: C.surfaceAlt }}
          >
            <User size={24} color={C.textMuted} />
          </div>
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Select an employee
          </p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>
            Click any card to view details
          </p>
        </div>
      );

    const deptStyle = DEPT_COLORS[selected.dept] || DEPT_COLORS["Engineering"];
    const direct = selected.children.length;
    const total = countDescendants(selected);

    return (
      <div className="flex-1 overflow-y-auto p-4">
        {/* Profile header */}
        <div className="rounded-2xl overflow-hidden mb-3">
          <div
            className="h-16 relative"
            style={{
              background: `linear-gradient(135deg, ${deptStyle.bg}, ${deptStyle.bg}bb)`,
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>
          <div
            className="px-4 pb-4"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderTop: "none",
              borderRadius: "0 0 16px 16px",
            }}
          >
            <div className="-mt-6 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-lg"
                style={{ background: deptStyle.bg }}
              >
                {selected.initials}
              </div>
            </div>
            <p
              className="text-sm font-bold"
              style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
            >
              {selected.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
              {selected.role}
            </p>
            <span
              className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: deptStyle.light, color: deptStyle.text }}
            >
              {selected.dept}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: "Direct Reports", value: direct, color: C.primary },
            { label: "Total Reports", value: total, color: C.purple },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 text-center"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
            >
              <p
                className="text-xl font-bold"
                style={{ color: s.color, fontFamily: "Sora, sans-serif" }}
              >
                {s.value}
              </p>
              <p
                className="text-[10px] font-semibold"
                style={{ color: C.textMuted }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Details */}
        {[
          { label: "Employee ID", value: selected.id, icon: User },
          { label: "Department", value: selected.dept, icon: Building2 },
          { label: "Location", value: selected.location, icon: MapPin },
        ].map((d) => (
          <div
            key={d.label}
            className="flex items-center gap-3 py-2.5"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <d.icon size={13} color={C.textMuted} />
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: C.textMuted }}
              >
                {d.label}
              </p>
              <p
                className="text-xs font-medium"
                style={{ color: C.textPrimary }}
              >
                {d.value}
              </p>
            </div>
          </div>
        ))}

        {/* Direct reports list */}
        {selected.children.length > 0 && (
          <div className="mt-3">
            <p
              className="text-[11px] font-bold uppercase tracking-wide mb-2"
              style={{ color: C.textMuted }}
            >
              Direct Reports ({direct})
            </p>
            <div className="space-y-1.5">
              {selected.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelected(child)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{
                      background: DEPT_COLORS[child.dept]?.bg || C.primary,
                    }}
                  >
                    {child.initials}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: C.textPrimary }}
                    >
                      {child.name}
                    </p>
                    <p
                      className="text-[10px] truncate"
                      style={{ color: C.textMuted }}
                    >
                      {child.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 rounded-xl text-xs font-semibold text-white"
            style={{
              background: C.primary,
              boxShadow: `0 2px 8px ${C.primary}44`,
            }}
          >
            View Full Profile
          </motion.button>
          <button
            className="w-full py-2 rounded-xl text-xs font-semibold"
            style={{
              background: C.surfaceAlt,
              color: C.textSecondary,
              border: `1px solid ${C.border}`,
            }}
          >
            Change Manager (Drag & Drop)
          </button>
        </div>
      </div>
    );
  };

  const depts = [
    "all",
    ...Object.keys(DEPT_COLORS).filter((d) => d !== "Executive"),
  ];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.bg, fontFamily: "Sora, sans-serif" }}
    >
      <AdminSideNavbar
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        ADMIN={ADMIN}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center px-5 gap-4 shrink-0"
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          >
            <Menu size={18} color={C.textSecondary} />
          </button>
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: C.textMuted }}
          >
            <span>Employees</span>
            <ChevronRight size={12} />
            <span style={{ color: C.primary, fontWeight: 600 }}>Org Chart</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={16} color={C.textSecondary} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: C.danger }}
              />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}
            >
              {ADMIN.initials}
            </div>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          {/* ─── Canvas ─── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div
              className="flex items-center gap-3 px-5 py-3 shrink-0"
              style={{
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {/* Search */}
              <div className="relative w-56">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  color={C.textMuted}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
                  style={{
                    background: C.surfaceAlt,
                    border: `1.5px solid ${search ? C.primary + "66" : C.border}`,
                    color: C.textPrimary,
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X size={11} color={C.textMuted} />
                  </button>
                )}
                {/* Search dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-full mt-1 left-0 right-0 rounded-xl overflow-hidden z-20"
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      }}
                    >
                      {searchResults.slice(0, 6).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setSelected(r);
                            setSearch("");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div
                            className="w-6 h-6 rounded-lg text-[10px] font-bold text-white flex items-center justify-center shrink-0"
                            style={{
                              background: DEPT_COLORS[r.dept]?.bg || C.primary,
                            }}
                          >
                            {r.initials}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-xs font-semibold truncate"
                              style={{ color: C.textPrimary }}
                            >
                              {r.name}
                            </p>
                            <p
                              className="text-[10px] truncate"
                              style={{ color: C.textMuted }}
                            >
                              {r.role}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dept filter */}
              <div
                className="flex items-center gap-1 overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {depts.slice(0, 6).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDeptFilter(d)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize"
                    style={{
                      background:
                        deptFilter === d
                          ? DEPT_COLORS[d]?.bg || C.primary
                          : C.surfaceAlt,
                      color: deptFilter === d ? "#fff" : C.textSecondary,
                      border: `1px solid ${deptFilter === d ? "transparent" : C.border}`,
                    }}
                  >
                    {d === "all" ? "All Depts" : d}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {/* Expand/collapse all */}
                <button
                  onClick={() => setTree((p) => expandAll(p))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: C.surfaceAlt,
                    color: C.textSecondary,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <ChevronDown size={12} />
                  Expand All
                </button>
                <button
                  onClick={() => setTree((p) => collapseAll(p))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: C.surfaceAlt,
                    color: C.textSecondary,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <ChevronUp size={12} />
                  Collapse
                </button>
                <button
                  onClick={() => setTree(buildOrgTree())}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Reset tree"
                >
                  <RotateCcw size={14} color={C.textMuted} />
                </button>

                {/* Zoom */}
                <div
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl"
                  style={{
                    background: C.surfaceAlt,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <button
                    onClick={() => setZoom((p) => Math.max(0.4, p - 0.1))}
                    className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                  >
                    <ZoomOut size={12} color={C.textSecondary} />
                  </button>
                  <span
                    className="text-xs font-bold w-10 text-center"
                    style={{ color: C.textPrimary }}
                  >
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((p) => Math.min(1.5, p + 0.1))}
                    className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                  >
                    <ZoomIn size={12} color={C.textSecondary} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setZoom(0.85);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Reset view"
                >
                  <Maximize2 size={14} color={C.textMuted} />
                </button>
              </div>
            </div>

            {/* DnD hint */}
            <div
              className="flex items-center gap-2 px-5 py-2 shrink-0"
              style={{
                background: `${C.warning}10`,
                borderBottom: `1px solid ${C.warning}22`,
              }}
            >
              <Move size={12} color={C.warning} />
              <p className="text-[11px]" style={{ color: C.warning }}>
                <strong>Drag & Drop</strong> any employee card onto another to
                reassign their reporting manager
              </p>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              className="flex-1 overflow-hidden relative"
              style={{
                cursor: isPanning ? "grabbing" : "grab",
                background: C.bg,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Dot grid background */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <pattern
                    id="dots"
                    x="0"
                    y="0"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1" fill={C.border} />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>

              <div
                className="absolute"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "top center",
                  top: 40,
                  left: "50%",
                  translateX: "-50%",
                  width: "max-content",
                }}
              >
                <OrgNode
                  node={tree}
                  selectedId={selected?.id}
                  dragState={dragState}
                  onSelect={setSelected}
                  onToggle={(id) => setTree((p) => toggleExpand(p, id))}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
              </div>
            </div>
          </div>

          {/* ─── Right panel ─── */}
          <div
            className="w-64 flex flex-col shrink-0"
            style={{
              background: C.surface,
              borderLeft: `1px solid ${C.border}`,
            }}
          >
            {/* Panel header */}
            <div
              className="px-4 py-3.5 shrink-0"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <p
                className="text-sm font-bold"
                style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
              >
                {selected ? "Employee Detail" : "Select Employee"}
              </p>
              {selected && (
                <button
                  onClick={() => setSelected(null)}
                  className="text-[11px] mt-0.5"
                  style={{ color: C.textMuted }}
                >
                  Clear selection
                </button>
              )}
            </div>

            {renderDetailPanel()}

            {/* Dept legend */}
            <div
              className="px-4 py-3 shrink-0"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wide mb-2"
                style={{ color: C.textMuted }}
              >
                Departments
              </p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(DEPT_COLORS)
                  .filter(([d]) => d !== "Executive")
                  .map(([dept, s]) => (
                    <div key={dept} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: s.bg }}
                      />
                      <span
                        className="text-[10px] truncate"
                        style={{ color: C.textMuted }}
                      >
                        {dept}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {pendingReassign && (
          <ReassignModal
            draggedNode={pendingReassign.draggedNode}
            targetNode={pendingReassign.targetNode}
            onConfirm={confirmReassign}
            onCancel={() => setPendingReassign(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{
              background: C.navy,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: 300,
            }}
          >
            <CheckCircle2 size={15} color={C.success} />
            <span className="text-sm font-medium">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-auto">
              <X size={13} color="rgba(255,255,255,0.5)" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
