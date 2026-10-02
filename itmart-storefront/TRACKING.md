# Tracking & ads (Facebook Pixel, Google, Clarity)

The storefront can send visits and sales to three free tools. Each one is
**off until you paste its ID** into `itmart-storefront/.env`, then restart
`npm run dev` (or rebuild for production).

| Tool | What it's for | Where to find the ID | `.env` line |
|---|---|---|---|
| **Meta Pixel** | Facebook & Instagram ads: see which ads bring sales, retarget visitors | business.facebook.com → **Events Manager** → Connect data → Web → Meta Pixel → copy the **Pixel ID** (digits) | `NEXT_PUBLIC_META_PIXEL_ID=` |
| **Google Analytics 4** | Visitor statistics: how many people, from where, which pages, which products sell | analytics.google.com → Admin → **Data streams** → Web → **Measurement ID** (`G-…`) | `NEXT_PUBLIC_GA_MEASUREMENT_ID=` |
| **Google Ads** | Count sales coming from your Google ads | ads.google.com → Goals → **Conversions** → New → Website → "Purchase" → set up the tag manually → from `send_to: 'AW-123456789/AbCdEf'` copy both parts | `NEXT_PUBLIC_GOOGLE_ADS_ID=AW-123456789` and `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL=AbCdEf` |
| **Microsoft Clarity** | See how visitors move: heatmaps (where they click and scroll) and replays of real visits | clarity.microsoft.com → New project → Settings → Overview → **Project ID** | `NEXT_PUBLIC_CLARITY_PROJECT_ID=` |

You can set only the ones you use; the others stay off.

## What is recorded

| When | Facebook | Google |
|---|---|---|
| Every page | PageView | page_view (automatic) |
| Product page opened | ViewContent | view_item |
| Search | Search | search |
| "Acheter" / add to cart | AddToCart | add_to_cart |
| Checkout page opened | InitiateCheckout | begin_checkout |
| Order placed | **Purchase** (amount in XAF, order reference) | **purchase** + Google Ads **conversion** |
| WhatsApp question button on a product | Contact | contact |

Amounts are in **XAF** (FCFA). The order reference (ORD-…) is sent with each
purchase, so a sale is never counted twice.

Note that a "Purchase" here means an order placed on the site. Orders you
later cancel are still counted by the ad platforms.

## Cookie banner

On their first visit, visitors are asked to accept or decline. **Nothing is
loaded until they accept.** They can change their mind with **"Gérer les
cookies"** at the bottom of every page, and the privacy page explains what's
collected.

To track without asking (for example if your lawyer confirms it isn't
required), set `NEXT_PUBLIC_REQUIRE_TRACKING_CONSENT=false`. Keep in mind
that Cameroon's personal data protection law (2024) and Meta's and Google's
own rules generally expect consent for advertising cookies.

## Checking it works

- **Facebook:** install the *Meta Pixel Helper* Chrome extension, open your
  site, accept cookies, and click the extension icon. You should see
  PageView, then ViewContent on a product page. Events Manager → **Test
  events** also shows events live.
- **Google:** in Google Analytics → Reports → **Realtime**, open your site in
  another tab and you appear within a few seconds.
- **Clarity:** recordings appear in the dashboard about 30 minutes to 2 hours
  after a visit.

Tracking only gives useful data once the site is online with its real domain.
Tools like Clarity and Google Ads may not accept `localhost` as your website
address when you set them up.
