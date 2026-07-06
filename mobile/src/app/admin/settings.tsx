// // src/app/admin/settings.tsx
// // HR Admin Settings hub — same architecture as leave.tsx / payroll.tsx:
// // a parent screen holding `activeView` state, swapping in full-screen child
// // components for each section. No router involved for in-hub navigation.

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   Alert,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   ChevronLeft,
//   User,
//   Building2,
//   Bell,
//   ShieldCheck,
//   Plug,
//   Sun,
//   Moon,
//   LifeBuoy,
//   LogOut,
//   ChevronRight,
//   KeyRound,
// } from "lucide-react-native";

// import { useTheme } from "../../components/ThemeContext";
// import { useAuth } from "../../hooks/useAuth";

// import MyProfileView from "../../components/admin/settings/MyProfileView";
// import CompanyProfileView from "../../components/admin/settings/CompanyProfileView";
// import NotificationsView from "../../components/admin/settings/NotificationsView";
// import SecurityView from "../../components/admin/settings/SecurityView";
// import AccessControlView from "../../components/admin/settings/AccessControlView";
// import AppearanceView from "../../components/admin/settings/AppearanceView";
// import HelpSupportView from "../../components/admin/settings/HelpSupportView";
// import SettingsSection from "../../components/admin/settings/SettingsSection";
// import SettingsRow from "../../components/admin/settings/SettingsRow";

// type View =
//   | "hub"
//   | "profile"
//   | "companyProfile"
//   | "notifications"
//   | "security"
//   | "accessControl"
//   | "appearance"
//   | "help";

// export default function AdminSettingsScreen() {
//   const insets = useSafeAreaInsets();
//   const { colors: C, scheme, toggle } = useTheme();
//   const { employee, logout } = useAuth();

//   const [activeView, setActiveView] = useState<View>("hub");

//   const close = () => setActiveView("hub");

//   if (activeView === "profile") return <MyProfileView onClose={close} />;
//   if (activeView === "companyProfile")
//     return <CompanyProfileView onClose={close} />;
//   if (activeView === "notifications")
//     return <NotificationsView onClose={close} />;
//   if (activeView === "security") return <SecurityView onClose={close} />;
//   if (activeView === "accessControl")
//     return <AccessControlView onClose={close} />;
//   if (activeView === "appearance") return <AppearanceView onClose={close} />;
//   if (activeView === "help") return <HelpSupportView onClose={close} />;

//   const initials = (employee?.name ?? "Admin")
//     .split(" ")
//     .map((s: string) => s[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();

//   const handleLogout = () => {
//     Alert.alert("Log Out", "Are you sure you want to log out?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Log Out",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             if (typeof logout === "function") {
//               await logout();
//             }
//             router.replace("/login" as any);
//           } catch {
//             Alert.alert("Couldn't log out", "Please try again.");
//           }
//         },
//       },
//     ]);
//   };

//   return (
//     <View
//       style={[styles.screen, { paddingTop: insets.top, backgroundColor: C.bg }]}
//     >
//       {/* Header */}
//       <View
//         style={[
//           styles.header,
//           { borderBottomColor: C.border, backgroundColor: C.bg },
//         ]}
//       >
//         <Pressable
//           onPress={() => router.back()}
//           style={[
//             styles.headerBack,
//             { backgroundColor: C.surface, borderColor: C.border },
//           ]}
//         >
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={[styles.headerTitle, { color: C.textPrimary }]}>
//             Settings
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: C.textMuted }]}>
//             Account & workspace preferences
//           </Text>
//         </View>

//         {/* Quick light/dark toggle */}
//         <Pressable
//           onPress={toggle}
//           style={[
//             styles.themeToggle,
//             { backgroundColor: C.surface, borderColor: C.border },
//           ]}
//         >
//           {scheme === "dark" ? (
//             <Moon size={16} color={C.textSecondary} />
//           ) : (
//             <Sun size={16} color={C.textSecondary} />
//           )}
//         </Pressable>
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ── Admin identity card ── */}
//         <Pressable
//           onPress={() => setActiveView("profile")}
//           style={[styles.identityCard, { backgroundColor: C.navy }]}
//         >
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>{initials}</Text>
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.identityName}>
//               {employee?.name ?? "HR Admin"}
//             </Text>
//             <Text style={styles.identityRole}>
//               {employee?.role ?? employee?.email ?? "Administrator"}
//             </Text>
//           </View>
//           <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
//         </Pressable>

