# Deployment

PocketLedger builds to a fully static `dist/` folder — serve it with any static host.

## Build

```bash
npm run build
```

The result in `dist/` can be shipped as-is.

## Deploy targets

### GitHub Pages

```bash
npm run build
# push dist/ to the gh-pages branch, or configure Actions:
npx gh-pages -d dist
```

### Vercel / Netlify

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

### Cloudflare Pages

Same as above — no serverless functions needed.

### nginx / Apache / any static server

Copy `dist/` to your web root. That's it. Because the app uses HashRouter, no server rewrites are needed.

## Content-Security-Policy (optional)

The app does not require network access. If you want a strict CSP, allow only your own origin:

```
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'
```

(Vite may inline some styles, hence `'unsafe-inline'` for style-src.)

## Service worker / PWAs (optional)

The app is already offline-first by design (IndexedDB). If you want installability, add a PWA plugin such as `vite-plugin-pwa`; the app contents are fully static so it's a drop-in change.

## Configuration at build time

Use env vars to adjust pricing/URL before building:

```
VITE_UPGRADE_URL="https://your-store.com/checkout" VITE_PREMIUM_PRICE=14.99 VITE_PREMIUM_CURRENCY=USD npm run build
```
