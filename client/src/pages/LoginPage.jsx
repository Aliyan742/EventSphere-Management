import {
  ArrowRight,
  CalendarCheck2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuthModal from "../components/GoogleAuthModal";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (role) => {
    if (role === "admin") navigate("/admin");
    else if (role === "exhibitor") navigate("/exhibitor");
    else navigate("/attendee");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.user, data.token);
      redirectByRole(data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googlePayload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/google", googlePayload);
      login(data.user, data.token);
      setGoogleOpen(false);
      redirectByRole(data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Visual Showcase Panel */}
      <div className="hidden lg:flex lg:col-span-6 relative overflow-hidden bg-slate-900 bg-grid-slate p-12 xl:p-16 flex-col justify-between text-white">
        <img
          src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80"
          alt="EventSphere Conference Hall"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/85 to-slate-900" />

        <div className="relative z-10 space-y-5 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-200 border border-blue-500/30">
            <CalendarCheck2 className="w-4 h-4 text-blue-400" />
            <span>EventSphere Portal</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-[1.15] tracking-tight">
            Your entire event,{" "}
            <span className="text-blue-400">organized in one place.</span>
          </h2>

          <p className="text-base text-slate-300 leading-relaxed">
            Sign in to reserve booths on the floor map, manage speaker
            sessions, and access your QR entry passes.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10 max-w-md bg-white/5 border border-white/15 p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300">
              Verified Exhibitor
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">
            &ldquo;Setting up our booth profile and managing 1-on-1 visitor
            appointments used to take spreadsheets. EventSphere keeps everything
            in one dashboard.&rdquo;
          </p>

          <div className="pt-1 flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Zainab Tariq — Event Director, NexaTech</span>
          </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="lg:col-span-6 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-12">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in to access your EventSphere dashboard.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium"
            >
              {error}
            </div>
          )}

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={() => setGoogleOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
              />
              <path
                fill="#34A853"
                d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink mx-3 text-xs font-medium text-slate-400">
              or with email
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 font-semibold text-sm text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              New to EventSphere?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <GoogleAuthModal
        isOpen={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onConfirm={handleGoogleSuccess}
        loading={loading}
      />
    </div>
  );
};

export default LoginPage;
