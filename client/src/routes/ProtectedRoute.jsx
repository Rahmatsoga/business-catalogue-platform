import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function ProtectedRoute({ children }) {
  const { admin, checkingSession } = useAuth();

  if (checkingSession) {
    return <Spinner label="Checking session..." />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
