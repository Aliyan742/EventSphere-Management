import {
  ArrowRight,
  Award,
  CalendarCheck2,
  Globe,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSmartAction } from "../hooks/useSmartAction";

const PILLARS = [
  {
    icon: ShieldCheck,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    title: "Verified Organizers & Brands",
    desc: "Every exhibitor profile and booth booking is reviewed by event organizers so visitors know who they are meeting.",
  },
  {
    icon: Users,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "Direct Networking",
    desc: "Message nearby booths, contact the organizer desk, and schedule 1-on-1 appointments ahead of the event.",
  },
  {
    icon: Layers,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Streamlined Booking",
    desc: "Reserve a booth straight from the hall map or generate a scannable QR entry pass in seconds.",
  },
];

const AboutPage = () => {
  const { getPrimaryAction } = useSmartAction();
  const primaryAction = getPrimaryAction("/register", "Create Free Account");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Banner */}
      <section className="relative py-16 sm:py-22 bg-slate-900 bg-grid-slate text-white overflow-hidden border-b border-slate-800">
        <img
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=75"
          alt="Conference Venue"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/85 to-slate-900" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-200 border border-blue-500/30">
            <CalendarCheck2 className="w-3.5 h-3.5 text-blue-400" />
            <span>About EventSphere</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15]">
            Built to Make Exhibitions{" "}
            <span className="text-blue-400">Simpler to Run</span>
          </h1>

          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed">
            EventSphere replaces manual spreadsheets, double-booked stalls, and
            slow registration lines with one shared workspace for organizers,
            exhibitors, and attendees.
          </p>
        </div>
      </section>

      {/* Story & Visual */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="rounded-2xl overflow-hidden bg-white p-2.5 border border-slate-200 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80"
            alt="Team Collaboration"
            loading="lazy"
            decoding="async"
            className="w-full h-72 sm:h-80 object-cover rounded-xl"
          />
        </div>

        <div className="space-y-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Why EventSphere
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Designed for Clarity and Real-Time Coordination
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            From regional tech summits in Karachi to multi-hall trade shows,
            EventSphere lets organizers build digital floor maps in minutes,
            gives brands full control over their booth presence, and provides
            visitors with instant QR passes and session timetables.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-base">
                Structured Access
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Dedicated role portals, secure sign-in, and full account data
                export controls.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-base">
                Real-Time Sync
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Instant booth reservations, live attendance stats, and WebSocket
                messaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="bg-white border-t border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Our Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              What We Focus On
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-slate-50 border border-slate-200 p-6 sm:p-7 rounded-2xl space-y-3.5"
                >
                  <div
                    className={`w-11 h-11 rounded-xl border ${item.badge} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to={primaryAction.to}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors group"
            >
              <span>{primaryAction.label}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
