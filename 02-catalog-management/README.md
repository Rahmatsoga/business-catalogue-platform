# Month 2 — Week 2: Core Catalogue
**Business Catalogue Website — SYNEXUS Software Technologies Internship**

This week extends Week 1's foundation (auth, layouts, business settings) with the actual
catalogue: category management, item management with image uploads, and the public browsing
experience (grid, search, pagination, category filtering, item detail pages).

---

## What's New This Week

**Backend**
- Full Category CRUD (create/edit/delete, with the "can't delete a category that still has items
  or subcategories" rule from BR-007).
- Full CatalogueItem CRUD, including all five price display types, tags, and specifications.
- Image upload for items via Multer (JPEG/PNG/WebP only, 5MB max per file, random filenames so
  nothing can be guessed or overwritten) — with reorder-to-primary and delete.
- Public browsing endpoints: category listing (with live item counts), item search + pagination,
  category-filtered item listing, single item detail with related items.
- Automatic, collision-safe slug generation for both categories and items.

**Frontend**
- Admin: Categories page (table + modal form + activate/deactivate + delete).
- Admin: Items page (searchable/filterable table + delete + quick feature/activate toggles).
- Admin: Item form (core fields, price-type-aware pricing fields, dynamic specification rows,
  image gallery manager with "set primary" and delete).
- Public: Catalogue page with search and pagination, using the URL itself to hold state
  (`useSearchParams`) so refreshing or sharing a link keeps your search and page.
- Public: Categories page and single Category page (filtered grid).
- Public: Item Detail page with an image gallery, price display, specifications table, and
  related items.
- Homepage now pulls in real featured categories and featured items.

## What's Still Not Built (by design — Week 3)

- Inquiry forms (general + item-specific), WhatsApp inquiry, inquiry admin management.
- Filters beyond category (availability, featured, price range) and sorting.
- Contact and About pages, SEO metadata, share links.

---

## Project Structure (new/changed files only)

```
Month2_Week2_Task/
├── server/src/
│   ├── utils/slugify.js              slug generation with uniqueness checking
│   ├── middleware/upload.js          Multer config (file type/size validation)
│   ├── controllers/categoryController.js
│   ├── controllers/itemController.js
│   └── routes/categoryRoutes.js, itemRoutes.js
├── server/uploads/items/             uploaded product images live here (gitignored)
└── client/src/
    ├── pages/admin/Categories.jsx, CategoryFormModal.jsx
    ├── pages/admin/Items.jsx, ItemForm.jsx
    ├── pages/public/Catalogue.jsx, Categories.jsx, CategoryPage.jsx, ItemDetail.jsx
    ├── components/ItemCard.jsx
    └── utils/priceFormat.js
```

---

## Setup Instructions

Same as Week 1, plus:

1. Copy `.env.example` → `.env` in both `server/` and `client/` if you haven't already.
2. `npm install` in `server/` (this pulls in the two new packages: `multer` and `slugify`).
3. `npm install` in `client/` (no new packages this week — same dependencies as Week 1).
4. Run `npm run seed:admin` again **only if** you're starting from a fresh database — if you
   already have an admin account from Week 1, skip this.
5. Start both servers as before (`npm run dev` in each folder).

No new environment variables were added this week.

---

## API Documentation (Week 2 additions)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/public/categories` | Public | List active categories with item counts |
| GET | `/api/public/items` | Public | Search/paginate active items (`?search=&category=&page=&featured=`) |
| GET | `/api/public/items/:slug` | Public | Single item + related items |
| GET | `/api/admin/categories` | Admin | List all categories (including inactive) |
| POST | `/api/admin/categories` | Admin | Create a category |
| PUT | `/api/admin/categories/:id` | Admin | Update a category |
| DELETE | `/api/admin/categories/:id` | Admin | Delete a category (blocked if it has items/subcategories) |
| GET | `/api/admin/items` | Admin | Search/filter/paginate all items (`?search=&category=&status=&page=`) |
| GET | `/api/admin/items/:id` | Admin | Full item record for editing |
| POST | `/api/admin/items` | Admin | Create an item |
| PUT | `/api/admin/items/:id` | Admin | Update an item |
| DELETE | `/api/admin/items/:id` | Admin | Delete an item (also removes its stored images) |
| PATCH | `/api/admin/items/:id/status` | Admin | Toggle `isActive` / `isFeatured` |
| POST | `/api/admin/items/:id/images` | Admin | Upload one or more images (multipart form, field name `images`) |
| DELETE | `/api/admin/items/:id/images/:imageId` | Admin | Remove one image |
| PATCH | `/api/admin/items/:id/images/:imageId/primary` | Admin | Set an image as primary |

---

## Demo Walkthrough Checklist

1. Log into the admin panel. Go to **Categories** → Add Category (e.g. "Tiles"). Confirm it appears in the table.
2. Go to **Items** → Add Item. Fill in name, pick the category you just made, choose a price type
   (try "Price Range" to see the two price fields appear), save.
3. You should land back in edit mode automatically — upload 2–3 images. Confirm the first one is
   marked "Primary." Try "Set Primary" on a different one.
4. Add a couple of specifications (e.g. Color → White, Size → 30x30cm). Save changes.
5. Go to the public site → **Categories** → click "Tiles" → confirm your item appears with its
   primary image and price.
6. Click into the item → confirm the full detail page shows the gallery, specs table, and price.
7. Go to **Catalogue** → search for part of your item's name → confirm it's found.
8. Back in the admin **Items** table, click "Deactivate" on the item → confirm it disappears from
   the public catalogue and its detail page now 404s.
9. Try deleting the "Tiles" category while the item is still assigned to it → confirm you get a
   clear error instead of a silent failure or broken data.
10. Delete the item, then delete the category → both should now succeed.
11. Add 13+ items to one category and confirm pagination controls appear and work correctly.

---

## Tradeoffs and Notes

- **Only category filtering + search + pagination are live on the public catalogue this week.**
  Availability/featured/price-range filters and all sort options are explicitly Week 3 work per
  the SRS's own four-week plan (`FR-010` partial, `FR-011` deferred).
- **MongoDB `$text` index search** is used for FR-009 (name/summary/description/tags). This is a
  simpler, "good enough for an MVP" approach — it doesn't do fuzzy/typo-tolerant matching, but it
  is fast and doesn't require an external search service.
- **Multer is pinned to the 2.x line**, not 1.x — npm flagged 1.x as having known vulnerabilities
  during install, so it was upgraded before writing any code against it (same file-type/size
  validation API either way).
- **Image files are stored on local disk** (`server/uploads/items/`), not cloud storage. This
  matches the SRS's MVP scope but is worth flagging for the "Deployment" tradeoffs conversation
  in Week 4 — a production deployment would want persistent storage that survives redeploys.
- **New item images can only be uploaded after the item is first saved** (an image needs a real
  item `_id` to attach to). The form handles this by redirecting into "edit mode" immediately
  after creating a new item.

---

## Verification Performed Before Handoff

- [x] `node -c` syntax check passed on every server `.js` file (including all Week 2 additions).
- [x] Server's Express app module loads without runtime errors.
- [x] `npm run build` succeeded in `client/` (118 modules transformed, no errors).
- [x] Multer upgraded to the patched 2.x release after npm flagged 1.x vulnerabilities.
      *As with Week 1, a full connect-and-boot test against a live database needs your local
      MongoDB — please confirm `[db] Connected to MongoDB` appears when you run `npm run dev`.*
