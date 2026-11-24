# SABER project page and evaluation playground

Public entry: `https://quantum-bitss.github.io/saber/`.

The project page introduces the method, authors, main-paper results, and released
attack-instance archive. The interactive console is at `/saber/playground/`.
Saved `/saber/#job=...` links redirect to the console with their fragment intact.
The project landing page makes no API requests and adds no analytics.

The six figure crops come directly from the supplied `SABER_ICML2027.pdf`
(November 24, 2026 manuscript): motivation (p. 1), feedback analysis (p. 4),
method (p. 6), IPI comparison (p. 7), and DPI/backend results (p. 8). They retain
the original values and labels. The main study's 96 cases are distinct from
the full case catalog available in the playground.

Released samples: `https://anonymous.4open.science/r/SABER-BD80/`.
ZIP: `https://anonymous.4open.science/api/repo/SABER-BD80/zip`.
Browser access and an actual ZIP download were verified on November 24, 2026.
The archive is externally hosted; its availability is not controlled by Pages.

The console lists the full deployed DTap attack-case catalog, with domain/threat
filters, search, and 50-row pages. It has no difficulty classification. Backend
availability controls selection: unsupported environments remain inspectable.
New cases receive an isolated setup check before model calls; an available
case is not a claim that a model-funded attack has already been evaluated.

`public/saber/` contains only the static browser UI. The existing paused homepage
stays blank. The deployment workflow copies this directory into `out/saber/`
even when `SITE_PAUSED` is true. If the homepage is restored later, Next.js's
static export includes the directory automatically.

In Settings → Pages, set **Source** to **GitHub Actions**. The legacy
"Deploy from a branch" publisher must be disabled: otherwise its automatic
Jekyll deployment can overwrite this workflow's blank homepage and console.
The workflow also supports manual runs from the Actions tab.

The backend remains on the existing evaluation server. Its HTTPS origin is the
`saber-api-base` meta element in `public/saber/playground/index.html`; the CSP `connect-src`
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

To regenerate the project page and browser assets from the service checkout
(project source: `web/project/`; console source: `web/review.html`):

```sh
python3 deploy/export_pages_console.py \
  --destination /path/to/homepage/public/saber \
  --api-base https://CURRENT-BACKEND-HOST
```

Before publishing, check case browsing/details, API validation, job polling,
result recovery, credentials clearing, responsive layout and exact-origin CORS.
