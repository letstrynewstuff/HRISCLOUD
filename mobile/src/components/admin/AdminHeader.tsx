// // src/components/admin/AdminHeader.tsx
// // Top bar for every admin screen: avatar, greeting + role badge, icons.

// import { View, Text, Pressable, StyleSheet } from "react-native";
// import { Bell, Settings } from "lucide-react-native";
// import Avatar from "../ui/Avatar";
// import C from "../../styles/colors";

// type AdminHeaderProps = {
//   name: string;
//   role: string;
//   avatarUri?: string;
//   notificationCount?: number;
//   onPressNotifications?: () => void;
//   onPressSettings?: () => void;
// };

// function greetingForHour(date = new Date()) {
//   const h = date.getHours();
//   if (h < 12) return "Good morning";
//   if (h < 17) return "Good afternoon";
//   return "Good evening";
// }

// export default function AdminHeader({
//   name,
//   role,
//   avatarUri,
//   notificationCount = 0,
//   onPressNotifications,
//   onPressSettings,
// }: AdminHeaderProps) {
//   return (
//     <View style={styles.row}>
//       <View style={styles.identity}>
//         <Avatar uri={avatarUri} name={name} size={50} online />
//         <View style={styles.textCol}>
//           <Text style={styles.greeting} numberOfLines={1}>
//             {greetingForHour()},{" "}
//             <Text style={styles.name}>{name.split(" ")[0]}</Text> 👋
//           </Text>
//           <View style={styles.rolePillRow}>
//             <View style={styles.rolePill}>
//               <Text style={styles.rolePillText}>
//                 {role.replace(/_/g, " ").toUpperCase()}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </View>

//       <View style={styles.icons}>
//         <Pressable
//           onPress={onPressNotifications}
//           hitSlop={10}
//           style={({ pressed }) => [
//             styles.iconBtn,
//             pressed && styles.iconPressed,
//           ]}
//         >
//           <Bell size={21} color={C.textPrimary} strokeWidth={1.8} />
//           {notificationCount > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>
//                 {notificationCount > 9 ? "9+" : notificationCount}
//               </Text>
//             </View>
//           )}
//         </Pressable>

//         <Pressable
//           onPress={onPressSettings}
//           hitSlop={10}
//           style={({ pressed }) => [
//             styles.iconBtn,
//             pressed && styles.iconPressed,
//           ]}
//         >
//           <Settings size={21} color={C.textPrimary} strokeWidth={1.8} />
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
//   textCol: { flexShrink: 1 },
//   greeting: { fontSize: 16, color: C.textPrimary },
//   name: { fontWeight: "800" },
//   rolePillRow: { flexDirection: "row", marginTop: 4 },
//   rolePill: {
//     backgroundColor: C.primaryLight,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   rolePillText: {
//     fontSize: 9,
//     fontWeight: "800",
//     color: C.primary,
//     letterSpacing: 0.5,
//   },
//   icons: { flexDirection: "row", alignItems: "center", gap: 10 },
//   iconBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconPressed: { backgroundColor: C.surfaceAlt },
//   badge: {
//     position: "absolute",
//     top: 2,
//     right: 2,
//     minWidth: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: C.danger,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 3,
//     borderWidth: 2,
//     borderColor: C.bg,
//   },
//   badgeText: { fontSize: 8, fontWeight: "800", color: "#fff" },
// });



// src/components/admin/AdminHeader.tsx
// Top bar for every admin screen: avatar, greeting + role badge.

import { View, Text, StyleSheet } from "react-native";
import Avatar from "../ui/Avatar";
import C from "../../styles/colors";

type AdminHeaderProps = {
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

export default function AdminHeader({
  name,
  role,
  avatarUri,
}: AdminHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.identity}>
        <Avatar uri={avatarUri} name={name} size={50} online />
        <View style={styles.textCol}>
          <Text style={styles.greeting} numberOfLines={1}>
            {greetingForHour()},{" "}
            <Text style={styles.name}>{name.split(" ")[0]}</Text> 👋
          </Text>
          <View style={styles.rolePillRow}>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>
                {role.replace(/_/g, " ").toUpperCase()}
              </Text>
            </View>
          </View>
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
  textCol: { flexShrink: 1 },
  greeting: { fontSize: 16, color: C.textPrimary },
  name: { fontWeight: "800" },
  rolePillRow: { flexDirection: "row", marginTop: 4 },
  rolePill: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: "800",
    color: C.primary,
    letterSpacing: 0.5,
  },
});