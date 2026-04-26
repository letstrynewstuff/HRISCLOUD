import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { SETTINGS_MOCK } from "./SettingsMockData";

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

export default function UserManagement() {
  const [users, setUsers] = useState(SETTINGS_MOCK.users);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const inviteUser = (email, role) => {
    const newUser = {
      id: `U${Date.now()}`,
      name: email.split("@")[0],
      email,
      role,
      status: "Invited",
    };
    setUsers([...users, newUser]);
    setShowInviteModal(false);
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <motion.button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
          style={{ background: C.primary, color: "#fff" }}
        >
          <Plus size={16} /> Invite User
        </motion.button>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b"
                style={{ borderColor: C.border }}
              >
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-sm">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs rounded-full bg-primaryLight text-primary">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-4 py-1 text-xs rounded-full ${user.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <motion.button
                    className="p-2 rounded-lg"
                    style={{ background: C.accentLight, color: C.accent }}
                  >
                    <Edit2 size={14} />
                  </motion.button>
                  <motion.button
                    className="p-2 rounded-lg"
                    style={{ background: C.dangerLight, color: C.danger }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md"
            >
              <h3 className="font-bold text-xl mb-6">Invite New User</h3>
              <input
                id="email"
                placeholder="user@company.com"
                className="w-full px-4 py-3 rounded-xl mb-4"
                style={{ background: C.surfaceAlt }}
              />
              <select
                id="role"
                className="w-full px-4 py-3 rounded-xl mb-6"
                style={{ background: C.surfaceAlt }}
              >
                <option>HR Admin</option>
                <option>Manager</option>
                <option>Finance</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 rounded-xl"
                  style={{ background: C.surfaceAlt }}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    inviteUser(
                      document.getElementById("email").value,
                      document.getElementById("role").value,
                    )
                  }
                  className="flex-1 py-3 rounded-xl text-white"
                  style={{ background: C.primary }}
                >
                  Send Invitation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
