// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Plus, Edit2, Trash2 } from "lucide-react";
// import { SETTINGS_MOCK } from "./SettingsMockData";

// const C = {
//   bg: "#F0F2F8",
//   surface: "#FFFFFF",
//   surfaceAlt: "#F7F8FC",
//   border: "#E4E7F0",
//   primary: "#4F46E5",
//   primaryLight: "#EEF2FF",
//   success: "#10B981",
//   successLight: "#D1FAE5",
//   warning: "#F59E0B",
//   warningLight: "#FEF3C7",
//   danger: "#EF4444",
//   dangerLight: "#FEE2E2",
//   textPrimary: "#0F172A",
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
// };

// export default function UserManagement() {
//   const [users, setUsers] = useState(SETTINGS_MOCK.users);
//   const [showInviteModal, setShowInviteModal] = useState(false);

//   const inviteUser = (email, role) => {
//     const newUser = {
//       id: `U${Date.now()}`,
//       name: email.split("@")[0],
//       email,
//       role,
//       status: "Invited",
//     };
//     setUsers([...users, newUser]);
//     setShowInviteModal(false);
//   };

//   return (
//     <div>
//       <div className="flex justify-between mb-6">
//         <h2 className="text-2xl font-bold">User Management</h2>
//         <motion.button
//           onClick={() => setShowInviteModal(true)}
//           className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
//           style={{ background: C.primary, color: "#fff" }}
//         >
//           <Plus size={16} /> Invite User
//         </motion.button>
//       </div>

//       <div
//         className="rounded-2xl border overflow-hidden"
//         style={{ background: C.surface, borderColor: C.border }}
//       >
//         <table className="w-full">
//           <thead>
//             <tr style={{ background: C.surfaceAlt }}>
//               <th className="px-6 py-4 text-left">Name</th>
//               <th className="px-6 py-4 text-left">Email</th>
//               <th className="px-6 py-4 text-left">Role</th>
//               <th className="px-6 py-4 text-left">Status</th>
//               <th className="px-6 py-4 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((user, i) => (
//               <motion.tr
//                 key={i}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="border-b"
//                 style={{ borderColor: C.border }}
//               >
//                 <td className="px-6 py-4 font-medium">{user.name}</td>
//                 <td className="px-6 py-4 text-sm">{user.email}</td>
//                 <td className="px-6 py-4">
//                   <span className="px-3 py-1 text-xs rounded-full bg-primaryLight text-primary">
//                     {user.role}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4">
//                   <span
//                     className={`px-4 py-1 text-xs rounded-full ${user.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
//                   >
//                     {user.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 flex gap-2">
//                   <motion.button
//                     className="p-2 rounded-lg"
//                     style={{ background: C.accentLight, color: C.accent }}
//                   >
//                     <Edit2 size={14} />
//                   </motion.button>
//                   <motion.button
//                     className="p-2 rounded-lg"
//                     style={{ background: C.dangerLight, color: C.danger }}
//                   >
//                     <Trash2 size={14} />
//                   </motion.button>
//                 </td>
//               </motion.tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Invite Modal */}
//       <AnimatePresence>
//         {showInviteModal && (
//           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
//             <motion.div
//               initial={{ scale: 0.95 }}
//               animate={{ scale: 1 }}
//               className="bg-white rounded-2xl p-8 w-full max-w-md"
//             >
//               <h3 className="font-bold text-xl mb-6">Invite New User</h3>
//               <input
//                 id="email"
//                 placeholder="user@company.com"
//                 className="w-full px-4 py-3 rounded-xl mb-4"
//                 style={{ background: C.surfaceAlt }}
//               />
//               <select
//                 id="role"
//                 className="w-full px-4 py-3 rounded-xl mb-6"
//                 style={{ background: C.surfaceAlt }}
//               >
//                 <option>HR Admin</option>
//                 <option>Manager</option>
//                 <option>Finance</option>
//               </select>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowInviteModal(false)}
//                   className="flex-1 py-3 rounded-xl"
//                   style={{ background: C.surfaceAlt }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() =>
//                     inviteUser(
//                       document.getElementById("email").value,
//                       document.getElementById("role").value,
//                     )
//                   }
//                   className="flex-1 py-3 rounded-xl text-white"
//                   style={{ background: C.primary }}
//                 >
//                   Send Invitation
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }



// src/admin/settings/UserManagement.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Loader2, RefreshCw, AlertCircle, CheckCircle2, X, Mail } from "lucide-react";
import { settingsApi } from "../../api/service/settingsApi";

const C = {
  bg: "#F0F2F8",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
};

const ROLES = ["hr_admin", "manager", "finance", "employee", "super_admin"];

const ROLE_LABELS = {
  hr_admin:    "HR Admin",
  manager:     "Manager",
  finance:     "Finance",
  employee:    "Employee",
  super_admin: "Super Admin",
};

