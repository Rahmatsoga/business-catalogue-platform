import { useEffect, useState } from "react";
import apiClient from "../../api/axiosClient";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Spinner from "../../components/Spinner";

export default function Settings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await apiClient.get("/admin/settings");
        setForm(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleAppearanceChange = (field, value) => {
    setForm({ ...form, appearance: { ...form.appearance, [field]: value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await apiClient.put("/admin/settings", form);
      setForm(response.data.data);
      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading settings..." />;
  if (!form) return <p style={{ color: "#dc2626" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ marginBottom: "20px" }}>Business Settings</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Business Name"
            name="businessName"
            value={form.businessName || ""}
            onChange={(e) => handleChange("businessName", e.target.value)}
            required
          />
          <Input
            label="Primary Color"
            name="primaryColor"
            value={form.appearance?.primaryColor || ""}
            onChange={(e) => handleAppearanceChange("primaryColor", e.target.value)}
            placeholder="#0F766E"
          />
          <Input
            label="Secondary Color"
            name="secondaryColor"
            value={form.appearance?.secondaryColor || ""}
            onChange={(e) => handleAppearanceChange("secondaryColor", e.target.value)}
            placeholder="#0891B2"
          />
          <Input
            label="Hero Title"
            name="heroTitle"
            value={form.appearance?.heroTitle || ""}
            onChange={(e) => handleAppearanceChange("heroTitle", e.target.value)}
          />

          {message && <p style={{ color: "#16a34a", fontSize: 14 }}>{message}</p>}
          {error && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