//         {/* ── Account ── */}
//         <SettingsSection title="Account">
//           <SettingsRow
//             icon={User}
//             label="My Profile"
//             sub="Your admin account details"
//             onPress={() => setActiveView("profile")}
//           />
//           <SettingsRow
//             icon={Building2}
//             label="Company Profile"
//             sub="Name, logo, address, time zone & currency"
//             onPress={() => setActiveView("companyProfile")}
//           />
//         </SettingsSection>

//         {/* ── Access Control ── */}
//         <SettingsSection title="Access Control">
//           <SettingsRow
//             icon={ShieldCheck}
//             label="Roles & Permissions"
//             sub="Control what each role can see and do"
//             onPress={() => setActiveView("accessControl")}
//           />
//         </SettingsSection>

//         {/* ── Preferences ── */}
//         <SettingsSection title="Preferences">
//           <SettingsRow
//             icon={Bell}
//             label="Notifications"
//             sub="Email, push, and SMS alerts"
//             onPress={() => setActiveView("notifications")}
//           />
//           <SettingsRow
//             icon={KeyRound}
//             label="Security"
//             sub="Password and two-factor authentication"
//             onPress={() => setActiveView("security")}
//           />
//           <SettingsRow
//             icon={scheme === "dark" ? Moon : Sun}
//             label="Appearance"
//             sub={scheme === "dark" ? "Dark mode" : "Light mode"}
//             onPress={() => setActiveView("appearance")}
//             right={
//               <Pressable onPress={toggle} hitSlop={8}>
//                 <View
//                   style={[
//                     styles.miniToggle,
//                     {
//                       backgroundColor: scheme === "dark" ? C.primary : C.border,
//                     },
//                   ]}
//                 >
//                   <View
//                     style={[
//                       styles.miniToggleDot,
//                       {
//                         alignSelf:
//                           scheme === "dark" ? "flex-end" : "flex-start",
//                       },
//                     ]}
//                   />
//                 </View>
//               </Pressable>
//             }
//           />
//         </SettingsSection>

//         {/* ── Integrations ── */}
//         <SettingsSection title="Integrations">
//           <SettingsRow
//             icon={Plug}
//             label="Integrations"
//             sub="Connect payroll banks, Slack, and more"
//             badge="Coming soon"
//             disabled
//             showChevron={false}
//           />
//         </SettingsSection>

//         {/* ── Support ── */}
//         <SettingsSection title="Support">
//           <SettingsRow
//             icon={LifeBuoy}
//             label="Help & Support"
//             sub="Contact us or browse resources"
//             onPress={() => setActiveView("help")}
//           />
//         </SettingsSection>

//         {/* ── Logout ── */}
//         <Pressable
//           onPress={handleLogout}
//           style={[
//             styles.logoutBtn,
//             { backgroundColor: C.dangerLight, borderColor: `${C.danger}33` },
//           ]}
//         >
//           <LogOut size={16} color={C.danger} />
//           <Text style={[styles.logoutText, { color: C.danger }]}>Log Out</Text>
//         </Pressable>

//         <View style={{ height: 32 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   headerBack: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//   },
//   headerTitle: { fontSize: 17, fontWeight: "800" },
//   headerSubtitle: { fontSize: 12, marginTop: 2 },
//   themeToggle: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//   },

//   scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

//   identityCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 22,
//   },
//   avatar: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
//   identityName: { color: "#fff", fontSize: 15, fontWeight: "800" },
//   identityRole: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 },

//   miniToggle: {
//     width: 40,
//     height: 22,
//     borderRadius: 11,
//     padding: 2,
//     justifyContent: "center",
//   },
//   miniToggleDot: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: "#fff",
//   },

//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 15,
//     borderRadius: 16,
//     borderWidth: 1,
//     marginTop: 4,
//   },
//   logoutText: { fontSize: 14, fontWeight: "800" },
// });

// // src/app/admin/settings.tsx
// // HR Admin Settings hub — same architecture as leave.tsx / payroll.tsx:
// // a parent screen holding `activeView` state, swapping in full-screen child
// // components for each section. No router involved for in-hub navigation.

// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   Alert,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router, useFocusEffect } from "expo-router";
// import {
//   ChevronLeft,
//   User,
//   Building2,
//   Bell,
//   ShieldCheck,
//   Plug,
//   Sun,
//   Moon,
//   LifeBuoy,
//   LogOut,
//   ChevronRight,
//   KeyRound,
// } from "lucide-react-native";

