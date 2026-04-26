import { useState } from "react";
import { motion } from "framer-motion";

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

const notificationTypes = [
  "Payroll Processed",
  "Leave Request Approved",
  "New Employee Onboarded",
  "Performance Review Due",
  "Document Expiring",
  "Employee Birthday",
];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    email: true,
    inApp: true,
    sms: false,
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Notification Settings</h2>

      <div
        className="rounded-2xl border p-8"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              <th className="px-6 py-4 text-left">Notification Type</th>
              <th className="px-6 py-4 text-center">Email</th>
              <th className="px-6 py-4 text-center">In-App</th>
              <th className="px-6 py-4 text-center">SMS</th>
            </tr>
          </thead>
          <tbody>
            {notificationTypes.map((type, i) => (
              <tr
                key={i}
                className="border-b"
                style={{ borderColor: C.border }}
              >
                <td className="px-6 py-5 font-medium">{type}</td>
                <td className="px-6 py-5 text-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-primary"
                  />
                </td>
                <td className="px-6 py-5 text-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-primary"
                  />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="accent-primary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
