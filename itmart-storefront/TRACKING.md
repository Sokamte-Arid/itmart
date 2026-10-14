# Tracking & ads (Facebook Pixel, Google, Clarity)

The storefront can send visits and sales to four free tools. You turn them on
from the **admin → Suivi & publicité** (Super Admin only): paste each tool's
ID, or the whole code the tool gives you, and the ID is picked out
automatically. Click **Enregistrer**: the shop uses it within about a minute.
No code to change, nothing to rebuild.

A field left empty means that tool is off.

| Tool | What it's for | Where to find the ID |
|---|---|---|
| **Meta Pixel** | Facebook & Instagram ads: see which ads bring sales, retarget visitors | business.facebook.com → **Events Manager** → your Pixel → **Pixel ID** (digits) |
| **Google Analytics 4** | Visitor statistics: how many people, from where, which pages, which products sell | analytics.google.com → Admin → **Data streams** → Web → **Measurement ID** (`G-…`) |
| **Google Ads** | Count sales coming from your Google ads | ads.google.com → Goals → **Conversions** → New → Website → "Purchase" → set up the tag manually. Paste the code containing `send_to: 'AW-123456789/AbCdEf'`: both the ID and the label fill in |
| **Microsoft Clarity** | See how visitors move: heatmaps (where they click and scroll) and replays of real visits | clarity.microsoft.com → New project → Settings → Overview → **Project ID** |

Each ID is checked against that tool's exact format, both in the admin and on
the server. A wrong value is refused, so no code can be slipped into the shop
through these fields.

The old `.env` lines (`NEXT_PUBLIC_META_PIXEL_ID`, etc.) still work, but only
as a fallback for a field left empty in the admin. On the live server, leave
them empty and manage everything from the admin.

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
required), untick **"Demander l'accord des visiteurs"** in the admin page. Keep in mind
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
