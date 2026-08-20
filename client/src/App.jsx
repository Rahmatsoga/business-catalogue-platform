import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/public/Home";
import ComingSoon from "./pages/public/ComingSoon";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/Settings";

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="catalogue" element={<ComingSoon title="Catalogue" />} />
        <Route path="contact" element={<ComingSoon title="Contact" />} />
      </Route>

      {/* Admin login (no layout - full screen) */}
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
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<ComingSoon title="Categories (Week 2)" />} />
        <Route path="items" element={<ComingSoon title="Items (Week 2)" />} />
        <Route path="inquiries" element={<ComingSoon title="Inquiries (Week 3)" />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<ComingSoon title="404 - Page Not Found" />} />
    </Routes>
  );
}
