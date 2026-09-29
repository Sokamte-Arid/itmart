# IT Mart — Backend API

Node.js + Express + Prisma + PostgreSQL backend for the IT materials e-commerce catalog.

## Features implemented in this stage

- Bilingual (EN/FR) categories, brands, and products
- Products can be grouped as variants of the same base model (`ProductGroup`)
- Structured, per-category filterable attributes (e.g. RAM, Storage) — powers dynamic filters
- Full-text-ish search across product name/description/SKU/brand (EN + FR)
- Best sellers & discounted products filtering
- Local image upload/storage for products — automatically resized (max 1600px wide) and
  compressed to WebP on upload, for fast loading on mobile connections
- Rate limiting: order submissions (5 / 15 min per IP), admin login attempts (10 / 15 min per
  IP), and a general baseline across the public API — protects against spam/abuse
- Orders: no online payment — customer submits their info, order is saved, then:
  - A `wa.me` WhatsApp link is returned so the customer's browser opens WhatsApp with a
    pre-filled message to the admin
  - A confirmation email is sent to the customer (if they provided one)
  - A notification email is sent to the admin (`ADMIN_EMAIL`) with the full order details —
    a written backup to the WhatsApp message
- Order tracking by reference number
- JWT-based admin authentication, with roles (`SUPER_ADMIN`, `ADMIN`, `EDITOR`)
- Admin dashboard summary stats endpoint

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Then edit `.env`:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — any long random string
- `ADMIN_WHATSAPP_NUMBER` — the admin's WhatsApp number in international format, digits only (e.g. `237677123456`)
- `SMTP_*` — your email provider's SMTP credentials (Gmail App Password, Mailtrap, SendGrid, etc.). If left blank, order creation still works — the email step is skipped silently.

### 3. Create the database
Make sure PostgreSQL is running, then create a database and user matching your `DATABASE_URL`, e.g.:
```sql
CREATE USER itmart_user WITH PASSWORD 'itmart_password';
CREATE DATABASE itmart_db OWNER itmart_user;
```

### 4. Run migrations & generate the Prisma client
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Seed sample data (optional but recommended)
Creates a default admin account and a sample category/brand/product with two variants.
```bash
npm run seed
```
Default admin login: `admin@itmart.cm` / `Admin@12345` — **change this password after first login.**

### 6. Run the server
```bash
npm run dev     # development (auto-reload)
npm start       # production
```
API will be available at `http://localhost:5000/api`, health check at `/api/health`.

## API Overview

| Area | Public routes | Admin routes (require `Authorization: Bearer <token>`) |
|---|---|---|
| Auth | `POST /api/auth/login` | `GET /api/auth/me`, `POST /api/auth/admins` |
| Categories | `GET /api/categories`, `GET /api/categories/:slug` | `POST/PUT/DELETE /api/categories/:id`, attribute routes |
| Brands | `GET /api/brands` | `POST/PUT/DELETE /api/brands/:id` |
| Products | `GET /api/products` (search/filter/sort/paginate), `GET /api/products/:slug`, `GET /api/products/search-suggestions` | `POST/PUT/DELETE /api/products/:id`, image upload routes |
| Orders | `POST /api/orders`, `GET /api/orders/track/:reference` | `GET /api/orders`, `PUT /api/orders/:id/status`, `GET /api/orders/stats/summary` |

### Example: catalog with search + filters
```
GET /api/products?category=laptops&brand=hp&q=elitebook&minPrice=300000&maxPrice=500000&attr[<attributeId>]=16&sort=price_asc&page=1&limit=20
```

### Example: placing an order
```json
POST /api/orders
{
  "customerName": "Jean Dupont",
  "phone": "677123456",
  "email": "jean@example.com",
  "address": "Rue 123, Bastos",
  "city": "Yaoundé",
  "lang": "fr",
  "items": [{ "productId": "...", "quantity": 1 }]
}
```
Response includes `data.whatsappLink` — redirect the customer's browser to this URL to open WhatsApp with the order pre-filled to the admin's number.

## Notes on image uploads
Images are stored in `/uploads/products` and served statically at `/uploads/products/<filename>`. To upload:
```
POST /api/products/:id/images   (multipart/form-data, field name: images, up to 8 files)
```

## Next stages
1. ✅ Database + backend API (this stage)
2. Admin dashboard (React + Tailwind, YouCan Shop-style layout)
3. Public storefront (React + Tailwind, Glotelho-style catalog)
4. Polishing WhatsApp/email flow, i18n wiring end-to-end