// import { useTheme } from "../../components/ThemeContext";
// import { useAuth } from "../../hooks/useAuth";
// import { Loader } from "../../hooks/loaderManager";

// import MyProfileView from "../../components/admin/settings/MyProfileView";
// import CompanyProfileView from "../../components/admin/settings/CompanyProfileView";
// import NotificationsView from "../../components/admin/settings/NotificationsView";
// import SecurityView from "../../components/admin/settings/SecurityView";
// import AccessControlView from "../../components/admin/settings/AccessControlView";
// import AppearanceView from "../../components/admin/settings/AppearanceView";
// import HelpSupportView from "../../components/admin/settings/HelpSupportView";
// import SettingsSection from "../../components/admin/settings/SettingsSection";
// import SettingsRow from "../../components/admin/settings/SettingsRow";

// type View =
//   | "hub"
//   | "profile"
//   | "companyProfile"
//   | "notifications"
//   | "security"
//   | "accessControl"
//   | "appearance"
//   | "help";

// export default function AdminSettingsScreen() {
//   const insets = useSafeAreaInsets();
//   const { colors: C, scheme, toggle } = useTheme();
//   const { employee, logout } = useAuth();

//   const [activeView, setActiveView] = useState<View>("hub");

//   // Hide loader when settings hub comes into focus (it's static, no data fetch)
//   useFocusEffect(
//     useCallback(() => {
//       Loader.hide();
//       return () => {};
//     }, []),
//   );

//   const close = () => setActiveView("hub");

//   if (activeView === "profile") return <MyProfileView onClose={close} />;
//   if (activeView === "companyProfile")
//     return <CompanyProfileView onClose={close} />;
//   if (activeView === "notifications")
//     return <NotificationsView onClose={close} />;
//   if (activeView === "security") return <SecurityView onClose={close} />;
//   if (activeView === "accessControl")
//     return <AccessControlView onClose={close} />;
//   if (activeView === "appearance") return <AppearanceView onClose={close} />;
//   if (activeView === "help") return <HelpSupportView onClose={close} />;

//   const initials = (employee?.name ?? "Admin")
//     .split(" ")
//     .map((s: string) => s[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();

//   const handleLogout = () => {
//     Alert.alert("Log Out", "Are you sure you want to log out?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Log Out",
//         style: "destructive",
//         onPress: async () => {
//           Loader.show();
//           try {
//             if (typeof logout === "function") {
//               await logout();
//             }
//             router.replace("/login" as any);
//           } catch {
//             Alert.alert("Couldn't log out", "Please try again.");
//           } finally {
//             Loader.hide();
//           }
//         },
//       },
//     ]);
//   };

//   return (
//     <View
//       style={[styles.screen, { paddingTop: insets.top, backgroundColor: C.bg }]}
//     >
//       {/* Header */}
//       <View
//         style={[
//           styles.header,
//           { borderBottomColor: C.border, backgroundColor: C.bg },
//         ]}
//       >
//         <Pressable
//           onPress={() => router.back()}
//           style={[
//             styles.headerBack,
//             { backgroundColor: C.surface, borderColor: C.border },
//           ]}
//         >
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={[styles.headerTitle, { color: C.textPrimary }]}>
//             Settings
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: C.textMuted }]}>
//             Account & workspace preferences
//           </Text>
//         </View>

//         {/* Quick light/dark toggle */}
//         <Pressable
//           onPress={toggle}
//           style={[
//             styles.themeToggle,
//             { backgroundColor: C.surface, borderColor: C.border },
//           ]}
//         >
//           {scheme === "dark" ? (
//             <Moon size={16} color={C.textSecondary} />
//           ) : (
//             <Sun size={16} color={C.textSecondary} />
//           )}
//         </Pressable>
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ── Admin identity card ── */}
//         <Pressable
//           onPress={() => setActiveView("profile")}
//           style={[styles.identityCard, { backgroundColor: C.navy }]}
//         >
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>{initials}</Text>
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.identityName}>
//               {employee?.name ?? "HR Admin"}
//             </Text>
//             <Text style={styles.identityRole}>
//               {employee?.role ?? employee?.email ?? "Administrator"}
//             </Text>
//           </View>
//           <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
//         </Pressable>

//         {/* ── Account ── */}
//         <SettingsSection title="Account">
//           <SettingsRow
//             icon={User}
//             label="My Profile"
//             sub="Your admin account details"
//             onPress={() => setActiveView("profile")}
//           />
//           <SettingsRow
//             icon={Building2}
//             label="Company Profile"
//             sub="Name, logo, address, time zone & currency"
//             onPress={() => setActiveView("companyProfile")}
//           />
//         </SettingsSection>

