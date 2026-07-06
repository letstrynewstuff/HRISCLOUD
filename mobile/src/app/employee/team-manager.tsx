// // src/app/employee/team-manager.tsx
// // Team + Chat screen for MANAGERS / HR_ADMIN / SUPER_ADMIN.
// //
// // What managers can do:
// //  • View all team members in their department
// //  • Create group channels (their team only — backend also enforces this)
// //  • DM any team member
// //  • Open any group channel they belong to
// //  • Close (soft-delete) a channel they created
// //
// // Data flow:
// //  1. GET /employees/me     → resolves own employeeId + departmentId + isManager
// //  2. GET /employees        → filtered by department_id = my dept → team members
// //  3. GET /chat/channels    → channels the manager belongs to
// //  4. Chat actions use chatApi (unchanged)

// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   TextInput,
//   RefreshControl,
//   ActivityIndicator,
//   Modal,
//   Alert,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   ArrowLeft,
//   Plus,
//   Hash,
//   MessageSquare,
//   Search,
//   Users,
//   Mail,
//   MessageCircle,
//   RefreshCw,
//   AlertCircle,
//   X,
// } from "lucide-react-native";
// import Toast from "react-native-toast-message";

// import C from "../../styles/colors";
// import { chatApi } from "../../api/service/chatApi";
// import { getEmployees, getMyProfile } from "../../api/service/employeeApi";
// import ChatAvatar from "../../components/chat/ChatAvatar";
// import CreateChannelModal, {
//   TeamEmployee,
// } from "../../components/chat/CreateChannelModal";
// import ChatWindow, { ActiveConv } from "../../components/chat/ChatWindow";
// import { getInitials } from "../../hooks/chatHelpers";

// // ── Types ──────────────────────────────────────────────────────
// type Channel = {
//   id: string;
//   name: string;
//   type?: string;
//   memberCount?: number;
//   isActive?: boolean;
// };

// type TeamMember = {
//   id: string;
//   first_name: string;
//   last_name: string;
//   job_role_name?: string;
//   department_name?: string;
//   department_id?: string;
//   email?: string;
//   is_manager?: boolean;
//   on_leave?: boolean;
// };

// type MyProfile = {
//   id: string;
//   firstName?: string;
//   first_name?: string;
//   lastName?: string;
//   last_name?: string;
//   employeeId?: string;
//   employee_id?: string;
//   departmentId?: string;
//   department_id?: string;
//   role?: string;
//   isManager?: boolean;
//   is_manager?: boolean;
//   jobRoleName?: string;
//   job_role_name?: string;
// };

// export default function ManagerTeamChatScreen() {
//   const insets = useSafeAreaInsets();

//   /* ── Identity ── */
//   const [me, setMe] = useState<MyProfile | null>(null);
//   const [myEmpId, setMyEmpId] = useState("");
//   const [myName, setMyName] = useState("");
//   const [myDeptId, setMyDeptId] = useState<string | undefined>();

//   /* ── Data ── */
//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
//   const [channels, setChannels] = useState<Channel[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   /* ── UI state ── */
//   const [search, setSearch] = useState("");
//   const [activeConv, setActiveConv] = useState<ActiveConv | null>(null);
//   const [showCreate, setShowCreate] = useState(false);
//   const [creatingChannel, setCreatingChannel] = useState(false);

//   /* ── Load self + team + channels ── */
//   const load = useCallback(async () => {
//     setError(null);
//     try {
//       const meRes: MyProfile = await getMyProfile();
//       const empId = meRes.employeeId ?? meRes.employee_id ?? meRes.id ?? "";
//       const deptId = meRes.departmentId ?? meRes.department_id;
//       const firstName = meRes.firstName ?? meRes.first_name ?? "";
//       const lastName = meRes.lastName ?? meRes.last_name ?? "";
//       const name = `${firstName} ${lastName}`.trim();

//       setMe(meRes);
//       setMyEmpId(empId);
//       setMyName(name);
//       setMyDeptId(deptId);

//       const params: Record<string, string | number> = {
//         status: "active",
//         limit: 100,
//       };
//       if (deptId) params.department_id = deptId;

