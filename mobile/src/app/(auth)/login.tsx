// // src/app/(auth)/login.tsx
// // Hero lockup: wordmark on the left, logo badge on the right (white
// // rounded badge so the logo's white background blends intentionally
// // instead of looking like a mistake). On successful login, redirects
// // to (app)/dashboard. Frontend only — no backend calls.

// import { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Pressable,
//   Image,
//   Animated,
//   Easing,
// } from "react-native";
// import { router } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import {
//   Eye,
//   EyeOff,
//   Mail,
//   Lock,
//   ArrowRight,
//   ArrowLeft,
//   CheckCircle2,
//   AlertCircle,
//   KeyRound,
//   Smartphone,
//   Check,
//   ShieldCheck,
// } from "lucide-react-native";
// import C from "../../styles/colors";
// import { useAuth } from "../../hooks/useAuth";
// import { authApi } from "../../api/service/authApi";

// // ─── Role → route map ───────────────────────────────────────
// // Mirrors the web LoginPage.jsx ROLE_CONFIG redirect logic.
// const ROLE_ROUTES: Record<string, string> = {
//   hr_admin: "/admin/dashboard",
//   admin: "/admin/dashboard",
//   hr: "/employee/dashboard",
//   employee: "/employee/dashboard",
// };

// type View_ = "login" | "forgot" | "otp" | "reset" | "success";

// // ─── Animated press wrapper ─────────────────────────────────
// function Pressy({
//   children,
//   onPress,
//   disabled,
//   style,
// }: {
//   children: React.ReactNode;
//   onPress?: () => void;
//   disabled?: boolean;
//   style?: any;
// }) {
//   const scale = useRef(new Animated.Value(1)).current;

//   const onPressIn = () =>
//     Animated.spring(scale, {
//       toValue: 0.97,
//       useNativeDriver: true,
//       speed: 40,
//     }).start();
//   const onPressOut = () =>
//     Animated.spring(scale, {
//       toValue: 1,
//       useNativeDriver: true,
//       speed: 30,
//     }).start();

//   return (
//     <Pressable
//       onPress={onPress}
//       onPressIn={onPressIn}
//       onPressOut={onPressOut}
//       disabled={disabled}
//     >
//       <Animated.View style={[style, { transform: [{ scale }] }]}>
//         {children}
//       </Animated.View>
//     </Pressable>
//   );
// }

// // ─── Field with animated focus ring ─────────────────────────
// function Field({
//   label,
//   value,
//   onChangeText,
//   placeholder,
//   error,
//   icon: Icon,
//   secureTextEntry,
//   rightEl,
//   keyboardType,
//   autoFocus,
// }: {
//   label: string;
//   value: string;
//   onChangeText: (t: string) => void;
//   placeholder: string;
//   error?: string;
//   icon?: any;
//   secureTextEntry?: boolean;
//   rightEl?: React.ReactNode;
//   keyboardType?: "default" | "email-address";
//   autoFocus?: boolean;
// }) {
//   const [focused, setFocused] = useState(false);
//   const glow = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(glow, {
//       toValue: focused ? 1 : 0,
//       duration: 180,
//       easing: Easing.out(Easing.quad),
//       useNativeDriver: false,
//     }).start();
//   }, [focused]);

//   const borderColor = error
//     ? C.danger
//     : glow.interpolate({
//         inputRange: [0, 1],
//         outputRange: [C.border, C.primary],
//       });

//   const shadowOpacity = glow.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 0.18],
//   });

//   return (
//     <View style={{ marginBottom: 6 }}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       <Animated.View
//         style={[
//           styles.inputWrap,
//           {
//             borderColor,
//             shadowColor: C.primary,
//             shadowOpacity,
//             shadowRadius: 10,
//             shadowOffset: { width: 0, height: 0 },
//             elevation: focused ? 2 : 0,
//           },
//         ]}
//       >
//         {Icon && (
//           <Icon
//             size={17}
//             color={value || focused ? C.primary : C.textMuted}
//             style={{ marginRight: 10 }}
//           />
//         )}
//         <TextInput
//           value={value}
//           onChangeText={onChangeText}
//           placeholder={placeholder}
//           placeholderTextColor={C.textMuted}
//           secureTextEntry={secureTextEntry}
//           keyboardType={keyboardType ?? "default"}
//           autoCapitalize="none"
//           autoFocus={autoFocus}
//           onFocus={() => setFocused(true)}
//           onBlur={() => setFocused(false)}
//           style={styles.input}
//         />
//         {rightEl}
//       </Animated.View>
//       {error ? (
//         <View style={styles.errorRow}>
//           <AlertCircle size={11} color={C.danger} />
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       ) : null}
//     </View>
//   );
// }

// // ─── OTP input ──────────────────────────────────────────────
// function OtpInput({
//   value,
//   onChange,
// }: {
//   value: string;
//   onChange: (v: string) => void;
// }) {
//   const inputs = useRef<(TextInput | null)[]>([]);
//   const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

//   const handleChange = (i: number, text: string) => {
//     const d = text.replace(/\D/g, "").slice(-1);
//     const next = value.slice(0, i) + d + value.slice(i + 1);
//     onChange(next.slice(0, 6));
//     if (d && i < 5) inputs.current[i + 1]?.focus();
//   };

//   const handleKeyPress = (i: number, key: string) => {
//     if (key === "Backspace" && !digits[i] && i > 0) {
//       inputs.current[i - 1]?.focus();
//     }
//   };

//   return (
//     <View style={styles.otpRow}>
//       {digits.map((d, i) => (
//         <TextInput
//           key={i}
//           ref={(el) => (inputs.current[i] = el)}
//           value={d}
//           onChangeText={(t) => handleChange(i, t)}
//           onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
//           keyboardType="number-pad"
//           maxLength={1}
//           style={[
//             styles.otpBox,
//             {
//               backgroundColor: d ? C.primaryLight : C.surfaceAlt,
//               borderColor: d ? C.primary : C.border,
//             },
//           ]}
//         />
//       ))}
//     </View>
//   );
// }

// // ─── Primary pill button ─────────────────────────────────────
// function PrimaryButton({
//   label,
//   onPress,
//   loading,
//   disabled,
//   loadingLabel,
// }: {
//   label: string;
//   onPress: () => void;
//   loading?: boolean;
//   disabled?: boolean;
//   loadingLabel?: string;
// }) {
//   return (
//     <Pressy onPress={onPress} disabled={loading || disabled}>
//       <View
//         style={[
//           styles.primaryBtn,
//           {
//             backgroundColor: C.primary,
//             opacity: loading || disabled ? 0.6 : 1,
//           },
//         ]}
//       >
//         {loading ? (
//           <>
//             <ActivityIndicator size="small" color="#fff" />
//             <Text style={styles.primaryBtnText}>
//               {loadingLabel ?? "Loading..."}
//             </Text>
//           </>
//         ) : (
//           <>
//             <Text style={styles.primaryBtnText}>{label}</Text>
//             <ArrowRight size={17} color="#fff" />
//           </>
//         )}
//       </View>
//     </Pressy>
//   );
// }

