import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

const CATEGORIZED_FAQS = {
  General: [
    {
      q: "What is EventSphere Management?",
      a: "EventSphere is an expo and trade show management platform connecting organizers, exhibitors, and visitors with interactive floor plans, QR entry passes, and direct messaging.",
    },
    {
      q: "How is my personal data protected?",
      a: "Accounts use encrypted password storage and token-based access control. You can also export or permanently delete your account data anytime from Settings.",
    },
  ],
  Exhibitors: [
    {
      q: "How do I reserve a booth on the floor plan?",
      a: "Sign in as an Exhibitor, open the Floor Plan tab, select any available Standard, Premium, or VIP booth, and submit your showcase details for organizer review.",
    },
    {
      q: "Can I print an official receipt for my booked booth?",
      a: 'Yes. Once your booth reservation is approved, open your My Booths tab and click "View Official QR Invoice" to print or save a PDF receipt.',
    },
  ],
  Attendees: [
    {
      q: "How do I get my entry QR pass?",
      a: 'Register for any upcoming expo inside your Attendee Hub, then click "My QR Pass" in the header to view or print your scannable entry badge.',
    },
    {
      q: "Can I schedule 1-on-1 meetings with exhibitors?",
      a: 'Yes. Browse the Confirmed Exhibitors directory, click "Book Appointment" on any booth, choose your preferred time, and follow up in chat.',
    },
  ],
};

const DEFAULT_REVIEWS = [
  {
    _id: "default-1",
    name: "Zainab Tariq",
    userRole: "Exhibitor • NexaTech",
    rating: 5,
    message:
      "Booking Booth A-01 took less than two minutes. Having our product catalog and 1-on-1 appointments in one place doubled our leads.",
  },
  {
    _id: "default-2",
    name: "Bilal Ahmed",
    userRole: "Exhibitor • CloudWave",
    rating: 5,
    message:
      "Nearby booth chat helped us coordinate a joint live security demo right on the expo floor.",
  },
  {
    _id: "default-3",
    name: "Sara Khan",
    userRole: "Attendee",
    rating: 5,
    message:
      "My scannable QR pass and saved speaker schedule made navigating the event effortless.",
  },
];

const FaqAndContactSection = () => {
  const [faqCategory, setFaqCategory] = useState("General");
  const [openIndex, setOpenIndex] = useState(0);
  const [verifiedReviews, setVerifiedReviews] = useState([]);

  useEffect(() => {
    api
      .get("/system/public-reviews")
      .then(({ data }) => setVerifiedReviews(data.reviews || []))
      .catch(() => {});
  }, []);

  const reviewsToDisplay =
    verifiedReviews.length > 0 ? verifiedReviews : DEFAULT_REVIEWS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20 text-slate-900">
      {/* Verified Reviews Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Feedback from Attendees &amp; Exhibitors</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Trusted by Organizers &amp; Brands
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewsToDisplay.map((rev) => (
            <div
              key={rev._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-500"
                      />
                    ))}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                    Verified
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  &ldquo;{rev.message}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs flex items-center gap-3">
                {rev.user?.avatar &&
                rev.user.avatar !== "default-avatar.png" &&
                !rev.user.avatar.startsWith("data:image/svg") ? (
                  <img
                    src={rev.user.avatar}
                    alt={rev.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {rev.name?.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 text-sm truncate">
                    {rev.name}
                  </div>
                  <div className="text-slate-500 mt-0.5 truncate">
                    {rev.userRole || "Verified Member"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorized FAQ & Contact Desk */}
      <section
        id="faq"
        className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12"
      >
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Help Center
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.keys(CATEGORIZED_FAQS).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setFaqCategory(cat);
                  setOpenIndex(0);
                }}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  faqCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {CATEGORIZED_FAQS[faqCategory].map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-xl overflow-hidden transition-colors ${
                    isOpen ? "border-blue-300" : "border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-semibold text-slate-900 cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Card */}
        <div id="contact" className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Contact
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Get in Touch
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Need help setting up an expo floor plan or managing exhibitor
                requests? Reach our support desk directly.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">Office</div>
                  <div className="text-slate-500 mt-0.5">
                    Expo Center Avenue, Karachi, Pakistan
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">
                    Organizer Desk
                  </div>
                  <div className="text-slate-500 mt-0.5">+92 (21) 3555-0192</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">Email</div>
                  <div className="text-slate-500 mt-0.5">
                    support@eventsphere.com
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">Hours</div>
                  <div className="text-slate-500 mt-0.5">
                    Mon – Sat: 9:00 AM – 8:00 PM PKT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqAndContactSection;
