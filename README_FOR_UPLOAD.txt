Project package prepared for upload.

1) Before running, install dependencies:
   npm ci

2) To build (for Vercel you can just push to GitHub and connect to Vercel):
   npm run build

3) To run locally (after build):
   npm start
   or
   npm run dev

Notes:
- This archive excludes 'node_modules' and '.next' build artifacts to keep size small and ensure Vercel/GitHub compatibility.
- If your project requires environment variables, create a .env.local file (not included in this archive) with required vars.
- If you want the deployment-ready zip (with lockfile), this archive includes package-lock.json and package.json.
- If you prefer I produce a Git-ready ZIP (no .git folder), this archive already removes .git.
