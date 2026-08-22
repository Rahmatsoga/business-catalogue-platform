import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const BusinessSettingsContext = createContext(null);

export function BusinessSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loadState, setLoadState] = useState("loading");

  useEffect(() => {
    axiosClient
      .get("/public/settings")
      .then((res) => {
        setSettings(res.data.data);
        setLoadState("ready");

        // FR-050: apply the default SEO title/description to the document
        // whenever a specific page hasn't already set its own (see useDocumentTitle).
        if (res.data.data.seoTitle) document.title = res.data.data.seoTitle;
        if (res.data.data.seoDescription) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement("meta");
            meta.name = "description";
            document.head.appendChild(meta);
          }
          meta.content = res.data.data.seoDescription;
        }
      })
      .catch(() => setLoadState("error"));
  }, []);

  return (
    <BusinessSettingsContext.Provider value={{ settings, loadState }}>
      {children}
    </BusinessSettingsContext.Provider>
  );
}

export function useBusinessSettings() {
  const ctx = useContext(BusinessSettingsContext);
  if (!ctx) throw new Error("useBusinessSettings must be used inside a BusinessSettingsProvider");
  return ctx;
}
