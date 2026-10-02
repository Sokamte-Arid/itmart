# IT Mart Admin as a phone app

The admin dashboard is now a **PWA** (installable web app). You can install it
on a phone's home screen. It opens full screen like a normal app and shows a
notification for every **new order** and every **low-stock** product.

Nothing is duplicated: the app is the same admin and uses the same backend,
the same admin accounts and the same database.

---

## 1. One-time setup (backend)

```bash
cd itmart-backend
npm install                                     # adds the new "web-push" package
npx prisma migrate dev --name add_push_subscriptions
npm run push:keys                               # prints a Public Key and a Private Key
```

Paste the two keys into `itmart-backend/.env`:

```
VAPID_PUBLIC_KEY=<the Public Key>
VAPID_PRIVATE_KEY=<the Private Key>
VAPID_SUBJECT=mailto:your-email@example.com
```

Generate the keys **once** and keep them. If you change them later, every
device must turn notifications on again. Keep the private key secret, like
your JWT secret.

Restart the backend (`npm run dev`). If the keys are missing, the backend
still runs normally and prints `🔕 Push notifications disabled`.

## 2. Admin

`itmart-admin/.env` now contains `VITE_API_URL=/api`. The admin's dev server
forwards `/api` and `/uploads` to the backend on `localhost:5000`, so the
admin works the same way on your PC and on a phone. No new packages are
needed; just restart `npm run dev`.

---

## 3. Testing on your phone while you work on localhost

| Where | What works | How |
|---|---|---|
| **Your PC** (Chrome) | Everything: install and notifications | Open `http://localhost:5174` and use the install icon in the address bar. Press Ctrl+Shift+M in DevTools to see the phone layout. |
| **Phone on the same Wi-Fi** | Mobile layout only (no install, no notifications, because the connection isn't HTTPS) | Run `ipconfig` on the PC, note the IPv4 address, then open `http://<that-IP>:5174` on the phone. If it doesn't load, allow Node.js through the Windows firewall (private networks). |
| **Android phone over USB** | Everything | Turn on USB debugging on the phone, open `chrome://inspect` on the PC, click **Port forwarding**, add `5174 → localhost:5174`, then open `http://localhost:5174` in Chrome on the phone. |
| **Any phone through a tunnel** (including iPhone) | Everything | Install ngrok (free), run `ngrok http 5174`, then open the `https://….ngrok-free.app` address it prints on the phone. |

### Turning notifications on

1. Open the admin on the phone (with one of the methods above).
2. **Android:** tap **Configurer** on the dashboard banner (or *Menu → Application mobile*) and choose **Installer IT Mart Admin**.
   **iPhone:** in Safari, tap **Share → Sur l'écran d'accueil**. On iPhone, notifications only work from the installed app (iOS 16.4 or later).
3. Open the installed app, go to *Menu → Application mobile*, tap **Activer les notifications** and allow them.
4. Tap **Envoyer un test**. A notification should appear within a few seconds.
5. Place a test order on the storefront. The phone shows *🛒 Nouvelle commande ORD-…* and tapping it opens that order.

Each admin can turn notifications on for each of their devices. They are
written in the language the admin app is set to (FR/EN). Logging out turns
notifications off on that device.

---

## 4. What's different on a phone

- A bottom tab bar gives quick access to Accueil, Commandes, Produits, Statistiques and Menu. The full menu slides in from the left.
- Orders appear as cards, with a status selector and **Appeler** and **WhatsApp** buttons on each order.
- Products appear as cards. In the product form, **Prendre une photo** opens the camera directly. Large phone photos are shrunk before upload, so they upload faster and never hit the 5 MB limit.
- The **Save** button stays at the bottom of the product form, within thumb reach.
- Modals open as bottom sheets.
- The app still opens without a connection (with an "offline" notice) and doesn't log you out.

---

## 5. When you put IT Mart online

- Serve the admin over **HTTPS**. This is required for installing the app and for notifications.
- If the admin and the API are on different domains, build the admin with the full API URL, for example
  `VITE_API_URL=https://api.itmart.cm/api npm run build`, and add the admin's domain to `ALLOWED_ORIGINS` in the backend `.env`.
- Keep the same VAPID keys in the production `.env`.
- If you want the app in the Google Play Store later, this PWA can be packaged with Capacitor or Bubblewrap without rewriting it.
