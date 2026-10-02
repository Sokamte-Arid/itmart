# IT Mart — Admin Dashboard

React + TailwindCSS admin dashboard for managing the IT Mart catalog, orders, categories and brands. Styled with a YouCan Shop–inspired layout: fixed sidebar navigation, clean data tables, and a focused amber accent color.

## Features

- **Auth**: JWT-based admin login, session persistence, protected routes
- **Dashboard**: total orders, pending orders, revenue, product count, recent orders table
- **Products**: search + category filter, full create/edit form with:
  - Bilingual name & description (EN/FR)
  - Dynamic specification fields based on the selected category's attributes (e.g. RAM, Storage for Laptops)
  - Multi-image upload, primary image selection, image deletion
  - Variant grouping — type the same "group name" on multiple products (e.g. different RAM configs of the same laptop) to link them as variants
  - Best seller flag, active/inactive toggle, price + discount price, stock
- **Categories**: create/edit/delete, plus inline management of filterable attributes (the spec fields used for storefront filters)
- **Brands**: simple create/edit/delete
- **Orders**: list with status filter, detail view (customer info, items, total), status update (Pending → Contacted → Confirmed → Shipped → Delivered / Cancelled)
- **Bilingual UI**: French/English toggle in the top bar, persisted across sessions

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the API URL
The `.env` file uses a relative URL:
```
VITE_API_URL=/api
```
In development, the Vite server forwards `/api` and `/uploads` to the backend on `http://localhost:5000` (see `vite.config.js`; override with `BACKEND_URL=...`). That is what lets the same admin work on your phone. For a production build hosted separately from the API, set the full URL (e.g. `https://api.itmart.cm/api`).

📱 **Phone app & notifications:** see [MOBILE_APP.md](./MOBILE_APP.md).

### 3. Make sure the backend is running
This dashboard is a pure frontend — it needs the `itmart-backend` API running (see that project's README) with the database migrated and, ideally, seeded (`npm run seed` in the backend gives you a working admin login: `admin@itmart.cm` / `Admin@12345`).

### 4. Run the dev server
```bash
npm run dev
```
Opens on `http://localhost:5174` by default.

### 5. Build for production
```bash
npm run build
```
Outputs static files to `dist/` — deploy this to any static host (Netlify, Vercel, Nginx, etc.), pointing `VITE_API_URL` at your production backend.

## Notes

- **Uploading product images** requires the product to be saved first (it needs a product ID to attach images to) — create the product, then the image upload area becomes active.
- **Variant grouping**: there's no separate "manage groups" screen — groups are created automatically the first time you type a new group name on a product, and reused when you type a matching name on another product.
- **Category attributes**: define these before creating products in that category, so the spec fields (and later, storefront filters) are available. You can still add attributes to a category later — existing products just won't have those specs filled in until edited.

## Next stage
This completes Stage 2. Stage 3 is the public storefront (catalog browsing, search, filters, cart, checkout with the WhatsApp + email order flow).