//         {/* ── Access Control ── */}
//         <SettingsSection title="Access Control">
//           <SettingsRow
//             icon={ShieldCheck}
//             label="Roles & Permissions"
//             sub="Control what each role can see and do"
//             onPress={() => setActiveView("accessControl")}
//           />
//         </SettingsSection>

//         {/* ── Preferences ── */}
//         <SettingsSection title="Preferences">
//           <SettingsRow
//             icon={Bell}
//             label="Notifications"
//             sub="Email, push, and SMS alerts"
//             onPress={() => setActiveView("notifications")}
//           />
//           <SettingsRow
//             icon={KeyRound}
//             label="Security"
//             sub="Password and two-factor authentication"
//             onPress={() => setActiveView("security")}
//           />
//           <SettingsRow
//             icon={scheme === "dark" ? Moon : Sun}
//             label="Appearance"
//             sub={scheme === "dark" ? "Dark mode" : "Light mode"}
//             onPress={() => setActiveView("appearance")}
//             right={
//               <Pressable onPress={toggle} hitSlop={8}>
//                 <View
//                   style={[
//                     styles.miniToggle,
//                     {
//                       backgroundColor: scheme === "dark" ? C.primary : C.border,
//                     },
//                   ]}
//                 >
//                   <View
//                     style={[
//                       styles.miniToggleDot,
//                       {
//                         alignSelf:
//                           scheme === "dark" ? "flex-end" : "flex-start",
//                       },
//                     ]}
//                   />
//                 </View>
//               </Pressable>
//             }
//           />
//         </SettingsSection>

//         {/* ── Integrations ── */}
//         <SettingsSection title="Integrations">
//           <SettingsRow
//             icon={Plug}
//             label="Integrations"
//             sub="Connect payroll banks, Slack, and more"
//             badge="Coming soon"
//             disabled
//             showChevron={false}
//           />
//         </SettingsSection>

//         {/* ── Support ── */}
//         <SettingsSection title="Support">
//           <SettingsRow
//             icon={LifeBuoy}
//             label="Help & Support"
//             sub="Contact us or browse resources"
//             onPress={() => setActiveView("help")}
//           />
//         </SettingsSection>

//         {/* ── Logout ── */}
//         <Pressable
//           onPress={handleLogout}
//           style={[
//             styles.logoutBtn,
//             { backgroundColor: C.dangerLight, borderColor: `${C.danger}33` },
//           ]}
//         >
//           <LogOut size={16} color={C.danger} />
//           <Text style={[styles.logoutText, { color: C.danger }]}>Log Out</Text>
//         </Pressable>

//         <View style={{ height: 32 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   headerBack: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//   },
//   headerTitle: { fontSize: 17, fontWeight: "800" },
//   headerSubtitle: { fontSize: 12, marginTop: 2 },
//   themeToggle: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//   },

//   scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

//   identityCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 22,
//   },
//   avatar: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
//   identityName: { color: "#fff", fontSize: 15, fontWeight: "800" },
//   identityRole: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 },

//   miniToggle: {
//     width: 40,
//     height: 22,
//     borderRadius: 11,
//     padding: 2,
//     justifyContent: "center",
//   },
//   miniToggleDot: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: "#fff",
//   },

//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 15,
//     borderRadius: 16,
//     borderWidth: 1,
//     marginTop: 4,
//   },
//   logoutText: { fontSize: 14, fontWeight: "800" },
// });



// src/app/admin/settings.tsx
// HR Admin Settings hub — same architecture as leave.tsx / payroll.tsx:
// a parent screen holding `activeView` state, swapping in full-screen child
// components for each section. No router involved for in-hub navigation.

// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   Alert,
//   InteractionManager,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router, useFocusEffect } from "expo-router";
// import {
//   ChevronLeft,
//   User,
//   Building2,
//   Bell,
//   ShieldCheck,
//   Plug,
//   Sun,
//   Moon,
//   LifeBuoy,
//   LogOut,
//   ChevronRight,
//   KeyRound,
// } from "lucide-react-native";

// import { useTheme } from "../../components/ThemeContext";
// import { useAuth } from "../../hooks/useAuth";
// import { Loader } from "../../hooks/loaderManager";

