


// // src/components/admin/AdminBottomTabBar.tsx
// // Bottom nav for the admin stack. Mirrors employee BottomTabBar structure.

// import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
// import {
//   Home,
//   Users,
//   CalendarClock,
//   FileText,
//   Settings,
// } from "lucide-react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router, usePathname } from "expo-router";
// import C from "../../styles/colors";

// export type AdminTabKey =
//   | "home"
//   | "employees"
//   | "attendance"
//   | "reports"
//   | "settings";

// type Props = {
//   active: AdminTabKey;
//   onChange: (key: AdminTabKey) => void;
// };

// const TABS = [
//   { key: "home", label: "Home", Icon: Home, route: "/admin/dashboard" },
//   {
//     key: "employees",
//     label: "Employees",
//     Icon: Users,
//     route: "/admin/employees",
//   },
//   {
//     key: "attendance",
//     label: "Attendance",
//     Icon: CalendarClock,
//     route: "/admin/attendance",
//   },
//   { key: "reports", label: "Reports", Icon: FileText, route: "/admin/reports" },
//   { key: "settings", label: "Settings", Icon: Settings, route: "/admin/settings" },
// ] as const;

// export default function AdminBottomTabBar({ active, onChange }: Props) {
//   const insets = useSafeAreaInsets();
//   const currentPath = usePathname();

//   function handlePress(key: AdminTabKey, route: string) {
//     onChange(key);
//     if (currentPath !== route) {
//       router.navigate(route as any);
//     }
//   }

//   return (
//     <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
//       {TABS.map(({ key, label, Icon, route }) => {
//         const isActive = key === active;
//         return (
//           <Pressable
//             key={key}
//             style={styles.tab}
//             hitSlop={6}
//             onPress={() => handlePress(key, route)}
//           >
//             <Icon
//               size={22}
//               color={isActive ? C.primary : C.textMuted}
//               strokeWidth={isActive ? 2.2 : 1.8}
//             />
//             <Text style={[styles.label, isActive && styles.labelActive]}>
//               {label}
//             </Text>
//           </Pressable>
//         );
//       })}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrap: {
//     flexDirection: "row",
//     backgroundColor: C.surface,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//     paddingTop: 10,
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOpacity: 0.05,
//         shadowOffset: { width: 0, height: -2 },
//         shadowRadius: 8,
//       },
//       android: { elevation: 8 },
//     }),
//   },
//   tab: { flex: 1, alignItems: "center", gap: 4 },
//   label: { fontSize: 10.5, fontWeight: "600", color: C.textMuted },
//   labelActive: { fontWeight: "700", color: C.primary },
// });


// src/components/admin/AdminBottomTabBar.tsx
// Bottom nav for the admin stack. Mirrors employee BottomTabBar structure.

import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import {
  Home,
  Users,
  CalendarClock,
  FileText,
  Settings,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import C from "../../styles/colors";
import { Loader } from "../../hooks/loaderManager";

export type AdminTabKey =
  | "home"
  | "employees"
  | "attendance"
  | "reports"
  | "settings";

type Props = {
  active: AdminTabKey;
  onChange: (key: AdminTabKey) => void;
};

const TABS = [
  { key: "home", label: "Home", Icon: Home, route: "/admin/dashboard" },
  {
    key: "employees",
    label: "Employees",
    Icon: Users,
    route: "/admin/employees",
  },
  {
    key: "attendance",
    label: "Attendance",
    Icon: CalendarClock,
    route: "/admin/attendance",
  },
  { key: "reports", label: "Reports", Icon: FileText, route: "/admin/reports" },
  { key: "settings", label: "Settings", Icon: Settings, route: "/admin/settings" },
] as const;

export default function AdminBottomTabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const currentPath = usePathname();

  function handlePress(key: AdminTabKey, route: string) {
    onChange(key);
    if (currentPath !== route) {
      Loader.show();
      router.navigate(route as any);
      // The destination screen is responsible for calling Loader.hide()
      // after its data loads (via useFocusEffect + Loader.hide() in finally).
    }
  }

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map(({ key, label, Icon, route }) => {
        const isActive = key === active;
        return (
          <Pressable
            key={key}
            style={styles.tab}
            hitSlop={6}
            onPress={() => handlePress(key, route)}
          >
            <Icon
              size={22}
              color={isActive ? C.primary : C.textMuted}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  tab: { flex: 1, alignItems: "center", gap: 4 },
  label: { fontSize: 10.5, fontWeight: "600", color: C.textMuted },
  labelActive: { fontWeight: "700", color: C.primary },
});