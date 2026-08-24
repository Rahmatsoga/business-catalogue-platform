import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/axiosClient";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      try {
        const response = await apiClient.get("/public/settings");
        if (!isMounted) return;

        const data = response.data.data;
        setSettings(data);

        // Apply branding colors as CSS variables so the WHOLE app re-themes
        // itself automatically - this is what makes the codebase reusable
        // for a different business without touching any component code.
        const root = document.documentElement;
        if (data?.appearance?.primaryColor) {
          root.style.setProperty("--color-primary", data.appearance.primaryColor);
        }
        if (data?.appearance?.secondaryColor) {
          root.style.setProperty("--color-secondary", data.appearance.secondaryColor);
        }

        if (data?.businessName) {
          document.title = data.seo?.defaultTitle || data.businessName;
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || "Unable to load business settings. Is the server running?"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
