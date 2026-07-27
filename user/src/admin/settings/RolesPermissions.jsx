import { useState } from "react";
import C from "../../styles/colors";
import { motion } from "framer-motion";
import { SETTINGS_MOCK } from "./SettingsMockData";


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
      <h2 className="text-2xl mb-8">Roles & Permissions</h2>

      <div className="space-y-8">
        {roles.map((role, idx) => (
          <div
            key={idx}
            className="rounded-2xl border p-6"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="text-xl">{role.name}</h3>
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
