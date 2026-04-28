// src/pages/Chat.jsx
//
// Fixed:
//  • No socket.io — uses REST polling every 3 s
//  • Employee list loaded from getEmployees() API — shows ALL colleagues
//    with same-department employees listed first
//  • File send uses chatApi.sendDocument() multipart (no separate upload step)
//  • Channel IDs use .id (not ._id) to match backend response
//  • CreateChannelModal receives allEmployees with search + dept info
//  • Loader component used in loading states
//  • Colors defined inline (no missing ../styles/colors import)

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// import SideNavbar from "../components/SideNavbar";
import Loader from "../components/Loader";
import { useAuth } from "../components/useAuth";
import { chatApi } from "../api/service/chatApi";
import { getEmployees } from "../api/service/employeeApi";
import {
  MessageSquare,
  Users,
  Search,
  Send,
  Paperclip,
  X,
  Plus,
  ArrowLeft,
  Hash,
  FileText,
  Menu,
  Loader2,
  Check,
  Download,
  File,
} from "lucide-react";

// ── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  bg: "#F0F2F8",
  surface: "#FFFFFF",
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
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  navy: "#1E1B4B",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const now = new Date();
  const isToday = dt.toDateString() === now.toDateString();
  return isToday
    ? dt.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
    : dt.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
};
const isImage = (mime) => mime?.startsWith("image/");
const colorFor = (str = "") => {
  const cols = [
    "#4F46E5",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EC4899",
    "#8B5CF6",
    "#EF4444",
    "#F97316",
  ];
  let h = 0;
  for (const c of str) h = c.charCodeAt(0) + ((h << 5) - h);
  return cols[Math.abs(h) % cols.length];
};
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl ${className}`}
    style={{ background: C.border }}
  />
);

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name = "", size = 36 }) {
  return (
    <div
      className="rounded-full shrink-0 flex items-center justify-center font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: colorFor(name),
      }}
    >
      {getInitials(name)}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, isMine, showAvatar }) {
  const body = msg.body ?? msg.text ?? "";
  const fileMime = msg.fileMime ?? msg.file?.mimeType ?? "";
  const fileUrl = msg.fileUrl ?? msg.file?.url ?? "";
  const fileName = msg.fileName ?? msg.file?.name ?? "";
  const fileSize = msg.fileSize ?? msg.file?.size ?? 0;
  const hasFile = msg.contentType === "document" || !!fileUrl;

  return (
    <div
      className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isMine && showAvatar && (
        <Avatar name={msg.senderName ?? "?"} size={28} />
      )}
      {!isMine && !showAvatar && <div style={{ width: 28 }} />}

      <div
        className={`flex flex-col gap-0.5 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
      >
        {!isMine && showAvatar && (
          <span
            className="text-[10px] font-semibold ml-1 mb-0.5"
            style={{ color: C.textMuted }}
          >
            {msg.senderName}
          </span>
        )}

        {msg.isDeleted ? (
          <p
            className="text-xs italic px-3 py-2 rounded-2xl"
            style={{ color: C.textMuted, background: C.surfaceAlt }}
          >
            This message was deleted
          </p>
        ) : (
          <div
            className="rounded-2xl px-3.5 py-2.5 break-words"
            style={{
              background: isMine ? C.primary : C.surfaceAlt,
              color: isMine ? "#fff" : C.textPrimary,
              borderBottomRightRadius: isMine ? 4 : 16,
              borderBottomLeftRadius: isMine ? 16 : 4,
              maxWidth: "100%",
            }}
          >
            {hasFile && (
              <div className="mb-2">
                {isImage(fileMime) ? (
                  <a href={fileUrl} target="_blank" rel="noreferrer">
                    <img
                      src={fileUrl}
                      alt={fileName}
                      className="rounded-xl max-w-[220px] max-h-[180px] object-cover"
                    />
                  </a>
                ) : (
                  <a
                    href={fileUrl}
                    download={fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
                    style={{
                      background: isMine ? "rgba(255,255,255,0.15)" : C.border,
                      color: isMine ? "#fff" : C.textPrimary,
                    }}
                  >
                    <FileText size={16} />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{fileName}</p>
                      <p className="opacity-60">
                        {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : ""}
                      </p>
                    </div>
                    <Download size={13} className="shrink-0 ml-1" />
                  </a>
                )}
              </div>
            )}
            {body && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {body}
              </p>
            )}
            <p
              className={`text-[10px] mt-0.5 ${isMine ? "text-right opacity-70" : "opacity-50"}`}
            >
              {fmt(msg.createdAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Channel Modal ──────────────────────────────────────────────────────
function CreateChannelModal({ allEmployees, onSave, onClose, saving }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const toggle = (id) =>
    setMembers((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const filtered = allEmployees.filter((e) => {
    const fullName = `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase();
    const role = (e.job_role_name ?? "").toLowerCase();
    const dept = (e.department_name ?? "").toLowerCase();
    return (
      !search ||
      fullName.includes(search.toLowerCase()) ||
      role.includes(search.toLowerCase()) ||
      dept.includes(search.toLowerCase())
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: C.primaryLight }}
          >
            <Hash size={16} color={C.primary} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              Create Team Channel
            </p>
            <p className="text-[10px]" style={{ color: C.textMuted }}>
              Visible to all added members
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <X size={13} color={C.textSecondary} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label
              className="text-[10px] font-semibold mb-1 block"
              style={{ color: C.textSecondary }}
            >
              Channel Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                color: C.textPrimary,
              }}
              placeholder="e.g. product-design, engineering-team"
            />
          </div>

          <div>
            <label
              className="text-[10px] font-semibold mb-1 block"
              style={{ color: C.textSecondary }}
            >
              Description
            </label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                color: C.textPrimary,
              }}
              placeholder="What is this channel for?"
            />
          </div>

          <div>
            <label
              className="text-[10px] font-semibold mb-2 block"
              style={{ color: C.textSecondary }}
            >
              Add Members ({members.length} selected)
            </label>

            {/* Search in modal */}
            <div className="relative mb-2">
              <Search
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                }}
                placeholder="Search employees…"
              />
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p
                  className="text-xs text-center py-4"
                  style={{ color: C.textMuted }}
                >
                  No employees found
                </p>
              ) : (
                filtered.map((e) => {
                  const fullName =
                    `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim();
                  const id = e.id ?? e._id;
                  const sel = members.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggle(id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all"
                      style={{
                        background: sel ? C.primaryLight : C.surfaceAlt,
                        border: `1px solid ${sel ? C.primary : C.border}`,
                      }}
                    >
                      <Avatar name={fullName} size={28} />
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-medium block truncate"
                          style={{ color: C.textPrimary }}
                        >
                          {fullName}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: C.textMuted }}
                        >
                          {e.department_name ? `${e.department_name} · ` : ""}
                          {e.job_role_name ?? "Employee"}
                        </span>
                      </div>
                      {sel && <Check size={14} color={C.primary} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div
          className="px-5 py-4 flex gap-2"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              onSave({ name, description: desc, memberIds: members })
            }
            disabled={!name.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: C.primary,
              opacity: !name.trim() || saving ? 0.6 : 1,
            }}
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            Create Channel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CHAT PAGE
═══════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, employee } = useAuth();

  /* ── Identity ── */
  const myEmployeeId = user?.employeeId ?? employee?.id ?? "";
  const myName = user
    ? (user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim())
    : "Me";
  const isManager =
    employee?.isManager ||
    ["manager", "hr_admin", "super_admin"].includes(user?.role);

  /* ── Data ── */
  const [channels, setChannels] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  /* ── Active conversation ── */
  // { type: "channel"|"dm", id: string, name: string, channelId?: string }
  const [active, setActive] = useState(null);

  /* ── Messages ── */
  const [messages, setMessages] = useState({}); // { [convId]: msg[] }
  const [msgLoading, setMsgLoading] = useState(false);
  const messagesEndRef = useRef(null);

  /* ── Input ── */
  const [inputText, setInputText] = useState("");
  const [pendingFile, setPendingFile] = useState(null); // { file, name, mimeType, preview? }
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);

  /* ── UI ── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [searchContacts, setSearchContacts] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);

  /* ── Polling ── */
  const pollRef = useRef(null);
  const activeConvIdRef = useRef(null);

  const convId = active
    ? active.type === "channel"
      ? `channel:${active.id}`
      : `dm:${active.id}`
    : null;
  const msgs = convId ? (messages[convId] ?? []) : [];

  /* ── Nav info for sidebar ── */
  const EMPLOYEE_NAV = {
    name: myName,
    initials: getInitials(myName),
    id: employee?.employeeCode ?? myEmployeeId,
    role: employee?.jobRoleName ?? employee?.jobTitle ?? user?.role ?? "",
    department: employee?.departmentName ?? employee?.department ?? "",
  };

  /* ── Load channels + all employees ── */
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [chanRes, empRes] = await Promise.allSettled([
          chatApi.listChannels(),
          getEmployees({ status: "active", limit: 200 }),
        ]);

        if (chanRes.status === "fulfilled") {
          const chans = chanRes.value?.channels ?? [];
          // Only show group channels in the sidebar (not DM channels)
          setChannels(chans.filter((c) => c.type === "group" || !c.type));
        }

        if (empRes.status === "fulfilled") {
          const raw = empRes.value?.data ?? empRes.value?.employees ?? [];
          const others = raw.filter((e) => (e.id ?? e._id) !== myEmployeeId);

          // Sort: same department first
          const myDeptId = employee?.departmentId;
          if (myDeptId) {
            others.sort((a, b) => {
              const aScore = a.department_id === myDeptId ? 0 : 1;
              const bScore = b.department_id === myDeptId ? 0 : 1;
              return aScore - bScore;
            });
          }
          setAllEmployees(others);
        }
      } finally {
        setLoadingData(false);
      }
    };
    if (myEmployeeId) load();
  }, [myEmployeeId, employee?.departmentId]); // eslint-disable-line

  /* ── Handle openDM navigation state (from Team.jsx) ── */
  useEffect(() => {
    if (location.state?.openDM && allEmployees.length > 0) {
      const target = allEmployees.find(
        (e) => (e.id ?? e._id) === location.state.openDM,
      );
      if (target) openDm(target);
      window.history.replaceState({}, "");
    }
  }, [location.state, allEmployees]); // eslint-disable-line

  /* ── Poll active conversation every 3 s ── */
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!active) return;

    activeConvIdRef.current = convId;

    const poll = async () => {
      try {
        const channelId =
          active.type === "channel" ? active.id : active.channelId;
        if (!channelId) return;

        const res = await chatApi.getMessages(channelId, { limit: 50 });
        if (activeConvIdRef.current === convId) {
          setMessages((prev) => ({ ...prev, [convId]: res.messages ?? [] }));
        }
      } catch {
        /* silent */
      }
    };

    poll(); // immediate first fetch
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [active?.id, active?.channelId, convId]); // eslint-disable-line

  /* ── Scroll to bottom on new messages ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  /* ── Open group channel ── */
  const openChannel = useCallback((ch) => {
    const id = ch.id ?? ch._id;
    setActive({ type: "channel", id, name: ch.name });
    setChatPanelOpen(true);
    setInputText("");
    setPendingFile(null);
  }, []);

  /* ── Open / create DM with employee ── */
  const openDm = useCallback(async (emp) => {
    const empId = emp.id ?? emp._id;
    const name =
      `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() ||
      emp.name ||
      "Unknown";

    // Immediately show the chat area while loading
    setActive({ type: "dm", id: empId, name, channelId: null });
    setChatPanelOpen(true);
    setInputText("");
    setPendingFile(null);
    setMsgLoading(true);

    try {
      const res = await chatApi.openDM(empId);
      const channelId = res.channel?.id;
      const initMsgs = res.messages ?? [];

      setActive({ type: "dm", id: empId, name, channelId });
      setMessages((prev) => ({ ...prev, [`dm:${empId}`]: initMsgs }));
    } catch (err) {
      console.error("openDM error:", err);
    } finally {
      setMsgLoading(false);
    }
  }, []);

  /* ── Send message ── */
  // const handleSend = async () => {
  //   const text = inputText.trim();
  //   if (!text && !pendingFile) return;
  //   if (!active) return;

  //   // const channelId = active.type === "channel" ? active.id : active.channelId;
  //   const channelId =
  //     active.type === "channel" ? active.id : (active.channelId ?? active.id);
  //   if (!channelId) return;

  //   setSending(true);
  //   const cid = convId;

  //   // Optimistic bubble
  //   const tempMsg = {
  //     _tempId: `temp-${Date.now()}`,
  //     senderId: myEmployeeId,
  //     senderName: myName,
  //     body: text,
  //     contentType: pendingFile ? "document" : "text",
  //     createdAt: new Date().toISOString(),
  //   };
  //   setMessages((prev) => ({
  //     ...prev,
  //     [cid]: [...(prev[cid] ?? []), tempMsg],
  //   }));
  //   const savedText = text;
  //   const savedFile = pendingFile;
  //   setInputText("");
  //   setPendingFile(null);

  //   try {
  //     let res;
  //     if (savedFile?.file) {
  //       res = await chatApi.sendDocument(channelId, savedFile.file, savedText);
  //     } else {
  //       res = await chatApi.sendText(channelId, savedText);
  //     }
  //     // Replace optimistic msg
  //     setMessages((prev) => {
  //       const list = prev[cid] ?? [];
  //       const idx = [...list].reverse().findIndex((m) => m._tempId);
  //       // if (idx === -1) return { ...prev, [cid]: [...list, res.message] };
  //       if (idx === -1)
  //         return { ...prev, [cid]: [...list, res.message ?? res] };
  //       const updated = [...list];
  //       // updated[list.length - 1 - idx] = res.message;
  //       updated[list.length - 1 - idx] = res.message ?? res;
  //       return { ...prev, [cid]: updated };
  //     });
  //   } catch {
  //     // Remove failed optimistic
  //     setMessages((prev) => ({
  //       ...prev,
  //       [cid]: (prev[cid] ?? []).filter((m) => !m._tempId),
  //     }));
  //   } finally {
  //     setSending(false);
  //   }
  // };
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text && !pendingFile) return;
    if (!active) return;

    const channelId =
      active.type === "channel" ? active.id : (active.channelId ?? active.id);

    if (!channelId) {
      console.error("No channelId found");
      return;
    }

    setSending(true);
    const cid = convId;

    const tempMsg = {
      _tempId: `temp-${Date.now()}`,
      senderId: myEmployeeId,
      senderName: myName,
      body: text,
      contentType: pendingFile ? "document" : "text",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [cid]: [...(prev[cid] ?? []), tempMsg],
    }));

    const savedText = text;
    const savedFile = pendingFile;

    setInputText("");
    setPendingFile(null);

    try {
      let res;

      if (savedFile?.file) {
        res = await chatApi.sendDocument(channelId, savedFile.file, savedText);
      } else {
        res = await chatApi.sendText(channelId, savedText);
      }

      const realMessage = res.message ?? res;

      setMessages((prev) => {
        const list = prev[cid] ?? [];
        const idx = [...list].reverse().findIndex((m) => m._tempId);

        if (idx === -1) return { ...prev, [cid]: [...list, realMessage] };

        const updated = [...list];
        updated[list.length - 1 - idx] = realMessage;
        return { ...prev, [cid]: updated };
      });
    } catch (err) {
      console.error("SEND ERROR:", err.response?.data || err);

      setMessages((prev) => ({
        ...prev,
        [cid]: (prev[cid] ?? []).filter((m) => !m._tempId),
      }));
    } finally {
      setSending(false);
    }
  };
  /* ── File select ── */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (file.size > 10 * 1024 * 1024) {
      alert("File must not exceed 10 MB.");
      return;
    }
    const preview = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;
    setPendingFile({ file, name: file.name, mimeType: file.type, preview });
  };

  /* ── Create channel ── */
  const handleCreateChannel = async (payload) => {
    setCreatingChannel(true);
    try {
      const res = await chatApi.createChannel(payload);
      const newCh = res.channel;
      setChannels((prev) => [newCh, ...prev]);
      setShowCreateModal(false);
      openChannel(newCh);
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to create channel.");
    } finally {
      setCreatingChannel(false);
    }
  };

  /* ── Filtered lists ── */
  const q = searchContacts.toLowerCase();
  const filteredChannels = channels.filter(
    (ch) => !q || ch.name.toLowerCase().includes(q),
  );
  const filteredContacts = allEmployees.filter((e) => {
    const fullName = `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase();
    return (
      !q ||
      fullName.includes(q) ||
      (e.job_role_name ?? "").toLowerCase().includes(q) ||
      (e.department_name ?? "").toLowerCase().includes(q)
    );
  });

  const myDeptId = employee?.departmentId;

  /* ══════════════════════ RENDER ══════════════════════════════════════════ */
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
        {/* ── App sidebar ── */}
        {/* <SideNavbar
          sidebarOpen={sidebarOpen}
          COLORS={C}
          EMPLOYEE={EMPLOYEE_NAV}
        /> */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)} // <-- This is the magic close button
          />
        )}
        {/* <SideNavbar
          sidebarOpen={sidebarOpen}
          // If you are using the collapse feature, add this:
          // onToggleCollapse={() => setCollapsed(!collapsed)}
        /> */}

        <div className="flex-1 flex min-w-0 overflow-hidden">
          {/* ── Mobile top bar ── */}
          <div
            className="absolute top-0 left-0 right-0 h-[60px] flex items-center px-4 gap-3 z-10 md:hidden"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </button>
            {chatPanelOpen && active ? (
              <>
                <button
                  onClick={() => {
                    setChatPanelOpen(false);
                    setActive(null);
                  }}
                  className="p-1.5"
                >
                  <ArrowLeft size={16} color={C.textSecondary} />
                </button>
                <p
                  className="font-semibold text-sm truncate"
                  style={{ color: C.textPrimary }}
                >
                  {active.type === "channel" ? `# ${active.name}` : active.name}
                </p>
              </>
            ) : (
              <p
                className="font-semibold text-sm"
                style={{ color: C.textPrimary }}
              >
                Messages
              </p>
            )}
          </div>

          {/* ══ CHAT SIDEBAR ══════════════════════════════════════════════════ */}
          <div
            className={`flex flex-col shrink-0 border-r ${chatPanelOpen ? "hidden md:flex" : "flex"} w-full md:w-72 lg:w-80`}
            style={{
              background: C.surface,
              borderColor: C.border,
              paddingTop: "60px",
            }}
          >
            {/* Header */}
            <div
              className="px-4 pt-4 pb-3"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h1
                  className="text-base font-bold"
                  style={{
                    color: C.textPrimary,
                    fontFamily: "Sora,sans-serif",
                  }}
                >
                  Messages
                </h1>
              </div>
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  color={C.textMuted}
                />
                <input
                  value={searchContacts}
                  onChange={(e) => setSearchContacts(e.target.value)}
                  placeholder="Search people, channels…"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
                  style={{
                    background: C.surfaceAlt,
                    border: `1px solid ${C.border}`,
                    color: C.textPrimary,
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-5 px-2">
              {/* ── Team Channels ── */}
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: C.textMuted }}
                  >
                    Team Channels
                  </span>
                  {isManager && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowCreateModal(true)}
                      className="w-5 h-5 rounded-lg flex items-center justify-center"
                      style={{ background: C.primaryLight }}
                      title="Create channel"
                    >
                      <Plus size={11} color={C.primary} />
                    </motion.button>
                  )}
                </div>

                {loadingData ? (
                  <div className="space-y-1.5 px-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-9" />
                    ))}
                  </div>
                ) : filteredChannels.length === 0 ? (
                  <div className="px-3 py-3 text-center">
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      {isManager
                        ? "Create the first channel for your team."
                        : "No channels yet. Ask your manager."}
                    </p>
                    {isManager && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowCreateModal(true)}
                        className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl"
                        style={{ background: C.primaryLight, color: C.primary }}
                      >
                        + New Channel
                      </motion.button>
                    )}
                  </div>
                ) : (
                  filteredChannels.map((ch) => {
                    const chId = ch.id ?? ch._id;
                    const isAct =
                      active?.type === "channel" && active?.id === chId;
                    return (
                      <motion.button
                        key={chId}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openChannel(ch)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                        style={{
                          background: isAct ? C.primaryLight : "transparent",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: isAct ? C.primary : C.surfaceAlt,
                          }}
                        >
                          <Hash
                            size={14}
                            color={isAct ? "#fff" : C.textSecondary}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-xs truncate"
                            style={{ color: isAct ? C.primary : C.textPrimary }}
                          >
                            {ch.name}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: C.textMuted }}
                          >
                            {ch.memberCount
                              ? `${ch.memberCount} members`
                              : ch.isActive === false
                                ? "Closed"
                                : "Active"}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* ── Direct Messages ── */}
              <div>
                <div className="px-2 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: C.textMuted }}
                  >
                    Direct Messages
                  </span>
                </div>

                {loadingData ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <Loader />
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      Loading colleagues…
                    </p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <p
                    className="text-xs text-center px-3 py-2"
                    style={{ color: C.textMuted }}
                  >
                    No contacts found
                  </p>
                ) : (
                  (() => {
                    let shownDeptDivider = false;
                    let shownOtherDivider = false;
                    return filteredContacts.map((emp) => {
                      const empId = emp.id ?? emp._id;
                      const fullName =
                        `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim();
                      const isAct =
                        active?.type === "dm" && active?.id === empId;
                      const inMyDept =
                        myDeptId && emp.department_id === myDeptId;
                      const items = [];

                      // Section dividers
                      if (inMyDept && !shownDeptDivider) {
                        shownDeptDivider = true;
                        items.push(
                          <p
                            key="label-dept"
                            className="text-[10px] font-semibold px-3 pt-1 pb-1"
                            style={{ color: C.textMuted }}
                          >
                            My Department
                          </p>,
                        );
                      }
                      if (!inMyDept && !shownOtherDivider && shownDeptDivider) {
                        shownOtherDivider = true;
                        items.push(
                          <p
                            key="label-other"
                            className="text-[10px] font-semibold px-3 pt-3 pb-1"
                            style={{ color: C.textMuted }}
                          >
                            Other Employees
                          </p>,
                        );
                      }
                      if (
                        !inMyDept &&
                        !shownOtherDivider &&
                        !shownDeptDivider
                      ) {
                        shownOtherDivider = true;
                        items.push(
                          <p
                            key="label-all"
                            className="text-[10px] font-semibold px-3 pt-1 pb-1"
                            style={{ color: C.textMuted }}
                          >
                            All Employees
                          </p>,
                        );
                      }

                      items.push(
                        <motion.button
                          key={empId}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openDm(emp)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all"
                          style={{
                            background: isAct ? C.primaryLight : "transparent",
                          }}
                        >
                          <Avatar name={fullName} size={34} />
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-xs truncate"
                              style={{
                                color: isAct ? C.primary : C.textPrimary,
                              }}
                            >
                              {fullName}
                            </p>
                            <p
                              className="text-[10px] truncate"
                              style={{ color: C.textMuted }}
                            >
                              {emp.department_name
                                ? `${emp.department_name} · `
                                : ""}
                              {emp.job_role_name ?? "Employee"}
                            </p>
                          </div>
                        </motion.button>,
                      );

                      return items;
                    });
                  })()
                )}
              </div>
            </div>
          </div>

          {/* ══ MESSAGE AREA ════════════════════════════════════════════════ */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${!chatPanelOpen ? "hidden md:flex" : "flex"}`}
            style={{ paddingTop: "60px" }}
          >
            {!active ? (
              /* ── Empty state ── */
              <div
                className="flex-1 flex flex-col items-center justify-center gap-4 p-8"
                style={{ background: C.bg }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: C.primaryLight }}
                >
                  <MessageSquare size={28} color={C.primary} />
                </div>
                <div className="text-center">
                  <p
                    className="font-bold text-lg"
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    Start a conversation
                  </p>
                  <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                    Select a team channel or a colleague to start chatting.
                  </p>
                </div>
                {isManager && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: C.primary, color: "#fff" }}
                  >
                    <Plus size={15} /> Create Team Channel
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                {/* ── Chat header ── */}
                <div
                  className="shrink-0 flex items-center gap-3 px-5 py-3.5"
                  style={{
                    background: C.surface,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <button
                    className="p-1.5 md:hidden"
                    onClick={() => {
                      setChatPanelOpen(false);
                      setActive(null);
                    }}
                  >
                    <ArrowLeft size={16} color={C.textSecondary} />
                  </button>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        active.type === "channel"
                          ? C.primaryLight
                          : colorFor(active.name) + "22",
                    }}
                  >
                    {active.type === "channel" ? (
                      <Hash size={16} color={C.primary} />
                    ) : (
                      <Avatar name={active.name} size={36} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm truncate"
                      style={{ color: C.textPrimary }}
                    >
                      {active.type === "channel"
                        ? `# ${active.name}`
                        : active.name}
                    </p>
                    <p className="text-[10px]" style={{ color: C.textMuted }}>
                      {active.type === "channel"
                        ? `${channels.find((c) => (c.id ?? c._id) === active.id)?.memberCount ?? 0} members`
                        : "Direct Message"}
                    </p>
                  </div>
                  {/* Live dot */}
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: C.success }}
                    title="Polling every 3s"
                  />
                </div>

                {/* ── Messages ── */}
                <div
                  className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                  style={{ background: C.bg }}
                >
                  {msgLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                      <Loader />
                    </div>
                  ) : msgs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
                      <MessageSquare size={28} color={C.textMuted} />
                      <p className="text-sm" style={{ color: C.textMuted }}>
                        {active.type === "channel"
                          ? `This is the beginning of #${active.name}`
                          : `Start a conversation with ${active.name}`}
                      </p>
                    </div>
                  ) : (
                    msgs.map((msg, i) => {
                      const fromId = msg.senderId ?? msg.from?.toString() ?? "";
                      const isMine = fromId === myEmployeeId || !!msg._tempId;
                      const prevFrom =
                        msgs[i - 1]?.senderId ??
                        msgs[i - 1]?.from?.toString() ??
                        "";
                      const showAvatar = !isMine && fromId !== prevFrom;
                      return (
                        <motion.div
                          key={msg.id ?? msg._tempId ?? i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <Bubble
                            msg={msg}
                            isMine={isMine}
                            showAvatar={showAvatar}
                          />
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── File preview ── */}
                <AnimatePresence>
                  {pendingFile && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 py-2 flex items-center gap-3 overflow-hidden"
                      style={{
                        background: C.primaryLight,
                        borderTop: `1px solid ${C.primary}22`,
                      }}
                    >
                      {pendingFile.preview ? (
                        <img
                          src={pendingFile.preview}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: C.surfaceAlt }}
                        >
                          <File size={18} color={C.primary} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: C.primary }}
                        >
                          {pendingFile.name}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: C.textMuted }}
                        >
                          Ready to send
                        </p>
                      </div>
                      <button
                        onClick={() => setPendingFile(null)}
                        className="p-1"
                      >
                        <X size={14} color={C.primary} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Input bar ── */}
                <div
                  className="shrink-0 px-4 py-3 flex items-end gap-2"
                  style={{
                    background: C.surface,
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileRef.current?.click()}
                    className="p-2.5 rounded-xl shrink-0 self-end"
                    style={{
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <Paperclip size={15} color={C.textSecondary} />
                  </motion.button>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                    onChange={handleFileSelect}
                  />

                  <div className="flex-1 relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={
                        active.type === "channel"
                          ? `Message #${active.name}…`
                          : `Message ${active.name}…`
                      }
                      rows={Math.min(
                        Math.max(inputText.split("\n").length, 1),
                        5,
                      )}
                      className="w-full resize-none text-sm px-4 py-2.5 rounded-xl outline-none"
                      style={{
                        background: C.surfaceAlt,
                        border: `1.5px solid ${inputText ? C.primary : C.border}`,
                        color: C.textPrimary,
                        lineHeight: 1.55,
                        boxShadow: inputText
                          ? `0 0 0 3px ${C.primaryLight}`
                          : "none",
                      }}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={handleSend}
                    disabled={(!inputText.trim() && !pendingFile) || sending}
                    className="p-2.5 rounded-xl shrink-0 self-end"
                    style={{
                      background:
                        (inputText.trim() || pendingFile) && !sending
                          ? C.primary
                          : C.border,
                      boxShadow:
                        inputText.trim() || pendingFile
                          ? "0 4px 12px rgba(79,70,229,0.35)"
                          : "none",
                      transition: "background 0.2s",
                    }}
                  >
                    {sending ? (
                      <Loader2
                        size={16}
                        color="#fff"
                        className="animate-spin"
                      />
                    ) : (
                      <Send
                        size={16}
                        color={
                          (inputText.trim() || pendingFile) && !sending
                            ? "#fff"
                            : C.textMuted
                        }
                      />
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Create channel modal ── */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateChannelModal
            allEmployees={allEmployees}
            onSave={handleCreateChannel}
            onClose={() => setShowCreateModal(false)}
            saving={creatingChannel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