//       const [empRes, chanRes] = await Promise.allSettled([
//         getEmployees(params),
//         chatApi.listChannels(),
//       ]);

//       if (empRes.status === "fulfilled") {
//         const raw: TeamMember[] =
//           empRes.value?.data ?? empRes.value?.employees ?? [];
//         // Exclude self from team list
//         setTeamMembers(raw.filter((e) => e.id !== empId));
//       }

//       if (chanRes.status === "fulfilled") {
//         const chans: Channel[] = chanRes.value?.channels ?? [];
//         setChannels(chans.filter((c) => c.type === "group" || !c.type));
//       }
//     } catch (err: any) {
//       setError(err?.response?.data?.message ?? "Failed to load team data.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   /* ── Create channel ── */
//   const handleCreateChannel = async (payload: {
//     name: string;
//     description: string;
//     memberIds: string[];
//   }) => {
//     setCreatingChannel(true);
//     try {
//       const res = await chatApi.createChannel(payload);
//       const newCh: Channel = res.channel;
//       setChannels((p) => [newCh, ...p]);
//       setShowCreate(false);
//       // Auto-open the new channel
//       setActiveConv({
//         type: "channel",
//         channelId: newCh.id,
//         name: newCh.name,
//         memberCount: payload.memberIds.length + 1,
//       });
//       Toast.show({ type: "success", text1: `#${newCh.name} created` });
//     } catch (err: any) {
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Failed to create channel.",
//       });
//     } finally {
//       setCreatingChannel(false);
//     }
//   };

//   /* ── Open DM with team member ── */
//   const openDm = async (member: TeamMember) => {
//     const name = `${member.first_name} ${member.last_name}`.trim();
//     try {
//       const res = await chatApi.openDM(member.id);
//       const channelId = res.channel?.id ?? res.channel?._id;
//       if (!channelId) return;
//       setActiveConv({ type: "dm", channelId, name });
//     } catch (err: any) {
//       Toast.show({ type: "error", text1: "Could not open chat." });
//     }
//   };

//   /* ── Close channel ── */
//   const handleCloseChannel = (ch: Channel) => {
//     Alert.alert(
//       "Close Channel",
//       `Close #${ch.name}? Members won't be able to send new messages.`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Close",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await chatApi.closeChannel(ch.id);
//               setChannels((p) =>
//                 p.map((c) => (c.id === ch.id ? { ...c, isActive: false } : c)),
//               );
//               Toast.show({ type: "success", text1: `#${ch.name} closed` });
//             } catch {
//               Toast.show({ type: "error", text1: "Failed to close channel." });
//             }
//           },
//         },
//       ],
//     );
//   };

//   /* ── Filtered lists ── */
//   const q = search.toLowerCase();
//   const filteredMembers = teamMembers.filter(
//     (m) =>
//       !q ||
//       `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
//       (m.job_role_name ?? "").toLowerCase().includes(q),
//   );
//   const filteredChannels = channels.filter(
//     (c) => !q || c.name.toLowerCase().includes(q),
//   );

//   /* ── Team employees shaped for CreateChannelModal ── */
//   const teamForModal: TeamEmployee[] = teamMembers.map((m) => ({
//     id: m.id,
//     firstName: m.first_name,
//     lastName: m.last_name,
//     jobRoleName: m.job_role_name,
//     departmentName: m.department_name,
//   }));

//   /* ── If a conv is active, show ChatWindow full-screen ── */
//   if (activeConv) {
//     return (
//       <ChatWindow
//         conv={activeConv}
//         myEmployeeId={myEmpId}
//         myName={myName}
//         onBack={() => setActiveConv(null)}
//       />
//     );
//   }

//   /* ── Main screen ── */
//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable
//           onPress={() => router.back()}
//           hitSlop={8}
//           style={styles.backBtn}
//         >
//           <ArrowLeft size={18} color={C.textSecondary} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Team & Chat</Text>
//         <Pressable
//           onPress={() => setShowCreate(true)}
//           hitSlop={8}
//           style={styles.createBtn}
//         >
//           <Plus size={18} color="#fff" />
//         </Pressable>
//       </View>

