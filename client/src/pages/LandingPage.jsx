import {
  ArrowRight,
  Building2,
  Calendar,
  CalendarRange,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Search,
  Shield,
  Store,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CountdownTimer from "../components/CountdownTimer";
import FaqAndContactSection from "../components/FaqAndContactSection";
import { useDebounce } from "../hooks/useDebounce";
import { useSmartAction } from "../hooks/useSmartAction";
import api from "../services/api";

const EXPO_BANNERS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1200&q=80",
];

const GALLERY_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
    title: "Main Keynote Auditorium",
    tag: "2,500+ Seats",
  },
  {
    url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80",
    title: "Meeting & Networking Lounges",
    tag: "1-on-1 Tables",
  },
  {
    url: "https://images.unsplash.com/photo-1560523159-4a9692d222ef?auto=format&fit=crop&w=900&q=80",
    title: "Main Exhibition Halls",
    tag: "Custom Booths",
  },
  {
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
    title: "Tech Panels & Stages",
    tag: "Live Demos",
  },
];

const PARTNER_BRANDS = [
  "NEXATECH",
  "CLOUDWAVE",
  "FINPULSE",
  "SYNAPSE LABS",
  "ORBITAL CLOUD",
];

const ROLE_PORTALS = [
  {
    icon: Shield,
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Organizers & Admins",
    desc: "Set up multi-hall expos, generate booth grids in seconds, review exhibitor applications, and monitor attendance reports.",
    perks: [
      "Automated Booth Grid Builder",
      "Occupancy & Attendance Analytics",
      "One-Click Stall Approvals",
    ],
  },
  {
    icon: Store,
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    title: "Exhibitors & Brands",
    desc: "Select stalls directly from the hall floor map, publish product catalogs, manage booth staff, and print official invoices.",
    perks: [
      "Interactive Stall Selection",
      "Printable QR Booking Invoice",
      "Exhibitor-to-Exhibitor Chat",
    ],
  },
  {
    icon: Ticket,
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "Attendees & Visitors",
    desc: "Filter exhibitors by category, bookmark booths to visit, save speaker talks, and generate a scannable QR entry badge.",
    perks: [
      "Instant QR Entry Pass",
      "1-on-1 Booth Appointments",
      "Personal Schedule & Bookmarks",
    ],
  },
];

