import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Ticket,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuthModal from "../components/GoogleAuthModal";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const BENEFITS = [
  "Generate a scannable QR entry pass right after registering",
  "Pick and reserve stalls directly from an interactive floor map",
  "Schedule 1-on-1 meetings and chat with exhibitors",
  "Manage profile visibility and export personal data anytime",
];

const RegisterPage = () => {
  const [role, setRole] = useState("attendee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industryCategory, setIndustryCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        phone,
        role,
        ...(role === "exhibitor" && {
          exhibitorProfile: { companyName, industryCategory },
        }),
      };

      const { data } = await api.post("/auth/register", payload);
      login(data.user, data.token);
      navigate(role === "exhibitor" ? "/exhibitor" : "/attendee");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
      navigate(data.user.role === "exhibitor" ? "/exhibitor" : "/attendee");
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Benefits Panel */}
      <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-slate-900 bg-grid-slate p-12 flex-col justify-between text-white">
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
          alt="Exhibition Venue"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/85 to-slate-900" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-200 border border-blue-500/30">
            <CalendarCheck2 className="w-4 h-4 text-blue-400" />
            <span>Free Account Setup</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-[1.18] tracking-tight">
            Discover expos, book booths, and{" "}
            <span className="text-blue-400">connect faster.</span>
          </h2>

          <div className="bg-white/5 border border-white/15 rounded-2xl p-6">
            <ul className="space-y-3.5 text-sm text-slate-200">
              {BENEFITS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Trusted by event organizers, exhibitors, and attendees</span>
        </div>
      </div>

      {/* Right Registration Form Panel */}
      <div className="lg:col-span-7 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-slate-500 text-sm">
              Select your role and complete your profile below.
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

          {/* Continue with Google */}
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
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink mx-3 text-xs font-medium text-slate-400">
              or register with email
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("attendee")}
              className={`p-3.5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                role === "attendee"
                  ? "bg-blue-50/70 border-blue-600 text-slate-900"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    role === "attendee"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                </span>
              </div>
              <div className="font-bold text-sm text-slate-900">
                Attendee / Visitor
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse events &amp; get QR passes
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole("exhibitor")}
              className={`p-3.5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                role === "exhibitor"
                  ? "bg-blue-50/70 border-blue-600 text-slate-900"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    role === "exhibitor"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <div className="font-bold text-sm text-slate-900">
                Exhibitor / Brand
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Reserve booths &amp; showcase products
              </p>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Aliyan Butt"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-phone"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-phone"
                    type="text"
                    autoComplete="tel"
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {role === "exhibitor" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3.5 border-t border-slate-100">
                <div>
                  <label
                    htmlFor="reg-company"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-company"
                      type="text"
                      required
                      placeholder="Acme Tech Ltd."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-industry"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Industry Category
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-industry"
                      type="text"
                      required
                      placeholder="Software, FinTech..."
                      value={industryCategory}
                      onChange={(e) => setIndustryCategory(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 font-semibold text-sm text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Sign in
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

export default RegisterPage;
