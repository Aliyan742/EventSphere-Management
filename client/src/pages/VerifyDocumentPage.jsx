import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";

const VerifyDocumentPage = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();

  const isPass = type === "pass";
  const holder = searchParams.get("holder") || "Verified EventSphere Member";
  const email = searchParams.get("email") || "";
  const title =
    searchParams.get("title") ||
    (isPass ? "VIP Expo Pass" : "Official Booth Invoice");
  const subtitle =
    searchParams.get("subtitle") || "EventSphere Official Credential";
  const meta =
    searchParams.get("meta") ||
    (isPass ? "ALL-ACCESS VIP" : "PAID & CONFIRMED");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Top Verified Banner */}
        <div className="bg-emerald-600 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                Verified Credential
              </div>
              <h1 className="text-lg font-bold">
                {isPass ? "Valid VIP Entry Pass" : "Official Booth Receipt"}
              </h1>
            </div>
          </div>
          <BadgeCheck className="w-5 h-5 text-emerald-100" />
        </div>

        {/* Credential Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              ID: {id?.slice(-10).toUpperCase()}
            </span>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Issued To</span>
              <span className="font-semibold text-slate-900 text-right">
                {holder}
              </span>
            </div>
            {email && (
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Registered Email</span>
                <span className="font-medium text-slate-700 text-right">
                  {email}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-3 pt-2 border-t border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5">
                {isPass ? (
                  <Calendar className="w-4 h-4 text-blue-600" />
                ) : (
                  <Building2 className="w-4 h-4 text-blue-600" />
                )}
                <span>Status</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs">
                {meta}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Verified by EventSphere
              Check-In
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Portal Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDocumentPage;
