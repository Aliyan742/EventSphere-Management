import { lazy, Suspense, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Route-level code splitting for faster initial page load
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ExpoDetailPage = lazy(() => import("./pages/ExpoDetailPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const VerifyDocumentPage = lazy(() => import("./pages/VerifyDocumentPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ExhibitorDashboard = lazy(() => import("./pages/ExhibitorDashboard"));
const AttendeeDashboard = lazy(() => import("./pages/AttendeeDashboard"));

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 rounded-full border-3 border-slate-200 border-t-blue-600 animate-spin" />
      <span className="text-xs font-medium text-slate-500">Loading...</span>
    </div>
  </div>
);

// Synchronize theme, font, scale, and density across tabs
const AppearanceSync = () => {
  const { user } = useAuth();

  useEffect(() => {
    const savedLocal = JSON.parse(
      localStorage.getItem("eventsphere_appearance") || "{}",
    );
    const settings = user?.settings || savedLocal;

    const theme = settings.theme || "light";
    const fontFamily = settings.fontFamily || "sans";
    const fontSize = settings.fontSize || "md";
    const compactMode = Boolean(settings.compactMode);

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark-theme");
    } else {
      root.classList.remove("dark-theme");
    }
    root.setAttribute("data-font", fontFamily);
    root.setAttribute("data-size", fontSize);
    root.setAttribute("data-compact", String(compactMode));

    localStorage.setItem(
      "eventsphere_appearance",
      JSON.stringify({ theme, fontFamily, fontSize, compactMode }),
    );
  }, [user]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <AppearanceSync />
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/expos/:id" element={<ExpoDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route
                  path="/verify/:type/:id"
                  element={<VerifyDocumentPage />}
                />

                {/* Protected Dashboards */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exhibitor"
                  element={
                    <ProtectedRoute allowedRoles={["exhibitor"]}>
                      <ExhibitorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/attendee"
                  element={
                    <ProtectedRoute allowedRoles={["attendee"]}>
                      <AttendeeDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
