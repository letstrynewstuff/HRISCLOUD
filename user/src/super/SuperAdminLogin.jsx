

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
