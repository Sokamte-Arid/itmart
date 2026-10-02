# IT Mart — security measures in place

## Security headers
Small instructions sent with every page that tell the visitor's browser how to
protect them. They cost nothing and block whole families of attacks.

| Header | What it prevents |
|---|---|
| `X-Frame-Options` | Another site showing IT Mart inside a hidden frame to trick people into clicking (clickjacking) |
| `X-Content-Type-Options: nosniff` | A file disguised as an image being run as a script |
| `Strict-Transport-Security` (HSTS) | Anyone downgrading a visitor to unencrypted HTTP (e.g. on public Wi-Fi) |
| `Referrer-Policy` | Full page addresses leaking to other sites (ad attribution still works) |
| `Content-Security-Policy` (API) | Injected scripts running from the API's domain |
| `Permissions-Policy` | The site ever asking for camera, microphone or location |
| No `X-Powered-By` | Advertising which software runs the site |

Where: the API (`helmet` in `itmart-backend/src/app.js`), the storefront
(`next.config.mjs`), and Nginx on the server (HSTS + the admin).

## Other protections
- Per-visitor limits: 7 orders / 10 min, 10 admin logins / 15 min, 300 requests / 15 min.
  On the server the API reads the real visitor address from Nginx (`TRUST_PROXY`).
- Passwords are stored hashed (bcrypt), never readable.
- Unexpected errors show visitors a plain message; details stay in the server log.
- The admin is hidden from search engines (`noindex` + `robots.txt`).
- Secrets live only in `.env` files on the server, never on GitHub.
- Dependencies: `npm audit` reports 0 known vulnerabilities (October 2026).
