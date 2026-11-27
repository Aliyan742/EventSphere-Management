import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";

export const useSmartAction = () => {
  const { user } = useAuth();

  const getPortalHome = useCallback(() => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "exhibitor") return "/exhibitor";
    return "/attendee";
  }, [user]);

  // For Booth Reservation CTAs (e.g., ServicesPage, ExpoDetailPage)
  const getBoothAction = useCallback(
    (defaultLabel = "Reserve Booth") => {
      if (!user) return { to: "/login", label: defaultLabel };
      if (user.role === "exhibitor") {
        return {
          to: "/exhibitor?tab=floorplan",
          label: "Open Floor Plan & Book",
        };
      }
      if (user.role === "admin") {
        return { to: "/admin?tab=booths", label: "Manage Floor Plan" };
      }
      return { to: "/attendee?tab=exhibitors", label: "Browse Booths" };
    },
    [user],
  );

  // For General / Join / Hero CTAs (e.g., LandingPage, AboutPage)
  const getPrimaryAction = useCallback(
    (guestTo = "/register", guestLabel = "Create Free Account") => {
      if (!user) return { to: guestTo, label: guestLabel };
      if (user.role === "admin") {
        return { to: "/admin", label: "Open Organizer Dashboard" };
      }
      if (user.role === "exhibitor") {
        return { to: "/exhibitor", label: "Open Exhibitor Portal" };
      }
      return { to: "/attendee", label: "Open Attendee Hub & Pass" };
    },
    [user],
  );

  return { user, getPortalHome, getBoothAction, getPrimaryAction };
};
