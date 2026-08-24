import { Link, Outlet } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import Spinner from "../components/Spinner";

export default function PublicLayout() {
  const { settings, loading, error } = useSettings();

  if (loading) return <Spinner label="Loading business info..." />;
  if (error) {
    return (
      <div className="error-screen">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          padding: "16px 0",
        }}
      >
        <div
          className="container"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.businessName} style={{ height: 36 }} />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {settings?.businessName?.charAt(0) || "B"}
              </div>
            )}
            <strong style={{ color: "var(--color-text)", fontSize: 18 }}>
              {settings?.businessName || "Business Catalogue"}
            </strong>
          </Link>

          <nav style={{ display: "flex", gap: "20px" }}>
            <Link to="/">Home</Link>
            <Link to="/catalogue">Catalogue</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          marginTop: "60px",
          padding: "24px 0",
          color: "var(--color-text-muted)",
          fontSize: "14px",
        }}
      >
        <div className="container">
          <p>
            {settings?.businessName || "Business Catalogue"}
            {settings?.address ? ` — ${settings.address}` : ""}
          </p>
          {settings?.contact?.phone && <p>Phone: {settings.contact.phone}</p>}
        </div>
      </footer>
    </div>
  );
}
