import { Link, Outlet } from "react-router-dom";
import "./PublicLayout.css";

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header__inner">
          <Link to="/" className="public-header__brand">
            My Business
          </Link>
          <nav className="public-header__nav">
            <Link to="/">Home</Link>
            <Link to="/catalogue">Catalogue</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <p>&copy; {new Date().getFullYear()} My Business. All rights reserved.</p>
      </footer>
    </div>
  );
}
