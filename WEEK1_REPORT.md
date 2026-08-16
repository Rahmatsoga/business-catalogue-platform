# Progress Report — Business Catalogue Website (Month 2, Week 1)
**Foundation and Design**

> Prepared by: SYNEXUS Development Intern
> Project: Business Catalogue Website (Month 2 — new project, separate from Month 1)
> Week: 1 of 4 — Foundation and Design
> Status: Complete — pending local verification and screenshots

---

## 1. Overview

This report covers Week 1 of the Business Catalogue Website project, an internship task at
SYNEXUS Software Technologies. The Business Catalogue Website is a brand-new, standalone
application (unrelated to the Month 1 Inventory Management System) that will allow a retail or
service business to publish a public product/service catalogue online, managed through a secure
admin panel.

Per the project's four-week development plan defined in the Software Requirements Specification
(SRS), Week 1 is scoped to **Foundation and Design**: establishing the codebase, database schema,
authentication system, base application layouts, and the business settings structure that later
weeks will build upon.

## 2. What Was Delivered This Week

### 2.1 Backend (Node.js + Express + MongoDB)

- Project scaffolding with `server/.gitignore` and `server/.env.example` created **before** any
  dependency installation, preventing accidental commits of secrets or `node_modules`.
- Mongoose schemas for all seven data entities defined in the SRS: `Administrator`,
  `BusinessSetting`, `Category`, `CatalogueItem`, `ItemImage`, `ItemSpecification`, and `Inquiry`.
- JWT-based authentication: login, logout, and session-check (`/me`) endpoints, with the token
  stored in an httpOnly cookie.
- Password security using bcrypt one-way hashing; password hashes are excluded from all API
  responses by default.
- Rate limiting on the login endpoint to reduce brute-force attack risk.
- An administrator seed script for provisioning the first admin account (no public
  self-registration, per the SRS's security model).
- Business Settings API: a public read endpoint and admin read/update endpoints, implemented as
  a single "singleton" settings document.
- A centralized error handler that logs details server-side but never leaks stack traces,
  secrets, or server paths to the client.

### 2.2 Frontend (React 18 + Vite)

- Vite pinned to the stable **5.x** release line (verified installed version `5.4.21`) to avoid a
  known native-binding crash in the latest major version on Windows.
- Two distinct layouts: a **Public layout** (header, navigation, footer) for visitors, and an
  **Admin layout** (sidebar navigation) for the management panel.
- An authentication context that tracks login state across the app, and a Protected Route
  component that redirects unauthenticated visitors away from admin pages.
- A fully functional **Login** page wired to the backend authentication API.
- A fully functional **Business Settings** page allowing the administrator to view and update
  business name, description, contact details, brand colors, and hero content.
- An **Admin Dashboard** shell, ready to display live summary data once catalogue and inquiry
  features exist.

## 3. Key Technical Concepts Applied

| Concept | Purpose in this project |
|---|---|
| Mongoose schema validation | Enforces required fields, formats, and uniqueness at the database layer before data is saved. |
| Embedded subdocuments | Item images and specifications are stored inside their parent catalogue item document, since they never exist independently of it. |
| Singleton document pattern | Business settings are constrained to exactly one record per deployment, matching the SRS's "one business per deployment" rule. |
| JWT stored in httpOnly cookie | Keeps the authentication token inaccessible to client-side JavaScript, reducing exposure to cross-site scripting attacks. |
| bcrypt password hashing | Ensures plain-text passwords are never stored; even a database breach would not expose usable credentials. |
| Express middleware | A reusable "gatekeeper" function that verifies a valid session before allowing access to admin-only routes. |
| React Context API | Shares authentication state across the frontend application without manually passing it through every component. |
| Protected client-side routing | Prevents unauthenticated users from viewing admin pages, complementing server-side route protection. |

## 4. Verification Performed

- Every backend JavaScript file was syntax-checked individually (`node -c`) with no errors.
- The Express application module was confirmed to load without runtime errors.
- The frontend production build (`npm run build`) completed successfully, compiling all React
  components without errors.
- The installed Vite version was confirmed to be within the required stable 5.x line.

A full server "connect and boot" test against a live MongoDB instance is pending local
verification, since the development sandbox used to prepare this code does not have MongoDB
installed. This will be confirmed once run locally against MongoDB Compass.

## 5. Explicitly Out of Scope This Week

The following SRS features are intentionally deferred to Weeks 2 and 3, per the project's
four-week development plan, and are **not** present in this week's deliverable:

- Category and catalogue item management (create/edit/delete/activate)
- Image upload and gallery management
- Public catalogue browsing, search, filtering, sorting, and pagination
- Customer inquiry forms, WhatsApp integration, and inquiry management
- Contact and About pages, and SEO metadata

## 6. Next Steps

Week 2 will focus on **Core Catalogue** functionality: category CRUD, catalogue item CRUD with
image upload, active/featured controls, and the public-facing category and catalogue browsing
pages, including search and pagination, as defined in the SRS's four-week development plan.

---

*End of Week 1 Progress Report.*