// import MyProfileView from "../../components/admin/settings/MyProfileView";
// import CompanyProfileView from "../../components/admin/settings/CompanyProfileView";
// import NotificationsView from "../../components/admin/settings/NotificationsView";
// import SecurityView from "../../components/admin/settings/SecurityView";
// import AccessControlView from "../../components/admin/settings/AccessControlView";
// import AppearanceView from "../../components/admin/settings/AppearanceView";
// import HelpSupportView from "../../components/admin/settings/HelpSupportView";
// import SettingsSection from "../../components/admin/settings/SettingsSection";
// import SettingsRow from "../../components/admin/settings/SettingsRow";

// type View =
//   | "hub"
//   | "profile"
//   | "companyProfile"
//   | "notifications"
//   | "security"
//   | "accessControl"
//   | "appearance"
//   | "help";

// export default function AdminSettingsScreen() {
//   const insets = useSafeAreaInsets();
//   const { colors: C, scheme, toggle } = useTheme();
//   const { employee, logout } = useAuth();

//   const [activeView, setActiveView] = useState<View>("hub");

//   // Hide loader after the screen transition completes and UI is ready
//   useFocusEffect(
//     useCallback(() => {
//       // Wait for all pending interactions (navigation transitions) to finish
//       const task = InteractionManager.runAfterInteractions(() => {
//         Loader.hide();
//       });
//       return () => task.cancel();
//     }, []),
//   );

//   const close = () => setActiveView("hub");

//   if (activeView === "profile") return <MyProfileView onClose={close} />;
//   if (activeView === "companyProfile")
//     return <CompanyProfileView onClose={close} />;
//   if (activeView === "notifications")
//     return <NotificationsView onClose={close} />;
//   if (activeView === "security") return <SecurityView onClose={close} />;
//   if (activeView === "accessControl")
//     return <AccessControlView onClose={close} />;
//   if (activeView === "appearance") return <AppearanceView onClose={close} />;
//   if (activeView === "help") return <HelpSupportView onClose={close} />;

//   const initials = (employee?.name ?? "Admin")
//     .split(" ")
//     .map((s: string) => s[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();

//   const handleLogout = () => {
//     Alert.alert("Log Out", "Are you sure you want to log out?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Log Out",
//         style: "destructive",
//         onPress: async () => {
//           Loader.show();
//           try {
//             if (typeof logout === "function") {
//               await logout();
//             }
//             router.replace("/login" as any);
//           } catch {
//             Alert.alert("Couldn't log out", "Please try again.");
//           } finally {
//             Loader.hide();
//           }
//         },
//       },
//     ]);
//   };


// src/app/admin/settings.tsx
// HR Admin Settings hub — same architecture as leave.tsx / payroll.tsx:
// a parent screen holding `activeView` state, swapping in full-screen child
// components for each section. No router involved for in-hub navigation.

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  User,
  Building2,
  Bell,
  ShieldCheck,
  Plug,
  Sun,
  Moon,
  LifeBuoy,
  LogOut,
  ChevronRight,
  KeyRound,
} from "lucide-react-native";

import { useTheme } from "../../components/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { Loader } from "../../hooks/loaderManager";

import MyProfileView from "../../components/admin/settings/MyProfileView";
import CompanyProfileView from "../../components/admin/settings/CompanyProfileView";
import NotificationsView from "../../components/admin/settings/NotificationsView";
import SecurityView from "../../components/admin/settings/SecurityView";
import AccessControlView from "../../components/admin/settings/AccessControlView";
import AppearanceView from "../../components/admin/settings/AppearanceView";
import HelpSupportView from "../../components/admin/settings/HelpSupportView";
import SettingsSection from "../../components/admin/settings/SettingsSection";
import SettingsRow from "../../components/admin/settings/SettingsRow";

