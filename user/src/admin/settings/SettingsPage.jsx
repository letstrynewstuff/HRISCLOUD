// src/admin/settings/AdminSettingsPage.jsx
import { useState, useEffect } from "react";
import C from "../../styles/colors";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Building2,
  Users,
  Key,
  Plug,
  Clock,
  CreditCard,
  Bell,
  Search,
  Menu,
} from "lucide-react";
import CompanyProfile from "./CompanyProfile";
import PayGroupSettings from "./PayGroupSettings";
import UserManagement from "./UserManagement";
import RolesPermissions from "./RolesPermissions";
import Integrations from "./Integrations";
import AuditLog from "./AuditLog";
import BillingSubscription from "./BillingSubscription";
import NotificationSettings from "./NotificationSettings";
import { authApi } from "../../api/service/authApi";


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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Load logged-in user for avatar / initials
  useEffect(() => {
    authApi
      .getMe()
      .then((d) => setAdminUser(d.user ?? d))
      .catch(() => {});
  }, []);

  const initials = adminUser
    ? `${adminUser.firstName?.[0] ?? ""}${adminUser.lastName?.[0] ?? ""}`.toUpperCase() ||
      "AD"
    : "AD";

  // Filter sidebar sections by search
  const visibleSections = SETTINGS_SECTIONS.filter(
    (s) =>
      !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── Header — same pattern as AdminAttendancePage ── */}
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
              className="p-2 rounded-full"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            {/* Animated search — mirrors attendance page */}
            <motion.div
              className="flex-1 max-w-sm relative"
              animate={{ width: searchFocused ? "320px" : "240px" }}
              transition={{ duration: 0.3 }}
            >
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search settings..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </motion.div>

            {/* Admin avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ml-auto"
              style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}
            >
              {initials}
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* ── Left settings nav — collapsible ── */}
            <AnimatePresence initial={false}>
              {sidebarOpen && (
                <motion.div
                  key="settings-nav"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 272, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-y-auto overflow-x-hidden shrink-0"
                  style={{
                    background: C.surface,
                    borderRight: `1px solid ${C.border}`,
                  }}
                >
                  <div className="p-4 w-[272px]">
                    {/* Section heading */}
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-3 px-2"
                      style={{ color: C.textMuted }}
                    >
                      Settings
                    </p>

                    {visibleSections.length === 0 ? (
                      <p
                        className="text-xs px-2 py-4 text-center"
                        style={{ color: C.textMuted }}
                      >
                        No sections match.
                      </p>
                    ) : (
                      visibleSections.map((section) => {
                        const active = activeSection === section.id;
                        return (
                          <motion.button
                            key={section.id}
                            whileHover={{ x: 2 }}
                            onClick={() => setActiveSection(section.id)}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium mb-1 transition-all text-left"
                            style={{
                              background: active ? C.primary : "transparent",
                              color: active ? "#fff" : C.textSecondary,
                              boxShadow: active
                                ? "0 2px 8px rgba(79,70,229,0.25)"
                                : "none",
                            }}
                          >
                            <section.icon size={16} />
                            {section.label}
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Main content ── */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <AnimatePresence mode="wait">
                {activeSection === "company" && (
                  <motion.div
                    key="company"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <CompanyProfile />
                  </motion.div>
                )}
                {activeSection === "paygroup" && (
                  <motion.div
                    key="paygroup"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <PayGroupSettings />
                  </motion.div>
                )}
                {activeSection === "users" && (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <UserManagement />
                  </motion.div>
                )}
                {activeSection === "roles" && (
                  <motion.div
                    key="roles"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <RolesPermissions />
                  </motion.div>
                )}
                {activeSection === "integrations" && (
                  <motion.div
                    key="integrations"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Integrations />
                  </motion.div>
                )}
                {activeSection === "audit" && (
                  <motion.div
                    key="audit"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <AuditLog />
                  </motion.div>
                )}
                {activeSection === "billing" && (
                  <motion.div
                    key="billing"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <BillingSubscription />
                  </motion.div>
                )}
                {activeSection === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <NotificationSettings />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
