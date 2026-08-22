import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          backgroundColor: "var(--color-bg-alt)",
          borderRight: "1px solid var(--color-border)",
          padding: "20px",
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: "24px" }}>Admin Panel</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/categories">Categories</Link>
          <Link to="/admin/items">Items</Link>
          <Link to="/admin/inquiries">Inquiries</Link>
          <Link to="/admin/settings">Settings</Link>
        </nav>
      </aside>

      <div style={{ flex: 1 }}>
        <header
          style={{
            borderBottom: "1px solid var(--color-border)",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Logged in as: {admin?.name}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        <main style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
