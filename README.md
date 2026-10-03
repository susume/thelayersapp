# Layers public website

Static product pages and the Firebase-powered Guard parent dashboard, hosted
under the existing `www.thelayersapp.com` domain.

## Edit the current product pages

- `tools/build_site.py`: English content, shared page shell and navigation.
- `tools/localized_content.py`: Japanese, Chinese and Vietnamese summaries.
- `assets/tokens.css`: shared visual tokens and font.
- `assets/site.css` / `assets/site.js`: public-page layouts and enhancements.
- `assets/dashboard-theme.css`: dashboard appearance only.
- `src/product-demo.jsx` / `src/demo-state.mjs`: interactive React product
  walkthrough and isolated sample device state.
- `assets/product-demo.css`: device frames and platform-specific app previews.
- `content/articles/`: retained journal body/header content.
- `tools/refresh_supporting_pages.py`: journal generation, assistant prompt,
  access labels, sitemap, robots and extensionless localized aliases.

Generate after a content change:

```powershell
python tools/build_site.py
python tools/refresh_supporting_pages.py
```

The static deployment serves generated HTML and the checked-in React bundle
directly. After editing the demo, run `npm ci` then `npm run build:demo`; there is
no runtime CDN dependency or client-side JSX compiler. Firebase logic and
selectors remain in `dashboard.html`; the page builder does not rewrite them.

Preserve the interactive phone/laptop hero and app walkthrough on the home and
Guard Family pages when updating content. They share transient sample state and
never connect to Firebase, sign in, or issue real device commands. The parent web
preview follows `dashboard.html`, the Android Controller uses its dark purple
theme, and the Windows child window follows `windows_ui.py`.

## Preview and verify

```powershell
python -m http.server 8765 --bind 127.0.0.1
python tools/check_site.py
node --test tests/*.test.mjs
```

The checker also accepts a Node executable as its first argument. Test mail
preparation locally; do not send a real test message or create a customer account
just to inspect the page.

Current content decisions and implementation evidence are recorded in
`docs/product-audit-2026-10-03.md`. Layers is running a closed beta: participants trial the apps free of charge
in return for honest feedback and testimonials. Enquiries go to
`contact@thelayersapp.com`; future prices are unpublished, and Windows/Android are the active child-app platforms. Do not
restore retired Mac offers or use a source version as proof of a public release.

`worker.js` is the separately deployed assistant Worker, not a GitHub Pages
backend or an email sender. If used, deploy it separately through its normal
Cloudflare workflow after updating its prompt.
