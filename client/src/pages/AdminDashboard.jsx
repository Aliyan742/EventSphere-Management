import {
  BarChart3,
  Building2,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Layers,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  UserCog,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AccountSettings from "../components/AccountSettings";
import ExpoDropdown from "../components/ExpoDropdown";
import MessageCenter from "../components/MessageCenter";
import api from "../services/api";

const TABS = [
  { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
  { id: "expos", label: "Manage Expos", icon: CalendarPlus },
  { id: "booths", label: "Floor Plan & Approvals", icon: Layers },
  { id: "schedules", label: "Event Schedules", icon: Clock },
  { id: "support", label: "Support & Feedback", icon: MessageSquare },
  { id: "settings", label: "Account Settings", icon: UserCog },
];

const BOOTH_FILTERS = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "pending_approval", label: "Pending" },
  { id: "booked", label: "Booked" },
];

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "analytics";
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [feedbackDrawerOpen, setFeedbackDrawerOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [expos, setExpos] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState("");
  const [booths, setBooths] = useState([]);
  const [boothFilter, setBoothFilter] = useState("all");
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [fbReplies, setFbReplies] = useState({});
  const [confirmDeleteExpoId, setConfirmDeleteExpoId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const [expoForm, setExpoForm] = useState({
    title: "",
    theme: "",
    description: "",
    startDate: "",
    endDate: "",
    venueName: "",
    address: "",
    city: "Karachi",
    rows: 3,
    columns: 4,
  });

  const [sessionForm, setSessionForm] = useState({
    title: "",
    topic: "",
    description: "",
    speakerName: "",
    speakerDesignation: "",
    hallLocation: "",
    startTime: "",
    endTime: "",
    capacity: 150,
  });

  const notify = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  const [{ todayStr, maxDateStr, nowDateTimeStr, maxDateTimeStr }] = useState(
    () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const maxObj = new Date();
      maxObj.setFullYear(maxObj.getFullYear() + 2);
      const maxStr = maxObj.toISOString().split("T")[0];
      const localIso = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
      return {
        todayStr: today,
        maxDateStr: maxStr,
        nowDateTimeStr: localIso,
        maxDateTimeStr: `${maxStr}T23:59`,
      };
    },
  );

  const fetchCoreData = useCallback(async () => {
    const [analyticsRes, exposRes, msgRes, fbRes] = await Promise.allSettled([
      api.get("/system/analytics"),
      api.get("/expos"),
      api.get("/messages/my"),
      api.get("/system/feedback"),
    ]);

    if (analyticsRes.status === "fulfilled")
      setAnalytics(analyticsRes.value.data.analytics);
    if (exposRes.status === "fulfilled") {
      const list = exposRes.value.data.expos || [];
      setExpos(list);
      setSelectedExpoId((prev) => prev || (list[0]?._id ?? ""));
    }
    if (msgRes.status === "fulfilled")
      setMessages(msgRes.value.data.messages || []);
    if (fbRes.status === "fulfilled")
      setFeedbacks(fbRes.value.data.feedbacks || []);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get("/system/analytics"),
      api.get("/expos"),
      api.get("/messages/my"),
      api.get("/system/feedback"),
    ]).then(([analyticsRes, exposRes, msgRes, fbRes]) => {
      if (!active) return;
      if (analyticsRes.status === "fulfilled")
        setAnalytics(analyticsRes.value.data.analytics);
      if (exposRes.status === "fulfilled") {
        const list = exposRes.value.data.expos || [];
        setExpos(list);
        setSelectedExpoId((prev) => prev || (list[0]?._id ?? ""));
      }
      if (msgRes.status === "fulfilled")
        setMessages(msgRes.value.data.messages || []);
      if (fbRes.status === "fulfilled")
        setFeedbacks(fbRes.value.data.feedbacks || []);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab === "messages" || activeTab === "support") {
      api.put("/messages/mark-read").catch(() => {});
    }
  }, [activeTab]);

  const fetchExpoDetails = useCallback(async (expoId) => {
    if (!expoId) return;
    try {
      const [boothsRes, sessionsRes] = await Promise.all([
        api.get(`/booths/expo/${expoId}`),
        api.get(`/sessions/expo/${expoId}`),
      ]);
      setBooths(boothsRes.data.booths);
      setSessions(sessionsRes.data.sessions);
    } catch (err) {
      console.error("Error loading expo details:", err);
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
      .catch((err) => console.error("Error loading expo details:", err));
    return () => {
      active = false;
    };
  }, [selectedExpoId]);

  useEffect(() => {
    if (!feedbackDrawerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setFeedbackDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [feedbackDrawerOpen]);

  const filteredBooths = useMemo(() => {
    if (boothFilter === "all") return booths;
    return booths.filter((b) => b.status === boothFilter);
  }, [booths, boothFilter]);

  const pieData = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        name: "Booked Stalls",
        value: analytics.boothOccupancy.booked || 0,
      },
      {
        name: "Available Stalls",
        value: Math.max(
          0,
          (analytics.boothOccupancy.total || 0) -
            (analytics.boothOccupancy.booked || 0),
        ),
      },
    ];
  }, [analytics]);

  const barData = useMemo(() => {
    if (!analytics) return [];
    return analytics.popularSessions.map((s) => ({
      name: s.title.length > 16 ? `${s.title.slice(0, 16)}...` : s.title,
      Registered: s.attendees,
      Capacity: s.capacity,
    }));
  }, [analytics]);

  const handleCreateExpo = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/expos", {
        title: expoForm.title,
        theme: expoForm.theme,
        description: expoForm.description,
        startDate: expoForm.startDate,
        endDate: expoForm.endDate,
        location: {
          venueName: expoForm.venueName,
          address: expoForm.address,
          city: expoForm.city,
        },
        floorPlan: {
          dimensions: {
            rows: Number(expoForm.rows),
            columns: Number(expoForm.columns),
          },
        },
      });
      notify(data.message || "Expo created!");
      setExpoForm({
        title: "",
        theme: "",
        description: "",
        startDate: "",
        endDate: "",
        venueName: "",
        address: "",
        city: "Karachi",
        rows: 3,
        columns: 4,
      });
      fetchCoreData();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create expo");
    }
  };

  const handleDeleteExpo = async (id) => {
    try {
      await api.delete(`/expos/${id}`);
      notify("Expo deleted");
      setConfirmDeleteExpoId(null);
      if (selectedExpoId === id) setSelectedExpoId("");
      fetchCoreData();
    } catch {
      notify("Failed to delete expo");
    }
  };

  const handleBoothAction = async (boothId, action) => {
    try {
      const { data } = await api.put(`/booths/${boothId}/status`, { action });
      notify(data.message);
      fetchExpoDetails(selectedExpoId);
      fetchCoreData();
    } catch (err) {
      notify(err.response?.data?.message || "Action failed");
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedExpoId) return notify("Select an Expo first");
    try {
      await api.post("/sessions", {
        expo: selectedExpoId,
        title: sessionForm.title,
        topic: sessionForm.topic,
        description: sessionForm.description,
        speaker: {
          name: sessionForm.speakerName,
          designation: sessionForm.speakerDesignation,
        },
        hallLocation: sessionForm.hallLocation,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        capacity: Number(sessionForm.capacity),
      });
      notify("Session published!");
      setSessionForm({
        title: "",
        topic: "",
        description: "",
        speakerName: "",
        speakerDesignation: "",
        hallLocation: "",
        startTime: "",
        endTime: "",
        capacity: 150,
      });
      fetchExpoDetails(selectedExpoId);
      fetchCoreData();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create session");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      notify("Session removed");
      fetchExpoDetails(selectedExpoId);
    } catch {
      notify("Failed to delete session");
    }
  };

  const handleFeedbackRespond = async (e, fbId) => {
    e.preventDefault();
    const adminReply = fbReplies[fbId]?.trim();
    if (!adminReply) return;
    try {
      await api.put(`/system/feedback/${fbId}`, {
        status: "resolved",
        adminReply,
      });
      notify("Feedback marked resolved with response!");
      setFbReplies({ ...fbReplies, [fbId]: "" });
      fetchCoreData();
    } catch {
      notify("Failed to respond to feedback");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner */}
      <div className="relative bg-slate-900 bg-grid-slate text-white pt-8 pb-16 sm:pt-10 sm:pb-20 border-b border-slate-800">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Organizer Dashboard
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Manage expos, review booth requests, publish schedules, and reply
              to support messages.
            </p>
          </div>

          <ExpoDropdown
            expos={expos}
            selectedExpoId={selectedExpoId}
            onSelect={setSelectedExpoId}
            label="Active Expo:"
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
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
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

        {/* TAB 1: ANALYTICS */}
        {activeTab === "analytics" &&
          (analytics ? (
            <div className="space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
                    <span>Total Expos</span>
                    <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CalendarPlus className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {analytics.totalExpos}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
                    <span>Exhibitors</span>
                    <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {analytics.totalExhibitors}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
                    <span>Attendees</span>
                    <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {analytics.totalAttendees}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
                    <span>Booths Booked</span>
                    <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {analytics.boothOccupancy.booked}{" "}
                    <span className="text-base font-medium text-slate-400">
                      / {analytics.boothOccupancy.total}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                    Hall Booth Occupancy
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          <Cell fill="#2563EB" />
                          <Cell fill="#E2E8F0" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "12px",
                            color: "#0f172a",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600" />
                      Booked ({analytics.boothOccupancy.booked})
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-200" />
                      Available (
                      {analytics.boothOccupancy.total -
                        analytics.boothOccupancy.booked}
                      )
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                    Session Attendance
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "12px",
                            color: "#0f172a",
                          }}
                        />
                        <Bar
                          dataKey="Registered"
                          fill="#2563EB"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="Capacity"
                          fill="#CBD5E1"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-5">
                  Session Seat Fill Rate
                </h3>
                {analytics.popularSessions.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No sessions published yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {analytics.popularSessions.map((s) => {
                      const pct = Math.min(
                        100,
                        Math.round((s.attendees / (s.capacity || 100)) * 100),
                      );
                      return (
                        <div key={s.id}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-semibold text-slate-900">
                              {s.title}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {s.attendees} / {s.capacity} seats ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-200 p-6 rounded-2xl h-28 animate-pulse"
                />
              ))}
            </div>
          ))}

        {/* TAB 2: MANAGE EXPOS */}
        {activeTab === "expos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            <form
              onSubmit={handleCreateExpo}
              className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs self-start"
            >
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </span>
                <span>Create New Expo</span>
              </h3>

              <input
                type="text"
                required
                placeholder="Expo Title"
                value={expoForm.title}
                onChange={(e) =>
                  setExpoForm({ ...expoForm, title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                required
                placeholder="Theme (e.g. Tech, Healthcare)"
                value={expoForm.theme}
                onChange={(e) =>
                  setExpoForm({ ...expoForm, theme: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <textarea
                required
                rows={2}
                placeholder="Short Description"
                value={expoForm.description}
                onChange={(e) =>
                  setExpoForm({ ...expoForm, description: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    max={maxDateStr}
                    value={expoForm.startDate}
                    onChange={(e) =>
                      setExpoForm({ ...expoForm, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    min={expoForm.startDate || todayStr}
                    max={maxDateStr}
                    value={expoForm.endDate}
                    onChange={(e) =>
                      setExpoForm({ ...expoForm, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <input
                type="text"
                required
                placeholder="Venue Name"
                value={expoForm.venueName}
                onChange={(e) =>
                  setExpoForm({ ...expoForm, venueName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Address"
                  value={expoForm.address}
                  onChange={(e) =>
                    setExpoForm({ ...expoForm, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={expoForm.city}
                  onChange={(e) =>
                    setExpoForm({ ...expoForm, city: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Floor Rows
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={expoForm.rows}
                    onChange={(e) =>
                      setExpoForm({ ...expoForm, rows: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Booths / Row
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={expoForm.columns}
                    onChange={(e) =>
                      setExpoForm({ ...expoForm, columns: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Publish Expo &amp; Build Floor Plan
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Published Expos ({expos.length})
              </h3>
              {expos.map((ex) => (
                <div
                  key={ex._id}
                  className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                      {ex.theme}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">
                      {ex.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {ex.location?.venueName}, {ex.location?.city} •{" "}
                      {ex.floorPlan?.totalBooths} Booths
                    </p>
                  </div>

                  {confirmDeleteExpoId === ex._id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteExpo(ex._id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteExpoId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteExpoId(ex._id)}
                      className="self-start sm:self-center p-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Expo"
                      aria-label="Delete Expo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FLOOR PLAN & APPROVALS */}
        {activeTab === "booths" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Floor Plan &amp; Booth Requests
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {BOOTH_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setBoothFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      boothFilter === f.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {filteredBooths.map((b) => (
                <div
                  key={b._id}
                  className={`p-4 rounded-xl border transition-colors ${
                    b.status === "booked"
                      ? "bg-blue-50/70 border-blue-200"
                      : b.status === "pending_approval"
                        ? "bg-amber-50/80 border-amber-300"
                        : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-base">
                      {b.boothNumber}
                    </span>
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {b.tier} • ${b.price}
                    </span>
                  </div>

                  {b.exhibitor ? (
                    <div className="text-xs space-y-1 mb-3">
                      <div className="font-semibold text-blue-700">
                        {b.exhibitor.exhibitorProfile?.companyName ||
                          b.exhibitor.name}
                      </div>
                      <div className="text-slate-500 truncate">
                        {b.exhibitor.email}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-emerald-700 mb-3">
                      Open for Booking
                    </div>
                  )}

                  {b.status === "pending_approval" && (
                    <div className="flex gap-2 pt-2.5 border-t border-amber-200">
                      <button
                        onClick={() => handleBoothAction(b._id, "approve")}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleBoothAction(b._id, "reject")}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white cursor-pointer transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SCHEDULES */}
        {activeTab === "schedules" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            <form
              onSubmit={handleCreateSession}
              className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs self-start"
            >
              <h3 className="text-lg font-bold text-slate-900">
                Add Event Session
              </h3>
              <input
                type="text"
                required
                placeholder="Session Title"
                value={sessionForm.title}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                required
                placeholder="Topic / Track"
                value={sessionForm.topic}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, topic: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Speaker Name"
                  value={sessionForm.speakerName}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      speakerName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
                <input
                  type="text"
                  placeholder="Role / Title"
                  value={sessionForm.speakerDesignation}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      speakerDesignation: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Hall / Stage Location"
                value={sessionForm.hallLocation}
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    hallLocation: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    min={nowDateTimeStr}
                    max={maxDateTimeStr}
                    value={sessionForm.startTime}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    min={sessionForm.startTime || nowDateTimeStr}
                    max={maxDateTimeStr}
                    value={sessionForm.endTime}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Publish Session
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Scheduled Sessions ({sessions.length})
              </h3>
              {sessions.map((s) => (
                <div
                  key={s._id}
                  className="bg-white border border-slate-200 p-5 rounded-2xl flex items-start justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                      {s.topic}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      {s.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Speaker:{" "}
                      <strong className="font-semibold text-slate-900">
                        {s.speaker?.name}
                      </strong>{" "}
                      {s.speaker?.designation && `(${s.speaker.designation})`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.hallLocation} •{" "}
                      {new Date(s.startTime).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(s._id)}
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SUPPORT & FEEDBACK */}
        {activeTab === "support" && (
          <>
            <MessageCenter
              messages={messages}
              onRefresh={fetchCoreData}
              title="Exhibitor Support Threads"
              headerAction={
                <button
                  type="button"
                  onClick={() => setFeedbackDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>User Feedback ({feedbacks.length})</span>
                </button>
              }
            />

            {feedbackDrawerOpen && (
              <div
                className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={() => setFeedbackDrawerOpen(false)}
              >
                <div
                  className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      User Feedback &amp; Reports ({feedbacks.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setFeedbackDrawerOpen(false)}
                      className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-700 cursor-pointer"
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 overflow-y-auto">
                    {feedbacks.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        No feedback submitted yet.
                      </div>
                    ) : (
                      feedbacks.map((f) => (
                        <div
                          key={f._id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2.5">
                              {f.user?.avatar &&
                              f.user.avatar !== "default-avatar.png" ? (
                                <img
                                  src={f.user.avatar}
                                  alt={f.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                                  {f.name?.charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span className="font-semibold text-slate-900">
                                {f.name} ({f.email})
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full uppercase font-semibold ${
                                f.status === "resolved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {f.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {f.message}
                          </p>

                          <button
                            type="button"
                            onClick={async () => {
                              await api.put(
                                `/system/feedback/${f._id}/approve-public`,
                              );
                              fetchCoreData();
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              f.isApprovedForPublic
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-800"
                            }`}
                          >
                            {f.isApprovedForPublic
                              ? "Featured on Public Wall"
                              : "Feature on Public Wall"}
                          </button>

                          {f.adminReply ? (
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                              <strong className="font-semibold text-blue-700">
                                Admin Reply:
                              </strong>{" "}
                              {f.adminReply}
                            </div>
                          ) : (
                            <form
                              onSubmit={(e) => handleFeedbackRespond(e, f._id)}
                              className="flex flex-col sm:flex-row gap-2 pt-1"
                            >
                              <input
                                type="text"
                                placeholder="Write response & mark resolved..."
                                value={fbReplies[f._id] || ""}
                                onChange={(e) =>
                                  setFbReplies({
                                    ...fbReplies,
                                    [f._id]: e.target.value,
                                  })
                                }
                                className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                              />
                              <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white cursor-pointer transition-colors shrink-0"
                              >
                                <Send className="w-3.5 h-3.5" /> Resolve
                              </button>
                            </form>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 6: ACCOUNT SETTINGS */}
        {activeTab === "settings" && <AccountSettings />}
      </div>
    </div>
  );
};

export default AdminDashboard;
