# Test Report — Business Catalogue Platform

## Automated Tests

### Backend (Jest) — 16 tests, 3 suites, all passing

| Suite | What it covers |
|---|---|
| `sanitize.test.js` | HTML/script stripping from user-submitted text (XSS prevention) — script tags, `onerror` attributes, plain HTML tags, edge cases (null/undefined/empty string) |
| `slugify.test.js` | URL slug generation — lowercasing, special character stripping, collision handling (`-2`, `-3`...), excluding the current item when editing |
| `catalogueItemValidation.test.js` | The price-range business rule (max ≥ min) and the "every item needs a category" rule (BR-002), tested directly against the Mongoose schema |

Run with:
```bash
cd server
npm test
```

### Frontend (Vitest) — 10 tests, 1 suite, all passing

| Suite | What it covers |
|---|---|
| `priceFormat.test.js` | All five price display formats (fixed, range, starting-from, contact-for-price, hidden), plus the exact edge case that caused the Week 3 production bug: a price of exactly `0` must display as `$0.00`, not be treated as "no price set" |

Run with:
```bash
cd client
npm test
```

### Why these specific tests, and not more

Given the time available, automated tests were prioritized on **pure logic that doesn't require
a live database connection** — this makes them fast, reliable to run anywhere (including CI
pipelines later), and directly testable without extra setup. Broader end-to-end / API integration
tests (hitting real endpoints with a real database) were exercised **manually** instead, and are
documented below — this was a deliberate scope decision, not an oversight, given the one-month
timeline.

---

## Manual Testing (performed during Weeks 1–3, re-confirmed in Week 4)

The following flows were manually tested end-to-end in the browser against a real MongoDB
database, with real data, cross-checked for consistency across pages (e.g., item counts on the
Categories page matching the actual Items table):

- Administrator login, logout, and session persistence/expiry
- Category CRUD, including the "cannot delete a category with linked items" rule
- Catalogue item CRUD, including all five price types and specifications
- Image upload, primary image selection, and deletion
- Public catalogue browsing: search, category filtering, sorting, pagination
- Availability and price-range filtering
- Item detail pages, including related items
- General and item-specific inquiry submission
- Honeypot spam protection (manually verified a bot-like submission is silently rejected)
- WhatsApp deep-link generation with prefilled messages
- Copy-link sharing
- Admin dashboard live counts and recent inquiries feed
- Business Settings updates reflecting immediately on the public site

---

## Defects Found and Resolved

| Defect | Found During | Root Cause | Fix |
|---|---|---|---|
| Catalogue page showed "no items match" by default, even with active items in the database | Manual testing, Week 3 | Empty `priceMin`/`priceMax` query parameters were read as `0` rather than "not provided" (`Number("") === 0`, not `NaN`), silently filtering out every item with a real price | Explicit empty-string handling added on both backend and frontend; a regression test (`priceMin: 0` must still format correctly) was added in Week 4 to guard against this class of bug recurring |
| Image upload failed with `ENOENT` after a fresh install/extract | Manual testing, Week 3 | The `uploads/items/` folder is empty by default and isn't reliably preserved by every zip/extraction tool | Server now creates the upload directory itself on startup (`fs.mkdirSync` with `recursive: true`) instead of depending on an empty folder surviving distribution |
| Root README stopped rendering on GitHub ("Add a README" prompt shown instead of content) | Manual review, Week 3 | A manual file-replace step resulted in an empty file being committed | Correct content re-verified against the diff panel before committing (process fix, not a code fix) |

---

## Known Limitations

- **No automated end-to-end/API integration test suite.** Backend route-level tests (hitting
  real endpoints with Supertest against a live database) were not built this cycle due to time
  constraints; manual testing covered this ground instead. This is the clearest candidate for
  future investment if the project continues past the MVP stage.
- **No load/performance testing.** NFR-001/NFR-002 performance targets (page load times, 1,000+
  item catalogues) were not benchmarked; the architecture (indexed search, server-side
  pagination) is designed with this in mind, but it hasn't been measured under load.
- **No automated cross-browser testing.** Manual testing was performed in Chrome only; Firefox,
  Safari, and Edge should be spot-checked before any real production launch.
- **Password reset (FR-028) was not implemented** — marked "Should," not "Must," in the SRS, and
  was deprioritized in favor of completing all "Must" requirements first, per the SRS's own
  development priorities.

---

## Security Hardening Applied (Week 4)

- **Helmet** — sets standard protective HTTP response headers.
- **express-mongo-sanitize** — strips MongoDB operator characters (`$`, `.`) from all incoming
  request data, preventing NoSQL injection attempts.
- **sanitize-html** — strips all HTML/script tags from user-submitted text (category
  descriptions, item summaries/descriptions, and inquiry messages) before saving, closing the
  cross-site scripting (XSS) gap identified in the SRS's data validation requirements.
- **Rate limiting** — already in place since Week 1 (login) and Week 3 (inquiries); confirmed
  still active.
- **`trust proxy` configuration** — added for correct secure-cookie behavior when deployed
  behind a reverse proxy (required for most hosting platforms).
