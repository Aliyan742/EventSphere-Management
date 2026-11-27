import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "./BrandMark";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1: Brand */}
        <div className="space-y-3.5">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 font-bold text-lg tracking-tight text-slate-900"
          >
            <BrandMark className="w-8 h-8 shrink-0" />
            <span>
              Event<span className="text-blue-600">Sphere</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-500">
            Expo and trade show management platform for interactive hall floor
            plans, exhibitor booth bookings, and QR attendee passes.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
            Platform
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                to="/"
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Upcoming Expos
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Services &amp; Booth Packages
              </Link>
            </li>
            <li>
              <Link
                to="/feedback"
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Support &amp; Feedback
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Support & Resources */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
            Account &amp; Help
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href="/#faq"
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Frequently Asked Questions
              </a>
            </li>
            <li>
              <a
                href="/#contact"
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Contact Desk
              </a>
            </li>
            <li>
              <Link
                to="/login"
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="text-slate-500 hover:text-blue-600 font-medium transition-colors"
              >
                Create Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
            Contact
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-500">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Expo Center Avenue, Karachi</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>+92 (21) 3555-0192</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">support@eventsphere.com</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
              <span>www.eventsphere.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-slate-50 border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} EventSphere Management.</p>
          <div className="flex items-center gap-5">
            <a href="/#faq" className="hover:text-slate-900 transition-colors">
              Privacy &amp; Data
            </a>
            <a
              href="/#contact"
              className="hover:text-slate-900 transition-colors"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