// // ─── Progress steps ─────────────────────────────────────────
// function ProgressSteps({ activeIndex }: { activeIndex: number }) {
//   const steps = ["forgot", "otp", "reset", "success"];
//   return (
//     <View style={styles.progressRow}>
//       {steps.map((s, i) => (
//         <View key={s} style={styles.progressItem}>
//           <View
//             style={[
//               styles.progressDot,
//               {
//                 backgroundColor:
//                   i < activeIndex
//                     ? C.success
//                     : i === activeIndex
//                       ? C.primary
//                       : C.surfaceAlt,
//                 borderColor:
//                   i < activeIndex
//                     ? C.success
//                     : i === activeIndex
//                       ? C.primary
//                       : C.border,
//               },
//             ]}
//           >
//             {i < activeIndex ? (
//               <Check size={10} color="#fff" />
//             ) : (
//               <Text
//                 style={[
//                   styles.progressDotText,
//                   { color: i <= activeIndex ? "#fff" : C.textMuted },
//                 ]}
//               >
//                 {i + 1}
//               </Text>
//             )}
//           </View>
//           {i < steps.length - 1 && (
//             <View
//               style={[
//                 styles.progressLine,
//                 { backgroundColor: i < activeIndex ? C.success : C.border },
//               ]}
//             />
//           )}
//         </View>
//       ))}
//     </View>
//   );
// }

// // ════════════════════ MAIN SCREEN ════════════════════
// export default function LoginScreen() {
//   const [view, setView] = useState<View_>("login");

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPw, setShowPw] = useState(false);
//   const [remember, setRemember] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [loading, setLoading] = useState(false);

//   const [forgotEmail, setForgotEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [otpTimer, setOtpTimer] = useState(60);
//   const [otpRunning, setOtpRunning] = useState(false);
//   const [newPw, setNewPw] = useState("");
//   const [confirmPw, setConfirmPw] = useState("");
//   const [showNewPw, setShowNewPw] = useState(false);
//   const [showConfirmPw, setShowConfirmPw] = useState(false);
//   const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

//   const sheetY = useRef(new Animated.Value(40)).current;
//   const sheetOpacity = useRef(new Animated.Value(0)).current;
//   const logoOpacity = useRef(new Animated.Value(0)).current;
//   const logoY = useRef(new Animated.Value(-12)).current;

//   useEffect(() => {
//     Animated.sequence([
//       Animated.parallel([
//         Animated.timing(logoOpacity, {
//           toValue: 1,
//           duration: 380,
//           useNativeDriver: true,
//         }),
//         Animated.timing(logoY, {
//           toValue: 0,
//           duration: 380,
//           easing: Easing.out(Easing.quad),
//           useNativeDriver: true,
//         }),
//       ]),
//       Animated.parallel([
//         Animated.timing(sheetOpacity, {
//           toValue: 1,
//           duration: 420,
//           useNativeDriver: true,
//         }),
//         Animated.spring(sheetY, {
//           toValue: 0,
//           useNativeDriver: true,
//           speed: 12,
//           bounciness: 6,
//         }),
//       ]),
//     ]).start();
//   }, []);

//   const viewFade = useRef(new Animated.Value(1)).current;
//   const animateViewChange = (next: View_) => {
//     Animated.timing(viewFade, {
//       toValue: 0,
//       duration: 140,
//       useNativeDriver: true,
//     }).start(() => {
//       setView(next);
//       Animated.timing(viewFade, {
//         toValue: 1,
//         duration: 220,
//         useNativeDriver: true,
//       }).start();
//     });
//   };

//   useEffect(() => {
//     if (!otpRunning) return;
//     if (otpTimer <= 0) {
//       setOtpRunning(false);
//       return;
//     }
//     const t = setTimeout(() => setOtpTimer((p) => p - 1), 1000);
//     return () => clearTimeout(t);
//   }, [otpRunning, otpTimer]);

//   // ── Login: real API call, stores tokens, redirects by role ──

//   const { refreshUser } = useAuth();

//   const handleLogin = async () => {
//     const e: Record<string, string> = {};
//     if (!email.trim()) e.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(email))
//       e.email = "Enter a valid email address";
//     if (!password) e.password = "Password is required";
//     setErrors(e);
//     if (Object.keys(e).length) return;

//     setLoading(true);
//     try {
//       const data = await authApi.login(email.trim(), password);

//       await SecureStore.setItemAsync("accessToken", data.accessToken);
//       await SecureStore.setItemAsync("refreshToken", data.refreshToken);

//       await refreshUser();

//       // const role = data.user?.role ?? "employee";
//       // const dest = ROLE_ROUTES[role] ?? ROLE_ROUTES.employee;

//       // router.replace(dest as any);

//       const role = data.user?.role ?? "employee";
//       const dest = ROLE_ROUTES[role] ?? ROLE_ROUTES.employee;

//       router.replace(dest as any);
//     } catch (err: any) {
//       const message =
//         err?.response?.data?.message ??
//         (err?.isNetworkError
//           ? "Network error. Please check your internet connection."
//           : null) ??
//         (err?.isTimeout ? "Request timed out. Please try again." : null) ??
//         "Invalid email or password.";
//       setErrors({ general: message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Forgot password: real API call ──────────────────────────
//   const handleSendOtp = async () => {
//     if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
//       setErrors({ forgotEmail: "Enter a valid email address" });
//       return;
//     }
//     setErrors({});
//     setLoading(true);
//     try {
//       await authApi.forgotPassword(forgotEmail.trim());
//       setOtpTimer(60);
//       setOtpRunning(true);
//       animateViewChange("otp");
//     } catch (err: any) {
//       const message =
//         err?.response?.data?.message ?? "Failed to send verification code.";
//       setErrors({ forgotEmail: message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Verify code ──────────────────────────────────────────────
//   // NOTE: Your backend's forgot-password flow emails a reset *link*
//   // with a token (see web LoginPage.jsx — otp state holds that token).
//   // If your backend instead supports a true 6-digit OTP verify endpoint,
//   // swap this stub for that API call. For now this matches the web
//   // app's behavior: the "otp" field is used as the reset token at the
//   // final step, so the user must paste the token they received by email.
//   const handleVerifyOtp = () => {
//     if (otp.length < 6) {
//       setErrors({ otp: "Enter all 6 digits" });
//       return;
//     }
//     setErrors({});
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//       animateViewChange("reset");
//     }, 600);
//   };