//       {/* Hero */}
//       <View style={styles.hero}>
//         <View style={styles.heroIconWrap}>
//           <Users size={20} color="#fff" />
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.heroTitle}>My Team</Text>
//           <Text style={styles.heroSub}>
//             {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} ·{" "}
//             {channels.length} channel{channels.length !== 1 ? "s" : ""}
//           </Text>
//         </View>
//       </View>

//       {/* Search */}
//       <View style={styles.searchRow}>
//         <Search size={14} color={C.textMuted} />
//         <TextInput
//           value={search}
//           onChangeText={setSearch}
//           placeholder="Search members or channels…"
//           placeholderTextColor={C.textMuted}
//           style={styles.searchInput}
//         />
//         {!!search && (
//           <Pressable onPress={() => setSearch("")} hitSlop={8}>
//             <X size={13} color={C.textMuted} />
//           </Pressable>
//         )}
//       </View>

//       {loading ? (
//         <View style={styles.centerState}>
//           <ActivityIndicator color={C.primary} size="large" />
//         </View>
//       ) : error ? (
//         <View style={styles.errorBox}>
//           <AlertCircle size={16} color={C.danger} />
//           <Text style={styles.errorText}>{error}</Text>
//           <Pressable onPress={load} style={styles.retryBtn}>
//             <RefreshCw size={13} color={C.primary} />
//             <Text style={styles.retryLabel}>Retry</Text>
//           </Pressable>
//         </View>
//       ) : (
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={styles.scrollContent}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => {
//                 setRefreshing(true);
//                 load();
//               }}
//               tintColor={C.primary}
//             />
//           }
//           showsVerticalScrollIndicator={false}
//         >
//           {/* ── Group Channels ── */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Hash size={13} color={C.textMuted} />
//               <Text style={styles.sectionTitle}>Team Channels</Text>
//               <Pressable
//                 onPress={() => setShowCreate(true)}
//                 style={styles.sectionAddBtn}
//               >
//                 <Plus size={12} color={C.primary} />
//               </Pressable>
//             </View>

//             {filteredChannels.length === 0 ? (
//               <Pressable
//                 onPress={() => setShowCreate(true)}
//                 style={styles.emptyChannelPrompt}
//               >
//                 <Text style={styles.emptyChannelText}>
//                   No channels yet — tap to create one for your team
//                 </Text>
//               </Pressable>
//             ) : (
//               filteredChannels.map((ch) => (
//                 <Pressable
//                   key={ch.id}
//                   onPress={() =>
//                     setActiveConv({
//                       type: "channel",
//                       channelId: ch.id,
//                       name: ch.name,
//                       memberCount: ch.memberCount,
//                     })
//                   }
//                   style={({ pressed }) => [
//                     styles.channelRow,
//                     pressed && { opacity: 0.8 },
//                   ]}
//                 >
//                   <View style={styles.channelIcon}>
//                     <Hash size={15} color={C.primary} />
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.channelName}>#{ch.name}</Text>
//                     <Text style={styles.channelSub}>
//                       {ch.isActive === false
//                         ? "Closed"
//                         : ch.memberCount
//                           ? `${ch.memberCount} members`
//                           : "Active"}
//                     </Text>
//                   </View>
//                   {ch.isActive !== false && (
//                     <Pressable
//                       onPress={() => handleCloseChannel(ch)}
//                       hitSlop={8}
//                       style={styles.closeChanBtn}
//                     >
//                       <X size={12} color={C.textMuted} />
//                     </Pressable>
//                   )}
//                 </Pressable>
//               ))
//             )}
//           </View>

//           {/* ── Direct Messages ── */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <MessageCircle size={13} color={C.textMuted} />
//               <Text style={styles.sectionTitle}>Team Members</Text>
//               <Text style={styles.sectionCount}>{filteredMembers.length}</Text>
//             </View>

