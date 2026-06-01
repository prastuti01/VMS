import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth();

  // Fallback to localStorage for the async state update gap for backup
  const resolvedUser =
    user ??
    (() => {
      try {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();

  const resolvedRole = role ?? localStorage.getItem("role");

  if (!resolvedUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(resolvedRole))
    return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
