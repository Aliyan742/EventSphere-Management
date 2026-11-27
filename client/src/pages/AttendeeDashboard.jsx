import {
  Bell,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  LayoutGrid,
  MapPin,
  MessageSquare,
  QrCode,
  Search,
  Send,
  UserCog,
} from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AccountSettings from "../components/AccountSettings";
import ExpoDropdown from "../components/ExpoDropdown";
import MessageCenter from "../components/MessageCenter";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import api from "../services/api";

const QrDocumentModal = lazy(() => import("../components/QrDocumentModal"));

const AttendeeDashboard = () => {
  const { user } = useAuth();
  const [showQrPass, setShowQrPass] = useState(false);
  const [savedBoothIds, setSavedBoothIds] = useState(user?.savedBooths || []);
  const [savedOnly, setSavedOnly] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "analytics";
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [expos, setExpos] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState("");
  const [booths, setBooths] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const [selectedExhibitor, setSelectedExhibitor] = useState(null);
  const [msgType, setMsgType] = useState("appointment");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const [{ minDateTimeStr, maxDateTimeStr }] = useState(() => {
    const now = new Date();
    const minStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    const maxStr = `${now.getFullYear() + 2}-12-31T23:59`;
    return { minDateTimeStr: minStr, maxDateTimeStr: maxStr };
  });

  const notify = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  const handleSaveBooth = async (boothId) => {
    try {
      const { data } = await api.post(`/auth/saved-booths/${boothId}`);
      setSavedBoothIds(data.savedBooths);
      notify(data.message);
    } catch {
      notify("Failed to update visit list");
    }
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

  const loadExpoContent = useCallback(async (expoId) => {
    if (!expoId) return;
    try {
      const [boothsRes, sessionsRes] = await Promise.all([
        api.get(`/booths/expo/${expoId}`),
        api.get(`/sessions/expo/${expoId}`),
      ]);
      setBooths(boothsRes.data.booths);
      setSessions(sessionsRes.data.sessions);
    } catch (err) {
      console.error("Error loading expo content:", err);
    }
  }, []);

  useEffect(() => {
    if (!selectedExpoId) return;
    let active = true;
    Promise.all([
      api.get(`/booths/expo/${selectedExpoId}`),
      api.get(`/sessions/expo/${selectedExpoId}`),
    ])
      .then(([boothsRes, sessionsRes]) => {
        if (!active) return;
        setBooths(boothsRes.data.booths);
        setSessions(sessionsRes.data.sessions);
      })
      .catch((err) => console.error("Error loading expo content:", err));
    return () => {
      active = false;
    };
  }, [selectedExpoId]);

  const currentUserId = user?.id || user?._id;
  const currentExpo = expos.find((ex) => ex._id === selectedExpoId);
  const isRegisteredForExpo =
    currentExpo?.registeredAttendees?.includes(currentUserId);

  const handleRegisterExpo = async () => {
    try {
      const { data } = await api.post(`/expos/${selectedExpoId}/register`);
      notify(data.message);
      loadInitialData();
    } catch (err) {
      notify(err.response?.data?.message || "Registration failed");
    }
  };

  const handleToggleBookmark = async (sessionId) => {
    try {
      const { data } = await api.post(`/sessions/${sessionId}/bookmark`);
      notify(data.message);
      loadExpoContent(selectedExpoId);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update bookmark");
    }
  };

  const handleSendExhibitorMessage = async (e) => {
    e.preventDefault();
    if (!selectedExhibitor) return;
    try {
      await api.post("/messages", {
        expo: selectedExpoId,
        receiver: selectedExhibitor.exhibitor._id,
        messageType: msgType,
        subject: msgSubject,
        content: msgContent,
        ...(msgType === "appointment" && appointmentDate
          ? {
              appointmentDetails: {
                requestedDate: appointmentDate,
                status: "pending",
              },
            }
          : {}),
      });
      notify(
        msgType === "appointment" ? "Appointment requested!" : "Inquiry sent!",
      );
      setSelectedExhibitor(null);
      setMsgSubject("");
      setMsgContent("");
      setAppointmentDate("");
      loadInitialData();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to send message");
    }
  };

  const filteredExhibitors = useMemo(() => {
    const booked = booths.filter((b) => b.status === "booked" && b.exhibitor);
    const q = debouncedQuery.toLowerCase();
    return booked.filter((b) => {
      if (savedOnly && !savedBoothIds.includes(b._id)) return false;
      if (!q) return true;
      const company =
        b.exhibitor?.exhibitorProfile?.companyName?.toLowerCase() || "";
      const category =
        b.exhibitor?.exhibitorProfile?.industryCategory?.toLowerCase() || "";
      const products = (b.showcaseDetails?.productsOrServices || [])
        .join(" ")
        .toLowerCase();
      const boothNum = b.boothNumber.toLowerCase();
      return (
        company.includes(q) ||
        category.includes(q) ||
        products.includes(q) ||
        boothNum.includes(q)
      );
    });
  }, [booths, debouncedQuery, savedOnly, savedBoothIds]);

  const bookmarkedSessions = useMemo(
    () =>
      sessions.filter((s) => s.registeredAttendees?.includes(currentUserId)),
    [sessions, currentUserId],
  );

  const currentTab = activeTab === "analytics" ? "exhibitors" : activeTab;

  const tabs = [
    {
      id: "exhibitors",
      label: "Exhibitors & Floor Plan",
      icon: Building2,
    },
    {
      id: "schedule",
      label: `Event Schedule (${sessions.length})`,
      icon: Calendar,
    },
    {
      id: "messages",
      label: `Appointments & Chats (${messages.length})`,
      icon: MessageSquare,
    },
    { id: "settings", label: "Account Settings", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner */}
      <div className="relative bg-slate-900 bg-grid-slate text-white pt-8 pb-16 sm:pt-10 sm:pb-20 border-b border-slate-800">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Attendee Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Browse exhibitors, view hall booth locations, and book 1-on-1
              meetings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ExpoDropdown
              expos={expos}
              selectedExpoId={selectedExpoId}
              onSelect={setSelectedExpoId}
              label="Expo:"
            />

            {currentExpo && (
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleRegisterExpo}
                  disabled={isRegisteredForExpo}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    isRegisteredForExpo
                      ? "bg-white/10 text-white border border-white/20 cursor-default"
                      : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isRegisteredForExpo
                      ? "Registered Pass Active"
                      : "Register for Expo"}
                  </span>
                </button>

                {isRegisteredForExpo && (
                  <button
                    onClick={() => setShowQrPass(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 shrink-0" />
                    <span>My QR Pass</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10">
        {bookmarkedSessions.length > 0 && (
          <div className="mb-5 p-4 rounded-xl bg-white border border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-3 text-xs sm:text-sm text-slate-800">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </span>
              <span>
                <strong className="font-bold">Saved Schedule:</strong> You have{" "}
                <span className="font-bold text-blue-600">
                  {bookmarkedSessions.length}
                </span>{" "}
                bookmarked session(s). Next up:{" "}
                <strong className="font-semibold">
                  {bookmarkedSessions[0].title}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setActiveTab("schedule")}
              className="text-xs font-semibold text-blue-600 hover:underline self-start sm:self-center cursor-pointer shrink-0"
            >
              View Schedule →
            </button>
          </div>
        )}

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

        {/* TAB 1: EXHIBITORS & FLOOR PLAN */}
        {currentTab === "exhibitors" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Confirmed Exhibitors ({filteredExhibitors.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setSavedOnly((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    savedOnly
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${savedOnly ? "fill-rose-600 text-rose-600" : ""}`}
                  />
                  <span>Saved ({savedBoothIds.length})</span>
                </button>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search company, product, or booth..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredExhibitors.length === 0 ? (
                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-sm">
                    {savedOnly
                      ? "No saved booths in this expo yet. Click the heart icon on any booth to bookmark it."
                      : "No exhibitors match your search yet."}
                  </div>
                ) : (
                  filteredExhibitors.map((b) => {
                    const isSaved = savedBoothIds.includes(b._id);
                    return (
                      <div
                        key={b._id}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                              Booth {b.boothNumber}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-500 truncate max-w-[120px]">
                                {
                                  b.exhibitor?.exhibitorProfile
                                    ?.industryCategory
                                }
                              </span>
                              <button
                                onClick={() => handleSaveBooth(b._id)}
                                title="Save to Visit List"
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  isSaved
                                    ? "bg-rose-50 border-rose-200 text-rose-600"
                                    : "bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-600"
                                }`}
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    isSaved ? "fill-rose-600" : ""
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 mb-2">
                            {b.exhibitor?.exhibitorProfile?.companyName ||
                              b.exhibitor?.name}
                          </h3>

                          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            {b.showcaseDetails?.boothDescription ||
                              b.exhibitor?.exhibitorProfile?.description}
                          </p>

                          {b.showcaseDetails?.productsOrServices?.length >
                            0 && (
                            <div className="flex flex-wrap gap-1.5 mb-5">
                              {b.showcaseDetails.productsOrServices.map(
                                (prod, i) => (
                                  <span
                                    key={i}
                                    className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700"
                                  >
                                    {prod}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedExhibitor(b);
                            setMsgSubject(
                              `Inquiry regarding Booth ${b.boothNumber}`,
                            );
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
                        >
                          Book Appointment / Send Inquiry
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="lg:col-span-1">
                {selectedExhibitor ? (
                  <form
                    onSubmit={handleSendExhibitorMessage}
                    className="bg-white border-2 border-blue-600 rounded-2xl p-6 space-y-4 shadow-sm"
                  >
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase bg-amber-100 text-amber-800">
                      Booth {selectedExhibitor.boothNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      Connect with{" "}
                      {selectedExhibitor.exhibitor?.exhibitorProfile
                        ?.companyName || selectedExhibitor.exhibitor?.name}
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Request Type
                      </label>
                      <select
                        value={msgType}
                        onChange={(e) => setMsgType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                      >
                        <option value="appointment">
                          Book Booth Appointment
                        </option>
                        <option value="inquiry">General Product Inquiry</option>
                      </select>
                    </div>

                    {msgType === "appointment" && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Preferred Date &amp; Time
                        </label>
                        <input
                          type="datetime-local"
                          required
                          min={minDateTimeStr}
                          max={maxDateTimeStr}
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Subject"
                        value={msgSubject}
                        onChange={(e) => setMsgSubject(e.target.value)}
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
                        placeholder="Write your question or meeting agenda..."
                        value={msgContent}
                        onChange={(e) => setMsgContent(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="submit"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Request</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedExhibitor(null)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <LayoutGrid className="w-4 h-4" />
                      </span>
                      <span>Hall Floor Plan Map</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Click any highlighted booth to request an appointment.
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {booths.map((b) => {
                        const isBooked = b.status === "booked" && b.exhibitor;
                        return (
                          <button
                            key={b._id}
                            type="button"
                            disabled={!isBooked}
                            onClick={() => {
                              if (!isBooked) return;
                              setSelectedExhibitor(b);
                              setMsgSubject(
                                `Inquiry regarding Booth ${b.boothNumber}`,
                              );
                            }}
                            title={
                              isBooked
                                ? b.exhibitor?.exhibitorProfile?.companyName ||
                                  b.exhibitor?.name
                                : "Open"
                            }
                            className={`p-2 rounded-lg text-center text-xs font-semibold border transition-colors ${
                              isBooked
                                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white cursor-pointer"
                                : "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                            }`}
                          >
                            {b.boothNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE */}
        {currentTab === "schedule" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sessions.length === 0 ? (
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-sm">
                No sessions scheduled for this expo yet.
              </div>
            ) : (
              sessions.map((s) => {
                const isBookmarked =
                  s.registeredAttendees?.includes(currentUserId);
                return (
                  <div
                    key={s._id}
                    className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                          {s.topic}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {new Date(s.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {s.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Speaker:{" "}
                        <strong className="font-semibold text-slate-900">
                          {s.speaker?.name}
                        </strong>{" "}
                        {s.speaker?.designation && `(${s.speaker.designation})`}
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{s.hallLocation}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(s._id)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isBookmarked
                          ? "bg-amber-400 text-slate-900"
                          : "bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white"
                      }`}
                    >
                      {isBookmarked ? (
                        <>
                          <BookmarkCheck className="w-4 h-4" />
                          <span>Saved to My Schedule</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          <span>Save Session</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: APPOINTMENTS & CHATS */}
        {currentTab === "messages" && (
          <MessageCenter
            messages={messages}
            onRefresh={loadInitialData}
            title="Appointments & Exhibitor Conversations"
          />
        )}

        {/* TAB 4: ACCOUNT SETTINGS */}
        {activeTab === "settings" && <AccountSettings />}
      </div>

      {showQrPass && (
        <Suspense fallback={null}>
          <QrDocumentModal
            isOpen={showQrPass}
            onClose={() => setShowQrPass(false)}
            type="pass"
            data={currentExpo}
            user={user}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AttendeeDashboard;
