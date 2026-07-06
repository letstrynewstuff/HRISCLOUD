// // src/components/admin/settings/MyProfileView.tsx
// // Admin's own account details — name, email, phone, avatar. Mirrors
// // CompanyProfileView's load/edit/save shape but scoped to the logged-in
// // admin rather than the whole company.

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from "react-native";
// import { User, AlertCircle, ImagePlus } from "lucide-react-native";
// import { useTheme } from "../../ThemeContext";
// import {
//   getMyProfile,
//   updateMyProfile,
// } from "../../../api/service/settingsApi";
// import { Loader } from "../../../hooks/loaderManager";
// import SettingsHeader from "./SettingsHeader";
// import FieldInput from "./FieldInput";

// type Props = { onClose: () => void };

// export default function MyProfileView({ onClose }: Props) {
//   const { colors: C } = useTheme();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     avatar_url: "",
//   });
//   const [formErr, setFormErr] = useState<any>({});

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       setError(null);
//       Loader.show();
//       try {
//         const res: any = await getMyProfile();
//         const p = res.data ?? res ?? {};
//         setForm({
//           name: p.name ?? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
//           email: p.email ?? p.work_email ?? "",
//           phone: p.phone ?? "",
//           avatar_url: p.avatar_url ?? p.avatarUrl ?? "",
//         });
//       } catch (e: any) {
//         setError(e?.response?.data?.message ?? "Failed to load your profile.");
//       } finally {
//         setLoading(false);
//         Loader.hide();
//       }
//     })();
//   }, []);

//   const handleSave = async () => {
//     const errs: any = {};
//     if (!form.name.trim()) errs.name = "Required";
//     if (!form.email.trim()) errs.email = "Required";
//     setFormErr(errs);
//     if (Object.keys(errs).length) return;

//     setSaving(true);
//     setError(null);
//     try {
//       await updateMyProfile({
//         name: form.name.trim(),
//         email: form.email.trim(),
//         phone: form.phone.trim(),
//       });
//       Alert.alert("Saved", "Your profile has been updated.");
//     } catch (e: any) {
//       setError(e?.response?.data?.message ?? "Failed to save your profile.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleChangeAvatar = () => {
//     // Wire up expo-image-picker here, then call an uploadAvatar(formData)
//     // helper from settingsApi and set form.avatar_url to the returned URL.
//     Alert.alert(
//       "Change Photo",
//       "Hook this up to expo-image-picker to select an image, then upload it.",
//     );
//   };

//   const initials = (form.name || "Admin")
//     .split(" ")
//     .map((s) => s[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();

//   return (
//     <View style={[styles.screen, { backgroundColor: C.bg }]}>
//       <SettingsHeader
//         title="My Profile"
//         subtitle="Your admin account details"
//         onBack={onClose}
//       />

//       {loading ? (
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       ) : (
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           <View style={styles.avatarSection}>
//             <View
//               style={[
//                 styles.avatarWrap,
//                 { backgroundColor: C.primary, borderColor: C.border },
//               ]}
//             >
//               {form.avatar_url ? (
//                 <Image
//                   source={{ uri: form.avatar_url }}
//                   style={styles.avatarImage}
//                   resizeMode="cover"
//                 />
//               ) : (
//                 <Text style={styles.avatarInitials}>{initials}</Text>
//               )}
//             </View>
//             <Pressable
//               onPress={handleChangeAvatar}
//               style={[
//                 styles.changeAvatarBtn,
//                 { borderColor: C.border, backgroundColor: C.surface },
//               ]}
//             >
//               <ImagePlus size={13} color={C.textSecondary} />
//               <Text
//                 style={[styles.changeAvatarText, { color: C.textSecondary }]}
//               >
//                 {form.avatar_url ? "Change Photo" : "Upload Photo"}
//               </Text>
//             </Pressable>
//           </View>

//           {error && (
//             <View
//               style={[styles.errorBanner, { backgroundColor: C.dangerLight }]}
//             >
//               <AlertCircle size={14} color={C.danger} />
//               <Text style={[styles.errorText, { color: C.danger }]}>
//                 {error}
//               </Text>
//             </View>
//           )}

//           <View
//             style={[
//               styles.card,
//               { backgroundColor: C.surface, borderColor: C.border },
//             ]}
//           >
//             <FieldInput
//               label="Full Name *"
//               value={form.name}
//               onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
//               placeholder="e.g. Amara Johnson"
//               error={formErr.name}
//             />
//             <View style={{ height: 14 }} />
//             <FieldInput
//               label="Email *"
//               value={form.email}
//               onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
//               placeholder="you@company.com"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               error={formErr.email}
//             />
//             <View style={{ height: 14 }} />
//             <FieldInput
//               label="Phone"
//               value={form.phone}
//               onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
//               placeholder="+234 801 234 5678"
//               keyboardType="phone-pad"
//             />
//           </View>

//           <Pressable
//             onPress={handleSave}
//             disabled={saving}
//             style={[
//               styles.saveBtn,
//               { backgroundColor: C.primary, opacity: saving ? 0.7 : 1 },
//             ]}
//           >
//             {saving ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.saveBtnText}>Save Changes</Text>
//             )}
//           </Pressable>

//           <View style={{ height: 24 }} />
//         </ScrollView>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1 },
//   center: { flex: 1, alignItems: "center", justifyContent: "center" },
//   scrollContent: { padding: 16 },
//   avatarSection: { alignItems: "center", marginBottom: 20 },
//   avatarWrap: {
//     width: 84,
//     height: 84,
//     borderRadius: 42,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     overflow: "hidden",
//   },
//   avatarImage: { width: "100%", height: "100%" },
//   avatarInitials: { color: "#fff", fontSize: 26, fontWeight: "800" },
//   changeAvatarBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginTop: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 12,
//     borderWidth: 1,
//   },
//   changeAvatarText: { fontSize: 12, fontWeight: "700" },
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 12,
//     borderRadius: 14,
//     marginBottom: 14,
//   },
//   errorText: { flex: 1, fontSize: 12 },
//   card: { borderWidth: 1, borderRadius: 18, padding: 16 },
//   saveBtn: {
//     marginTop: 20,
//     paddingVertical: 15,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
// });



// src/components/admin/settings/MyProfileView.tsx
// Admin's own account details — name, email, phone, avatar. Mirrors
// CompanyProfileView's load/edit/save shape but scoped to the logged-in
// admin rather than the whole company.

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { User, AlertCircle, ImagePlus } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
} from "../../../api/service/settingsApi";
import { Loader } from "../../../hooks/loaderManager";
import SettingsHeader from "./SettingsHeader";
import FieldInput from "./FieldInput";

