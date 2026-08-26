/**
 * Seeds realistic demo data so a fresh install/demo isn't an empty
 * catalogue. Run with: npm run seed:demo
 *
 * Safe to re-run: skips creating anything if demo categories already exist,
 * so it won't create duplicates if you run it twice.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const CatalogueItem = require("../models/CatalogueItem");
const { generateUniqueSlug } = require("../utils/slugify");

const DEMO_CATEGORIES = [
  { name: "Tiles", description: "Ceramic, porcelain, and stone tiles for floors and walls." },
  { name: "Sanitaryware", description: "Basins, toilets, faucets, and bathroom fittings." },
  { name: "Lighting", description: "Indoor and outdoor lighting fixtures." },
];

const DEMO_ITEMS = [
  { name: "Glossy White Ceramic Tile 30x30", category: "Tiles", price: 2.5, priceType: "fixed", unit: "per sq ft", color: "White", finish: "Glossy" },
  { name: "Matte Grey Porcelain Tile 60x60", category: "Tiles", price: 4.75, priceType: "fixed", unit: "per sq ft", color: "Grey", finish: "Matte" },
  { name: "Beige Marble-Look Floor Tile", category: "Tiles", priceType: "range", priceMin: 3, priceMax: 6, color: "Beige", finish: "Polished" },
  { name: "Textured Outdoor Paving Tile", category: "Tiles", priceType: "starting_from", price: 5, color: "Charcoal", finish: "Textured" },
  { name: "Mosaic Bathroom Wall Tile", category: "Tiles", priceType: "contact_for_price", color: "Blue Mix", finish: "Glossy" },
  { name: "Wooden-Look Vinyl Tile", category: "Tiles", price: 3.2, priceType: "fixed", unit: "per sq ft", color: "Oak Brown", finish: "Matte" },

  { name: "Wall-Mounted Ceramic Basin", category: "Sanitaryware", price: 65, priceType: "fixed", color: "White", material: "Ceramic" },
  { name: "One-Piece Dual-Flush Toilet", category: "Sanitaryware", price: 145, priceType: "fixed", color: "White", material: "Ceramic" },
  { name: "Chrome Single-Lever Basin Faucet", category: "Sanitaryware", price: 38, priceType: "fixed", material: "Brass/Chrome" },
  { name: "Rain Shower Head Set", category: "Sanitaryware", priceType: "range", priceMin: 40, priceMax: 90, material: "Stainless Steel" },
  { name: "Freestanding Bathtub", category: "Sanitaryware", priceType: "contact_for_price", material: "Acrylic" },
  { name: "Kitchen Sink Mixer Tap", category: "Sanitaryware", price: 52, priceType: "fixed", material: "Brass" },

  { name: "LED Recessed Ceiling Light 12W", category: "Lighting", price: 8.5, priceType: "fixed", color: "Warm White" },
  { name: "Modern Pendant Light", category: "Lighting", priceType: "range", priceMin: 25, priceMax: 60, material: "Metal/Glass" },
  { name: "Outdoor Wall Lantern", category: "Lighting", priceType: "starting_from", price: 22, material: "Weatherproof Aluminum" },
];

async function seed() {
  await connectDB();

  const categoryMap = {};
  for (const cat of DEMO_CATEGORIES) {
    const existing = await Category.findOne({ name: cat.name });
    if (existing) {
      categoryMap[cat.name] = existing._id;
      continue;
    }
    const slug = await generateUniqueSlug(Category, cat.name);
    const created = await Category.create({ name: cat.name, slug, description: cat.description, isActive: true });
    categoryMap[cat.name] = created._id;
    console.log(`[seed:demo] Created category "${cat.name}"`);
  }

  for (const item of DEMO_ITEMS) {
    const existing = await CatalogueItem.findOne({ name: item.name });
    if (existing) continue;

    const slug = await generateUniqueSlug(CatalogueItem, item.name);
    const specifications = [];
    if (item.color) specifications.push({ label: "Color", value: item.color, displayOrder: 0 });
    if (item.material) specifications.push({ label: "Material", value: item.material, displayOrder: 1 });
    if (item.finish) specifications.push({ label: "Finish", value: item.finish, displayOrder: 2 });
    if (item.unit) specifications.push({ label: "Unit", value: item.unit, displayOrder: 3 });

    await CatalogueItem.create({
      name: item.name,
      slug,
      categoryId: categoryMap[item.category],
      summary: `${item.name} — quality product, ready for quotation.`,
      priceType: item.priceType,
      priceMin: item.priceMin ?? item.price ?? null,
      priceMax: item.priceMax ?? null,
      availability: "in_stock",
      specifications,
      isActive: true,
      isFeatured: Math.random() < 0.25, // roughly a quarter marked featured, for demo variety
    });
    console.log(`[seed:demo] Created item "${item.name}"`);
  }

  console.log(`[seed:demo] Done. ${DEMO_CATEGORIES.length} categories, ${DEMO_ITEMS.length} items (skipping any that already existed).`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed:demo] Failed:", err.message);
  process.exit(1);
});
