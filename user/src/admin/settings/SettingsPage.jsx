import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import AdminSideNavbar from "../AdminSideNavbar";
import {
  Shield,
  Building2,
  Users,
  Key,
  Plug,
  Clock,
  CreditCard,
  Bell,
} from "lucide-react";
import CompanyProfile from "./CompanyProfile";
import PayGroupSettings from "./PayGroupSettings";
import UserManagement from "./UserManagement";
import RolesPermissions from "./RolesPermissions";
import Integrations from "./Integrations";
import AuditLog from "./AuditLog";
import BillingSubscription from "./BillingSubscription";
import NotificationSettings from "./NotificationSettings";

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

const ADMIN = { name: "Ngozi Adeleke", initials: "NA", role: "Super Admin" };

const SETTINGS_SECTIONS = [
  { id: "company", label: "Company Profile", icon: Building2 },
  { id: "paygroup", label: "Pay Group", icon: Shield },
  { id: "users", label: "User Management", icon: Users },
  { id: "roles", label: "Roles & Permissions", icon: Key },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "audit", label: "Audit Log", icon: Clock },
  { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState("company");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
          ADMIN={ADMIN}
          pendingApprovals={3}
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl"
            >
              <Shield size={16} color={C.textSecondary} />
            </motion.button>
            <div className="flex-1">
              <h1
                className="text-xl font-bold"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                System Settings
              </h1>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#4F46E5,#06B6D4)" }}
            >
              {ADMIN.initials}
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar Navigation */}
            <div
              className="w-72 border-r overflow-y-auto bg-white p-4"
              style={{ borderColor: C.border }}
            >
              {SETTINGS_SECTIONS.map((section) => (
                <motion.button
                  key={section.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-all ${activeSection === section.id ? "bg-primary text-white" : "hover:bg-slate-100"}`}
                >
                  <section.icon size={18} />
                  {section.label}
                </motion.button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              <AnimatePresence mode="wait">
                {activeSection === "company" && (
                  <CompanyProfile key="company" />
                )}
                {activeSection === "paygroup" && (
                  <PayGroupSettings key="paygroup" />
                )}
                {activeSection === "users" && <UserManagement key="users" />}
                {activeSection === "roles" && <RolesPermissions key="roles" />}
                {activeSection === "integrations" && (
                  <Integrations key="integrations" />
                )}
                {activeSection === "audit" && <AuditLog key="audit" />}
                {activeSection === "billing" && (
                  <BillingSubscription key="billing" />
                )}
                {activeSection === "notifications" && (
                  <NotificationSettings key="notifications" />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