//   const pwStrength = (pw: string) => {
//     let score = 0;
//     if (pw.length >= 8) score++;
//     if (/[A-Z]/.test(pw)) score++;
//     if (/[0-9]/.test(pw)) score++;
//     if (/[^A-Za-z0-9]/.test(pw)) score++;
//     return score;
//   };
//   const strength = pwStrength(newPw);
//   const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
//   const strengthColor = [C.border, C.danger, C.warning, C.accent, C.success][
//     strength
//   ];

//   // ── Reset password: real API call ───────────────────────────
//   const handleResetPw = async () => {
//     const e: Record<string, string> = {};
//     if (newPw.length < 8) e.newPw = "Password must be at least 8 characters";
//     if (newPw !== confirmPw) e.confirmPw = "Passwords do not match";
//     setPwErrors(e);
//     if (Object.keys(e).length) return;

//     setLoading(true);
//     try {
//       // `otp` here holds the reset token, matching the web LoginPage.jsx pattern.
//       await authApi.resetPassword(otp, newPw);
//       animateViewChange("success");
//     } catch (err: any) {
//       const message =
//         err?.response?.data?.message ?? "Failed to reset password.";
//       setPwErrors({ newPw: message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetAllAndGoLogin = () => {
//     animateViewChange("login");
//     setNewPw("");
//     setConfirmPw("");
//     setOtp("");
//     setForgotEmail("");
//     setErrors({});
//     setPwErrors({});
//   };

//   const FLOW_STEPS = ["forgot", "otp", "reset", "success"];
//   const flowIdx = FLOW_STEPS.indexOf(view);

//   return (
//     <View style={{ flex: 1, backgroundColor: C.navy }}>
//       {/* ── Dark hero: wordmark left, logo badge right ── */}
//       <View style={styles.hero}>
//         <Animated.View
//           style={[
//             styles.heroRow,
//             { opacity: logoOpacity, transform: [{ translateY: logoY }] },
//           ]}
//         >
//           <Text style={styles.wordmark}>
//             Banta<Text style={{ color: C.accent }}>HR</Text>
//           </Text>
//           <View style={styles.logoBadge}>
//             <Image
//               source={require("../../assets/mobilebanta.png")}
//               style={styles.heroLogo}
//               resizeMode="contain"
//             />
//           </View>
//         </Animated.View>
//       </View>

//       {/* ── Sheet ── */}
//       <KeyboardAvoidingView
//         style={styles.sheetWrap}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <Animated.View
//           style={[
//             styles.sheet,
//             { opacity: sheetOpacity, transform: [{ translateY: sheetY }] },
//           ]}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             <View style={styles.sheetHandle} />

//             <Animated.View style={{ opacity: viewFade }}>
//               {flowIdx >= 0 && <ProgressSteps activeIndex={flowIdx} />}

//               {/* ───── LOGIN ───── */}
//               {view === "login" && (
//                 <View>
//                   <Text style={styles.title}>Welcome back</Text>
//                   <Text style={styles.subtitle}>
//                     Sign in to your BantaHR account
//                   </Text>

//                   {errors.general ? (
//                     <View style={styles.alertBox}>
//                       <AlertCircle size={15} color={C.danger} />
//                       <Text style={styles.alertText}>{errors.general}</Text>
//                     </View>
//                   ) : null}

//                   <Field
//                     label="Work email"
//                     value={email}
//                     onChangeText={setEmail}
//                     placeholder="name@bantahr.com"
//                     error={errors.email}
//                     icon={Mail}
//                     keyboardType="email-address"
//                   />

//                   <Field
//                     label="Password"
//                     value={password}
//                     onChangeText={setPassword}
//                     placeholder="Enter your password"
//                     error={errors.password}
//                     icon={Lock}
//                     secureTextEntry={!showPw}
//                     rightEl={
//                       <Pressable
//                         onPress={() => setShowPw((p) => !p)}
//                         hitSlop={8}
//                       >
//                         {showPw ? (
//                           <EyeOff size={17} color={C.textMuted} />
//                         ) : (
//                           <Eye size={17} color={C.textMuted} />
//                         )}
//                       </Pressable>
//                     }
//                   />

//                   <View style={styles.rowBetween}>
//                     <Pressable
//                       style={styles.checkRow}
//                       onPress={() => setRemember((p) => !p)}
//                     >
//                       <View
//                         style={[
//                           styles.checkbox,
//                           {
//                             backgroundColor: remember
//                               ? C.primary
//                               : "transparent",
//                             borderColor: remember ? C.primary : C.border,
//                           },
//                         ]}
//                       >
//                         {remember && <Check size={10} color="#fff" />}
//                       </View>
//                       <Text style={styles.checkLabel}>Remember me</Text>
//                     </Pressable>
//                     <Pressable onPress={() => animateViewChange("forgot")}>
//                       <Text style={styles.linkText}>Forgot password?</Text>
//                     </Pressable>
//                   </View>

//                   <View style={{ marginTop: 10 }}>
//                     <PrimaryButton
//                       label="Sign in"
//                       loadingLabel="Signing in..."
//                       loading={loading}
//                       onPress={handleLogin}
//                     />
//                   </View>

//                   <View style={styles.dividerRow}>
//                     <View style={styles.dividerLine} />
//                     <Text style={styles.dividerText}>or</Text>
//                     <View style={styles.dividerLine} />
//                   </View>

//                   <View style={styles.centerRow}>
//                     <Text style={styles.mutedText}>New user? </Text>
//                     <Pressable onPress={() => router.push("/(auth)/login")}>
//                       <Text style={styles.linkTextBold}>Create an account</Text>
//                     </Pressable>
//                   </View>

//                   <View style={styles.secureRow}>
//                     <ShieldCheck size={13} color={C.textMuted} />
//                     <Text style={styles.secureText}>
//                       Secured with end-to-end encryption
//                     </Text>
//                   </View>
//                 </View>
//               )}

//               {/* ───── FORGOT ───── */}
//               {view === "forgot" && (
//                 <View>
//                   <Pressable
//                     style={styles.backRow}
//                     onPress={() => animateViewChange("login")}
//                   >
//                     <ArrowLeft size={13} color={C.textMuted} />
//                     <Text style={styles.backText}>Back to login</Text>
//                   </Pressable>