const LandingPage = () => {
  const [expos, setExpos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { user, getPrimaryAction } = useSmartAction();
  const heroCta = getPrimaryAction("/register", "Create Free Account");
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    let active = true;
    api
      .get(`/expos?search=${debouncedSearch}`)
      .then(({ data }) => {
        if (active) setExpos(data.expos || []);
      })
      .catch((err) => console.error("Failed to fetch expos:", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 bg-grid-slate text-white border-b border-slate-800">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=75"
            alt="Exhibition Hall"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 .bg-gradient-to-b from-slate-900/75 via-slate-900/85 to-slate-900" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-200 border border-blue-500/30">
              <CalendarRange className="w-3.5 h-3.5 text-blue-400" />
              <span>Expo &amp; Trade Show Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Plan expos, book booths, and{" "}
              <span className="text-blue-400">connect on the floor.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Manage interactive hall floor plans, exhibitor stall approvals,
              speaker timetables, and scannable QR entry passes from one place.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
              <Link
                to={heroCta.to}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-sm text-white transition-colors group"
              >
                <span>{heroCta.label}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#upcoming-expos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 font-semibold text-sm text-white transition-colors"
              >
                Browse Upcoming Expos
              </a>
            </div>

            {/* Next Expo Countdown */}
            <div className="pt-2 space-y-2.5">
              <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {expos[0]?.title
                    ? `${expos[0].title} starts in`
                    : "Next scheduled expo starts in"}
                </span>
              </p>
              <CountdownTimer targetDate={expos[0]?.startDate} />
            </div>
          </div>

          {/* Right Hero Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl overflow-hidden bg-slate-800/80 border border-slate-700/80 p-2.5 shadow-2xl">
              <div className="relative rounded-xl overflow-hidden .aspect-[16/10]">
                <img
                  src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80"
                  alt="Conference Stage"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 .bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-3.5 rounded-xl flex items-center justify-between gap-2 shadow-md">
                  <div className="min-w-0">
                    <div className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider">
                      Live Floor Plan
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      Real-Time Booth Availability
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shrink-0">
                    Live Sync
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  50+
                </div>
                <div className="text-xs text-slate-300 mt-0.5">Exhibitors</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-bold text-amber-300">
                  12K+
                </div>
                <div className="text-xs text-slate-300 mt-0.5">Attendees</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  3 Roles
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Dedicated Hubs
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTICIPATING BRANDS STRIP */}
      <section className="border-b border-slate-200 bg-white py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase tracking-widest text-slate-400 mb-5 font-semibold">
            Participating Exhibitors &amp; Event Partners
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 items-center text-center">
            {PARTNER_BRANDS.map((brand) => (
              <div
                key={brand}
                className="text-xs sm:text-sm font-bold tracking-wider text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. UPCOMING EXPOS DIRECTORY */}
      <section
        id="upcoming-expos"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Event Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Upcoming Expos &amp; Trade Shows
            </h2>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or theme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse"
              >
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-6 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : expos.length === 0 ? (
          <div className="text-center py-14 px-4 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No expos found matching your search. Try another keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {expos.map((expo, index) => (
              <div
                key={expo._id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-100">
                    <img
                      src={
                        expo.bannerImage &&
                        expo.bannerImage !== "default-expo-banner.jpg"
                          ? expo.bannerImage
                          : EXPO_BANNERS[index % EXPO_BANNERS.length]
                      }
                      loading="lazy"
                      decoding="async"
                      alt={expo.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 .bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-xs">
                        {expo.theme}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-amber-400 text-slate-900">
                        {expo.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                      {expo.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-5 leading-relaxed">
                      {expo.description}
                    </p>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          {new Date(expo.startDate).toLocaleDateString()} –{" "}
                          {new Date(expo.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          {expo.location?.venueName}, {expo.location?.city}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 pt-3 mt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {expo.floorPlan?.totalBooths} Booths
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-400" />
                          {expo.attendeeCount || 0} Registered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    to={`/expos/${expo._id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-semibold text-slate-800 transition-colors"
                  >
                    Floor Plan &amp; Details
                  </Link>
                  <Link
                    to={
                      user
                        ? user.role === "exhibitor"
                          ? "/exhibitor?tab=floorplan"
                          : user.role === "admin"
                            ? "/admin"
                            : "/attendee"
                        : "/login"
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-semibold text-white transition-colors group/btn"
                  >
                    <span>
                      {user
                        ? user.role === "exhibitor"
                          ? "Reserve Booth"
                          : user.role === "admin"
                            ? "Manage Expo"
                            : "Get VIP Pass"
                        : "Book / Register"}
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. VENUE GALLERY */}
      <section className="bg-white border-y border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Venue Spaces
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Inside EventSphere Venues
              </h2>
            </div>
            <Link
              to="/services"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 group"
            >
              <span>View Booth Packages</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {GALLERY_IMAGES.map((img) => (
              <div
                key={img.title}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 h-60 bg-slate-100"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 .bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-amber-400 text-slate-900">
                    {img.tag}
                  </span>
                  <h4 className="text-base font-bold text-white mt-2">
                    {img.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ROLE PORTALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Role-Based Workflows
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            One Platform, Three Dedicated Portals
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Organizers, exhibitors, and attendees each get tools tailored to
            their tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLE_PORTALS.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="bg-white border border-slate-200 p-6 sm:p-7 rounded-2xl space-y-4 shadow-xs hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center ${role.badgeBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {role.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {role.desc}
                </p>

                <ul className="space-y-2 pt-4 border-t border-slate-100 text-sm text-slate-700">
                  {role.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. REVIEWS, FAQ & CONTACT */}
      <FaqAndContactSection />
    </div>
  );
};

export default LandingPage;
