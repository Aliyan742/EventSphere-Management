import {
  Bell,
  Bookmark,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  FileText,
  Globe,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Moon,
  Palette,
  Phone,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Trash2,
  Type,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const SETTINGS_MENU = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security & Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy & Data", icon: ShieldAlert },
];

const getInitialPrefs = (u) => ({
  emailNotifications: u?.settings?.emailNotifications ?? true,
  appointmentAlerts: u?.settings?.appointmentAlerts ?? true,
  sessionReminders: u?.settings?.sessionReminders ?? true,
  theme: u?.settings?.theme || "light",
  fontFamily: u?.settings?.fontFamily || "sans",
  fontSize: u?.settings?.fontSize || "md",
  compactMode: u?.settings?.compactMode ?? false,
  profileVisibility: u?.settings?.profileVisibility || "public",
});

const AccountSettingsInner = ({ user, setUser, logout }) => {
  const navigate = useNavigate();

  const [subTab, setSubTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [statusBanner, setStatusBanner] = useState({ type: "", text: "" });

  // 1. Profile State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [interests, setInterests] = useState(
    (user?.attendeeProfile?.interests || []).join(", "),
  );
  const [companyName, setCompanyName] = useState(
    user?.exhibitorProfile?.companyName || "",
  );
  const [industryCategory, setIndustryCategory] = useState(
    user?.exhibitorProfile?.industryCategory || "",
  );
  const [website, setWebsite] = useState(
    user?.exhibitorProfile?.website || "",
  );
  const [description, setDescription] = useState(
    user?.exhibitorProfile?.description || "",
  );
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // 2. Security / Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 3. Notifications, Appearance & Privacy Preferences
  const [prefs, setPrefs] = useState(() => getInitialPrefs(user));

  // 5. Privacy / Export / Delete State
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const notify = (text, type = "success") => {
    setStatusBanner({ text, type });
    setTimeout(() => setStatusBanner({ text: "", type: "" }), 4000);
  };

  const resetFormFields = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setCity(user?.city || "");
    setBio(user?.bio || "");
    setAvatar(user?.avatar || "");
    setInterests((user?.attendeeProfile?.interests || []).join(", "));
    setCompanyName(user?.exhibitorProfile?.companyName || "");
    setIndustryCategory(user?.exhibitorProfile?.industryCategory || "");
    setWebsite(user?.exhibitorProfile?.website || "");
    setDescription(user?.exhibitorProfile?.description || "");
  };

  const hasProfileChanges =
    name.trim() !== (user?.name || "") ||
    email.trim().toLowerCase() !== (user?.email || "").toLowerCase() ||
    phone.trim() !== (user?.phone || "") ||
    city.trim() !== (user?.city || "") ||
    bio.trim() !== (user?.bio || "") ||
    avatar !== (user?.avatar || "") ||
    (user?.role === "attendee" &&
      interests.trim() !==
        (user?.attendeeProfile?.interests || []).join(", ")) ||
    (user?.role === "exhibitor" &&
      (companyName.trim() !== (user?.exhibitorProfile?.companyName || "") ||
        industryCategory.trim() !==
          (user?.exhibitorProfile?.industryCategory || "") ||
        website.trim() !== (user?.exhibitorProfile?.website || "") ||
        description.trim() !== (user?.exhibitorProfile?.description || "")));

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatar(data.url);
      notify('Photo uploaded. Click "Save Profile" to apply.');
    } catch (err) {
      notify(err.response?.data?.message || "Avatar upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        name,
        email,
        phone,
        city,
        bio,
        avatar,
        ...(user?.role === "attendee" && {
          attendeeProfile: {
            interests: interests
              .split(",")
              .map((i) => i.trim())
              .filter(Boolean),
          },
        }),
        ...(user?.role === "exhibitor" && {
          exhibitorProfile: {
            companyName,
            industryCategory,
            website,
            description,
          },
        }),
      };

      const { data } = await api.put("/auth/profile", payload);
      setUser(data.user);
      setIsEditingProfile(false);
      notify("Profile updated.");
    } catch (err) {
      notify(
        err.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    resetFormFields();
    setIsEditingProfile(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return notify("New password and confirmation do not match", "error");
    }
    try {
      const { data } = await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });
      notify(data.message || "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      notify(err.response?.data?.message || "Password change failed", "error");
    }
  };

  const handleSavePreferences = async (updatedPrefs) => {
    setPrefs(updatedPrefs);
    try {
      const { data } = await api.put("/auth/profile", {
        settings: updatedPrefs,
      });
      setUser(data.user);
      notify("Preferences saved.");
    } catch {
      notify("Failed to save preferences", "error");
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data } = await api.get("/auth/export-data");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EventSphere-Data-${user?.name?.replace(/\s+/g, "_") || "User"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notify("Personal data archive downloaded.");
    } catch {
      notify("Failed to export data", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/auth/account");
      logout();
      navigate("/");
    } catch (err) {
      notify(err.response?.data?.message || "Account deletion failed", "error");
      setDeleting(false);
    }
  };

  const activeAvatar = isEditingProfile ? avatar : user?.avatar;
  const hasValidAvatar =
    activeAvatar &&
    activeAvatar !== "default-avatar.png" &&
    !activeAvatar.startsWith("data:image/svg");

  return (
    <div className="max-w-5xl space-y-6 text-slate-900">
      {/* Top Identity Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          {hasValidAvatar ? (
            <img
              src={activeAvatar}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xl font-bold text-blue-700 shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {user?.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
                {user?.role}
              </span>
            </div>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                {user?.isVerified ? "Verified Account" : "Standard Account"}
              </span>
              {user?.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.city}
                </span>
              )}
              {user?.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {statusBanner.text && (
        <div
          className={`p-3.5 rounded-xl border text-sm font-medium flex items-center gap-2.5 ${
            statusBanner.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusBanner.text}</span>
        </div>
      )}

      {/* Split Layout: Left Navigation + Right Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 lg:col-span-3 flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {SETTINGS_MENU.map((item) => {
            const Icon = item.icon;
            const active = subTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSubTab(item.id);
                  if (item.id !== "profile") setIsEditingProfile(false);
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-8 lg:col-span-9">
          {/* 1. PROFILE */}
          {subTab === "profile" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {isEditingProfile ? "Edit Profile" : "Profile Details"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {isEditingProfile
                      ? "Update your photo, contact info, and organization details."
                      : "Your account information saved on EventSphere."}
                  </p>
                </div>

                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {!isEditingProfile ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-blue-600" /> Full Name
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {user?.name || "Not provided"}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                        <Mail className="w-3.5 h-3.5 text-blue-600" /> Email
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {user?.email || "Not provided"}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {user?.phone || "Not added"}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" /> City
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {user?.city || "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5 text-blue-600" /> Bio
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {user?.bio || "No bio added yet."}
                    </p>
                  </div>

                  {user?.role === "attendee" && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Bookmark className="w-4 h-4 text-blue-600" /> Interests
                        &amp; Activity
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-sm font-medium text-slate-800">
                        {(user.attendeeProfile?.interests || []).length > 0
                          ? user.attendeeProfile.interests.join(", ")
                          : "No interests listed yet"}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-600">
                          Registered Expos:{" "}
                          <strong className="font-bold text-slate-900">
                            {user.attendeeProfile?.registeredExpos?.length || 0}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-600">
                          Saved Sessions:{" "}
                          <strong className="font-bold text-slate-900">
                            {user.attendeeProfile?.bookmarkedSessions?.length ||
                              0}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {user?.role === "exhibitor" && (
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />{" "}
                          Organization Details
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 uppercase font-semibold">
                          {user.exhibitorProfile?.approvalStatus || "pending"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                          <div className="text-xs font-semibold text-slate-400 mb-1">
                            Company Name
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {user.exhibitorProfile?.companyName || "Not set"}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                          <div className="text-xs font-semibold text-slate-400 mb-1">
                            Industry
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {user.exhibitorProfile?.industryCategory ||
                              "Not set"}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                        <div className="text-xs font-semibold text-blue-600">
                          {user.exhibitorProfile?.website || "No website URL"}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {user.exhibitorProfile?.description ||
                            "No company description added."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSaveGeneral} className="space-y-5">
                  <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    {hasValidAvatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-14 h-14 rounded-full object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-lg font-bold text-blue-700">
                        {name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors cursor-pointer">
                        <Camera className="w-3.5 h-3.5" />
                        <span>
                          {uploading ? "Uploading..." : "Change Photo"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-slate-500">
                        JPG, PNG or WebP (Max 5MB).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        City / Location
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Karachi, Pakistan"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Bio
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Short note about your role or interests..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  {user?.role === "attendee" && (
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Event Interests (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="Artificial Intelligence, Cloud, FinTech"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  )}

                  {user?.role === "exhibitor" && (
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-600" /> Company
                        Details
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        />
                        <input
                          type="text"
                          placeholder="Industry Category"
                          value={industryCategory}
                          onChange={(e) => setIndustryCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Website URL"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Company Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
                      />
                    </div>
                  )}

                  {hasProfileChanges && (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>
                          {savingProfile ? "Saving..." : "Save Profile"}
                        </span>
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* 2. SECURITY & PASSWORD */}
          {subTab === "security" && (
            <form
              onSubmit={handleChangePassword}
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs"
            >
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" /> Change Password
              </h4>
              <p className="text-sm text-slate-500">
                Use a strong password of at least 8 characters to keep your
                account secure.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </form>
          )}

          {/* 3. NOTIFICATION PREFERENCES */}
          {subTab === "notifications" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Notification Preferences
                </h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Choose which alerts appear in your navigation bar and inbox.
                </p>
              </div>

              {[
                {
                  key: "emailNotifications",
                  title: "Booth Status Updates",
                  desc: "Receive updates when booth reservations are approved or declined.",
                },
                {
                  key: "appointmentAlerts",
                  title: "Appointment & Chat Alerts",
                  desc: "Get notified for new meeting requests and message replies.",
                },
                {
                  key: "sessionReminders",
                  title: "Saved Session Reminders",
                  desc: "Display reminders for speaker sessions you have bookmarked.",
                },
              ].map((toggle) => (
                <div
                  key={toggle.key}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {toggle.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {toggle.desc}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleSavePreferences({
                        ...prefs,
                        [toggle.key]: !prefs[toggle.key],
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                      prefs[toggle.key] ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        prefs[toggle.key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 4. APPEARANCE, THEME & TYPOGRAPHY */}
          {subTab === "appearance" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Appearance &amp; Display
                </h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Customize theme, typeface, and text scale across your account.
                </p>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleSavePreferences({ ...prefs, theme: "light" })
                    }
                    className={`p-4 rounded-xl border-2 text-left space-y-1.5 transition-colors cursor-pointer ${
                      prefs.theme === "light"
                        ? "bg-blue-50/70 border-blue-600"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-500" />
                    <div className="text-sm font-bold text-slate-900">
                      Light Mode
                    </div>
                    <p className="text-xs text-slate-500">
                      Clean bright interface suited for daytime use.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSavePreferences({ ...prefs, theme: "dark" })
                    }
                    className={`p-4 rounded-xl border-2 text-left space-y-1.5 transition-colors cursor-pointer ${
                      prefs.theme === "dark"
                        ? "bg-blue-50/70 border-blue-600"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <Moon className="w-5 h-5 text-blue-600" />
                    <div className="text-sm font-bold text-slate-900">
                      Dark Mode
                    </div>
                    <p className="text-xs text-slate-500">
                      Low-glare dark surfaces for evening sessions.
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-600" /> Typeface
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "sans", label: "Inter", sample: "Aa Bb Cc • Default" },
                    {
                      id: "jakarta",
                      label: "Plus Jakarta",
                      sample: "Aa Bb Cc • Geometric",
                    },
                    {
                      id: "mono",
                      label: "JetBrains Mono",
                      sample: "Aa Bb Cc • Monospace",
                    },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() =>
                        handleSavePreferences({ ...prefs, fontFamily: font.id })
                      }
                      className={`p-3.5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                        prefs.fontFamily === font.id
                          ? "bg-blue-50/70 border-blue-600"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900">
                        {font.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {font.sample}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Text Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "sm", label: "Compact (90%)" },
                    { id: "md", label: "Default (100%)" },
                    { id: "lg", label: "Large (110%)" },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() =>
                        handleSavePreferences({ ...prefs, fontSize: sz.id })
                      }
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-colors cursor-pointer ${
                        prefs.fontSize === sz.id
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-800 border-slate-200"
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. PRIVACY, DATA EXPORT & ACCOUNT DELETION */}
          {subTab === "privacy" && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" /> Directory Visibility
                </h4>
                <p className="text-sm text-slate-500">
                  Control who can view your profile during live events.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "public",
                      title: "Public",
                      desc: "Visible to all visitors & exhibitors",
                    },
                    {
                      id: "attendees",
                      title: "Participants Only",
                      desc: "Visible to signed-in users",
                    },
                    {
                      id: "private",
                      title: "Private",
                      desc: "Hidden from public search",
                    },
                  ].map((vis) => (
                    <button
                      key={vis.id}
                      type="button"
                      onClick={() =>
                        handleSavePreferences({
                          ...prefs,
                          profileVisibility: vis.id,
                        })
                      }
                      className={`p-3.5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                        prefs.profileVisibility === vis.id
                          ? "bg-blue-50/70 border-blue-600"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">
                        {vis.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {vis.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-3 shadow-xs">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" /> Export Personal
                  Data
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Download a JSON copy of your profile, booth reservations,
                  bookmarked sessions, and message history.
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm font-semibold text-white cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {exporting ? "Preparing Export..." : "Download Data (.JSON)"}
                  </span>
                </button>
              </div>

              <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-7 space-y-3 shadow-xs">
                <h4 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> Delete Account
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Permanently remove your profile, messages, and release any
                  reserved booths. This action cannot be undone.
                </p>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete My Account</span>
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
                    >
                      <span>
                        {deleting ? "Deleting..." : "Confirm Permanent Delete"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AccountSettings = () => {
  const { user, setUser, logout } = useAuth();
  return (
    <AccountSettingsInner
      key={user?._id || user?.id || "anon"}
      user={user}
      setUser={setUser}
      logout={logout}
    />
  );
};

export default AccountSettings;