//                   <View
//                     style={[
//                       styles.iconBadge,
//                       { backgroundColor: C.primaryLight },
//                     ]}
//                   >
//                     <KeyRound size={20} color={C.primary} />
//                   </View>
//                   <Text style={styles.title}>Forgot password?</Text>
//                   <Text style={styles.subtitle}>
//                     Enter your work email and we'll send a 6-digit verification
//                     code.
//                   </Text>

//                   <Field
//                     label="Work email"
//                     value={forgotEmail}
//                     onChangeText={setForgotEmail}
//                     placeholder="name@bantahr.com"
//                     error={errors.forgotEmail}
//                     icon={Mail}
//                     keyboardType="email-address"
//                     autoFocus
//                   />

//                   <View style={{ marginTop: 10 }}>
//                     <PrimaryButton
//                       label="Send verification code"
//                       loadingLabel="Sending..."
//                       loading={loading}
//                       onPress={handleSendOtp}
//                     />
//                   </View>
//                 </View>
//               )}

//               {/* ───── OTP ───── */}
//               {view === "otp" && (
//                 <View>
//                   <Pressable
//                     style={styles.backRow}
//                     onPress={() => animateViewChange("forgot")}
//                   >
//                     <ArrowLeft size={13} color={C.textMuted} />
//                     <Text style={styles.backText}>Back</Text>
//                   </Pressable>

//                   <View
//                     style={[
//                       styles.iconBadge,
//                       { backgroundColor: C.accentGlow },
//                     ]}
//                   >
//                     <Smartphone size={20} color={C.accent} />
//                   </View>
//                   <Text style={styles.title}>Check your email</Text>
//                   <Text style={styles.subtitle}>
//                     We sent a 6-digit code to{" "}
//                     <Text style={{ color: C.textPrimary, fontWeight: "700" }}>
//                       {forgotEmail}
//                     </Text>
//                     . Enter it below.
//                   </Text>

//                   <OtpInput value={otp} onChange={setOtp} />

//                   {errors.otp ? (
//                     <View
//                       style={[
//                         styles.errorRow,
//                         { justifyContent: "center", marginTop: 10 },
//                       ]}
//                     >
//                       <AlertCircle size={11} color={C.danger} />
//                       <Text style={styles.errorText}>{errors.otp}</Text>
//                     </View>
//                   ) : null}

//                   <View style={{ marginTop: 18 }}>
//                     <PrimaryButton
//                       label="Verify code"
//                       loadingLabel="Verifying..."
//                       loading={loading}
//                       disabled={otp.length < 6}
//                       onPress={handleVerifyOtp}
//                     />
//                   </View>

//                   <View style={styles.centerRow}>
//                     {otpRunning ? (
//                       <Text style={styles.mutedText}>
//                         Resend code in{" "}
//                         <Text style={{ color: C.primary, fontWeight: "700" }}>
//                           {otpTimer}s
//                         </Text>
//                       </Text>
//                     ) : (
//                       <Pressable onPress={handleSendOtp}>
//                         <Text style={styles.linkTextBold}>
//                           Resend verification code
//                         </Text>
//                       </Pressable>
//                     )}
//                   </View>

//                   <Text
//                     style={[
//                       styles.mutedText,
//                       { textAlign: "center", fontSize: 11, marginTop: 8 },
//                     ]}
//                   >
//                     For demo, enter any 6 digits to continue.
//                   </Text>
//                 </View>
//               )}

//               {/* ───── RESET ───── */}
//               {view === "reset" && (
//                 <View>
//                   <View
//                     style={[
//                       styles.iconBadge,
//                       { backgroundColor: C.successLight },
//                     ]}
//                   >
//                     <Lock size={20} color={C.success} />
//                   </View>
//                   <Text style={styles.title}>Set new password</Text>
//                   <Text style={styles.subtitle}>
//                     Choose a strong password for your account.
//                   </Text>

//                   <Field
//                     label="New password"
//                     value={newPw}
//                     onChangeText={setNewPw}
//                     placeholder="At least 8 characters"
//                     error={pwErrors.newPw}
//                     icon={Lock}
//                     secureTextEntry={!showNewPw}
//                     rightEl={
//                       <Pressable
//                         onPress={() => setShowNewPw((p) => !p)}
//                         hitSlop={8}
//                       >
//                         {showNewPw ? (
//                           <EyeOff size={17} color={C.textMuted} />
//                         ) : (
//                           <Eye size={17} color={C.textMuted} />
//                         )}
//                       </Pressable>
//                     }
//                   />

//                   {newPw ? (
//                     <View style={{ marginBottom: 12 }}>
//                       <View style={styles.strengthRow}>
//                         {[1, 2, 3, 4].map((i) => (
//                           <View
//                             key={i}
//                             style={[
//                               styles.strengthBar,
//                               {
//                                 backgroundColor:
//                                   i <= strength ? strengthColor : C.border,
//                               },
//                             ]}
//                           />
//                         ))}
//                       </View>
//                       <View style={styles.rowBetween}>
//                         <Text
//                           style={[
//                             styles.strengthLabel,
//                             { color: strengthColor },
//                           ]}
//                         >
//                           {strengthLabel}
//                         </Text>
//                         <Text style={styles.strengthHint}>
//                           Use uppercase, numbers & symbols
//                         </Text>
//                       </View>
//                     </View>
//                   ) : null}

//                   <Field
//                     label="Confirm password"
//                     value={confirmPw}
//                     onChangeText={setConfirmPw}
//                     placeholder="Repeat your password"
//                     error={pwErrors.confirmPw}
//                     icon={Lock}
//                     secureTextEntry={!showConfirmPw}
//                     rightEl={
//                       <Pressable
//                         onPress={() => setShowConfirmPw((p) => !p)}
//                         hitSlop={8}
//                       >
//                         {showConfirmPw ? (
//                           <EyeOff size={17} color={C.textMuted} />
//                         ) : (
//                           <Eye size={17} color={C.textMuted} />
//                         )}
//                       </Pressable>
//                     }
//                   />

//                   <View style={styles.rulesBox}>
//                     {[
//                       {
//                         rule: "At least 8 characters",
//                         pass: newPw.length >= 8,
//                       },
//                       {
//                         rule: "One uppercase letter",
//                         pass: /[A-Z]/.test(newPw),
//                       },
//                       { rule: "One number", pass: /[0-9]/.test(newPw) },
//                       {
//                         rule: "One special character",
//                         pass: /[^A-Za-z0-9]/.test(newPw),
//                       },
//                     ].map((r) => (
//                       <View key={r.rule} style={styles.ruleRow}>
//                         <View
//                           style={[
//                             styles.ruleDot,
//                             {
//                               backgroundColor: r.pass
//                                 ? C.successLight
//                                 : C.surfaceAlt,
//                               borderColor: r.pass ? C.success : C.border,
//                             },
//                           ]}
//                         >
//                           {r.pass && <Check size={9} color={C.success} />}
//                         </View>
//                         <Text
//                           style={[
//                             styles.ruleText,
//                             { color: r.pass ? C.success : C.textMuted },
//                           ]}
//                         >
//                           {r.rule}
//                         </Text>
//                       </View>
//                     ))}
//                   </View>

