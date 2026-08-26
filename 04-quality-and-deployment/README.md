# Week 4: Quality and Deployment
**Business Catalogue Platform — SYNEXUS Software Technologies Internship**

This is the final milestone: automated tests, security hardening, demo data, and a path to
actual production deployment — completing the SRS's Definition of Done.

---

## What's New This Week

- **Automated tests**: 16 backend tests (Jest) + 10 frontend tests (Vitest), all passing. See
  [`TEST_REPORT.md`](./TEST_REPORT.md) for the full breakdown.
- **Security hardening**: Helmet (HTTP security headers), NoSQL injection protection
  (`express-mongo-sanitize`), and HTML/script sanitization on every user-submitted text field
  (category/item descriptions, inquiry messages) to close the XSS gap.
- **SEO basics completed**: `robots.txt` and a dynamic `sitemap.xml` that lists every active
  category and item.
- **Demo data seed script**: creates 3 realistic categories and 15 items in one command, per the
  SRS's final deliverable requirement.
- **Deployment-ready server**: `trust proxy` configuration for secure cookies behind a reverse
  proxy, and an optional single-service deployment mode (`SERVE_CLIENT=true`) that serves the
  built React app directly from Express.

---

## Setup Instructions

Same as Week 3, plus new dependencies:

```bash
cd 04-quality-and-deployment/server
npm install
cp .env.example .env
npm run seed:admin    # first time only, or if starting a fresh database
npm run seed:demo     # optional: populates 3 categories + 15 sample items
npm run dev
```

```bash
cd 04-quality-and-deployment/client
npm install
cp .env.example .env
npm run dev
```

### Running the tests

```bash
cd server && npm test
cd client && npm test
```

Both should report all tests passing. If you change any logic in `priceFormat.js`, `slugify.js`,
`sanitize.js`, or the `CatalogueItem` price validation, re-run these — they're designed to catch
regressions in exactly those spots.

---

## Deployment Guide

This section explains **how you would deploy this to a real, public URL** — the actual deploy
step is something you'll run yourself with your own hosting account, but every code-level
requirement for it is already in place.

### Option A — Two separate services (recommended for most cases)

1. **Database**: create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. Copy its
   connection string into `MONGO_URI` in your production `.env`.
2. **Backend**: deploy the `server/` folder to a Node hosting platform (e.g.
   [Render](https://render.com), Railway, or similar). Set these environment variables there:
   - `MONGO_URI` (your Atlas connection string)
   - `JWT_SECRET` (a long, random string — generate a new one, don't reuse the dev one)
   - `CLIENT_URL` (your deployed frontend's URL, e.g. `https://your-app.netlify.app`)
   - `NODE_ENV=production`
3. **Frontend**: deploy the `client/` folder to a static host (e.g. Netlify or Vercel). Set
   `VITE_API_BASE_URL` to your deployed backend's URL (e.g.
   `https://your-api.onrender.com/api`).
4. Both platforms provide HTTPS automatically — satisfying NFR-005.

### Option B — Single combined service

If you'd rather deploy one service instead of two:

1. Build the client: `cd client && npm run build` (creates `client/dist/`).
2. On your server host, set `SERVE_CLIENT=true` in the environment variables, alongside
   `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV=production`.
3. Deploy the whole `04-quality-and-deployment/` folder (both `client/` and `server/`) as one
   service, with the platform running `npm install && npm run build` in `client/` followed by
   `npm start` in `server/`.
4. The Express server will now serve the built React app directly, alongside the API.

### Post-deployment checklist

- [ ] Run `npm run seed:admin` once against the production database to create the first real
      admin account (with a strong password — not `ChangeMe123!`).
- [ ] Optionally run `npm run seed:demo` if you want sample content live immediately.
- [ ] Visit `/robots.txt` and `/sitemap.xml` on your deployed URL to confirm they're generating
      correctly.
- [ ] Test the full demo checklist from Weeks 2–3's READMEs against the live URL.
- [ ] Confirm HTTPS is active (no mixed-content warnings in the browser console).

---

## Tradeoffs and Notes

- **Deployment itself was not performed as part of this handoff** — I don't have hosting
  credentials to deploy on your behalf, so this README documents exactly how to do it yourself,
  with the code already prepared to support both common deployment patterns (separate services
  or combined). This is a genuine gap between "deployment-ready" and "deployed," worth being
  upfront about rather than claiming something that didn't happen.
- **Automated tests focus on pure logic**, not full API/database integration tests — see
  `TEST_REPORT.md`'s "Known Limitations" section for the reasoning and what a future iteration
  should add.
- **`sanitize-html` is pinned to an exact version (`2.11.0`)**, not a caret range — its newer
  releases pull in an ESM-only dependency that breaks under Jest's default CommonJS test runner.
  This is a real, somewhat obscure compatibility issue worth remembering if you ever update this
  package.

---

## Verification Performed Before Handoff

- [x] `node -c` syntax check passed on every server `.js` file.
- [x] Server's Express app module loads without runtime errors.
- [x] **16 backend tests passing** (`npm test` in `server/`).
- [x] **10 frontend tests passing** (`npm test` in `client/`).
- [x] `npm run build` succeeded in `client/` (128 modules, no errors).
