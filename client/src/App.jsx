import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/public/Home";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/Settings";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          {/* Catalogue, Category, Item Details, About, Contact routes arrive in Week 2/3 */}
        </Route>

        {/* Admin login (outside the protected admin layout) */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected admin panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          {/* Categories, Items, Inquiries routes arrive in Week 2/3 */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h1>404</h1>
      <p>The page you're looking for could not be found.</p>
    </div>
  );
}
