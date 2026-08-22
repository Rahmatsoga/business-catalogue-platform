import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">Admin Panel</div>
        <nav className="admin-sidebar__nav">
          <NavLink to="/admin/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/categories" className={navClass}>
            Categories
          </NavLink>
          <NavLink to="/admin/items" className={navClass}>
            Items
          </NavLink>
          {/* Inquiries link will be added in Week 3 */}
          <NavLink to="/admin/settings" className={navClass}>
            Settings
          </NavLink>
        </nav>
        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__admin-name">{admin?.name}</span>
          <button onClick={handleLogout} className="admin-sidebar__logout">
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

function navClass({ isActive }) {
  return isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link";
}
