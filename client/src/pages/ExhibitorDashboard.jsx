import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  LayoutGrid,
  MessageSquare,
  Plus,
  Send,
  Store,
  Trash2,
  Upload,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AccountSettings from "../components/AccountSettings";
import ExpoDropdown from "../components/ExpoDropdown";
import MessageCenter from "../components/MessageCenter";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const QrDocumentModal = lazy(() => import("../components/QrDocumentModal"));

const ExhibitorDashboard = () => {
  const [invoiceBooth, setInvoiceBooth] = useState(null);
  const { user, setUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "analytics";
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [expos, setExpos] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState("");
  const [booths, setBooths] = useState([]);
  const [messages, setMessages] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");

  const [selectedBoothToBook, setSelectedBoothToBook] = useState(null);
  const [reserveProducts, setReserveProducts] = useState("");
  const [reserveDesc, setReserveDesc] = useState("");

  const [editingBoothId, setEditingBoothId] = useState("");
  const [showcaseProducts, setShowcaseProducts] = useState("");
  const [showcaseDesc, setShowcaseDesc] = useState("");
  const [staffList, setStaffList] = useState([{ name: "", role: "" }]);

  const [profileForm, setProfileForm] = useState({
    companyName: user?.exhibitorProfile?.companyName || "",
    industryCategory: user?.exhibitorProfile?.industryCategory || "",
    description: user?.exhibitorProfile?.description || "",
    website: user?.exhibitorProfile?.website || "",
    companyLogo: user?.exhibitorProfile?.companyLogo || "",
  });
  const [uploading, setUploading] = useState(false);

  const [msgForm, setMsgForm] = useState({
    receiverId: "",
    messageType: "support",
    subject: "",
    content: "",
  });

  const [composeOpen, setComposeOpen] = useState(false);

  const notify = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  const loadInitialData = useCallback(async () => {
    const [exposRes, msgRes] = await Promise.allSettled([
      api.get("/expos"),
      api.get("/messages/my"),
    ]);

    if (exposRes.status === "fulfilled") {
      const list = exposRes.value.data.expos || [];
      setExpos(list);
      setSelectedExpoId((prev) => prev || (list[0]?._id ?? ""));
    }
    if (msgRes.status === "fulfilled") {
      setMessages(msgRes.value.data.messages || []);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([api.get("/expos"), api.get("/messages/my")]).then(
      ([exposRes, msgRes]) => {
        if (!active) return;
        if (exposRes.status === "fulfilled") {
          const list = exposRes.value.data.expos || [];
          setExpos(list);
          setSelectedExpoId((prev) => prev || (list[0]?._id ?? ""));
        }
        if (msgRes.status === "fulfilled") {
          setMessages(msgRes.value.data.messages || []);
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab === "messages" || activeTab === "support") {
      api.put("/messages/mark-read").catch(() => {});
    }
  }, [activeTab]);

  const loadBooths = useCallback(async (expoId) => {
    if (!expoId) return;
    try {
      const { data } = await api.get(`/booths/expo/${expoId}`);
      setBooths(data.booths);
    } catch (err) {
      console.error("Error loading booths:", err);
    }
  }, []);

  useEffect(() => {
    if (!selectedExpoId) return;
    let active = true;
    api
      .get(`/booths/expo/${selectedExpoId}`)
      .then(({ data }) => {
        if (active) setBooths(data.booths);
      })
      .catch((err) => console.error("Error loading booths:", err));
    return () => {
      active = false;
    };
  }, [selectedExpoId]);

  useEffect(() => {
    if (!composeOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setComposeOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [composeOpen]);

  const currentUserId = user?.id || user?._id;
  const myBooths = useMemo(
    () => booths.filter((b) => b.exhibitor?._id === currentUserId),
    [booths, currentUserId],
  );

  const neighborExhibitors = useMemo(
    () =>
      booths
        .filter((b) => b.exhibitor && b.exhibitor._id !== currentUserId)
        .map((b) => ({
          id: b.exhibitor._id,
          boothNumber: b.boothNumber,
          company:
            b.exhibitor.exhibitorProfile?.companyName || b.exhibitor.name,
        })),
    [booths, currentUserId],
  );

  const handleReserveBooth = async (e) => {
    e.preventDefault();
    if (!selectedBoothToBook) return;
    try {
      const productsArray = reserveProducts
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const { data } = await api.post(
        `/booths/${selectedBoothToBook._id}/reserve`,
        {
          productsOrServices: productsArray,
          boothDescription: reserveDesc,
          staffMembers: [{ name: user.name, role: "Representative" }],
        },
      );
      notify(data.message);
      setSelectedBoothToBook(null);
      setReserveProducts("");
      setReserveDesc("");
      loadBooths(selectedExpoId);
    } catch (err) {
      notify(err.response?.data?.message || "Reservation failed");
    }
  };

  const selectBoothForEdit = (booth) => {
    setEditingBoothId(booth._id);
    setShowcaseProducts(
      (booth.showcaseDetails?.productsOrServices || []).join(", "),
    );
    setShowcaseDesc(booth.showcaseDetails?.boothDescription || "");
    setStaffList(
      booth.showcaseDetails?.staffMembers?.length > 0
        ? booth.showcaseDetails.staffMembers
        : [{ name: "", role: "" }],
    );
  };

  const handleUpdateShowcase = async (e) => {
    e.preventDefault();
    if (!editingBoothId) return;
    try {
      const productsArray = showcaseProducts
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const validStaff = staffList.filter((s) => s.name.trim() !== "");
      await api.put(`/booths/${editingBoothId}/showcase`, {
        productsOrServices: productsArray,
        boothDescription: showcaseDesc,
        staffMembers: validStaff,
      });
      notify("Booth showcase & staff updated!");
      loadBooths(selectedExpoId);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update booth");
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileForm({ ...profileForm, companyLogo: data.url });
      notify("Logo uploaded! Click Save Company Profile.");
    } catch (err) {
      notify(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/profile", {
        exhibitorProfile: profileForm,
      });
      setUser(data.user);
      notify("Company profile updated!");
    } catch (err) {
      notify(err.response?.data?.message || "Profile update failed");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedExpoId) return notify("Select an Expo first");

    let targetReceiverId = msgForm.receiverId;
    if (msgForm.messageType === "support") {
      const currentExpo = expos.find((ex) => ex._id === selectedExpoId);
      targetReceiverId = currentExpo?.createdBy?._id || currentExpo?.createdBy;
    }
    if (!targetReceiverId) return notify("Select a valid recipient");

    try {
      await api.post("/messages", {
        expo: selectedExpoId,
        receiver: targetReceiverId,
        messageType: msgForm.messageType,
        subject: msgForm.subject,
        content: msgForm.content,
      });
      notify("Message sent!");
      setMsgForm({
        receiverId: "",
        messageType: "support",
        subject: "",
        content: "",
      });
      loadInitialData();
      setComposeOpen(false);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to send message");
    }
  };

  const currentTab = activeTab === "analytics" ? "floorplan" : activeTab;

  const tabs = [
    { id: "floorplan", label: "Floor Plan & Booking", icon: LayoutGrid },
    {
      id: "mybooth",
      label: `My Booths (${myBooths.length})`,
      icon: Store,
    },
    { id: "profile", label: "Company Brand", icon: Building2 },
    {
      id: "messages",
      label: `Inbox & Chats (${messages.length})`,
      icon: MessageSquare,
    },
    { id: "settings", label: "Account Settings", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner */}
      <div className="relative bg-slate-900 bg-grid-slate text-white pt-8 pb-16 sm:pt-10 sm:pb-20 border-b border-slate-800">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {user?.exhibitorProfile?.companyName || "Exhibitor Portal"}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  user?.isVerified
                    ? "bg-amber-400 text-slate-900"
                    : "bg-white/10 text-slate-200 border border-white/20"
                }`}
              >
                {user?.isVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Brand
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" /> Pending Review
                  </>
                )}
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm">
              Pick a booth on the hall map, update your product showcase, and
              reply to visitor inquiries.
            </p>
          </div>

          <ExpoDropdown
            expos={expos}
            selectedExpoId={selectedExpoId}
            onSelect={setSelectedExpoId}
            label="Expo:"
          />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10">
        {statusMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-slate-900 text-white border-l-4 border-amber-400 shadow-lg text-xs sm:text-sm font-medium flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Responsive Scrollable Tab Bar */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-7 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: FLOOR PLAN */}
        {currentTab === "floorplan" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Hall Booth Layout
                </h2>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Your Stall
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    Booked
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {booths.map((b) => {
                  const isMine = b.exhibitor?._id === currentUserId;
                  const isAvailable = b.status === "available";
                  const isSelected = selectedBoothToBook?._id === b._id;

                  return (
                    <div
                      key={b._id}
                      onClick={() => isAvailable && setSelectedBoothToBook(b)}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        isSelected
                          ? "bg-blue-50 border-blue-600 cursor-pointer"
                          : isMine
                            ? "bg-blue-50/60 border-blue-400"
                            : isAvailable
                              ? "bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-white cursor-pointer"
                              : "bg-slate-100 border-slate-200 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-bold text-sm text-slate-900">
                          {b.boothNumber}
                        </span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                          {b.tier}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">
                        ${b.price}
                      </div>
                      {isMine ? (
                        <span className="inline-block text-[11px] font-semibold text-blue-700 capitalize">
                          Your Stall ({b.status.replace("_", " ")})
                        </span>
                      ) : isAvailable ? (
                        <span className="inline-block text-[11px] font-semibold text-emerald-700">
                          Click to Reserve
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 truncate block">
                          {b.exhibitor?.exhibitorProfile?.companyName ||
                            "Reserved"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1">
              {selectedBoothToBook ? (
                <form
                  onSubmit={handleReserveBooth}
                  className="bg-white border-2 border-blue-600 rounded-2xl p-6 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase bg-amber-100 text-amber-800">
                      {selectedBoothToBook.tier} Tier
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      ${selectedBoothToBook.price}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    Book Booth {selectedBoothToBook.boothNumber}
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Products / Services
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="AI Tools, Cloud Hosting, Analytics..."
                      value={reserveProducts}
                      onChange={(e) => setReserveProducts(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      What Visitors Will See
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Short description of your booth demo..."
                      value={reserveDesc}
                      onChange={(e) => setReserveDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors cursor-pointer"
                    >
                      Confirm Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBoothToBook(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-2xs">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Pick an Open Booth
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    Select any{" "}
                    <span className="text-emerald-700 font-semibold">
                      Available
                    </span>{" "}
                    stall on the left to submit your booking request.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY BOOTHS */}
        {currentTab === "mybooth" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Your Reserved Booths
              </h3>
              {myBooths.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
                  You haven&apos;t reserved any booths for this expo yet.
                </div>
              ) : (
                myBooths.map((b) => (
                  <div
                    key={b._id}
                    onClick={() => selectBoothForEdit(b)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-colors ${
                      editingBoothId === b._id
                        ? "bg-white border-blue-600 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-slate-900">
                        Booth {b.boothNumber}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full uppercase font-semibold bg-amber-100 text-amber-800">
                        {b.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-blue-600">
                      Click to edit products &amp; staff →
                    </p>
                    {b.status === "booked" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInvoiceBooth(b);
                        }}
                        className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Official QR
                        Invoice
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-2">
              {editingBoothId ? (
                <form
                  onSubmit={handleUpdateShowcase}
                  className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xs"
                >
                  <h3 className="text-xl font-bold text-slate-900">
                    Update Booth Showcase &amp; Team
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Featured Products (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={showcaseProducts}
                      onChange={(e) => setShowcaseProducts(e.target.value)}
                      placeholder="Product A, Product B, Service C"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Booth Description
                    </label>
                    <textarea
                      rows={3}
                      value={showcaseDesc}
                      onChange={(e) => setShowcaseDesc(e.target.value)}
                      placeholder="Tell visitors what makes your stall worth stopping by..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Booth Team Members</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setStaffList([...staffList, { name: "", role: "" }])
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Member
                      </button>
                    </div>

                    {staffList.map((staff, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row gap-2.5"
                      >
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={staff.name}
                          onChange={(e) => {
                            const updated = [...staffList];
                            updated[idx].name = e.target.value;
                            setStaffList(updated);
                          }}
                          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        />
                        <div className="flex flex-1 gap-2">
                          <input
                            type="text"
                            placeholder="Role (e.g. Sales Lead)"
                            value={staff.role}
                            onChange={(e) => {
                              const updated = [...staffList];
                              updated[idx].role = e.target.value;
                              setStaffList(updated);
                            }}
                            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                          />
                          {staffList.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setStaffList(
                                  staffList.filter((_, i) => i !== idx),
                                )
                              }
                              className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors cursor-pointer"
                  >
                    Save Booth Details
                  </button>
                </form>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-sm shadow-2xs">
                  Select one of your booths on the left to update its products
                  and team roster.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COMPANY PROFILE */}
        {currentTab === "profile" && (
          <form
            onSubmit={handleSaveProfile}
            className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xs"
          >
            <h3 className="text-xl font-bold text-slate-900">
              Company Brand &amp; Logo
            </h3>

            <div className="flex flex-wrap items-center gap-4 pb-5 border-b border-slate-100">
              {profileForm.companyLogo ? (
                <img
                  src={profileForm.companyLogo}
                  alt="Logo"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No Logo
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>
                  {uploading ? "Uploading..." : "Upload Company Logo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={profileForm.companyName}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      companyName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Industry Category
                </label>
                <input
                  type="text"
                  placeholder="Industry Category"
                  value={profileForm.industryCategory}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      industryCategory: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Website URL
              </label>
              <input
                type="text"
                placeholder="https://yourcompany.com"
                value={profileForm.website}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, website: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                About Your Company
              </label>
              <textarea
                rows={3}
                placeholder="Write a short intro about your brand..."
                value={profileForm.description}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              Save Company Profile
            </button>
          </form>
        )}

        {/* TAB 4: INBOX & CHATS */}
        {currentTab === "messages" && (
          <>
            <MessageCenter
              messages={messages}
              onRefresh={loadInitialData}
              title="Appointments & Conversations"
              headerAction={
                <button
                  type="button"
                  onClick={() => setComposeOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Message</span>
                </button>
              }
            />

            {composeOpen && (
              <div
                className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={() => setComposeOpen(false)}
              >
                <form
                  onSubmit={handleSendMessage}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">
                      Send a New Message
                    </h3>
                    <button
                      type="button"
                      onClick={() => setComposeOpen(false)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Send To
                    </label>
                    <select
                      value={msgForm.messageType}
                      onChange={(e) =>
                        setMsgForm({ ...msgForm, messageType: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="support">Organizer / Admin Desk</option>
                      <option value="collaboration">
                        Nearby Exhibitor Booth
                      </option>
                    </select>
                  </div>

                  {msgForm.messageType === "collaboration" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Select Exhibitor
                      </label>
                      <select
                        required
                        value={msgForm.receiverId}
                        onChange={(e) =>
                          setMsgForm({ ...msgForm, receiverId: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                      >
                        <option value="">-- Choose an Exhibitor --</option>
                        {neighborExhibitors.map((n) => (
                          <option key={n.id} value={n.id}>
                            Booth {n.boothNumber} — {n.company}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Topic of your message"
                      value={msgForm.subject}
                      onChange={(e) =>
                        setMsgForm({ ...msgForm, subject: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write your message here..."
                      value={msgForm.content}
                      onChange={(e) =>
                        setMsgForm({ ...msgForm, content: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* TAB 5: ACCOUNT SETTINGS */}
        {activeTab === "settings" && <AccountSettings />}
      </div>

      {invoiceBooth && (
        <Suspense fallback={null}>
          <QrDocumentModal
            isOpen={Boolean(invoiceBooth)}
            onClose={() => setInvoiceBooth(null)}
            type="invoice"
            data={invoiceBooth}
            user={user}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ExhibitorDashboard;
