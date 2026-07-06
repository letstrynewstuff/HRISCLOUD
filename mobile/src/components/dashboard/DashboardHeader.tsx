// // src/components/dashboard/DashboardHeader.tsx
// // Top greeting row: avatar + "Good morning, {name}" + role, with
// // notification and chat icon buttons (each with their own badge).

// import { View, Text, Pressable, StyleSheet } from "react-native";
// import { Bell, MessageCircle } from "lucide-react-native";
// import Avatar from "../ui/Avatar";
// import C from "../../styles/colors";

// type DashboardHeaderProps = {
//   name: string;
//   role: string;
//   avatarUri?: string;
//   notificationCount?: number;
//   hasNewMessages?: boolean;
//   onPressNotifications?: () => void;
//   onPressChat?: () => void;
// };

// function greetingForHour(date = new Date()) {
//   const h = date.getHours();
//   if (h < 12) return "Good morning";
//   if (h < 17) return "Good afternoon";
//   return "Good evening";
// }

// export default function DashboardHeader({
//   name,
//   role,
//   avatarUri,
//   notificationCount = 0,
//   hasNewMessages = false,
//   onPressNotifications,
//   onPressChat,
// }: DashboardHeaderProps) {
//   return (
//     <View style={styles.row}>
//       <View style={styles.identity}>
//         <Avatar uri={avatarUri} name={name} size={52} online />
//         <View style={styles.textCol}>
//           <Text style={styles.greeting} numberOfLines={1}>
//             {greetingForHour()}, <Text style={styles.name}>{name}</Text> 👋
//           </Text>
//           <Text style={styles.role}>{role}</Text>
//         </View>
//       </View>

//       <View style={styles.icons}>
//         <Pressable
//           onPress={onPressNotifications}
//           hitSlop={10}
//           style={({ pressed }) => [
//             styles.iconButton,
//             pressed && styles.iconPressed,
//           ]}
//         >
//           <Bell size={22} color={C.textPrimary} strokeWidth={1.8} />
//           {notificationCount > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>
//                 {notificationCount > 9 ? "9+" : notificationCount}
//               </Text>
//             </View>
//           )}
//         </Pressable>

//         <Pressable
//           onPress={onPressChat}
//           hitSlop={10}
//           style={({ pressed }) => [
//             styles.iconButton,
//             pressed && styles.iconPressed,
//           ]}
//         >
//           <MessageCircle size={22} color={C.textPrimary} strokeWidth={1.8} />
//           {hasNewMessages && <View style={styles.dot} />}
//         </Pressable>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   identity: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     flex: 1,
//     marginRight: 12,
//   },
//   textCol: {
//     flexShrink: 1,
//   },
//   greeting: {
//     fontSize: 18,
//     color: C.textPrimary,
//   },
//   name: {
//     fontWeight: "800",
//   },
//   role: {
//     fontSize: 13,
//     color: C.textMuted,
//     marginTop: 2,
//   },
//   icons: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//   },
//   iconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconPressed: {
//     backgroundColor: C.surfaceAlt,
//   },
//   badge: {
//     position: "absolute",
//     top: 2,
//     right: 2,
//     minWidth: 17,
//     height: 17,
//     borderRadius: 9,
//     backgroundColor: C.danger,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 3,
//     borderWidth: 2,
//     borderColor: C.bg,
//   },
//   badgeText: {
//     fontSize: 9,
//     fontWeight: "800",
//     color: "#fff",
//   },
//   dot: {
//     position: "absolute",
//     top: 4,
//     right: 4,
//     width: 9,
//     height: 9,
//     borderRadius: 5,
//     backgroundColor: C.primary,
//     borderWidth: 2,
//     borderColor: C.bg,
//   },
// });


// src/components/dashboard/DashboardHeader.tsx
// Top greeting row: avatar + "Good morning, {name}" + role.

import { View, Text, StyleSheet } from "react-native";
import Avatar from "../ui/Avatar";
import C from "../../styles/colors";

type DashboardHeaderProps = {
  name: string;
  role: string;
  avatarUri?: string;
};

function greetingForHour(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHeader({
  name,
  role,
  avatarUri,
}: DashboardHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.identity}>
        <Avatar uri={avatarUri} name={name} size={52} online />
        <View style={styles.textCol}>
          <Text style={styles.greeting} numberOfLines={1}>
            {greetingForHour()}, <Text style={styles.name}>{name}</Text> 👋
          </Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  textCol: {
    flexShrink: 1,
  },
  greeting: {
    fontSize: 18,
    color: C.textPrimary,
  },
  name: {
    fontWeight: "800",
  },
  role: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
  },
});