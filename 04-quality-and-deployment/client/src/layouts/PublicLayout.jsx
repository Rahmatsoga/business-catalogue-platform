import { Link, Outlet } from "react-router-dom";
import { useBusinessSettings } from "../context/BusinessSettingsContext";
import "./PublicLayout.css";

export default function PublicLayout() {
  const { settings } = useBusinessSettings();
  const businessName = settings?.businessName || "My Business";

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header__inner">
          <Link to="/" className="public-header__brand">
            {businessName}
          </Link>
          <nav className="public-header__nav">
            <Link to="/">Home</Link>
            <Link to="/catalogue">Catalogue</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        {settings && (settings.phone || settings.email || settings.address) && (
          <div className="public-footer__contact">
            {settings.address && <span>{settings.address}</span>}
            {settings.phone && <span>{settings.phone}</span>}
            {settings.email && <span>{settings.email}</span>}
          </div>
        )}
        <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
