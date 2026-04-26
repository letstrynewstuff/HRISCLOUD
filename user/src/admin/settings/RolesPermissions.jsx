import { useState } from "react";
import { motion } from "framer-motion";
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

const modules = [
  "Employees",
  "Payroll",
  "Attendance",
  "Leave",
  "Performance",
  "Reports",
  "Settings",
];

export default function RolesPermissions() {
  const [roles] = useState(SETTINGS_MOCK.roles);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Roles & Permissions</h2>

      <div className="space-y-8">
        {roles.map((role, idx) => (
          <div
            key={idx}
            className="rounded-2xl border p-6"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="font-semibold text-xl">{role.name}</h3>
                <p className="text-sm text-slate-500">{role.description}</p>
              </div>
              <span className="text-xs px-4 py-2 rounded-full bg-slate-100">
                {role.users} users
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {modules.map((mod) => (
                <div
                  key={mod}
                  className="p-4 rounded-xl border"
                  style={{ borderColor: C.primaryLight }}
                >
                  <p className="font-medium mb-3">{mod}</p>
                  <div className="space-y-2">
                    {["View", "Create", "Edit", "Approve"].map((action) => (
                      <label
                        key={action}
                        className="flex items-center gap-2 text-xs"
                      >
                        <input
                          type="checkbox"
                          defaultChecked
                          className="accent-primary"
                        />{" "}
                        {action}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