//                   <View style={{ marginTop: 8 }}>
//                     <PrimaryButton
//                       label="Reset password"
//                       loadingLabel="Updating..."
//                       loading={loading}
//                       onPress={handleResetPw}
//                     />
//                   </View>
//                 </View>
//               )}

//               {/* ───── SUCCESS ───── */}
//               {view === "success" && (
//                 <View style={{ alignItems: "center", paddingVertical: 12 }}>
//                   <View style={styles.successCircle}>
//                     <CheckCircle2 size={36} color={C.success} />
//                   </View>
//                   <Text
//                     style={[
//                       styles.title,
//                       { textAlign: "center", marginTop: 16 },
//                     ]}
//                   >
//                     Password updated!
//                   </Text>
//                   <Text style={[styles.subtitle, { textAlign: "center" }]}>
//                     Your password has been reset successfully. You can now sign
//                     in with your new password.
//                   </Text>
//                   <View style={{ width: "100%", marginTop: 12 }}>
//                     <PrimaryButton
//                       label="Back to login"
//                       onPress={resetAllAndGoLogin}
//                     />
//                   </View>
//                 </View>
//               )}
//             </Animated.View>
//           </ScrollView>
//         </Animated.View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// // ─── Styles ─────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   hero: {
//     height: 180,
//     backgroundColor: C.navy,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   heroRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   wordmark: {
//     fontSize: 26,
//     fontWeight: "800",
//     color: "#fff",
//     letterSpacing: -0.5,
//   },
//   logoBadge: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   heroLogo: {
//     width: 30,
//     height: 30,
//   },
//   sheetWrap: {
//     flex: 1,
//     marginTop: -28,
//   },
//   sheet: {
//     flex: 1,
//     backgroundColor: C.surface,
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     shadowColor: "#000",
//     shadowOpacity: 0.18,
//     shadowOffset: { width: 0, height: -8 },
//     shadowRadius: 24,
//     elevation: 12,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: 24,
//     paddingTop: 12,
//     paddingBottom: 40,
//   },
//   sheetHandle: {
//     width: 40,
//     height: 4,
//     borderRadius: 99,
//     backgroundColor: C.border,
//     alignSelf: "center",
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 13.5,
//     color: C.textMuted,
//     marginBottom: 22,
//     lineHeight: 19,
//   },
//   fieldLabel: {
//     fontSize: 12.5,
//     fontWeight: "600",
//     color: C.textPrimary,
//     marginBottom: 7,
//   },
//   inputWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderRadius: 16,
//     paddingHorizontal: 15,
//     paddingVertical: Platform.OS === "ios" ? 14 : 7,
//     backgroundColor: C.surfaceAlt,
//   },
//   input: {
//     flex: 1,
//     fontSize: 14.5,
//     color: C.textPrimary,
//   },
//   errorRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     marginTop: 5,
//   },
//   errorText: {
//     fontSize: 11,
//     color: C.danger,
//     fontWeight: "500",
//   },
//   alertBox: {
//     flexDirection: "row",
//     gap: 8,
//     backgroundColor: C.dangerLight,
//     borderWidth: 1,
//     borderColor: C.danger + "33",
//     borderRadius: 14,
//     padding: 12,
//     marginBottom: 16,
//     alignItems: "flex-start",
//   },
//   alertText: {
//     flex: 1,
//     fontSize: 13,
//     color: C.danger,
//   },
//   rowBetween: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   checkRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   checkbox: {
//     width: 16,
//     height: 16,
//     borderRadius: 4,
//     borderWidth: 1.5,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   checkLabel: {
//     fontSize: 12.5,
//     color: C.textSecondary,
//   },
//   linkText: {
//     fontSize: 12.5,
//     fontWeight: "700",
//     color: C.primary,
//   },
//   linkTextBold: {
//     fontSize: 13.5,
//     fontWeight: "700",
//     color: C.primary,
//   },
//   primaryBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 16,
//     borderRadius: 18,
//     shadowColor: C.primary,
//     shadowOpacity: 0.35,
//     shadowOffset: { width: 0, height: 8 },
//     shadowRadius: 18,
//     elevation: 6,
//   },
//   primaryBtnText: {
//     fontSize: 14.5,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   dividerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginVertical: 20,
//   },
//   dividerLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: C.border,
//   },
//   dividerText: {
//     fontSize: 11.5,
//     color: C.textMuted,
//   },
//   centerRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 4,
//   },
//   mutedText: {
//     fontSize: 13.5,
//     color: C.textSecondary,
//   },
//   secureRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     marginTop: 22,
//   },
//   secureText: {
//     fontSize: 11,
//     color: C.textMuted,
//   },
//   backRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginBottom: 18,
//   },
//   backText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: C.textMuted,
//   },
//   iconBadge: {
//     width: 46,
//     height: 46,
//     borderRadius: 15,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 16,
//   },
//   otpRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 10,
//     marginVertical: 10,
//   },
//   otpBox: {
//     width: 46,
//     height: 54,
//     borderRadius: 15,
//     borderWidth: 2,
//     textAlign: "center",
//     fontSize: 21,
//     fontWeight: "800",
//     color: C.primary,
//   },
//   strengthRow: {
//     flexDirection: "row",
//     gap: 6,
//     marginBottom: 6,
//   },
//   strengthBar: {
//     flex: 1,
//     height: 5,
//     borderRadius: 99,
//   },
//   strengthLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//   },
//   strengthHint: {
//     fontSize: 11,
//     color: C.textMuted,
//   },
//   rulesBox: {
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 16,
//     padding: 15,
//     gap: 9,
//     marginTop: 6,
//     marginBottom: 6,
//   },
//   ruleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   ruleDot: {
//     width: 16,
//     height: 16,
//     borderRadius: 99,
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   ruleText: {
//     fontSize: 11,
//   },
//   successCircle: {
//     width: 84,
//     height: 84,
//     borderRadius: 26,
//     backgroundColor: "#D1FAE5",
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: C.success,
//     shadowOpacity: 0.25,
//     shadowOffset: { width: 0, height: 8 },
//     shadowRadius: 20,
//     elevation: 6,
//   },
//   progressRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   progressItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   progressDot: {
//     width: 22,
//     height: 22,
//     borderRadius: 99,
//     borderWidth: 2,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   progressDotText: {
//     fontSize: 10,
//     fontWeight: "700",
//   },
//   progressLine: {
//     flex: 1,
//     height: 2,
//     borderRadius: 99,
//     marginHorizontal: 4,
//   },
// });



// src/app/(auth)/login.tsx
// Hero lockup: wordmark on the left, logo badge on the right (white
// rounded badge so the logo's white background blends intentionally
// instead of looking like a mistake). On successful login, redirects
// to (app)/dashboard. Frontend only — no backend calls.

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  Animated,
  Easing,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Smartphone,
  Check,
  ShieldCheck,
} from "lucide-react-native";
import C from "../../styles/colors";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/service/authApi";
import { Loader } from "../../hooks/loaderManager";

