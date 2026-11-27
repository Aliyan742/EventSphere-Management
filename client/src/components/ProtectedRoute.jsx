import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 gap-3">
        <div className="h-10 w-10 rounded-full border-3 border-slate-200 border-t-blue-600 animate-spin" />
        <span className="text-xs font-medium text-slate-500">
          Verifying session...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "exhibitor") return <Navigate to="/exhibitor" replace />;
    return <Navigate to="/attendee" replace />;
  }

  return children;
};

export default ProtectedRoute;
