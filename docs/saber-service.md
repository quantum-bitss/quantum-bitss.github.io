# SABER evaluation console

Public entry: `https://quantum-bitss.github.io/saber/`.

`public/saber/` contains only the static browser UI. The existing paused homepage
stays blank. The deployment workflow copies this directory into `out/saber/`
even when `SITE_PAUSED` is true. If the homepage is restored later, Next.js's
static export includes the directory automatically.

The backend remains on the existing evaluation server. Its HTTPS origin is the
`saber-api-base` meta element in `public/saber/index.html`; the CSP `connect-src`
must match. No API credentials, backend source, or server address is published
in the repository. Callers provide their own model credentials at runtime.
The frontend sends no cookies, Referer, or credentials in URLs. It keeps a random
job code in the URL fragment to recover a run after refresh.

The backend allows exactly `https://quantum-bitss.github.io` as a browser origin
through `SABER_FRONTEND_ORIGINS`. It continues accepting its original same-origin
console. CORS does not replace backend validation or make a public API private.

The existing `trycloudflare.com` backend hostname is temporary. The Pages URL
is stable, but if that tunnel is recreated, update the backend meta element and
CSP and republish the frontend. This change does not create a permanent tunnel.

The page adds no analytics or browser storage for API credentials. GitHub and
Cloudflare may maintain infrastructure security logs. Publishing beneath this
personal GitHub account is public attribution, not an anonymous review link.

To regenerate browser assets from the service checkout:

```sh
python3 deploy/export_pages_console.py \
  --destination /path/to/homepage/public/saber \
  --api-base https://CURRENT-BACKEND-HOST
```

Before publishing, check case browsing/details, API validation, job polling,
result recovery, credentials clearing, responsive layout and exact-origin CORS.
