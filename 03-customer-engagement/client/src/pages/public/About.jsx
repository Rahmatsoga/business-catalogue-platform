import { Link } from "react-router-dom";
import { useBusinessSettings } from "../../context/BusinessSettingsContext";

export default function About() {
  const { settings, loadState } = useBusinessSettings();

  if (loadState === "loading") return <p>Loading…</p>;
  if (loadState === "error" || !settings) return <p>Something went wrong. Please try again later.</p>;

  return (
    <div>
      <h1>About {settings.businessName || "Us"}</h1>

      {settings.heroImageUrl && (
        <img
          src={settings.heroImageUrl}
          alt={settings.businessName}
          style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 8, margin: "1rem 0" }}
        />
      )}

      {settings.description ? (
        <p style={{ lineHeight: 1.7, color: "#334155", maxWidth: 720 }}>{settings.description}</p>
      ) : (
        <p style={{ color: "#94a3b8" }}>No description has been added yet.</p>
      )}

      <p style={{ marginTop: "2rem" }}>
        Ready to get in touch? <Link to="/contact" style={{ color: "#0d9488" }}>Visit our Contact page</Link>.
      </p>
    </div>
  );
}
