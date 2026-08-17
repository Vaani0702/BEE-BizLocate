# BizLocate

**BizLocate** is an industrial real-estate matching platform prototype — it connects businesses looking for warehouse/manufacturing space with property owners listing those spaces, and scores how well each listing fits a business's stated requirements. Built as a fully client-side project: **no backend server, no database, no API** — every feature runs in the browser using `localStorage`.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Requirements to Run](#requirements-to-run)
3. [How to Run It](#how-to-run-it)
4. [Project Structure](#project-structure)
5. [Pages Overview](#pages-overview)
6. [Data Model (localStorage schema)](#data-model-localstorage-schema)
7. [Core Logic Explained](#core-logic-explained)
8. [JavaScript Function Reference](#javascript-function-reference)
9. [Design System](#design-system)
10. [External Dependencies (CDN)](#external-dependencies-cdn)
11. [Browser Compatibility](#browser-compatibility)
12. [Known Limitations](#known-limitations)
13. [Possible Future Improvements](#possible-future-improvements)
14. [Credits](#credits)

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Markup | **HTML5** | 10 static, hand-written `.html` pages — no templating engine, no server-side rendering |
| Styling | **Tailwind CSS** (via CDN Play script) | Utility-class framework; no build step, no `npm install`, no config file compiled — loaded directly in the browser |
| Fonts | **Google Fonts** — Hanken Grotesk, Inter | Loaded via `<link>` tags from `fonts.googleapis.com` |
| Icons | **Material Symbols Outlined** (Google Fonts icon font) | Icons are just special characters/ligatures rendered by a downloaded font — not images, not an icon library like FontAwesome |
| Logic | **Vanilla JavaScript (ES6+)** | One shared `script.js` file, no framework (no React/Vue/Angular), no bundler, no transpiler |
| Data storage | **Browser `localStorage`** | Acts as the entire "database" — see [Data Model](#data-model-localstorage-schema) |
| Backend | **None** | There is no server, no REST API, no GraphQL, no database. Nothing is transmitted anywhere except the initial page/asset downloads (HTML/CSS/JS files + fonts + property images) |

**In one sentence:** this is a static front-end-only web app — three file types (HTML, CSS, JS) plus a CSS framework loaded from a CDN, with the browser's built-in storage standing in for a real backend.

---

## Requirements to Run

Because there is no backend, the requirements are minimal:

- A modern web browser (Chrome, Edge, Firefox, or Safari — anything from the last ~5 years)
- An internet connection **the first time each page loads**, so the browser can download:
  - Tailwind CSS from `cdn.tailwindcss.com`
  - Fonts from `fonts.googleapis.com` / `fonts.gstatic.com`
  - The property photos (hosted externally)
- No Node.js, no npm, no build tools, no server software, no database software are required to run the site.

> If you need the site to work fully offline / with zero external dependencies, the CDN links (Tailwind + Google Fonts) would need to be replaced with local files — this version intentionally uses the CDN approach for simplicity.

---

## How to Run It

**Option 1 — Just open it**
Double-click `index.html` (or any page) and it opens directly in your browser via a `file://` URL. Every feature works this way because there's no server-side code.

**Option 2 — Local static server (optional, but recommended)**
Some browsers restrict certain behaviors on `file://` pages. If anything looks off, serve the folder locally:

```bash
# Python 3 (built into most systems)
python3 -m http.server 8000

# then open:
http://localhost:8000/index.html
```

or with Node.js:
```bash
npx serve .
```

No installation of project-specific dependencies is needed either way — there is no `package.json`, no `node_modules`.

---

## Project Structure

```
BizLocate/
├── index.html            → Landing page (hero, search bar, "How it works")
├── login.html             → Login form
├── signup.html            → Signup form (choose Business or Owner role)
├── business-form.html     → Business requirements form (sqft, power, budget, location)
├── owner-form.html        → Property listing form (for owners)
├── listings.html           → Browse/filter/sort all property listings
├── property-detail.html   → Full detail view of a single listing (reads ?id= from URL)
├── wishlist.html           → Saved/bookmarked listings for the logged-in user
├── profile.html            → User dashboard (stats, owned listings, logout)
├── enquiries.html          → Enquiry inbox (sent/received, status tabs)
├── style.css               → Shared custom CSS (used alongside Tailwind utility classes)
└── script.js               → All application logic (auth, matching, storage, rendering)
```

12 files total — **2,288 lines of code** across all HTML, CSS, and JS combined.

---

## Pages Overview

| Page | Purpose | Requires Login? |
|---|---|---|
| `index.html` | Marketing/landing page, hero search, hub cards, "How it works" | No |
| `login.html` | Sign in with email + password | No |
| `signup.html` | Create account, choose role (Business / Owner) | No |
| `business-form.html` | Business submits space requirements (used for match scoring) | Yes |
| `owner-form.html` | Owner submits a new property listing | Yes |
| `listings.html` | Grid of all listings with filters (price, area, power), sort, and search | No (browsing), Yes (to save/enquire) |
| `property-detail.html` | Full specs for one listing, Enquire button, Save to Wishlist | Partial |
| `wishlist.html` | Shows listings the current user has bookmarked | Yes |
| `profile.html` | Dashboard: user info, stats (listings/wishlist/enquiries count), manage own listings | Yes |
| `enquiries.html` | Inbox of enquiries sent (as a business) or received (as an owner), with status tabs | Yes |

---

## Data Model (localStorage schema)

All data is stored as JSON strings under these keys in `localStorage`:

| Key | Shape | Description |
|---|---|---|
| `bizlocate_users` | `Array<User>` | All registered accounts |
| `bizlocate_current_user_id` | `string` | ID of the currently logged-in user (session) |
| `bizlocate_listings` | `Array<Listing>` | All property listings (6 are seeded on first load) |
| `bizlocate_requirements` | `{ [userId]: Requirement }` | Each business user's saved space requirements |
| `bizlocate_wishlist` | `{ [userId]: number[] }` | Listing IDs each user has bookmarked |
| `bizlocate_enquiries` | `Array<Enquiry>` | All enquiries sent between businesses and owners |

**`User` object:**
```js
{ id, name, email, password, role }   // role: "business" | "owner"
```

**`Listing` object:**
```js
{
  id, title, type, location, area, rent, power, height, docks,
  flooring, zoning, truckAccess, grade, status, ownerId, ownerName,
  description, image
}
```

**`Requirement` object (per business user):**
```js
{ business_type, sqft, power, budget, location, truckAccess, savedAt }
```

**`Enquiry` object:**
```js
{
  id, listingId, listingTitle, listingLocation, listingImage,
  businessUserId, businessName, ownerId, message, status, date
}
// status: "Pending" | "Responded" | "Scheduled"
```

> ⚠️ Passwords are stored in **plain text** in `localStorage`. This is acceptable only because it's a local learning project — never do this in a real, deployed application.

---

## Core Logic Explained

### Authentication
Simple email/password check against the `bizlocate_users` array. On success, the user's `id` is saved as the "session" in `bizlocate_current_user_id`. No tokens, no cookies, no encryption — `logout()` just deletes that key.

### The Matching Algorithm
`calculateMatch(listing, requirement)` compares a listing against a business's saved requirement across **4 factors, worth 25 points each** (100 total):

1. Is the listing's area ≥ the business's minimum sqft?
2. Is the listing's rent ≤ the business's max budget?
3. Is the listing's power capacity ≥ the business's power need?
4. Does the listing's location contain the business's preferred location text?

The resulting score renders as a **"XX% Match"** badge on listing cards.

### Wishlist
A simple array of listing IDs stored per user. `toggleWishlist()` adds/removes an ID and re-renders whichever page is currently showing cards.

### Enquiries
When a business clicks "Book Viewing" / "Enquire Now," `submitEnquiry()` creates an enquiry record and — to simulate a real async network request (even though nothing actually goes over the network) — delays saving it with `setTimeout()`, showing a "Sending..." toast first.

### Filtering & Sorting (listings.html)
Pure JavaScript array `.filter()` and `.sort()` — no server-side pagination or query. Filters read directly from the DOM inputs (price range, area checkboxes, power dropdown, search box) every time they change.

---

## JavaScript Function Reference

All functions live in the single `script.js` file, grouped by responsibility:

| Category | Key Functions |
|---|---|
| Storage helpers | `getData()`, `setData()` |
| Notifications | `showToast()`, `ensureToastContainer()` |
| Seed data | `seedListingsIfEmpty()` |
| Auth | `getUsers()`, `findUserByEmail()`, `getCurrentUser()`, `setCurrentUser()`, `logout()`, `requireLogin()`, `handleSignup()`, `handleLogin()` |
| Nav UI | `renderNavAuth()`, `highlightActiveNav()` |
| Business form | `handleBusinessForm()`, `getRequirementFor()` |
| Owner form | `handleOwnerForm()` |
| Matching | `calculateMatch()` |
| Wishlist | `getWishlist()`, `isWishlisted()`, `toggleWishlist()` |
| Enquiries | `submitEnquiry()`, `updateEnquiryStatus()`, `buildEnquiryRow()`, `renderEnquiries()`, `initEnquiriesPage()` |
| Listings | `buildListingCard()`, `getListingFilters()`, `listingMatchesFilters()`, `renderListings()`, `initListingsPage()` |
| Property detail | `renderPropertyDetail()` |
| Profile/dashboard | `buildOwnerListingRow()`, `deleteListing()`, `renderProfile()` |
| Wishlist page | `renderWishlist()` |
| Visual effects | `initScrollReveal()` |
| Page init | `initIndexCtas()`, and a single `DOMContentLoaded` listener at the bottom that wires up whichever elements exist on the current page |

**JavaScript concepts used:** `const`/`let`, arrow functions, default parameters, closures, template literals, array methods (`map`, `filter`, `find`, `sort`, `reduce`-style patterns), `localStorage` API, `URLSearchParams`, `setTimeout` for simulated async behavior, event delegation via `addEventListener`, and DOM manipulation (`getElementById`, `querySelectorAll`, `innerHTML`, `classList`).

---

## Design System

- **Primary color:** Blue (`blue-700`/`blue-800`/`blue-950` in Tailwind)
- **Accent color:** Orange (`orange-500`/`orange-600`) — used for all primary call-to-action buttons
- **Success color:** Green — "Available" status badges
- **Typography:** Hanken Grotesk (headings/body), Inter (some UI text)
- **Icons:** Material Symbols Outlined font (e.g. `favorite`, `location_on`, `bolt`)
- **Components reused across pages:** navbar (logo + nav links + auth state), footer, listing cards, badges (`badge-premium`, `badge-available`, `badge-match`, `badge-draft`), toast notifications

---

## External Dependencies (CDN)

These are the **only** things loaded from the internet — all are static assets, none of them are APIs that send or receive your data:

| Resource | URL | What it provides |
|---|---|---|
| Tailwind CSS | `cdn.tailwindcss.com` | The utility-class CSS framework |
| Hanken Grotesk / Inter fonts | `fonts.googleapis.com` | Text typefaces |
| Material Symbols Outlined | `fonts.googleapis.com` | Icon font |
| Property photos | `lh3.googleusercontent.com`, `picsum.photos` | Static demo images used in seed listing data |

No API keys, no authentication tokens, and no environment variables are required for any of these — they're all public, unauthenticated resources fetched the same way an `<img>` tag fetches a picture.

---

## Browser Compatibility

Works in any browser supporting:
- ES6 JavaScript (arrow functions, `const`/`let`, template literals) — all browsers since ~2016
- `localStorage` — supported everywhere except very old browsers
- CSS Flexbox/Grid — all modern browsers

Not tested on Internet Explorer (and won't work, since IE doesn't support the JS syntax used).

---

## Known Limitations

- **Data is per-browser, per-device.** Since everything lives in `localStorage`, clearing browser data (or opening the site in a different browser/incognito window) wipes all accounts, listings, and enquiries.
- **No real authentication security.** Passwords aren't hashed; anyone with access to dev tools can read them directly from `localStorage`.
- **No multi-user sync.** Two people on different computers can't see each other's data — there's no shared backend.
- **Image uploads aren't supported** — owners paste an image URL rather than uploading a file, since there's no server to store files on.

---

## Possible Future Improvements

- Replace `localStorage` with a real backend (Node/Express + database) and REST or GraphQL API
- Add password hashing and real session/token-based authentication
- Support image file uploads instead of URLs
- Add pagination for large numbers of listings
- Add a real map integration for the "Location" section on property detail pages
- Move Tailwind from the CDN "Play" script to a proper compiled build for production use

---

## Credits

- **Fonts:** Hanken Grotesk & Inter — Google Fonts
- **Icons:** Material Symbols — Google Fonts
- **CSS Framework:** Tailwind CSS
- **Everything else** (HTML structure, CSS custom rules, all JavaScript logic, matching algorithm, data model): hand-written for this project.
