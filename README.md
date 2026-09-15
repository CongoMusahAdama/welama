# WELAMA

Storefront (Vite + React) and API (Express + MongoDB).

## Local setup

Frontend:

```bash
npm install
cp .env.example .env
npm run dev
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Fill `backend/.env` locally. Never commit that file.

## Hosting

- **Frontend — Vercel:** import this repo, framework Vite, set `VITE_API_URL` to `https://YOUR-RENDER-SERVICE.onrender.com/api`.
- **Backend — Render:** web service, root directory `backend`, start command `npm start`, add the same keys as `backend/.env.example` in Render Environment. Set `CLIENT_URL` / `FRONTEND_URL` to your Vercel URL (no trailing slash).