//             {filteredMembers.length === 0 ? (
//               <Text style={styles.emptyText}>No team members found</Text>
//             ) : (
//               filteredMembers.map((m) => {
//                 const fullName = `${m.first_name} ${m.last_name}`.trim();
//                 return (
//                   <View key={m.id} style={styles.memberCard}>
//                     <ChatAvatar name={fullName} size={42} />
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.memberName}>{fullName}</Text>
//                       <Text style={styles.memberRole}>
//                         {m.job_role_name ?? "Employee"}
//                       </Text>
//                       {m.on_leave && (
//                         <Text style={styles.onLeaveTag}>On Leave</Text>
//                       )}
//                     </View>
//                     <View style={styles.memberActions}>
//                       <Pressable
//                         onPress={() => openDm(m)}
//                         style={({ pressed }) => [
//                           styles.dmBtn,
//                           pressed && { opacity: 0.8 },
//                         ]}
//                       >
//                         <MessageCircle size={13} color={C.primary} />
//                         <Text style={styles.dmLabel}>DM</Text>
//                       </Pressable>
//                       {m.email && (
//                         <Pressable style={styles.emailBtn}>
//                           <Mail size={13} color={C.textSecondary} />
//                         </Pressable>
//                       )}
//                     </View>
//                   </View>
//                 );
//               })
//             )}
//           </View>

//           <View style={{ height: 24 }} />
//         </ScrollView>
//       )}

