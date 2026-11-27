import {
  BadgeCheck,
  Calendar,
  ExternalLink,
  MapPin,
  Printer,
  ShieldCheck,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const QrDocumentModal = ({ isOpen, onClose, type, data, user }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const isPass = type === "pass";
  const docTitle = isPass
    ? data.title
    : `Booth ${data.boothNumber} — ${data.tier?.toUpperCase()}`;
  const docSubtitle = isPass
    ? `${data.location?.venueName || "Expo Center"}, ${data.location?.city || "Karachi"}`
    : user?.exhibitorProfile?.companyName || user?.name;
  const docMeta = isPass
    ? `VIP PASS • ${new Date(data.startDate).toLocaleDateString()}`
    : `$${data.price}.00 PAID • ${data.size || "10x10 ft"}`;

  const verifyPath = `/verify/${isPass ? "pass" : "invoice"}/${data._id}?holder=${encodeURIComponent(
    user?.name || "",
  )}&email=${encodeURIComponent(user?.email || "")}&title=${encodeURIComponent(
    docTitle,
  )}&subtitle=${encodeURIComponent(docSubtitle)}&meta=${encodeURIComponent(docMeta)}`;

  const qrUrl = `${window.location.origin}${verifyPath}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <BadgeCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{isPass ? "Event Entry Pass" : "Official Booth Invoice"}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="no-print p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-7 space-y-5 text-slate-900">
          <div className="text-center space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              EventSphere Credential
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {docTitle}
            </h3>
            <p className="text-sm text-slate-500">{docSubtitle}</p>
          </div>

          {/* Scannable QR Code Card */}
          <div className="flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 p-5 rounded-2xl mx-auto w-fit">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <QRCodeSVG
                value={qrUrl}
                size={156}
                level="M"
                fgColor="#0F172A"
                bgColor="#FFFFFF"
              />
            </div>
            <span className="text-xs font-mono text-slate-700 mt-3 font-semibold bg-slate-200/70 px-3 py-0.5 rounded-full">
              ID: {data._id?.slice(-10).toUpperCase()}
            </span>
            <Link
              to={verifyPath}
              target="_blank"
              className="no-print mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Open Verification Page <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Details Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Holder</span>
              <span className="font-semibold text-slate-900 text-right truncate">
                {user?.name}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-700 text-right truncate">
                {user?.email}
              </span>
            </div>

            {isPass ? (
              <>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Event Date</span>
                  </span>
                  <span className="font-semibold text-slate-900">
                    {new Date(data.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Access</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                    All-Access VIP
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Booth Size &amp; Tier</span>
                  <span className="font-semibold text-slate-900 uppercase">
                    {data.size || "10x10 ft"} • {data.tier}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Fee Status</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    ${data.price}.00 Paid
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified Pass</span>
            </span>

            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrDocumentModal;
