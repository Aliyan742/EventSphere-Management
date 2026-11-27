import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CalendarClock,
  Check,
  LayoutGrid,
  MessageSquare,
  QrCode,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSmartAction } from "../hooks/useSmartAction";

const SERVICES = [
  {
    icon: LayoutGrid,
    title: "Interactive Floor Plans",
    desc: "Build multi-row hall layouts with Standard, Premium, and VIP zones and track booth availability live.",
    accent: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    icon: QrCode,
    title: "QR Entry Passes",
    desc: "Visitors receive a scannable digital pass as soon as they register, keeping venue check-ins fast.",
    accent: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    icon: BarChart3,
    title: "Event Analytics",
    desc: "Monitor booth occupancy, attendee registrations, and session seat fill rates in real time.",
    accent: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging & Meetings",
    desc: "Two-way real-time chat connecting visitors, exhibitors, nearby booths, and the organizer desk.",
    accent: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    icon: CalendarClock,
    title: "Session Schedules",
    desc: "Multi-hall timetables where attendees can bookmark keynotes and view upcoming reminders.",
    accent: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    icon: Shield,
    title: "Exhibitor Showcases",
    desc: "Dedicated brand profiles with product listings, booth staff rosters, and printable QR invoices.",
    accent: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

const TIERS = [
  {
    name: "Standard Booth",
    price: "$150",
    size: "10x10 ft",
    highlight: false,
    features: [
      "Standard Hall Placement (Row C+)",
      "Listing in the Event Directory",
      "2 Assigned Booth Staff Passes",
      "Visitor Inquiry & Appointment Inbox",
    ],
  },
  {
    name: "Premium Booth",
    price: "$300",
    size: "15x15 ft",
    highlight: true,
    features: [
      "High-Traffic Central Zone (Row B)",
      "Featured Brand Logo & Product Tags",
      "5 Assigned Booth Staff Passes",
      "Nearby Exhibitor Collaboration Chat",
      "Printable Official Stall Invoice",
    ],
  },
  {
    name: "VIP Corner Pavilion",
    price: "$500",
    size: "20x20 ft",
    highlight: false,
    features: [
      "Prime Main Entrance / Stage Front (Row A)",
      "Priority Placement in Visitor Search",
      "Unlimited Staff & Client Passes",
      "Priority Organizer Support Desk",
      "Detailed Visitor & Lead Insights",
    ],
  },
];

const ServicesPage = () => {
  const { getBoothAction } = useSmartAction();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-slate-900 bg-grid-slate text-white pt-14 pb-24 sm:pt-18 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-200 border border-blue-500/30">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>Platform Features &amp; Packages</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
            Tools &amp; Booth Packages for{" "}
            <span className="text-blue-400">Organized Expos</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Everything organizers, exhibitors, and visitors need to coordinate a
            trade show from floor setup to gate check-in.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 pb-20 space-y-20 relative z-20">
        {/* Core Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.title}
                className="bg-white border border-slate-200 p-6 sm:p-7 rounded-2xl space-y-3.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-11 h-11 rounded-xl border ${srv.accent} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {srv.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {srv.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Booth Tiers */}
        <div className="space-y-10 pt-2">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Exhibitor Booth Packages
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Choose the booth size and floor zone that fits your team across
              any EventSphere floor plan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {TIERS.map((tier) => {
              const action = getBoothAction(`Reserve ${tier.name}`);
              return (
                <div
                  key={tier.name}
                  className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-shadow ${
                    tier.highlight
                      ? "bg-slate-900 text-white border-2 border-blue-600 shadow-xl"
                      : "bg-white text-slate-900 border border-slate-200 shadow-xs hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 min-h-[28px] mb-3">
                      <h3
                        className={`text-xl font-bold tracking-tight ${
                          tier.highlight ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {tier.name}
                      </h3>
                      {tier.highlight && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-slate-900">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span
                        className={`text-3xl sm:text-4xl font-bold tracking-tight ${
                          tier.highlight ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {tier.price}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          tier.highlight ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        / expo ({tier.size})
                      </span>
                    </div>

                    <ul
                      className={`mt-6 space-y-3 text-sm border-t pt-6 ${
                        tier.highlight
                          ? "border-slate-800 text-slate-200"
                          : "border-slate-100 text-slate-600"
                      }`}
                    >
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              tier.highlight
                                ? "text-blue-400"
                                : "text-blue-600"
                            }`}
                          />
                          <span className="leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={action.to}
                    className={`mt-8 w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold transition-colors group ${
                      tier.highlight
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>{action.label}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