type Props = { onClose: () => void };

export default function MyProfileView({ onClose }: Props) {
  const { colors: C } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });
  const [formErr, setFormErr] = useState<any>({});

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const res: any = await getMyProfile();
      const p = res.data ?? res ?? {};
      setForm({
        name: p.name ?? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
        email: p.email ?? p.work_email ?? "",
        phone: p.phone ?? "",
        avatar_url: p.avatar_url ?? p.avatarUrl ?? "",
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load your profile.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    const errs: any = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.email.trim()) errs.email = "Required";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setError(null);
    try {
      await updateMyProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const localUri = result.assets[0].uri;
    // Show the picked photo immediately for snappy feedback, then swap
    // in the hosted URL once the upload resolves.
    setForm((f) => ({ ...f, avatar_url: localUri }));
    setUploadingAvatar(true);
    setError(null);
    try {
      const res: any = await uploadAvatar(localUri);
      const hostedUrl = res.avatar_url ?? res.data?.avatar_url ?? localUri;
      setForm((f) => ({ ...f, avatar_url: hostedUrl }));
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Failed to upload profile photo.",
      );
      // Revert to whatever was on the server before the failed attempt.
      loadProfile();
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initials = (form.name || "Admin")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <SettingsHeader
        title="My Profile"
        subtitle="Your admin account details"
        onBack={onClose}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.avatarWrap,
                { backgroundColor: C.primary, borderColor: C.border },
              ]}
            >
              {form.avatar_url ? (
                <Image
                  source={{ uri: form.avatar_url }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarInitials}>{initials}</Text>
              )}
              {uploadingAvatar && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              )}
            </View>
            <Pressable
              onPress={handleChangeAvatar}
              disabled={uploadingAvatar}
              style={[
                styles.changeAvatarBtn,
                { borderColor: C.border, backgroundColor: C.surface },
                uploadingAvatar && { opacity: 0.6 },
              ]}
            >
              <ImagePlus size={13} color={C.textSecondary} />
              <Text
                style={[styles.changeAvatarText, { color: C.textSecondary }]}
              >
                {uploadingAvatar
                  ? "Uploading…"
                  : form.avatar_url
                    ? "Change Photo"
                    : "Upload Photo"}
              </Text>
            </Pressable>
          </View>

          {error && (
            <View
              style={[styles.errorBanner, { backgroundColor: C.dangerLight }]}
            >
              <AlertCircle size={14} color={C.danger} />
              <Text style={[styles.errorText, { color: C.danger }]}>
                {error}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.card,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <FieldInput
              label="Full Name *"
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="e.g. Amara Johnson"
              error={formErr.name}
            />
            <View style={{ height: 14 }} />
            <FieldInput
              label="Email *"
              value={form.email}
              onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
              placeholder="you@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={formErr.email}
            />
            <View style={{ height: 14 }} />
            <FieldInput
              label="Phone"
              value={form.phone}
              onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="+234 801 234 5678"
              keyboardType="phone-pad"
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[
              styles.saveBtn,
              { backgroundColor: C.primary, opacity: saving ? 0.7 : 1 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </Pressable>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { padding: 16 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitials: { color: "#fff", fontSize: 26, fontWeight: "800" },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.45)",
  },
  changeAvatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  changeAvatarText: { fontSize: 12, fontWeight: "700" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 12 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  saveBtn: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});