
NAUSS Redesign Prototype v2
===========================

Contents
- index.html            -> RTL landing (prototype)
- login.html            -> RTL login page (balanced 50/50 layout)
- assets/styles.css     -> Global styles (uses Cairo font)
- assets/nauss-logo.png -> University logo or placeholder

How to use (quick)
1. Extract the zip into your project's `public/` folder or copy files into your Next.js `public/` and `app/` routes.
2. For a quick static preview, open `index.html` in a browser.
3. To integrate into Next.js:
   - Move `assets/` to `public/assets/`
   - Convert `index.html` -> `app/page.js` or `pages/index.js` (copy the HTML body into JSX; replace `<link>` with next/head import)
   - Import the CSS from `public/assets/styles.css` via a global <link> in app/layout.js or in `pages/_app.js`.

Recommended Git / Vercel deployment (example)
```bash
# place files into your repo, then:
git add public/assets public/index.html public/login.html
git commit -m "chore(ui): add NAUSS redesigned landing & login prototype v2"
git push origin main

# Deploy with Vercel (assumes Vercel CLI configured and project linked)
vercel --prod
```

Notes
- This is a visual/front-end prototype only. No server-side or database logic included.
- If you want, I can convert the HTML into Next.js pages and produce a single zip with all modified project files ready to replace in your repo.
