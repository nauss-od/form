
NAUSS Premium Redesign — Prototype (RTL)
======================================

This package contains a premium, production-like front-end prototype for NAUSS:
- index.html        -> Landing / login split (50/50)
- login.html        -> Balanced login page
- dashboard.html    -> Dashboard preview (Sidebar / Cards / Table)
- assets/styles.css -> Refined CSS (Cairo font)
- assets/scripts.js -> Small UI interactions (role switch, logout demo)
- assets/nauss-logo.png -> University logo (or placeholder)

How to preview quickly (static):
1. Unzip the package.
2. Open `index.html` in a browser (double-click). Works offline.
3. For pages preview: open `login.html` and `dashboard.html` similarly.

Integration notes for Next.js:
- Copy `assets/` to `public/assets/`.
- Convert HTML to React/Next files (pages or app routes). Replace `<link>` with head import and move CSS appropriately.
- All visual assets are static and intentionally separated so you can integrate into your repo easily.

Git commands (use these after replacing files in your repo):
git add .
git commit -m "feat(ui): add premium NAUSS RTL redesign prototype"
git push origin main

If you want: I'll convert these into exact Next.js files and produce a zip that replaces the specific repo paths (pages, components, public/assets). Reply 'convert' and I'll do it now.
