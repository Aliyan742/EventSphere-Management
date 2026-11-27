import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CalendarRange,
  Clock,
  LayoutGrid,
  MapPin,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSmartAction } from "../hooks/useSmartAction";
import api from "../services/api";

const ExpoDetailPage = () => {
  const { id } = useParams();
  const [expo, setExpo] = useState(null);
  const [booths, setBooths] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, getBoothAction, getPrimaryAction } = useSmartAction();

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get(`/expos/${id}`),
      api.get(`/booths/expo/${id}`),
      api.get(`/sessions/expo/${id}`),
    ])
      .then(([expoRes, boothsRes, sessionsRes]) => {
        if (!active) return;
        setExpo(expoRes.data.expo);
        setBooths(boothsRes.data.booths);
        setSessions(sessionsRes.data.sessions);
      })
      .catch((err) => console.error("Error loading expo:", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="h-64 bg-slate-900 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          </div>
          <div className="h-60 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!expo) {
    return (
      <div className="min-h-[60vh] bg-slate-50 flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold uppercase">
          Not Found
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          We couldn&apos;t find that expo.
        </h2>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const bookedBooths = booths.filter((b) => b.status === "booked");
  const mainBtn = getPrimaryAction("/login", "Sign In to Join");
  const boothBtn = getBoothAction("Create an Account");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner Header */}
      <div className="relative bg-slate-900 bg-grid-slate text-white pt-10 pb-18 sm:pt-14 sm:pb-22 overflow-hidden border-b border-slate-800">
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=75"
          alt={expo.title}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/85 to-slate-900" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Expos</span>
          </Link>

          <div className="pt-2 space-y-3 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-slate-900">
              <CalendarRange className="w-3.5 h-3.5" />
              <span>{expo.theme}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              {expo.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-8">
        {/* Left & Center Column */}
        <div className="lg:col-span-2 space-y-7">
          {/* Overview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              About This Event
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {expo.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs sm:text-sm font-medium text-slate-800">
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {new Date(expo.startDate).toLocaleDateString()} –{" "}
                  {new Date(expo.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">
                  {expo.location?.venueName}, {expo.location?.city}
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{expo.attendeeCount || 0} Registered</span>
              </div>
            </div>
          </div>

          {/* Live Floor Plan Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-5 h-5" />
                </span>
                <span>Hall Floor Plan</span>
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 w-fit">
                {bookedBooths.length} / {booths.length} Booths Booked
              </span>
            </div>

            {booths.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">
                Booth layout is being prepared and will appear here shortly.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {booths.map((b) => {
                  const isBooked = b.status === "booked";
                  const isPending = b.status === "pending_approval";
                  return (
                    <div
                      key={b._id}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        isBooked
                          ? "bg-blue-50/70 border-blue-200"
                          : isPending
                            ? "bg-amber-50/80 border-amber-300"
                            : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 font-bold text-xs sm:text-sm text-slate-900 mb-1">
                        <span>{b.boothNumber}</span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            isBooked
                              ? "bg-blue-600 text-white"
                              : isPending
                                ? "bg-amber-400 text-slate-900"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {b.tier}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {b.exhibitor?.exhibitorProfile?.companyName ||
                          (b.status === "available"
                            ? `Open • $${b.price}`
                            : "Reserved")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Speaker Lineup */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Talks &amp; Workshops
            </h2>
            {sessions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-500 text-sm">
                Speaker schedule will be posted soon.
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                        {s.topic}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {s.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Speaker:{" "}
                        <strong className="text-slate-800 font-semibold">
                          {s.speaker?.name}
                        </strong>{" "}
                        {s.speaker?.designation && `(${s.speaker.designation})`}{" "}
                        • {s.hallLocation}
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shrink-0 w-fit">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {new Date(s.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-slate-900 text-white rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl border border-slate-800">
            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-400 text-slate-900">
              Join This Expo
            </span>
            <h3 className="text-xl font-bold tracking-tight">
              Ready to attend or exhibit?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign in to reserve an exhibition booth for your brand or claim
              your visitor QR pass.
            </p>
            <div className="space-y-2.5 pt-1">
              <Link
                to={mainBtn.to}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors group"
              >
                <span>{mainBtn.label}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to={user ? boothBtn.to : "/register"}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-semibold text-white transition-colors"
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>{user ? boothBtn.label : "Create Free Account"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpoDetailPage;
