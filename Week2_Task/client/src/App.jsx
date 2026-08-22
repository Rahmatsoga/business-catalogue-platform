import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/public/Home";
import Catalogue from "./pages/public/Catalogue";
import Categories from "./pages/public/Categories";
import CategoryPage from "./pages/public/CategoryPage";
import ItemDetail from "./pages/public/ItemDetail";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/Settings";
import AdminCategories from "./pages/admin/Categories";
import AdminItems from "./pages/admin/Items";
import ItemForm from "./pages/admin/ItemForm";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/:slug" element={<CategoryPage />} />
          <Route path="items/:slug" element={<ItemDetail />} />
          {/* About and Contact pages arrive in Week 3 */}
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
          <Route path="categories" element={<AdminCategories />} />
          <Route path="items" element={<AdminItems />} />
          <Route path="items/new" element={<ItemForm />} />
          <Route path="items/:id/edit" element={<ItemForm />} />
          <Route path="settings" element={<Settings />} />
          {/* Inquiries route arrives in Week 3 */}
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
