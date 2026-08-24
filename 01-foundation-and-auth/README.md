# Month 2 — Week 1: Foundation and Design
**Business Catalogue Website — SYNEXUS Software Technologies Internship**

This is a brand-new project (not a continuation of Month 1's inventory system). This week builds
the **foundation only**: repo structure, database schema, admin authentication, base public/admin
layouts, and a working Business Settings screen. Categories, catalogue items, public browsing,
and inquiries are **not** built yet — those come in Weeks 2 and 3.

---

## What Works Right Now

- Admin can log in / log out (JWT stored in an httpOnly cookie).
- Admin dashboard shell (placeholder counts — becomes real data in Week 2/3).
- Admin can view and update **Business Settings** (name, description, contact info, colors, hero text).
- Public homepage placeholder (real content in Week 2/3).
- All 7 database models exist (`Administrator`, `BusinessSetting`, `Category`, `CatalogueItem`,
  `ItemImage`/`ItemSpecification` as embedded subdocuments, `Inquiry`), even though only
  `Administrator` and `BusinessSetting` have working CRUD this week — the rest are ready for
  Week 2/3's routes.

## What's Deliberately NOT Built Yet

- Category/Item CRUD, image upload, public catalogue browsing, search/filter — **Week 2**.
- Inquiry forms, WhatsApp inquiry, contact/about pages, SEO — **Week 3**.
- Password reset (marked "Should" in the SRS, not "Must") — can be added later.

---

## Project Structure

```
Month2_Week1_Task/
├── server/                 Express + MongoDB API
│   ├── src/
│   │   ├── config/db.js           Mongo connection
│   │   ├── models/                Mongoose schemas (all 7 entities)
│   │   ├── middleware/auth.js     JWT cookie verification
│   │   ├── controllers/           login/logout/settings logic
│   │   ├── routes/                authRoutes, settingsRoutes
│   │   ├── utils/seedAdmin.js     one-time admin creation script
│   │   └── app.js                 Express app (middleware + route mounting)
│   ├── server.js            entry point
│   ├── .env.example
│   └── .gitignore
└── client/                 React 18 + Vite 5.x
    └── src/
        ├── api/axiosClient.js     axios instance (withCredentials: true)
        ├── context/AuthContext.jsx
        ├── components/ProtectedRoute.jsx
        ├── layouts/PublicLayout.jsx, AdminLayout.jsx
        ├── pages/public/Home.jsx
        ├── pages/admin/Login.jsx, Dashboard.jsx, Settings.jsx
        └── App.jsx
```

---

## Setup Instructions (Windows, VS Code, MongoDB Compass)

### 1. Server

```bash
cd Month2_Week1_Task/server
npm install
copy .env.example .env
```

Open `.env` and adjust if needed (defaults already point at your local MongoDB Compass instance):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/synexus_catalogue
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=ChangeMe123!
```

Make sure MongoDB Compass / your local `mongod` is running, then create the first admin account:

```bash
npm run seed:admin
```

You should see `[seed] Created administrator "admin@example.com". ...`. Then start the server:

```bash
npm run dev
```

You should see `[db] Connected to MongoDB` and `[server] Business Catalogue API running on http://localhost:5000`.

### 2. Client

```bash
cd Month2_Week1_Task/client
npm install
copy .env.example .env
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

- Visit `/` — public homepage placeholder.
- Visit `/admin/login` — log in with the seeded admin email/password.
- After login you land on `/admin/dashboard`, and can visit `/admin/settings` to edit business info.

---

## Environment Variables Reference

**server/.env**
| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign/verify login tokens — keep this private |
| `JWT_EXPIRES_IN` | How long a login session lasts |
| `CLIENT_URL` | Used for CORS — must match your Vite dev server URL |
| `NODE_ENV` | `development` locally; `production` on deployment (enables secure cookies) |
| `SEED_ADMIN_*` | Only read by `npm run seed:admin`, to create the first admin |

**client/.env**
| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL the frontend calls for the API |

---

## API Documentation (Week 1 scope)

All responses follow `{ success: boolean, data?, message? }`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Log in with email/password, sets httpOnly cookie |
| POST | `/api/auth/logout` | Admin | Clears the session cookie |
| GET | `/api/auth/me` | Admin | Returns the logged-in admin's info (used to check session on page load) |
| GET | `/api/public/settings` | Public | Read business settings |
| GET | `/api/admin/settings` | Admin | Read business settings (admin view) |
| PUT | `/api/admin/settings` | Admin | Update business settings |
| GET | `/api/health` | Public | Simple health check |

---

## Demo Walkthrough Checklist

1. Start server (`npm run dev` in `server/`) — confirm `[db] Connected to MongoDB` in the terminal.
2. Start client (`npm run dev` in `client/`).
3. Visit `http://localhost:5173/` — homepage placeholder loads.
4. Visit `/admin/dashboard` directly **without logging in** — confirm it redirects you to `/admin/login` (this proves route protection works).
5. Log in with the seeded admin credentials — confirm you land on the dashboard.
6. Go to Settings, change the Business Name and a color, click Save — confirm the green "Settings saved successfully" message appears.
7. Refresh the page — confirm your changes persisted (proves it's really saved in MongoDB, not just local state).
8. Click Logout — confirm you're sent back to the login page.
9. Try visiting `/admin/dashboard` again after logout — confirm it redirects to login again.
10. In MongoDB Compass, open the `synexus_catalogue` database and confirm you can see the `administrators` and `businesssettings` collections with your data.

---

## Tradeoffs and Notes

- **ItemImage / ItemSpecification are embedded subdocuments**, not separate collections, even
  though the SRS lists them as entities with their own `id`. They always belong to exactly one
  item and are always read together with it, so embedding avoids unnecessary joins — a normal
  Mongoose pattern for tightly-coupled parent/child data. Each subdocument still gets its own
  MongoDB-generated `_id`.
- **BusinessSetting is a "singleton" document** — the SRS says "one settings record per
  deployment," so instead of a full CRUD API we lock it to exactly one document using a fixed
  key, and only expose read/update endpoints (no create/delete).
- **Categories and Items are not yet wired into routes this week** — their Mongoose schemas exist
  (with indexes for search planned in Week 2) so the database structure is ready, but the
  controllers/routes are deliberately deferred to match the SRS's own four-week plan.
- **Rate limiting is only on `/api/auth/login` this week** (brute-force protection). The
  inquiry-form rate limiting (FR-024) will be added in Week 3 alongside the inquiry endpoints.
- **Vite is pinned to `^5.4.11`**, not the latest major version, per your note about the Windows
  native-binding crash.

---

## Verification Performed Before Handoff

- [x] `node -c` syntax check passed on every server `.js` file.
- [x] Server's Express app module loads without runtime errors (`require("./src/app")` succeeds).
      *A full connect-and-listen boot test needs your local MongoDB — please confirm you see
      `[db] Connected to MongoDB` when you run `npm run dev`.*
- [x] `npm run build` succeeded in `client/` (100 modules transformed, no errors).
- [x] Confirmed installed Vite version is `5.4.21` (within the pinned 5.x line, not the crashing latest major).
