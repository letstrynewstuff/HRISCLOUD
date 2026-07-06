// // src/components/ui/BottomTabBar.tsx

// import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
// import { Home, Clock, Users, Bell, User } from "lucide-react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import C from "../../styles/colors";

// export type TabKey = "home" | "attendance" | "team" | "updates" | "profile";

// type TabBarProps = {
//   active: TabKey;
//   onChange: (key: TabKey) => void;
//   teamBadge?: boolean;
// };

// const TABS: {
//   key: TabKey;
//   label: string;
//   Icon: typeof Home;
//   route: string;
// }[] = [
//   {
//     key: "home",
//     label: "Home",
//     Icon: Home,
//     route: "/employee/dashboard",
//   },
//   {
//     key: "attendance",
//     label: "Attendance",
//     Icon: Clock,
//     route: "/employee/attendance",
//   },
//   {
//     key: "team",
//     label: "Team",
//     Icon: Users,
//     route: "/employee/team",
//   },
//   {
//     key: "updates",
//     label: "Updates",
//     Icon: Bell,
//     route: "/employee/announcements",
//   },
//   {
//     key: "profile",
//     label: "Profile",
//     Icon: User,
//     route: "/employee/profile",
//   },
// ];

// export default function BottomTabBar({
//   active,
//   onChange,
//   teamBadge,
// }: TabBarProps) {
//   const insets = useSafeAreaInsets();

//   const handlePress = (key: TabKey, route: string) => {
//     onChange(key);
//     router.replace(route);
//   };

//   return (
//     <View
//       style={[
//         styles.wrap,
//         {
//           paddingBottom: Math.max(insets.bottom, 10),
//         },
//       ]}
//     >
//       {TABS.map(({ key, label, Icon, route }) => {
//         const isActive = key === active;

//         return (
//           <Pressable
//             key={key}
//             style={styles.tab}
//             hitSlop={6}
//             onPress={() => handlePress(key, route)}
//           >
//             <View>
//               <Icon
//                 size={22}
//                 color={isActive ? C.primary : C.textMuted}
//                 strokeWidth={isActive ? 2.2 : 1.8}
//               />

//               {key === "team" && teamBadge && <View style={styles.badge} />}
//             </View>

//             <Text
//               style={[
//                 styles.label,
//                 {
//                   color: isActive ? C.primary : C.textMuted,
//                 },
//                 isActive && styles.labelActive,
//               ]}
//             >
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
//         shadowOpacity: 0.04,
//         shadowOffset: {
//           width: 0,
//           height: -2,
//         },
//         shadowRadius: 8,
//       },

//       android: {
//         elevation: 8,
//       },
//     }),
//   },

//   tab: {
//     flex: 1,
//     alignItems: "center",
//     gap: 4,
//   },

//   label: {
//     fontSize: 10.5,
//     fontWeight: "600",
//   },

//   labelActive: {
//     fontWeight: "700",
//   },

//   badge: {
//     position: "absolute",
//     top: -2,
//     right: -4,
//     width: 7,
//     height: 7,
//     borderRadius: 3.5,
//     backgroundColor: C.danger,
//   },
// });


// src/components/ui/BottomTabBar.tsx
// FIXED: Use router.navigate() instead of router.replace() to avoid
//        "go back was not handled by any navigator" errors.

import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Home, Clock, Users, Bell, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import C from "../../styles/colors";

export type TabKey = "home" | "attendance" | "team" | "updates" | "profile";

type TabBarProps = {
  active: TabKey;
  onChange: (key: TabKey) => void;
  teamBadge?: boolean;
};

const TABS = [
  {
    key: "home",
    label: "Home",
    Icon: Home,
    route: "/employee/dashboard",
  },
  {
    key: "attendance",
    label: "Attendance",
    Icon: Clock,
    route: "/employee/attendance",
  },
  {
    key: "team",
    label: "Team",
    Icon: Users,
    route: "/employee/team-manager",
  },
  {
    key: "updates",
    label: "Updates",
    Icon: Bell,
    route: "/employee/announcements",
  },
  {
    key: "profile",
    label: "Profile",
    Icon: User,
    route: "/employee/profile",
  },
] as const;

export default function BottomTabBar({
  active,
  onChange,
  teamBadge,
}: TabBarProps) {
  const insets = useSafeAreaInsets();
  const currentPath = usePathname();

  const handlePress = (key: TabKey, route: string) => {
    onChange(key);
    // Only navigate if we're not already on this screen
    // Use navigate (not replace) to preserve back stack
    if (currentPath !== route) {
      router.navigate(route as any);
    }
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {TABS.map(({ key, label, Icon, route }) => {
        const isActive = key === active;

        return (
          <Pressable
            key={key}
            style={styles.tab}
            hitSlop={6}
            onPress={() => handlePress(key, route)}
          >
            <View>
              <Icon
                size={22}
                color={isActive ? C.primary : C.textMuted}
                strokeWidth={isActive ? 2.2 : 1.8}
              />

              {key === "team" && teamBadge && <View style={styles.badge} />}
            </View>

            <Text
              style={[
                styles.label,
                {
                  color: isActive ? C.primary : C.textMuted,
                },
                isActive && styles.labelActive,
              ]}
            >
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
        shadowOpacity: 0.04,
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowRadius: 8,
      },

      android: {
        elevation: 8,
      },
    }),
  },

  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  label: {
    fontSize: 10.5,
    fontWeight: "600",
  },

  labelActive: {
    fontWeight: "700",
  },

  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.danger,
  },
});