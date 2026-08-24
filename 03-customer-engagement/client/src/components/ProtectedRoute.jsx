import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();

  if (status === "checking") {
    return <div style={{ padding: "2rem" }}>Checking session…</div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