//       {/* Create Channel Modal */}
//       <CreateChannelModal
//         open={showCreate}
//         teamEmployees={teamForModal}
//         onClose={() => setShowCreate(false)}
//         onSave={handleCreateChannel}
//         saving={creatingChannel}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 12,
//   },
//   backBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   headerTitle: {
//     flex: 1,
//     fontSize: 17,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   createBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   hero: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginHorizontal: 16,
//     marginBottom: 12,
//     borderRadius: 18,
//     padding: 16,
//     backgroundColor: C.navy,
//   },
//   heroIconWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   heroTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
//   heroSub: { fontSize: 11.5, color: "rgba(224,225,255,0.75)", marginTop: 2 },
//   searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginHorizontal: 16,
//     marginBottom: 14,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: C.surface,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   searchInput: { flex: 1, fontSize: 13.5, color: C.textPrimary },
//   scrollContent: { paddingHorizontal: 16 },
//   section: { marginBottom: 18 },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginBottom: 10,
//   },
//   sectionTitle: {
//     flex: 1,
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   sectionCount: {
//     fontSize: 10.5,
//     fontWeight: "700",
//     color: C.textMuted,
//     backgroundColor: C.surfaceAlt,
//     paddingHorizontal: 7,
//     paddingVertical: 2,
//     borderRadius: 999,
//   },
//   sectionAddBtn: {
//     width: 24,
//     height: 24,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//   },
//   emptyChannelPrompt: {
//     padding: 14,
//     borderRadius: 14,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderStyle: "dashed",
//     alignItems: "center",
//   },
//   emptyChannelText: { fontSize: 12.5, color: C.textMuted, textAlign: "center" },
//   channelRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     backgroundColor: C.surface,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: C.border,
//     marginBottom: 6,
//   },
//   channelIcon: {
//     width: 34,
//     height: 34,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//   },
//   channelName: { fontSize: 13.5, fontWeight: "700", color: C.textPrimary },
//   channelSub: { fontSize: 11, color: C.textMuted, marginTop: 1 },
//   closeChanBtn: {
//     padding: 5,
//     borderRadius: 8,
//     backgroundColor: C.surfaceAlt,
//   },
//   memberCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 11,
//     padding: 12,
//     backgroundColor: C.surface,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: C.border,
//     marginBottom: 8,
//   },
//   memberName: { fontSize: 13.5, fontWeight: "700", color: C.textPrimary },
//   memberRole: { fontSize: 11.5, color: C.textMuted, marginTop: 1 },
//   onLeaveTag: {
//     fontSize: 9.5,
//     fontWeight: "700",
//     color: C.warning,
//     marginTop: 2,
//   },
//   memberActions: { flexDirection: "row", gap: 7 },
//   dmBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     paddingVertical: 7,
//     paddingHorizontal: 10,
//     borderRadius: 10,
//     backgroundColor: C.primaryLight,
//   },
//   dmLabel: { fontSize: 11.5, fontWeight: "700", color: C.primary },
//   emailBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   emptyText: {
//     fontSize: 12.5,
//     color: C.textMuted,
//     textAlign: "center",
//     padding: 16,
//   },
//   centerState: { flex: 1, alignItems: "center", justifyContent: "center" },
//   errorBox: {
//     margin: 16,
//     padding: 16,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     alignItems: "center",
//     gap: 8,
//   },
//   errorText: { fontSize: 12.5, color: C.danger, textAlign: "center" },
//   retryBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     backgroundColor: C.primaryLight,
//   },
//   retryLabel: { fontSize: 12, fontWeight: "700", color: C.primary },
// });



// src/app/employee/team-manager.tsx
// Team + Chat screen for MANAGERS / HR_ADMIN / SUPER_ADMIN.
//
// What managers can do:
//  • View all team members in their department
//  • Create group channels (their team only — backend also enforces this)
//  • DM any team member
//  • Open any group channel they belong to
//  • Close (soft-delete) a channel they created
//
// Data flow:
//  1. GET /employees/me     → resolves own employeeId + departmentId + isManager
//  2. GET /employees        → filtered by department_id = my dept → team members
//  3. GET /chat/channels    → channels the manager belongs to
//  4. Chat actions use chatApi (unchanged)

import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Hash,
  MessageSquare,
  Search,
  Users,
  Mail,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import C from "../../styles/colors";
import { chatApi } from "../../api/service/chatApi";
import { getEmployees, getMyProfile } from "../../api/service/employeeApi";
import ChatAvatar from "../../components/chat/ChatAvatar";
import CreateChannelModal, {
  TeamEmployee,
} from "../../components/chat/CreateChannelModal";
import ChatWindow, { ActiveConv } from "../../components/chat/ChatWindow";
import { getInitials } from "../../hooks/chatHelpers";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";

// ── Types ──────────────────────────────────────────────────────
type Channel = {
  id: string;
  name: string;
  type?: string;
  memberCount?: number;
  isActive?: boolean;
};

type TeamMember = {
  id: string;
  first_name: string;
  last_name: string;
  job_role_name?: string;
  department_name?: string;
  department_id?: string;
  email?: string;
  is_manager?: boolean;
  on_leave?: boolean;
};

type MyProfile = {
  id: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  employeeId?: string;
  employee_id?: string;
  departmentId?: string;
  department_id?: string;
  role?: string;
  isManager?: boolean;
  is_manager?: boolean;
  jobRoleName?: string;
  job_role_name?: string;
};

export default function ManagerTeamChatScreen() {
  const insets = useSafeAreaInsets();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  /* ── Identity ── */
  const [me, setMe] = useState<MyProfile | null>(null);
  const [myEmpId, setMyEmpId] = useState("");
  const [myName, setMyName] = useState("");
  const [myDeptId, setMyDeptId] = useState<string | undefined>();

  /* ── Data ── */
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── UI state ── */
  const [search, setSearch] = useState("");
  const [activeConv, setActiveConv] = useState<ActiveConv | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);

  /* ── Load self + team + channels ── */
  const load = useCallback(async () => {
    setError(null);
    try {
      const meRes: MyProfile = await getMyProfile();
      const empId = meRes.employeeId ?? meRes.employee_id ?? meRes.id ?? "";
      const deptId = meRes.departmentId ?? meRes.department_id;
      const firstName = meRes.firstName ?? meRes.first_name ?? "";
      const lastName = meRes.lastName ?? meRes.last_name ?? "";
      const name = `${firstName} ${lastName}`.trim();

      setMe(meRes);
      setMyEmpId(empId);
      setMyName(name);
      setMyDeptId(deptId);

      const params: Record<string, string | number> = {
        status: "active",
        limit: 100,
      };
      if (deptId) params.department_id = deptId;

      const [empRes, chanRes] = await Promise.allSettled([
        getEmployees(params),
        chatApi.listChannels(),
      ]);

      if (empRes.status === "fulfilled") {
        const raw: TeamMember[] =
          empRes.value?.data ?? empRes.value?.employees ?? [];
        // Exclude self from team list
        setTeamMembers(raw.filter((e) => e.id !== empId));
      }

      if (chanRes.status === "fulfilled") {
        const chans: Channel[] = chanRes.value?.channels ?? [];
        setChannels(chans.filter((c) => c.type === "group" || !c.type));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load team data.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      loaderRef.current?.show();
      try {
        await load();
      } finally {
        loaderRef.current?.hide();
      }
    })();
  }, [load]);

  /* ── Create channel ── */
  const handleCreateChannel = async (payload: {
    name: string;
    description: string;
    memberIds: string[];
  }) => {
    setCreatingChannel(true);
    try {
      const res = await chatApi.createChannel(payload);
      const newCh: Channel = res.channel;
      setChannels((p) => [newCh, ...p]);
      setShowCreate(false);
      // Auto-open the new channel
      setActiveConv({
        type: "channel",
        channelId: newCh.id,
        name: newCh.name,
        memberCount: payload.memberIds.length + 1,
      });
      Toast.show({ type: "success", text1: `#${newCh.name} created` });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Failed to create channel.",
      });
    } finally {
      setCreatingChannel(false);
    }
  };

  /* ── Open DM with team member ── */
  const openDm = async (member: TeamMember) => {
    const name = `${member.first_name} ${member.last_name}`.trim();
    try {
      const res = await chatApi.openDM(member.id);
      const channelId = res.channel?.id ?? res.channel?._id;
      if (!channelId) return;
      setActiveConv({ type: "dm", channelId, name });
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Could not open chat." });
    }
  };

  /* ── Close channel ── */
  const handleCloseChannel = (ch: Channel) => {
    Alert.alert(
      "Close Channel",
      `Close #${ch.name}? Members won't be able to send new messages.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close",
          style: "destructive",
          onPress: async () => {
            try {
              await chatApi.closeChannel(ch.id);
              setChannels((p) =>
                p.map((c) => (c.id === ch.id ? { ...c, isActive: false } : c)),
              );
              Toast.show({ type: "success", text1: `#${ch.name} closed` });
            } catch {
              Toast.show({ type: "error", text1: "Failed to close channel." });
            }
          },
        },
      ],
    );
  };

  /* ── Filtered lists ── */
  const q = search.toLowerCase();
  const filteredMembers = teamMembers.filter(
    (m) =>
      !q ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
      (m.job_role_name ?? "").toLowerCase().includes(q),
  );
  const filteredChannels = channels.filter(
    (c) => !q || c.name.toLowerCase().includes(q),
  );

  /* ── Team employees shaped for CreateChannelModal ── */
  const teamForModal: TeamEmployee[] = teamMembers.map((m) => ({
    id: m.id,
    firstName: m.first_name,
    lastName: m.last_name,
    jobRoleName: m.job_role_name,
    departmentName: m.department_name,
  }));

  /* ── If a conv is active, show ChatWindow full-screen ── */
  if (activeConv) {
    return (
      <ChatWindow
        conv={activeConv}
        myEmployeeId={myEmpId}
        myName={myName}
        onBack={() => setActiveConv(null)}
      />
    );
  }

  /* ── Main screen ── */
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <ArrowLeft size={18} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Team & Chat</Text>
        <Pressable
          onPress={() => setShowCreate(true)}
          hitSlop={8}
          style={styles.createBtn}
        >
          <Plus size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIconWrap}>
          <Users size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>My Team</Text>
          <Text style={styles.heroSub}>
            {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} ·{" "}
            {channels.length} channel{channels.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Search size={14} color={C.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search members or channels…"
          placeholderTextColor={C.textMuted}
          style={styles.searchInput}
        />
        {!!search && (
          <Pressable onPress={() => setSearch("")} hitSlop={8}>
            <X size={13} color={C.textMuted} />
          </Pressable>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={load} style={styles.retryBtn}>
            <RefreshCw size={13} color={C.primary} />
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load().finally(() => setRefreshing(false));
              }}
              tintColor={C.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* ── Group Channels ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Hash size={13} color={C.textMuted} />
              <Text style={styles.sectionTitle}>Team Channels</Text>
              <Pressable
                onPress={() => setShowCreate(true)}
                style={styles.sectionAddBtn}
              >
                <Plus size={12} color={C.primary} />
              </Pressable>
            </View>

            {filteredChannels.length === 0 ? (
              <Pressable
                onPress={() => setShowCreate(true)}
                style={styles.emptyChannelPrompt}
              >
                <Text style={styles.emptyChannelText}>
                  No channels yet — tap to create one for your team
                </Text>
              </Pressable>
            ) : (
              filteredChannels.map((ch) => (
                <Pressable
                  key={ch.id}
                  onPress={() =>
                    setActiveConv({
                      type: "channel",
                      channelId: ch.id,
                      name: ch.name,
                      memberCount: ch.memberCount,
                    })
                  }
                  style={({ pressed }) => [
                    styles.channelRow,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <View style={styles.channelIcon}>
                    <Hash size={15} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.channelName}>#{ch.name}</Text>
                    <Text style={styles.channelSub}>
                      {ch.isActive === false
                        ? "Closed"
                        : ch.memberCount
                          ? `${ch.memberCount} members`
                          : "Active"}
                    </Text>
                  </View>
                  {ch.isActive !== false && (
                    <Pressable
                      onPress={() => handleCloseChannel(ch)}
                      hitSlop={8}
                      style={styles.closeChanBtn}
                    >
                      <X size={12} color={C.textMuted} />
                    </Pressable>
                  )}
                </Pressable>
              ))
            )}
          </View>

          {/* ── Direct Messages ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MessageCircle size={13} color={C.textMuted} />
              <Text style={styles.sectionTitle}>Team Members</Text>
              <Text style={styles.sectionCount}>{filteredMembers.length}</Text>
            </View>

            {filteredMembers.length === 0 ? (
              <Text style={styles.emptyText}>No team members found</Text>
            ) : (
              filteredMembers.map((m) => {
                const fullName = `${m.first_name} ${m.last_name}`.trim();
                return (
                  <View key={m.id} style={styles.memberCard}>
                    <ChatAvatar name={fullName} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{fullName}</Text>
                      <Text style={styles.memberRole}>
                        {m.job_role_name ?? "Employee"}
                      </Text>
                      {m.on_leave && (
                        <Text style={styles.onLeaveTag}>On Leave</Text>
                      )}
                    </View>
                    <View style={styles.memberActions}>
                      <Pressable
                        onPress={() => openDm(m)}
                        style={({ pressed }) => [
                          styles.dmBtn,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <MessageCircle size={13} color={C.primary} />
                        <Text style={styles.dmLabel}>DM</Text>
                      </Pressable>
                      {m.email && (
                        <Pressable style={styles.emailBtn}>
                          <Mail size={13} color={C.textSecondary} />
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Create Channel Modal */}
      <CreateChannelModal
        open={showCreate}
        teamEmployees={teamForModal}
        onClose={() => setShowCreate(false)}
        onSave={handleCreateChannel}
        saving={creatingChannel}
      />

      {/* Global loader — the only loader in this screen */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading team data..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
  },
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
    backgroundColor: C.navy,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  heroSub: { fontSize: 11.5, color: "rgba(224,225,255,0.75)", marginTop: 2 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 13.5, color: C.textPrimary },
  scrollContent: { paddingHorizontal: 16 },
  section: { marginBottom: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.textMuted,
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  sectionAddBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  emptyChannelPrompt: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
    alignItems: "center",
  },
  emptyChannelText: { fontSize: 12.5, color: C.textMuted, textAlign: "center" },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 6,
  },
  channelIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  channelName: { fontSize: 13.5, fontWeight: "700", color: C.textPrimary },
  channelSub: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  closeChanBtn: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: C.surfaceAlt,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  memberName: { fontSize: 13.5, fontWeight: "700", color: C.textPrimary },
  memberRole: { fontSize: 11.5, color: C.textMuted, marginTop: 1 },
  onLeaveTag: {
    fontSize: 9.5,
    fontWeight: "700",
    color: C.warning,
    marginTop: 2,
  },
  memberActions: { flexDirection: "row", gap: 7 },
  dmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
  },
  dmLabel: { fontSize: 11.5, fontWeight: "700", color: C.primary },
  emailBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyText: {
    fontSize: 12.5,
    color: C.textMuted,
    textAlign: "center",
    padding: 16,
  },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorBox: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    alignItems: "center",
    gap: 8,
  },
  errorText: { fontSize: 12.5, color: C.danger, textAlign: "center" },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
  },
  retryLabel: { fontSize: 12, fontWeight: "700", color: C.primary },
});