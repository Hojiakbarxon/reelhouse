# Reelhouse — Frontend

A production-ready React frontend for the movies streaming backend
(https://movies-hjaa.onrender.com/api). Built with Vite, React, TypeScript,
Tailwind v4, React Router, TanStack Query, Zustand, and react-hook-form + zod.

## Getting started

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

### Environment variables

Copy `.env.example` if you need to point at a different backend:

```bash
cp .env.example .env
```

- `.env.development` is already set to `http://localhost:3000` (your local backend).
- For the deployed backend, set `VITE_API_URL=https://movies-hjaa.onrender.com` in
  `.env` or `.env.production`.

The app always appends `/api` itself — don't include it in `VITE_API_URL`.

## Deploying

1. **Build**: `npm run build` → outputs to `dist/`.
2. **Set `VITE_API_URL`** at build time to your deployed backend
   (`https://movies-hjaa.onrender.com`) — Vite bakes env vars in at build time,
   not runtime, so this has to be set before you build, not after deploying.
3. **SPA rewrite rule** — this app uses client-side routing
   (`createBrowserRouter`), so the host needs to serve `index.html` for any
   path it doesn't recognize, or refreshing on `/movies/some-slug` (etc.) will
   404. This repo already includes:
   - `vercel.json` — works out of the box on Vercel
   - `public/_redirects` — works out of the box on Netlify
   - On Render static sites: add a rewrite rule `/*` → `/index.html` in the
     dashboard (Settings → Redirects/Rewrites)
   - On GitHub Pages or a plain nginx/S3 host: you'll need an equivalent
     catch-all rewrite — ask if you need help with a specific host
4. **Backend CORS** — the backend must allow this frontend's real deployed
   origin. Currently `src/main.ts` has:
   ```ts
   app.enableCors({ origin: true, credentials: true });
   ```
   `origin: true` reflects any request origin, which works everywhere
   including this deploy, but is permissive. Once you know the frontend's
   final domain, tighten it to an explicit list:
   ```ts
   app.enableCors({
     origin: ['https://your-frontend-domain.com'],
     credentials: true,
   });
   ```
   and redeploy the backend.

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck + production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — oxlint

## Project structure

```
src/
├── api/            # axios client + one module per backend controller, all typed
├── components/
│   ├── admin/      # PosterPicker, CategoryCheckboxList, MovieFilesManager
│   ├── layout/     # Navbar, Footer, RootLayout
│   ├── movies/     # MovieCard, MoviePlayer, ReviewForm, CheckoutModal
│   ├── user/       # MySubscriptions
│   └── ui/         # Button, Input, Select, Modal, ConfirmDialog, Feedback (Spinner/EmptyState/ErrorState), StarRating
├── hooks/          # one React Query hook module per resource
├── lib/            # query client, format.ts (price/date/decimal-string coercion)
├── pages/          # route components, grouped by domain (auth/movies/user/admin)
├── routes/         # router config, auth/admin guards, error boundary
└── store/          # Zustand: auth (JWT decode), payments-map (local payment-id cache)
```

## Auth model (matches the backend exactly)

- `POST /auth/login` returns `{ authToken, refreshToken }` — no user object.
- The frontend decodes `authToken` (a JWT) client-side to get `id` and `role`,
  then fetches the full user via `GET /users/:id`.
- Every request carries `Authorization: Bearer <authToken>` — the guard doesn't
  read the refresh cookie, so the frontend never relies on it.
- On a 401, the frontend logs the user out locally and redirects to `/login`
  (the backend has no refresh endpoint to silently retry against).

## Collaboration
I am really excited to work on new features with YOU, feel free to collaborate.

## Owner
Hojiakbarxon Olimxo'jayev

