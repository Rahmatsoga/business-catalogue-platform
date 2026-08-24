import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Settings.css";

const emptyForm = {
  businessName: "",
  description: "",
  address: "",
  phone: "",
  email: "",
  whatsappNumber: "",
  workingHours: "",
  mapUrl: "",
  primaryColor: "#0d9488",
  secondaryColor: "#0f172a",
  heroTitle: "",
  heroText: "",
  seoTitle: "",
  seoDescription: "",
};

export default function Settings() {
  const [form, setForm] = useState(emptyForm);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [saveState, setSaveState] = useState("idle"); // idle | saving | success | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await axiosClient.get("/admin/settings");
      const data = res.data.data;
      setForm({
        businessName: data.businessName || "",
        description: data.description || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        whatsappNumber: data.whatsappNumber || "",
        workingHours: data.workingHours || "",
        mapUrl: data.mapUrl || "",
        primaryColor: data.primaryColor || "#0d9488",
        secondaryColor: data.secondaryColor || "#0f172a",
        heroTitle: data.heroTitle || "",
        heroText: data.heroText || "",
        seoTitle: data.seoTitle || "",
        seoDescription: data.seoDescription || "",
      });
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMessage("");

    try {
      await axiosClient.put("/admin/settings", form);
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setSaveState("error");
      setErrorMessage(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  }

  if (loadState === "loading") return <p>Loading settings…</p>;
  if (loadState === "error") return <p>Could not load settings. Please refresh the page.</p>;

  return (
    <div>
      <h1>Business Settings</h1>
      <p style={{ color: "#64748b" }}>
        This information powers the public website's header, footer, and contact actions.
      </p>

      <form className="settings-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Business Profile</legend>

          <label htmlFor="businessName">Business Name</label>
          <input id="businessName" value={form.businessName} onChange={handleChange("businessName")} required />

          <label htmlFor="description">Description</label>
          <textarea id="description" value={form.description} onChange={handleChange("description")} rows={3} />

          <label htmlFor="address">Address</label>
          <input id="address" value={form.address} onChange={handleChange("address")} />

          <label htmlFor="workingHours">Working Hours</label>
          <input id="workingHours" value={form.workingHours} onChange={handleChange("workingHours")} placeholder="Mon-Sat 9am-6pm" />

          <label htmlFor="mapUrl">Map URL</label>
          <input id="mapUrl" value={form.mapUrl} onChange={handleChange("mapUrl")} placeholder="https://maps.google.com/..." />
        </fieldset>

        <fieldset>
          <legend>Contact (at least one required)</legend>

          <label htmlFor="phone">Phone</label>
          <input id="phone" value={form.phone} onChange={handleChange("phone")} />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={handleChange("email")} />

          <label htmlFor="whatsappNumber">WhatsApp Number</label>
          <input id="whatsappNumber" value={form.whatsappNumber} onChange={handleChange("whatsappNumber")} placeholder="+92300..." />
        </fieldset>

        <fieldset>
          <legend>Appearance</legend>

          <label htmlFor="primaryColor">Primary Color</label>
          <input id="primaryColor" type="color" value={form.primaryColor} onChange={handleChange("primaryColor")} />

          <label htmlFor="secondaryColor">Secondary Color</label>
          <input id="secondaryColor" type="color" value={form.secondaryColor} onChange={handleChange("secondaryColor")} />

          <label htmlFor="heroTitle">Hero Title</label>
          <input id="heroTitle" value={form.heroTitle} onChange={handleChange("heroTitle")} />

          <label htmlFor="heroText">Hero Text</label>
          <textarea id="heroText" value={form.heroText} onChange={handleChange("heroText")} rows={2} />
        </fieldset>

        <fieldset>
          <legend>SEO (Should — improves search engine visibility)</legend>

          <label htmlFor="seoTitle">Default Page Title</label>
          <input id="seoTitle" value={form.seoTitle} onChange={handleChange("seoTitle")} placeholder="My Business - Quality Products & Services" />

          <label htmlFor="seoDescription">Meta Description</label>
          <textarea
            id="seoDescription"
            value={form.seoDescription}
            onChange={handleChange("seoDescription")}
            rows={2}
            placeholder="A short summary shown in search engine results (150-160 characters recommended)."
          />
        </fieldset>

        {saveState === "error" && <div className="settings-form__error">{errorMessage}</div>}
        {saveState === "success" && <div className="settings-form__success">Settings saved successfully.</div>}

        <button type="submit" disabled={saveState === "saving"}>
          {saveState === "saving" ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
