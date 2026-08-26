const express = require("express");
const CatalogueItem = require("../models/CatalogueItem");
const Category = require("../models/Category");

const seoRouter = express.Router();

// GET /robots.txt (public)
seoRouter.get("/robots.txt", (req, res) => {
  const siteUrl = process.env.CLIENT_URL || "http://localhost:5173";
  res.type("text/plain").send(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      `Sitemap: ${siteUrl}/sitemap.xml`,
    ].join("\n")
  );
});

// GET /sitemap.xml (public) — lists the homepage, catalogue, every active
// category, and every active item, so search engines can discover pages
// that aren't directly linked from the homepage.
seoRouter.get("/sitemap.xml", async (req, res, next) => {
  try {
    const siteUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const [categories, items] = await Promise.all([
      Category.find({ isActive: true }).select("slug updatedAt").lean(),
      CatalogueItem.find({ isActive: true }).select("slug updatedAt").lean(),
    ]);

    const staticUrls = ["", "/catalogue", "/categories", "/about", "/contact"];
    const categoryUrls = categories.map((c) => ({ path: `/categories/${c.slug}`, lastmod: c.updatedAt }));
    const itemUrls = items.map((i) => ({ path: `/items/${i.slug}`, lastmod: i.updatedAt }));

    const allUrls = [
      ...staticUrls.map((path) => ({ path, lastmod: null })),
      ...categoryUrls,
      ...itemUrls,
    ];

    const xmlEntries = allUrls
      .map(({ path, lastmod }) => {
        const loc = `${siteUrl}${path}`;
        const lastmodTag = lastmod ? `<lastmod>${new Date(lastmod).toISOString().split("T")[0]}</lastmod>` : "";
        return `  <url><loc>${loc}</loc>${lastmodTag}</url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</urlset>`;

    res.type("application/xml").send(xml);
  } catch (err) {
    next(err);
  }
});

module.exports = { seoRouter };
