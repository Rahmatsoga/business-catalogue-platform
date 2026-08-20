import { useSettings } from "../../context/SettingsContext";
import Card from "../../components/Card";

export default function Home() {
  const { settings } = useSettings();

  return (
    <div>
      <section
        style={{
          background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
          color: "#fff",
          padding: "70px 0",
        }}
      >
        <div className="container">
          <h1 style={{ fontSize: 36, marginBottom: "12px" }}>
            {settings?.appearance?.heroTitle || settings?.businessName || "Welcome"}
          </h1>
          <p style={{ fontSize: 18, maxWidth: 560 }}>
            {settings?.appearance?.heroText ||
              "Browse our catalogue and get in touch — no account needed."}
          </p>
        </div>
      </section>

      <section className="container" style={{ padding: "40px 0" }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>About {settings?.businessName}</h2>
          <p style={{ color: "var(--color-text-muted)" }}>
            {settings?.description ||
              "This is placeholder business copy. Update it from the admin Settings screen."}
          </p>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
            Categories, catalogue browsing, and search are built in Week 2. This page currently
            demonstrates that branding (colors, name, hero text) is pulled live from the database.
          </p>
        </Card>
      </section>
    </div>
  );
}
