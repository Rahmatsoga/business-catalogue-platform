# Week 3: Inquiries and Completion
**Business Catalogue Platform — SYNEXUS Software Technologies Internship**

This week completes the MVP feature set: customer inquiries (WhatsApp, general form, item-specific
form), spam protection, a live admin dashboard, Contact/About pages, catalogue filtering and
sorting, and SEO basics.

---

## What's New This Week

**Backend**
- Public inquiry submission endpoint with a honeypot spam trap and rate limiting.
- Admin inquiry management: list (paginated, filterable by status), status updates, delete.
- Dashboard summary endpoint: live counts (active/inactive items, categories, new inquiries) plus
  the 5 most recent inquiries — powers the admin Dashboard for real.
- Public item browsing now supports **sorting** (latest, name A–Z/Z–A, price low–high/high–low)
  and additional **filters** (availability, featured, price range) alongside Week 2's search and
  category filter.

**Frontend**
- Public **Contact** page: business info, working hours, embedded map, and a general inquiry form.
- Public **About** page: business description pulled from Settings.
- Item Detail page now has a **WhatsApp button** (opens a chat with a prefilled message), a
  **Copy Link** share button, and an **item-specific inquiry form**.
- Catalogue page now has **sort and filter controls** (availability, featured, price range),
  all reflected in the URL so links/refreshes preserve your view.
- Admin **Inquiries** page: expandable list, status dropdown (New/Contacted/Resolved/Spam), delete.
- Admin **Dashboard** now shows real counts and a live "Recent Inquiries" list with quick-action
  shortcuts.
- Admin **Settings** page gained an SEO section (default page title, meta description).
- The header (business name), and footer (address/phone/email) are now pulled live from Business
  Settings instead of being hardcoded as "My Business."

## What's Still Not Built (intentionally — Week 4 territory)

- Automated test suite (unit/integration tests) — Week 4's "Quality" focus.
- Production deployment / HTTPS.
- Password reset flow (marked "Should" in the SRS, still optional).

---

## Project Structure (new/changed files only)

```
Week3_Task/
├── server/src/
│   ├── controllers/inquiryController.js
│   ├── controllers/dashboardController.js
│   ├── routes/inquiryRoutes.js, dashboardRoutes.js
│   └── controllers/itemController.js       (updated: sort + filters)
└── client/src/
    ├── context/BusinessSettingsContext.jsx  (shares settings across public pages)
    ├── components/InquiryForm.jsx, WhatsAppButton.jsx
    ├── pages/public/Contact.jsx, About.jsx
    ├── pages/public/ItemDetail.jsx          (updated: WhatsApp/share/inquiry)
    ├── pages/public/Catalogue.jsx           (updated: sort/filter controls)
    ├── pages/admin/Inquiries.jsx
    ├── pages/admin/Dashboard.jsx            (updated: live data)
    └── pages/admin/Settings.jsx             (updated: SEO fields)
```

---

## Setup Instructions

Same as Week 2 — no new packages this week (rate limiting reuses the `express-rate-limit`
dependency already installed in Week 1).

```bash
cd Week3_Task/server
npm install
npm run dev
```
```bash
cd Week3_Task/client
npm install
npm run dev
```

No new environment variables were added.

---

## API Documentation (Week 3 additions)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/public/inquiries` | Public (rate-limited) | Submit a general or item-specific inquiry |
| GET | `/api/admin/inquiries` | Admin | List inquiries (`?status=&page=`) |
| PATCH | `/api/admin/inquiries/:id/status` | Admin | Update an inquiry's status |
| DELETE | `/api/admin/inquiries/:id` | Admin | Delete an inquiry |
| GET | `/api/admin/dashboard/summary` | Admin | Live counts + 5 most recent inquiries |
| GET | `/api/public/items` | Public | *(updated)* now also accepts `sort`, `availability`, `featured`, `priceMin`, `priceMax` |

---

## Demo Walkthrough Checklist

1. On the public site, go to **Contact** → confirm your business info, working hours, and map
   (if you set a Map URL) all display correctly.
2. Submit the general inquiry form on the Contact page → confirm the success message appears.
3. Go to **Admin → Inquiries** → confirm your submission shows up with status "New."
4. Click the inquiry to expand it → change its status to "Contacted" → confirm the badge updates.
5. Go to an item's detail page → click **Chat on WhatsApp** → confirm it opens WhatsApp (web or
   app) with a prefilled message containing the item name.
6. On the same item page, click **Copy Link** → confirm the button briefly says "Link Copied!"
   and paste it somewhere to confirm it's the correct URL.
7. Submit the item-specific inquiry form on that page → go back to **Admin → Inquiries** →
   confirm this new inquiry shows "re: [item name]" next to it.
8. Go to **Catalogue** → try each sort option → confirm the order changes correctly.
9. Filter by **Availability: In Stock** and then by **Featured only** → confirm results narrow
   correctly; combine both with a price range and click Apply.
10. Go to **Admin → Dashboard** → confirm the four summary numbers match what's actually in your
    database, and your test inquiry appears in "Recent Inquiries."
11. Go to **Admin → Settings** → fill in the SEO Title/Description fields, save, then view the
    browser tab title on the public site — it should now reflect your SEO Title.
12. Test the spam protection: open your browser's dev tools, find the hidden "website" field in
    the inquiry form's HTML, and manually give it a value before submitting — confirm the
    inquiry does *not* appear in the admin Inquiries list (it should silently succeed on the
    frontend but never save).

---

## Tradeoffs and Notes

- **No third-party CAPTCHA service** (like reCAPTCHA) was integrated — the SRS explicitly allows
  "CAPTCHA **or** honeypot," and a honeypot avoids adding an external dependency/API key for an
  MVP. This can be swapped in later if spam becomes a real problem in production.
- **Price range filtering only considers `priceMin`.** Items priced "Contact for Price" or
  "Hidden" have no number to compare against, so they're correctly excluded whenever a price
  filter is active — this matches BR-006 (non-numeric price types are valid) without pretending
  those items have a price they don't.
- **The WhatsApp button only appears if a WhatsApp number is configured in Settings** — this
  respects BR-005 (at least one contact method required) without assuming WhatsApp specifically
  is always available.
- **SEO is "basics" as scoped**: default page title and meta description are applied globally
  from Settings. Per-page dynamic meta tags (e.g., a unique title per catalogue item) were judged
  out of scope for the MVP's remaining time and would be a reasonable Week 4+ enhancement.

---

## Verification Performed Before Handoff

- [x] `node -c` syntax check passed on every server `.js` file (including all Week 3 additions).
- [x] Server's Express app module loads without runtime errors.
- [x] `npm run build` succeeded in `client/` (128 modules transformed, no errors).
      *As with prior weeks, a full connect-and-boot test against a live database needs your local
      MongoDB — please confirm `[db] Connected to MongoDB` appears when you run `npm run dev`.*