const STATUS_CFG = {
  active:  { label: "Active",  bg: C.successLight, color: C.success },
  invited: { label: "Invited", bg: C.warningLight,  color: C.warning },
  inactive:{ label: "Inactive",bg: "#F1F5F9",       color: C.textMuted },
};

export default function UserManagement() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState("employee");
  const [inviting, setInviting] = useState(false);
  const [editUser, setEditUser] = useState(null); // { id, role }
  const [editRole, setEditRole] = useState("");
  const [delUser,  setDelUser]  = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getUsers();
      setUsers(res.users ?? res.data ?? res ?? []);
    } catch {
      showToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await settingsApi.inviteUser(inviteEmail.trim(), inviteRole);
      setUsers((p) => [...p, res.user ?? res]);
      setShowInvite(false);
      setInviteEmail("");
      setInviteRole("employee");
      showToast("Invitation sent successfully.");
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Failed to send invitation.", "error");
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editUser) return;
    try {
      await settingsApi.updateUserRole(editUser.id, editRole);
      setUsers((p) => p.map((u) => u.id === editUser.id ? { ...u, role: editRole } : u));
      setEditUser(null);
      showToast("Role updated.");
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Failed to update role.", "error");
    }
  };

  const handleDelete = async () => {
    if (!delUser) return;
    setDeleting(true);
    try {
      await settingsApi.removeUser(delUser.id);
      setUsers((p) => p.filter((u) => u.id !== delUser.id));
      setDelUser(null);
      showToast("User removed.");
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Failed to remove user.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
          User Management
        </h2>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.04 }} onClick={load}
            className="p-2 rounded-xl" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
            <RefreshCw size={14} color={C.textSecondary} className={loading ? "animate-spin" : ""} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: C.primary }}>
            <Plus size={15} /> Invite User
          </motion.button>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
          style={{ background: toast.type === "error" ? C.dangerLight : C.successLight,
                   border: `1px solid ${toast.type === "error" ? C.danger : C.success}33` }}>
          {toast.type === "error" ? <AlertCircle size={14} color={C.danger} /> : <CheckCircle2 size={14} color={C.success} />}
          <p className="text-sm" style={{ color: toast.type === "error" ? C.danger : C.success }}>{toast.msg}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={26} className="animate-spin" color={C.primary} />
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: C.surface, borderColor: C.border }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide"
                    style={{ color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: C.textMuted }}>
                    No users found.
                  </td>
                </tr>
              ) : users.map((user, i) => {
                const sc = STATUS_CFG[user.status?.toLowerCase()] ?? STATUS_CFG.active;
                return (
                  <tr key={user.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>
                          {(user.firstName?.[0] ?? user.name?.[0] ?? "U").toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: C.textSecondary }}>{user.email ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: C.primaryLight, color: C.primary }}>
                        {ROLE_LABELS[user.role] ?? user.role ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.08 }}
                          onClick={() => { setEditUser(user); setEditRole(user.role ?? "employee"); }}
                          className="p-1.5 rounded-lg" style={{ background: C.primaryLight, color: C.primary }}>
                          <Edit2 size={13} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.08 }}
                          onClick={() => setDelUser(user)}
                          className="p-1.5 rounded-lg" style={{ background: C.dangerLight, color: C.danger }}>
                          <Trash2 size={13} />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-md rounded-2xl p-6"
              style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>Invite New User</h3>
                <button onClick={() => setShowInvite(false)}><X size={15} color={C.textMuted} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>Email Address</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
                    <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}>
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowInvite(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleInvite} disabled={inviting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: C.primary, opacity: inviting ? 0.8 : 1 }}>
                  {inviting ? <Loader2 size={13} className="animate-spin" /> : null}
                  {inviting ? "Sending..." : "Send Invitation"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editUser && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditUser(null)} />
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-sm rounded-2xl p-6"
              style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>Change Role</h3>
                <button onClick={() => setEditUser(null)}><X size={15} color={C.textMuted} /></button>
              </div>
              <p className="text-xs mb-3" style={{ color: C.textMuted }}>
                Updating role for <span className="font-semibold" style={{ color: C.textPrimary }}>
                  {editUser.firstName ? `${editUser.firstName} ${editUser.lastName}` : editUser.name}
                </span>
              </p>
              <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-5"
                style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <div className="flex gap-3">
                <button onClick={() => setEditUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} onClick={handleUpdateRole}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: C.primary }}>
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {delUser && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDelUser(null)} />
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: C.dangerLight }}>
                <Trash2 size={22} color={C.danger} />
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: C.textPrimary }}>Remove User?</h3>
              <p className="text-sm mb-5" style={{ color: C.textSecondary }}>
                <strong>{delUser.firstName ? `${delUser.firstName} ${delUser.lastName}` : delUser.name}</strong> will lose access.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDelUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: C.danger, opacity: deleting ? 0.8 : 1 }}>
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  {deleting ? "Removing..." : "Remove"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}