// ─── Role → route map ───────────────────────────────────────
const ROLE_ROUTES: Record<string, string> = {
  hr_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  hr: "/employee/dashboard",
  employee: "/employee/dashboard",
};

type View_ = "login" | "forgot" | "otp" | "reset" | "success";

// ─── Animated press wrapper ─────────────────────────────────
function Pressy({
  children,
  onPress,
  disabled,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ─── Field with animated focus ring ─────────────────────────
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon: Icon,
  secureTextEntry,
  rightEl,
  keyboardType,
  autoFocus,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  error?: string;
  icon?: any;
  secureTextEntry?: boolean;
  rightEl?: React.ReactNode;
  keyboardType?: "default" | "email-address";
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(glow, {
      toValue: focused ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const borderColor = error
    ? C.danger
    : glow.interpolate({
        inputRange: [0, 1],
        outputRange: [C.border, C.primary],
      });

  const shadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.18],
  });

  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Animated.View
        style={[
          styles.inputWrap,
          {
            borderColor,
            shadowColor: C.primary,
            shadowOpacity,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            elevation: focused ? 2 : 0,
          },
        ]}
      >
        {Icon && (
          <Icon
            size={17}
            color={value || focused ? C.primary : C.textMuted}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize="none"
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
        />
        {rightEl}
      </Animated.View>
      {error ? (
        <View style={styles.errorRow}>
          <AlertCircle size={11} color={C.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── OTP input ──────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (i: number, text: string) => {
    const d = text.replace(/\D/g, "").slice(-1);
    const next = value.slice(0, i) + d + value.slice(i + 1);
    onChange(next.slice(0, 6));
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyPress = (i: number, key: string) => {
    if (key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpRow}>
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          value={d}
          onChangeText={(t) => handleChange(i, t)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
          keyboardType="number-pad"
          maxLength={1}
          style={[
            styles.otpBox,
            {
              backgroundColor: d ? C.primaryLight : C.surfaceAlt,
              borderColor: d ? C.primary : C.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Primary pill button (no local spinner — global loader handles it) ──
function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressy onPress={onPress} disabled={disabled}>
      <View
        style={[
          styles.primaryBtn,
          {
            backgroundColor: C.primary,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text style={styles.primaryBtnText}>{label}</Text>
        <ArrowRight size={17} color="#fff" />
      </View>
    </Pressy>
  );
}

// ─── Progress steps ─────────────────────────────────────────
function ProgressSteps({ activeIndex }: { activeIndex: number }) {
  const steps = ["forgot", "otp", "reset", "success"];
  return (
    <View style={styles.progressRow}>
      {steps.map((s, i) => (
        <View key={s} style={styles.progressItem}>
          <View
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  i < activeIndex
                    ? C.success
                    : i === activeIndex
                      ? C.primary
                      : C.surfaceAlt,
                borderColor:
                  i < activeIndex
                    ? C.success
                    : i === activeIndex
                      ? C.primary
                      : C.border,
              },
            ]}
          >
            {i < activeIndex ? (
              <Check size={10} color="#fff" />
            ) : (
              <Text
                style={[
                  styles.progressDotText,
                  { color: i <= activeIndex ? "#fff" : C.textMuted },
                ]}
              >
                {i + 1}
              </Text>
            )}
          </View>
          {i < steps.length - 1 && (
            <View
              style={[
                styles.progressLine,
                { backgroundColor: i < activeIndex ? C.success : C.border },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

// ════════════════════ MAIN SCREEN ════════════════════
export default function LoginScreen() {
  const [view, setView] = useState<View_>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const [loading, setLoading] = useState(false); // ← REMOVED

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpRunning, setOtpRunning] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  const sheetY = useRef(new Animated.Value(40)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.spring(sheetY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 6,
        }),
      ]),
    ]).start();
  }, []);

  const viewFade = useRef(new Animated.Value(1)).current;
  const animateViewChange = (next: View_) => {
    Animated.timing(viewFade, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setView(next);
      Animated.timing(viewFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    if (!otpRunning) return;
    if (otpTimer <= 0) {
      setOtpRunning(false);
      return;
    }
    const t = setTimeout(() => setOtpTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [otpRunning, otpTimer]);

  // ── Login: real API call, stores tokens, redirects by role ──
  const { refreshUser } = useAuth();

  const handleLogin = async () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    setErrors(e);
    if (Object.keys(e).length) return;

    Loader.show(); // ← global loader
    try {
      const data = await authApi.login(email.trim(), password);

      await SecureStore.setItemAsync("accessToken", data.accessToken);
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);

      await refreshUser();

      const role = data.user?.role ?? "employee";
      const dest = ROLE_ROUTES[role] ?? ROLE_ROUTES.employee;

      router.replace(dest as any);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        (err?.isNetworkError
          ? "Network error. Please check your internet connection."
          : null) ??
        (err?.isTimeout ? "Request timed out. Please try again." : null) ??
        "Invalid email or password.";
      setErrors({ general: message });
    } finally {
      Loader.hide(); // ← hide global loader
    }
  };

  // ── Forgot password: real API call ──────────────────────────
  const handleSendOtp = async () => {
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setErrors({ forgotEmail: "Enter a valid email address" });
      return;
    }
    setErrors({});
    Loader.show(); // ← global loader
    try {
      await authApi.forgotPassword(forgotEmail.trim());
      setOtpTimer(60);
      setOtpRunning(true);
      animateViewChange("otp");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to send verification code.";
      setErrors({ forgotEmail: message });
    } finally {
      Loader.hide(); // ← hide global loader
    }
  };

  // ── Verify code ──────────────────────────────────────────────
  const handleVerifyOtp = () => {
    if (otp.length < 6) {
      setErrors({ otp: "Enter all 6 digits" });
      return;
    }
    setErrors({});
    Loader.show(); // ← global loader
    setTimeout(() => {
      Loader.hide(); // ← hide global loader
      animateViewChange("reset");
    }, 600);
  };

  const pwStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = pwStrength(newPw);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [C.border, C.danger, C.warning, C.accent, C.success][
    strength
  ];

  // ── Reset password: real API call ───────────────────────────
  const handleResetPw = async () => {
    const e: Record<string, string> = {};
    if (newPw.length < 8) e.newPw = "Password must be at least 8 characters";
    if (newPw !== confirmPw) e.confirmPw = "Passwords do not match";
    setPwErrors(e);
    if (Object.keys(e).length) return;

    Loader.show(); // ← global loader
    try {
      await authApi.resetPassword(otp, newPw);
      animateViewChange("success");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to reset password.";
      setPwErrors({ newPw: message });
    } finally {
      Loader.hide(); // ← hide global loader
    }
  };

  const resetAllAndGoLogin = () => {
    animateViewChange("login");
    setNewPw("");
    setConfirmPw("");
    setOtp("");
    setForgotEmail("");
    setErrors({});
    setPwErrors({});
  };

  const FLOW_STEPS = ["forgot", "otp", "reset", "success"];
  const flowIdx = FLOW_STEPS.indexOf(view);

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      {/* ── Dark hero: wordmark left, logo badge right ── */}
      <View style={styles.hero}>
        <Animated.View
          style={[
            styles.heroRow,
            { opacity: logoOpacity, transform: [{ translateY: logoY }] },
          ]}
        >
          <Text style={styles.wordmark}>
            Banta<Text style={{ color: C.accent }}>HR</Text>
          </Text>
          <View style={styles.logoBadge}>
            <Image
              source={require("../../assets/mobilebanta.png")}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </View>

      {/* ── Sheet ── */}
      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View
          style={[
            styles.sheet,
            { opacity: sheetOpacity, transform: [{ translateY: sheetY }] },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sheetHandle} />

            <Animated.View style={{ opacity: viewFade }}>
              {flowIdx >= 0 && <ProgressSteps activeIndex={flowIdx} />}

              {/* ───── LOGIN ───── */}
              {view === "login" && (
                <View>
                  <Text style={styles.title}>Welcome back</Text>
                  <Text style={styles.subtitle}>
                    Sign in to your BantaHR account
                  </Text>

                  {errors.general ? (
                    <View style={styles.alertBox}>
                      <AlertCircle size={15} color={C.danger} />
                      <Text style={styles.alertText}>{errors.general}</Text>
                    </View>
                  ) : null}

                  <Field
                    label="Work email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@bantahr.com"
                    error={errors.email}
                    icon={Mail}
                    keyboardType="email-address"
                  />

                  <Field
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    error={errors.password}
                    icon={Lock}
                    secureTextEntry={!showPw}
                    rightEl={
                      <Pressable
                        onPress={() => setShowPw((p) => !p)}
                        hitSlop={8}
                      >
                        {showPw ? (
                          <EyeOff size={17} color={C.textMuted} />
                        ) : (
                          <Eye size={17} color={C.textMuted} />
                        )}
                      </Pressable>
                    }
                  />

                  <View style={styles.rowBetween}>
                    <Pressable
                      style={styles.checkRow}
                      onPress={() => setRemember((p) => !p)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: remember
                              ? C.primary
                              : "transparent",
                            borderColor: remember ? C.primary : C.border,
                          },
                        ]}
                      >
                        {remember && <Check size={10} color="#fff" />}
                      </View>
                      <Text style={styles.checkLabel}>Remember me</Text>
                    </Pressable>
                    <Pressable onPress={() => animateViewChange("forgot")}>
                      <Text style={styles.linkText}>Forgot password?</Text>
                    </Pressable>
                  </View>

                  <View style={{ marginTop: 10 }}>
                    <PrimaryButton
                      label="Sign in"
                      onPress={handleLogin}
                    />
                  </View>

                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.centerRow}>
                    <Text style={styles.mutedText}>New user? </Text>
                    <Pressable onPress={() => router.push("/(auth)/login")}>
                      <Text style={styles.linkTextBold}>Create an account</Text>
                    </Pressable>
                  </View>

                  <View style={styles.secureRow}>
                    <ShieldCheck size={13} color={C.textMuted} />
                    <Text style={styles.secureText}>
                      Secured with end-to-end encryption
                    </Text>
                  </View>
                </View>
              )}

              {/* ───── FORGOT ───── */}
              {view === "forgot" && (
                <View>
                  <Pressable
                    style={styles.backRow}
                    onPress={() => animateViewChange("login")}
                  >
                    <ArrowLeft size={13} color={C.textMuted} />
                    <Text style={styles.backText}>Back to login</Text>
                  </Pressable>

                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: C.primaryLight },
                    ]}
                  >
                    <KeyRound size={20} color={C.primary} />
                  </View>
                  <Text style={styles.title}>Forgot password?</Text>
                  <Text style={styles.subtitle}>
                    Enter your work email and we'll send a 6-digit verification
                    code.
                  </Text>

                  <Field
                    label="Work email"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    placeholder="name@bantahr.com"
                    error={errors.forgotEmail}
                    icon={Mail}
                    keyboardType="email-address"
                    autoFocus
                  />

                  <View style={{ marginTop: 10 }}>
                    <PrimaryButton
                      label="Send verification code"
                      onPress={handleSendOtp}
                    />
                  </View>
                </View>
              )}

              {/* ───── OTP ───── */}
              {view === "otp" && (
                <View>
                  <Pressable
                    style={styles.backRow}
                    onPress={() => animateViewChange("forgot")}
                  >
                    <ArrowLeft size={13} color={C.textMuted} />
                    <Text style={styles.backText}>Back</Text>
                  </Pressable>

                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: C.accentGlow },
                    ]}
                  >
                    <Smartphone size={20} color={C.accent} />
                  </View>
                  <Text style={styles.title}>Check your email</Text>
                  <Text style={styles.subtitle}>
                    We sent a 6-digit code to{" "}
                    <Text style={{ color: C.textPrimary, fontWeight: "700" }}>
                      {forgotEmail}
                    </Text>
                    . Enter it below.
                  </Text>

                  <OtpInput value={otp} onChange={setOtp} />

                  {errors.otp ? (
                    <View
                      style={[
                        styles.errorRow,
                        { justifyContent: "center", marginTop: 10 },
                      ]}
                    >
                      <AlertCircle size={11} color={C.danger} />
                      <Text style={styles.errorText}>{errors.otp}</Text>
                    </View>
                  ) : null}

                  <View style={{ marginTop: 18 }}>
                    <PrimaryButton
                      label="Verify code"
                      disabled={otp.length < 6}
                      onPress={handleVerifyOtp}
                    />
                  </View>

                  <View style={styles.centerRow}>
                    {otpRunning ? (
                      <Text style={styles.mutedText}>
                        Resend code in{" "}
                        <Text style={{ color: C.primary, fontWeight: "700" }}>
                          {otpTimer}s
                        </Text>
                      </Text>
                    ) : (
                      <Pressable onPress={handleSendOtp}>
                        <Text style={styles.linkTextBold}>
                          Resend verification code
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.mutedText,
                      { textAlign: "center", fontSize: 11, marginTop: 8 },
                    ]}
                  >
                    For demo, enter any 6 digits to continue.
                  </Text>
                </View>
              )}

              {/* ───── RESET ───── */}
              {view === "reset" && (
                <View>
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: C.successLight },
                    ]}
                  >
                    <Lock size={20} color={C.success} />
                  </View>
                  <Text style={styles.title}>Set new password</Text>
                  <Text style={styles.subtitle}>
                    Choose a strong password for your account.
                  </Text>

                  <Field
                    label="New password"
                    value={newPw}
                    onChangeText={setNewPw}
                    placeholder="At least 8 characters"
                    error={pwErrors.newPw}
                    icon={Lock}
                    secureTextEntry={!showNewPw}
                    rightEl={
                      <Pressable
                        onPress={() => setShowNewPw((p) => !p)}
                        hitSlop={8}
                      >
                        {showNewPw ? (
                          <EyeOff size={17} color={C.textMuted} />
                        ) : (
                          <Eye size={17} color={C.textMuted} />
                        )}
                      </Pressable>
                    }
                  />

                  {newPw ? (
                    <View style={{ marginBottom: 12 }}>
                      <View style={styles.strengthRow}>
                        {[1, 2, 3, 4].map((i) => (
                          <View
                            key={i}
                            style={[
                              styles.strengthBar,
                              {
                                backgroundColor:
                                  i <= strength ? strengthColor : C.border,
                              },
                            ]}
                          />
                        ))}
                      </View>
                      <View style={styles.rowBetween}>
                        <Text
                          style={[
                            styles.strengthLabel,
                            { color: strengthColor },
                          ]}
                        >
                          {strengthLabel}
                        </Text>
                        <Text style={styles.strengthHint}>
                          Use uppercase, numbers & symbols
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  <Field
                    label="Confirm password"
                    value={confirmPw}
                    onChangeText={setConfirmPw}
                    placeholder="Repeat your password"
                    error={pwErrors.confirmPw}
                    icon={Lock}
                    secureTextEntry={!showConfirmPw}
                    rightEl={
                      <Pressable
                        onPress={() => setShowConfirmPw((p) => !p)}
                        hitSlop={8}
                      >
                        {showConfirmPw ? (
                          <EyeOff size={17} color={C.textMuted} />
                        ) : (
                          <Eye size={17} color={C.textMuted} />
                        )}
                      </Pressable>
                    }
                  />

                  <View style={styles.rulesBox}>
                    {[
                      {
                        rule: "At least 8 characters",
                        pass: newPw.length >= 8,
                      },
                      {
                        rule: "One uppercase letter",
                        pass: /[A-Z]/.test(newPw),
                      },
                      { rule: "One number", pass: /[0-9]/.test(newPw) },
                      {
                        rule: "One special character",
                        pass: /[^A-Za-z0-9]/.test(newPw),
                      },
                    ].map((r) => (
                      <View key={r.rule} style={styles.ruleRow}>
                        <View
                          style={[
                            styles.ruleDot,
                            {
                              backgroundColor: r.pass
                                ? C.successLight
                                : C.surfaceAlt,
                              borderColor: r.pass ? C.success : C.border,
                            },
                          ]}
                        >
                          {r.pass && <Check size={9} color={C.success} />}
                        </View>
                        <Text
                          style={[
                            styles.ruleText,
                            { color: r.pass ? C.success : C.textMuted },
                          ]}
                        >
                          {r.rule}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <PrimaryButton
                      label="Reset password"
                      onPress={handleResetPw}
                    />
                  </View>
                </View>
              )}

              {/* ───── SUCCESS ───── */}
              {view === "success" && (
                <View style={{ alignItems: "center", paddingVertical: 12 }}>
                  <View style={styles.successCircle}>
                    <CheckCircle2 size={36} color={C.success} />
                  </View>
                  <Text
                    style={[
                      styles.title,
                      { textAlign: "center", marginTop: 16 },
                    ]}
                  >
                    Password updated!
                  </Text>
                  <Text style={[styles.subtitle, { textAlign: "center" }]}>
                    Your password has been reset successfully. You can now sign
                    in with your new password.
                  </Text>
                  <View style={{ width: "100%", marginTop: 12 }}>
                    <PrimaryButton
                      label="Back to login"
                      onPress={resetAllAndGoLogin}
                    />
                  </View>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  hero: {
    height: 180,
    backgroundColor: C.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  heroLogo: {
    width: 30,
    height: 30,
  },
  sheetWrap: {
    flex: 1,
    marginTop: -28,
  },
  sheet: {
    flex: 1,
    backgroundColor: C.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -8 },
    shadowRadius: 24,
    elevation: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13.5,
    color: C.textMuted,
    marginBottom: 22,
    lineHeight: 19,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: C.textPrimary,
    marginBottom: 7,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 14 : 7,
    backgroundColor: C.surfaceAlt,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: C.textPrimary,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  errorText: {
    fontSize: 11,
    color: C.danger,
    fontWeight: "500",
  },
  alertBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: C.danger,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 4,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkLabel: {
    fontSize: 12.5,
    color: C.textSecondary,
  },
  linkText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.primary,
  },
  linkTextBold: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.primary,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: C.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#fff",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontSize: 11.5,
    color: C.textMuted,
  },
  centerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  mutedText: {
    fontSize: 13.5,
    color: C.textSecondary,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 22,
  },
  secureText: {
    fontSize: 11,
    color: C.textMuted,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },
  backText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textMuted,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 10,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 15,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 21,
    fontWeight: "800",
    color: C.primary,
  },
  strengthRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  strengthBar: {
    flex: 1,
    height: 5,
    borderRadius: 99,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  strengthHint: {
    fontSize: 11,
    color: C.textMuted,
  },
  rulesBox: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 15,
    gap: 9,
    marginTop: 6,
    marginBottom: 6,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleDot: {
    width: 16,
    height: 16,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleText: {
    fontSize: 11,
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.success,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressDot: {
    width: 22,
    height: 22,
    borderRadius: 99,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  progressDotText: {
    fontSize: 10,
    fontWeight: "700",
  },
  progressLine: {
    flex: 1,
    height: 2,
    borderRadius: 99,
    marginHorizontal: 4,
  },
});