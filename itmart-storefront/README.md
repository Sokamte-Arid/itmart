# IT Mart — Storefront

Next.js 16 + TailwindCSS public storefront for the IT Mart catalog: browsing, search, filters, cart, and checkout via the WhatsApp + email order flow.

## Why Next.js (not plain React/Vite like the admin dashboard)

The admin dashboard is only used by admins, so a plain client-rendered React app was the simpler choice there. The storefront needs to be **found by customers on Google** and needs **rich link previews when product links are shared on WhatsApp** (the exact channel the checkout flow is built around) — both require server-rendered/pre-rendered HTML with real `<title>`, description, and Open Graph tags per page, which a plain client-rendered SPA can't provide. Next.js's App Router handles this natively.

## ⚠️ Built on Next.js 16 — read this if something looks unfamiliar

This project was scaffolded with the current Next.js version at build time, which has real breaking changes from older Next.js patterns you may be used to or find in older tutorials:
- `params` and `searchParams` in pages are **Promises** — always `await` them (see `products/[slug]/page.js` and `products/page.js`)
- `cookies()` (from `next/headers`) is **async** — always `await cookies()` (see `lib/i18n.js`)
- `fetch()` is **not cached by default** — caching is explicit via `next: { revalidate }` (see `lib/api.js`)

If you extend this project, check `node_modules/next/dist/docs/` for the exact current API before assuming an older pattern still applies — Next.js has moved fast across versions.

## Features

- **Home page**: hero, category grid, best sellers row, discounts row
- **Product listing** (`/products`): search results, category/brand filters, price range, dynamic category-specific spec filters, sorting, pagination
- **Product detail** (`/products/[slug]`): image gallery, pricing (with discount display), specifications table, sibling variant links, related products
- **Cart**: persisted in localStorage, quantity controls
- **Checkout**: customer info form → order created in the backend → redirected to WhatsApp (pre-filled message to the admin) → confirmation page. Handles stock-conflict errors from the backend gracefully (shown per-item if a quantity exceeds available stock)
- **Order tracking** (`/track`): look up an order by its reference number
- **Bilingual** (FR/EN): cookie-based, toggle in the header, defaults to French for the Cameroon market
- **SEO**: per-page metadata, Open Graph tags (product pages include the product image for WhatsApp/social link previews), `sitemap.xml`, `robots.txt`

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
`.env` already points to the local backend by default:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_ORIGIN=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Update `NEXT_PUBLIC_SITE_URL` to your real domain once deployed (used in metadata and the sitemap).

### 3. Make sure the backend is running
This is a pure frontend — it needs `itmart-backend` running and migrated (see that project's README), ideally seeded (`npm run seed`) so there's catalog data to browse.

### 4. Run the dev server
```bash
npm run dev
```
Opens on `http://localhost:3000`.

### 5. Build for production
```bash
npm run build
npm run start
```

## Notes

- **Resilient to backend downtime**: if the backend is unreachable, pages degrade gracefully (empty states) instead of crashing — this was deliberately built in and verified by testing with the backend offline.
- **The cart** is per-browser (localStorage), not tied to a customer account — there's no login for customers, matching the "no online payment, contact to order" model we designed.
- **Language** is stored in a cookie (`itmart_lang`), read server-side for the initial render and client-side for the interactive bits (cart, checkout, tracking, search suggestions).
- **Stock validation** happens server-side at order creation — if someone's cart has more of an item than is currently in stock (e.g., stock changed since they added it), the checkout page shows exactly which items and available quantities.

## This completes Stage 3 — the full application (backend, admin dashboard, storefront) is now built.
