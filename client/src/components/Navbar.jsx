import {
  Bell,
  Briefcase,
  Compass,
  Info,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import socket from "../services/socket";
import BrandMark from "./BrandMark";

const NAV_LINKS = [
  { name: "Home", path: "/", icon: Compass },
  { name: "About", path: "/about", icon: Info },
  { name: "Services", path: "/services", icon: Briefcase },
  { name: "Support", path: "/feedback", icon: LifeBuoy },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const loadNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/system/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silent fail on transient network issues
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const userId = user.id || user._id;
    socket.emit("join_user_room", userId);

    let active = true;
    api
      .get("/system/notifications")
      .then(({ data }) => {
        if (!active) return;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});

    const handleRealtimeSync = () => {
      loadNotifs();
    };

    socket.on("new_message", handleRealtimeSync);
    socket.on("messages_seen", handleRealtimeSync);
    return () => {
      active = false;
      socket.off("new_message", handleRealtimeSync);
      socket.off("messages_seen", handleRealtimeSync);
    };
  }, [user, location.pathname, location.search, loadNotifs]);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    if (!notifOpen && !mobileOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setMobileOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifOpen, mobileOpen]);

  const handleClearNotifications = async () => {
    try {
      await api.put("/messages/mark-read");
      const remainingApprovals = notifications.filter(
        (n) => n.type === "approval",
      );
      setNotifications(remainingApprovals);
      setUnreadCount(remainingApprovals.length);
    } catch {
      // Silent fail
    }
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setNotifOpen(false);
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "exhibitor") return "/exhibitor";
    return "/attendee";
  };

  const hasAvatar =
    user?.avatar &&
    user.avatar !== "default-avatar.png" &&
    !user.avatar.startsWith("data:image/svg");

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => {
            setMobileOpen(false);
            setNotifOpen(false);
          }}
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-slate-900 shrink-0"
        >
          <BrandMark className="w-8 h-8 shrink-0" />
          <span>
            Event<span className="text-blue-600">Sphere</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right User / Auth Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              {/* Live Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors relative cursor-pointer"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold flex items-center justify-center text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Notifications ({notifications.length})
                      </span>
                      <div className="flex items-center gap-3">
                        {notifications.some((n) => n.type !== "approval") && (
                          <button
                            type="button"
                            onClick={handleClearNotifications}
                            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setNotifOpen(false)}
                          className="text-xs font-medium text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-5 text-center">
                        No unread alerts right now.
                      </p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {notifications.map((n, idx) => (
                          <Link
                            key={n.id || idx}
                            to={`${getDashboardPath()}?tab=${n.targetTab || ""}`}
                            onClick={() => {
                              if (n.type !== "approval")
                                handleClearNotifications();
                              setNotifOpen(false);
                            }}
                            className="block p-3 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 transition-colors"
                          >
                            <div className="text-xs font-semibold text-blue-700 truncate">
                              {n.title}
                            </div>
                            <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                              {n.detail}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Badge */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/80 text-xs">
                {hasAvatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="font-semibold text-slate-800 max-w-[110px] truncate">
                  {user.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase text-[10px] font-semibold">
                  {user.role}
                </span>
              </div>

              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right Controls (Bell + Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setMobileOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMobileOpen(!mobileOpen);
              setNotifOpen(false);
            }}
            aria-label="Toggle Menu"
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Notifications Panel */}
      {notifOpen && user && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Notifications ({notifications.length})
            </span>
            <div className="flex items-center gap-3">
              {notifications.some((n) => n.type !== "approval") && (
                <button
                  type="button"
                  onClick={handleClearNotifications}
                  className="text-xs font-semibold text-blue-600"
                >
                  Mark read
                </button>
              )}
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                className="text-xs font-medium text-slate-400"
              >
                Done
              </button>
            </div>
          </div>
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              No unread alerts right now.
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2">
              {notifications.map((n, idx) => (
                <Link
                  key={n.id || idx}
                  to={`${getDashboardPath()}?tab=${n.targetTab || ""}`}
                  onClick={() => {
                    if (n.type !== "approval") handleClearNotifications();
                    setNotifOpen(false);
                  }}
                  className="block p-3 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div className="text-xs font-semibold text-blue-700 truncate">
                    {n.title}
                  </div>
                  <div className="text-xs text-slate-600 truncate mt-0.5">
                    {n.detail}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-1.5 shadow-lg">
          {user && (
            <div className="flex items-center justify-between p-3 mb-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 min-w-0">
                {hasAvatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {user.name}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase text-[10px] font-semibold shrink-0">
                {user.role}
              </span>
            </div>
          )}

          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  Open {user.role.toUpperCase()} Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-lg bg-rose-50 text-rose-600 text-sm font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg bg-slate-100 text-slate-800 text-sm font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
