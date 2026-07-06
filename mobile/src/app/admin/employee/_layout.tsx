// // src/app/admin/employees/_layout.tsx
// import { Stack } from "expo-router";

// export default function EmployeesLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="index" options={{ animation: "none" }} />
//       <Stack.Screen name="new" options={{ animation: "slide_from_right" }} />
//       <Stack.Screen name="list" options={{ animation: "slide_from_right" }} />
//       <Stack.Screen
//         name="profile"
//         options={{ animation: "slide_from_right" }}
//       />
//       <Stack.Screen
//         name="offboarding"
//         options={{ animation: "slide_from_right" }}
//       />
//     </Stack>
//   );
// }

import { Stack } from "expo-router";

export default function EmployeesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}