type SettingsView =
  | "hub"
  | "profile"
  | "companyProfile"
  | "notifications"
  | "security"
  | "accessControl"
  | "appearance"
  | "help";

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: C, scheme, toggle } = useTheme();
  const { employee, logout } = useAuth();
  const [activeView, setActiveView] = useState<SettingsView>("hub");
  const hasLoaded = useRef(false);

  // Show loader on first mount, hide after layout is ready
  useEffect(() => {
    if (!hasLoaded.current) {
      Loader.show();
      hasLoaded.current = true;
      // Small delay to ensure loader renders before hiding
      const timer = setTimeout(() => {
        Loader.hide();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = (): void => setActiveView("hub");

  if (activeView === "profile") return <MyProfileView onClose={close} />;
  if (activeView === "companyProfile")
    return <CompanyProfileView onClose={close} />;
  if (activeView === "notifications")
    return <NotificationsView onClose={close} />;
  if (activeView === "security") return <SecurityView onClose={close} />;
  if (activeView === "accessControl")
    return <AccessControlView onClose={close} />;
  if (activeView === "appearance") return <AppearanceView onClose={close} />;
  if (activeView === "help") return <HelpSupportView onClose={close} />;

  const initials = (employee?.name ?? "Admin")
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          Loader.show();
          try {
            if (typeof logout === "function") {
              await logout();
            }
            router.replace("/login" as any);
          } catch {
            Alert.alert("Couldn't log out", "Please try again.");
          } finally {
            Loader.hide();
          }
        },
      },
    ]);
  };

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top, backgroundColor: C.bg }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: C.border, backgroundColor: C.bg },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.headerBack,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>
            Settings
          </Text>
          <Text style={[styles.headerSubtitle, { color: C.textMuted }]}>
            Account & workspace preferences
          </Text>
        </View>

        {/* Quick light/dark toggle */}
        <Pressable
          onPress={toggle}
          style={[
            styles.themeToggle,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          {scheme === "dark" ? (
            <Moon size={16} color={C.textSecondary} />
          ) : (
            <Sun size={16} color={C.textSecondary} />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Admin identity card ── */}
        <Pressable
          onPress={() => setActiveView("profile")}
          style={[styles.identityCard, { backgroundColor: C.navy }]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.identityName}>
              {employee?.name ?? "HR Admin"}
            </Text>
            <Text style={styles.identityRole}>
              {employee?.role ?? employee?.email ?? "Administrator"}
            </Text>
          </View>
          <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>

        {/* ── Account ── */}
        <SettingsSection title="Account">
          <SettingsRow
            icon={User}
            label="My Profile"
            sub="Your admin account details"
            onPress={() => setActiveView("profile")}
          />
          <SettingsRow
            icon={Building2}
            label="Company Profile"
            sub="Name, logo, address, time zone & currency"
            onPress={() => setActiveView("companyProfile")}
          />
        </SettingsSection>

        {/* ── Access Control ── */}
        <SettingsSection title="Access Control">
          <SettingsRow
            icon={ShieldCheck}
            label="Roles & Permissions"
            sub="Control what each role can see and do"
            onPress={() => setActiveView("accessControl")}
          />
        </SettingsSection>

        {/* ── Preferences ── */}
        <SettingsSection title="Preferences">
          <SettingsRow
            icon={Bell}
            label="Notifications"
            sub="Email, push, and SMS alerts"
            onPress={() => setActiveView("notifications")}
          />
          <SettingsRow
            icon={KeyRound}
            label="Security"
            sub="Password and two-factor authentication"
            onPress={() => setActiveView("security")}
          />
          <SettingsRow
            icon={scheme === "dark" ? Moon : Sun}
            label="Appearance"
            sub={scheme === "dark" ? "Dark mode" : "Light mode"}
            onPress={() => setActiveView("appearance")}
            right={
              <Pressable onPress={toggle} hitSlop={8}>
                <View
                  style={[
                    styles.miniToggle,
                    {
                      backgroundColor: scheme === "dark" ? C.primary : C.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.miniToggleDot,
                      {
                        alignSelf:
                          scheme === "dark" ? "flex-end" : "flex-start",
                      },
                    ]}
                  />
                </View>
              </Pressable>
            }
          />
        </SettingsSection>

        {/* ── Integrations ── */}
        <SettingsSection title="Integrations">
          <SettingsRow
            icon={Plug}
            label="Integrations"
            sub="Connect payroll banks, Slack, and more"
            badge="Coming soon"
            disabled
            showChevron={false}
          />
        </SettingsSection>

        {/* ── Support ── */}
        <SettingsSection title="Support">
          <SettingsRow
            icon={LifeBuoy}
            label="Help & Support"
            sub="Contact us or browse resources"
            onPress={() => setActiveView("help")}
          />
        </SettingsSection>

        {/* ── Logout ── */}
        <Pressable
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            { backgroundColor: C.dangerLight, borderColor: `${C.danger}33` },
          ]}
        >
          <LogOut size={16} color={C.danger} />
          <Text style={[styles.logoutText, { color: C.danger }]}>Log Out</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  identityName: { color: "#fff", fontSize: 15, fontWeight: "800" },
  identityRole: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 },

  miniToggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 2,
    justifyContent: "center",
  },
  miniToggleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutText: { fontSize: 14, fontWeight: "800" },
});