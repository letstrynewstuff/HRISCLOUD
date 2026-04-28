// // src/superadmin/SuperAdminLogin.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Lock,
//   Mail,
//   Loader2,
//   ShieldCheck,
//   Eye,
//   EyeOff,
//   ChevronRight,
// } from "lucide-react";
// import { superAdminLoginApi } from "../api/service/superAdminApi";
// import C from "../styles/colors";

// export default function SuperAdminLogin() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     if (error) setError(""); // Clear error when user types
//   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError("");

// //     try {
// //       const response = await superAdminLoginApi(formData);

// //       // Handle successful login
// //       if (response.data?.token) {
// //         localStorage.setItem("superAdminToken", response.data.token);
// //         localStorage.setItem("userRole", "super_admin");

// //         // Success animation delay for UX
// //         setTimeout(() => {
// //           navigate("/super-admin/dashboard");
// //         }, 800);
// //       }
// //     } catch (err) {
// //       console.error("Login Error:", err);
// //       setError(
// //         err.response?.data?.message ||
// //           "Invalid credentials or system unreachable.",
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setError("");

//   try {
//     const response = await superAdminLoginApi(formData);

//     if (response.data?.token) {
//       // Store the token and role specifically for the Super Admin scope
//       localStorage.setItem("superAdminToken", response.data.token);
//       localStorage.setItem("userRole", "super_admin");

//       // Redirect to the dashboard
//       navigate("/super-admin/dashboard");
//     }
//   } catch (err) {
//     setError(err.response?.data?.message || "Login failed.");
//   } finally {
//     setLoading(false);
//   }
// };
//   return (
//     <div
//       className="min-h-screen flex items-center justify-center p-6"
//       style={{
//         background:
//           "linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)",
//         fontFamily: "Sora, sans-serif",
//       }}
//     >
//       {/* Decorative Background Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
//         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//         className="w-full max-w-[440px] relative z-10"
//       >
//         <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white/10">
//           <div className="p-8 md:p-10">
//             {/* Header */}
//             <div className="text-center mb-10">
//               <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-indigo-100">
//                 <ShieldCheck size={32} color={C.primary} />
//               </div>
//               <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
//                 System Master
//               </h1>
//               <p className="text-slate-500 text-sm font-medium">
//                 Enter your administrative credentials
//               </p>
//             </div>

//             {/* Error Message */}
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-xs font-bold uppercase tracking-wider"
//               >
//                 <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
//                 {error}
//               </motion.div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* Email Input */}
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
//                   Admin Email
//                 </label>
//                 <div className="relative group">
//                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
//                     <Mail size={18} />
//                   </div>
//                   <input
//                     required
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="name@hris.cloud"
//                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900"
//                   />
//                 </div>
//               </div>

//               {/* Password Input */}
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between ml-1">
//                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
//                     Password
//                   </label>
//                   <button
//                     type="button"
//                     className="text-[10px] font-bold text-indigo-600 hover:underline"
//                   >
//                     Recovery?
//                   </button>
//                 </div>
//                 <div className="relative group">
//                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
//                     <Lock size={18} />
//                   </div>
//                   <input
//                     required
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="••••••••"
//                     className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full mt-4 group relative overflow-hidden py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
//               >
//                 <div className="relative z-10 flex items-center justify-center gap-2">
//                   {loading ? (
//                     <Loader2 size={18} className="animate-spin" />
//                   ) : (
//                     <>
//                       Verify Access
//                       <ChevronRight
//                         size={16}
//                         className="group-hover:translate-x-1 transition-transform"
//                       />
//                     </>
//                   )}
//                 </div>
//                 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
//               </button>
//             </form>
//           </div>

//           {/* Footer Decoration */}
//           <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
//             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
//               Secured Endpoint : SSL Encryption Active
//             </p>
//           </div>
//         </div>

//         {/* Secondary Info */}
//         <p className="mt-8 text-center text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest">
//           Authorized Personnel Only • IP: Logged
//         </p>
//       </motion.div>
//     </div>
//   );
// }

// src/superadmin/SuperAdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";
import { superAdminLoginApi } from "../api/service/superAdminApi";
import C from "../styles/colors";

export default function SuperAdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 LOGIN ATTEMPT STARTED");
    console.log("📦 Payload being sent:", formData);

    setLoading(true);
    setError("");

    try {
      const response = await superAdminLoginApi(formData);

      console.log("✅ RESPONSE RECEIVED:", response);
      console.log("🔑 RESPONSE DATA:", response?.data);

      if (response.data?.accessToken) {
        localStorage.setItem("superAdminToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("userRole", "super_admin");

        console.log("🎉 LOGIN SUCCESS - Redirecting...");

        navigate("/super-admin/dashboard");
      } else {
        console.warn("⚠️ No accessToken returned:", response.data);
        setError("Login succeeded but no access token returned.");
      }
    } catch (err) {
      console.error("❌ LOGIN ERROR FULL OBJECT:", err);
      console.error("📡 Response Data:", err?.response?.data);
      console.error("📡 Status:", err?.response?.status);
      console.error("📡 Headers:", err?.response?.headers);

      setError(
        err?.response?.data?.message ||
          "Login failed. Check console for details.",
      );
    } finally {
      setLoading(false);
      console.log("🏁 LOGIN PROCESS FINISHED");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)",
        fontFamily: "Sora, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-10">
              <ShieldCheck size={32} color={C.primary} />
              <h1 className="text-2xl font-black mt-4">System Master</h1>
              <p className="text-slate-500 text-sm">
                Enter your administrative credentials
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-xs font-bold">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@email.com"
                    className="w-full pl-10 p-3 bg-gray-100 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 p-3 bg-gray-100 rounded-xl"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Login <ChevronRight />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
