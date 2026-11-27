import {
  CheckCircle2,
  Mail,
  MessageSquarePlus,
  Send,
  Star,
  Tag,
  User,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const FeedbackPage = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [category, setCategory] = useState("suggestion");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/system/feedback", {
        user: user?.id || user?._id || null,
        name,
        email,
        category,
        rating: Number(rating),
        message,
      });
      setSubmitted(true);
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        {/* Header */}
        <div className="flex items-start sm:items-center gap-3.5 mb-2">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Support &amp; Feedback
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Share your event experience, suggest improvements, or report an
              issue.
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-100 my-6" />

        {error && (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium"
          >
            {error}
          </div>
        )}

        {submitted ? (
          <div className="p-7 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">
                Feedback received
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you for writing in. Our organizer support team will review
                your message shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fb-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="fb-name"
                    type="text"
                    required
                    placeholder="Aliyan Butt"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="fb-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="fb-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fb-category"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Topic
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="fb-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="suggestion">Feature Idea</option>
                    <option value="event_feedback">Event Experience</option>
                    <option value="bug_report">Report a Problem</option>
                    <option value="other">General Question</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rating ({rating}/5)
                </span>
                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const active = starValue <= Number(rating);
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        aria-label={`Rate ${starValue} out of 5 stars`}
                        className="p-1 transition-transform hover:scale-115 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            active
                              ? "text-amber-500 fill-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="fb-message"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Message
              </label>
              <textarea
                id="fb-message"
                rows={4}
                required
                placeholder="Write your thoughts or issue details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{submitting ? "Sending..." : "Submit Feedback"}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
