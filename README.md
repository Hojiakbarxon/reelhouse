# Reelhouse — Frontend

A movie-streaming web app: browse and watch a catalogue, review films, keep a
personal list, subscribe to a plan, and manage everything from an admin panel.
Secure sign-in includes optional **two-factor authentication (TOTP)** with an
authenticator app. Designed **mobile-first**: every screen works with a thumb.


## Tech stack

| Area            | Choice                                                    |
| --------------- | --------------------------------------------------------- |
| Build / runtime | Vite, React 19, TypeScript                                |
| Styling         | Tailwind CSS v4 (design tokens in `src/index.css`)        |
| Routing         | React Router (`createBrowserRouter`, lazy admin routes)   |
| Server state    | TanStack Query                                            |
| Client state    | Zustand (persisted auth token)                            |
| Forms           | react-hook-form + zod                                     |
| HTTP            | axios (bearer token + silent refresh interceptor)         |
| 2FA QR codes    | `qrcode.react` (rendered locally, nothing leaves the app) |
| Lint            | oxlint                                                    |

## Features

- **Public:** browse and search movies, filter by category, movie detail page with
  player, cast, reviews and suggestions, actor pages, subscription plans.
- **Accounts:** register with email OTP confirmation, sign in, forgot / reset
  password, profile and avatar editing.
- **Two-factor authentication:** guided setup (QR code + copyable secret key),
  second step at sign-in, turn off with a current code.
- **Members:** favourites ("My List"), subscriptions, checkout, reviews.
- **Admin / superadmin:** manage movies (with files, cast, poster), categories,
  users, plans, subscriptions and payments.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

### Environment variables

```bash
cp .env.example .env
```

| Variable       | Meaning                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| `VITE_API_URL` | Backend origin **without** `/api` (the app appends it). Default: `http://localhost:3000` |

- `.env.development` already points at a local backend.
- Vite bakes env vars in at **build time**, so set `VITE_API_URL` *before* `npm run build`.

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Dev server                                    |
| `npm run build`   | Typecheck (`tsc -b`) + production build       |
| `npm run preview` | Serve the production build locally            |
| `npm run lint`    | oxlint                                        |

## Routes

| Access            | Path                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| Public            | `/`, `/plans`, `/movies/:slug`, `/actors/:id`                                          |
| Guests only       | `/login`, `/register`, `/confirm-otp`, `/forgot-password`, `/reset-password`           |
| Signed in         | `/favourites`, `/account`, `/account/two-factor`                                       |
| Admin / superadmin| `/admin/movies`, `/admin/movies/new`, `/admin/movies/:id/edit`, `/admin/categories`, `/admin/users`, `/admin/plans`, `/admin/subscriptions`, `/admin/payments` |

## Project structure

```
src/
├── api/            # axios client (interceptors), typed API modules, shared types
├── components/
│   ├── admin/      # PosterPicker, CategoryCheckboxList, MovieCastManager, MovieFilesManager
│   ├── layout/     # Navbar (desktop bar + mobile menu), Footer, RootLayout
│   ├── movies/     # MovieCard, MoviePlayer, ReviewForm, ReviewsList, CheckoutModal, ...
│   ├── user/       # MySubscriptions, TwoFactorSettings
│   └── ui/         # Button (+ button-styles), IconButton, Modal, ConfirmDialog, OtpInput,
│                   # CopyButton, Pagination, Input, PasswordInput, Select, Feedback, ...
├── hooks/          # React Query hooks per resource (auth.ts = auth API, use-two-factor.ts, ...)
├── lib/            # query client, error classification, formatting helpers
├── pages/          # route components grouped by domain (auth / movies / user / admin)
├── routes/         # router config, auth/admin guards, error boundary
└── store/          # Zustand stores (auth token, payments map)
```

## Authentication model

Two tokens, two lifetimes:

| Token           | Lifetime | Where it lives                                   | Used for                          |
| --------------- | -------- | ------------------------------------------------ | --------------------------------- |
| `authToken`     | 1 day    | Zustand store, persisted in `localStorage`       | `Authorization: Bearer ...` header |
| `refreshToken`  | 7 days   | **httpOnly cookie** set by the backend (invisible to JS) | `POST /auth/refresh` only |

- `POST /auth/login` returns **either**
  - `{ authToken, refreshToken }` (and sets the refresh cookie) — normal sign-in, **or**
  - `{ twoFactorRequired: true, twoFactorToken }` — the account has 2FA on (see below).
- The app decodes `authToken` (JWT) to get the user `id`, then loads the user (and role)
  with `GET /users/:id`.

### Staying signed in after the access token expires

"Signed in" means **a session exists**, not "the 1-day token is still valid"
(`useAuthStore().isTokenValid()` is true while a readable token is stored). Expiry is handled
silently in `src/api/client.ts`:

1. **Before each request** (except public auth endpoints): if the access token is expired or
   expires within 30 s, the client calls `POST /auth/refresh` first, stores the new token,
   then sends the real request.
2. **If the server answers 401 anyway**, the client refreshes once and retries the request once.
3. **Concurrent requests share one refresh call** (the endpoint is rate limited).
4. **On app start**, `AuthBootstrap` refreshes an expired saved token *before* the router renders,
   so a returning user is never bounced to `/login` and never sees a signed-out flash.
5. **The user is signed out only when the refresh itself fails** (cookie missing, expired after
   7 days, or invalid). Guards then redirect to `/login`.

`429` (rate limit) shows a friendly toast, except on `/auth/*` calls, which render their own inline alert.

> Cross-site cookies: if the frontend and backend are on different domains (e.g. `netlify.app` and
> `onrender.com`), the refresh cookie is a *third-party* cookie. Chrome allows it, but **Safari/iOS
> blocks it**, so refresh fails there. Fix: proxy the API through the frontend's own domain — see
> "Same-origin API proxy" under Deploying.

## Two-factor authentication (TOTP)

| Step            | Endpoint                         | Notes                                                    |
| --------------- | -------------------------------- | -------------------------------------------------------- |
| Start setup     | `POST /auth/2fa/enable`          | Returns `{ secret, otpauthUrl }`. **Shown once only.**   |
| Confirm setup   | `POST /auth/2fa/enable/check-otp`| Body `{ otp }`. Switches 2FA on.                         |
| Sign in (2nd)   | `POST /auth/2fa/login`           | Body `{ otp }`, header `two-factor-token: Bearer <token>` |
| Turn off        | `POST /auth/2fa/disable`         | Body `{ otp }` — needs a current code.                   |

How it looks to the user:

1. **Account → Two-step verification → Set up 2FA** opens `/account/two-factor`, a
   four-step wizard: read the guide → scan the QR code *or* copy the secret key →
   enter the 6-digit code → done.
2. The user is told to **save the secret key** (password manager). It is never shown again.
3. At sign-in, after the password, a 6-digit code step appears. The 2FA session token
   lasts 5 minutes; a countdown is shown and an expired session sends the user back
   to the password step.
4. **Account → Turn off** asks for a current code in a dialog.

Notes for developers:

- The QR code is generated **in the browser** from `otpauthUrl`; the secret is held in
  component state only and cleared when setup finishes.
- Call `POST /auth/2fa/enable` only on a user action (a button), never from an effect —
  every call generates a **new** secret and invalidates the previous pending one.
- `GET /users/:id` includes `enabledTwoFactorAuthentication`; the secret itself is never
  returned. The 2FA hooks invalidate the `['users', 'me']` query so the badge updates.
- If you set explicit `allowedHeaders` in the backend CORS config, include
  `two-factor-token`, or the browser's preflight will block the 2FA sign-in request.
- There is currently **no recovery-code flow**: a user who loses both their phone and
  their saved key cannot turn 2FA off. Keep that in mind before adding support promises.

### OtpInput

`OtpInput` is one real `<input>` (transparent, stretched over six visual boxes), so typing,
paste (`123 456` works), backspace, SMS / password-manager autofill (`autocomplete="one-time-code"`)
and mobile keyboards all behave natively. Pass `autoFocus` when it appears in a dialog.

## Mobile & touch guidelines

The app is designed mobile-first and relaxes sizes from the `md` breakpoint (768px) up.
When adding UI, follow these rules so it feels right on a phone:

- **Tap targets are at least 44 × 44 px on phones.** Use `Button` (`sm` / `md` / `lg`) —
  it is 44 px tall on phones and compacts on desktop. For links that must look like
  buttons use `buttonClass()` from `ui/button-styles.ts`; **don't nest a `<Button>` inside a `<Link>`**.
- **Every tappable thing needs a pressed state.** `hover:` never fires on touch, so add
  `active:` styles (the shared components already do: darker background + slight scale).
  `main.tsx` registers a passive `touchstart` listener so iOS Safari paints `:active`.
- **Icon-only actions** (edit / delete in lists) use `IconButton` / `IconLink`: a visible
  44 px button on phones, a quiet 36 px icon on desktop. Always give them a `label`.
- **Tables become cards on phones.** Admin lists render a card per row below `md`
  (with full-width, labelled **Edit / Delete** buttons) and the table from `md` up.
  Don't ship a wide table that hides its actions off-screen.
- **Modals are bottom sheets on phones** (centred cards from `sm`), scroll internally,
  lock page scroll, and use safe-area padding. `Modal` keeps the latest `onClose` in a ref,
  so passing an inline `onClose` is safe and won't steal focus from inputs while typing.
- **Pagination** shows large Prev / Next buttons with "Page x of y" on phones and numbered
  buttons from `md` up.
- **Navbar:** guests get a **Sign in** button directly in the header; the menu has large
  rows, a prominent **Admin panel** button for staff, an account card and a full-width
  Sign out / Join now / Sign in.
- **Inputs use 16 px text** on touch devices so iOS Safari doesn't zoom on focus
  (`src/index.css`).

Tip: test with Chrome DevTools device mode (it emulates touch) **and** on a real phone.

## Deploying

1. Set `VITE_API_URL` to your deployed backend, then `npm run build` → `dist/`.
2. **SPA fallback** — the host must serve `index.html` for unknown paths, or refreshing
   `/movies/some-slug` will 404. Included: `vercel.json` (Vercel) and `public/_redirects`
   (Netlify). On Render static sites add a rewrite `/*` → `/index.html`.
3. **Backend CORS** must allow the frontend's real origin with credentials:
   ```ts
   app.enableCors({ origin: ['https://your-frontend-domain.com'], credentials: true });
   ```
   (`origin: true` works but reflects any origin.) The refresh cookie needs
   `sameSite: 'none'` + `secure` when frontend and backend are on different domains.
4. Update the `Sitemap:` line in `public/robots.txt` with your real domain.

## Troubleshooting

- **"Invalid or expired code" with a correct-looking 2FA code** — the phone's clock is off.
  Turn on automatic date & time on the phone and try the next code.
- **Blocked 2FA sign-in request in the browser console** — see the CORS note above
  (`two-factor-token` header).
- **Sign-in works but a phone user sees a blank screen** — check `VITE_API_URL` was set at
  build time; it is not read at runtime.

- **Signed out after a day (or on iPhone only)** — the refresh cookie isn't reaching the backend.
  Open DevTools → Network → `POST /api/auth/refresh`: a `401 "Please sign in first."` means no
  cookie was sent. Use the same-origin proxy above.

## Collaboration

Contributions and ideas are welcome — open an issue or a pull request.

## Owner

Hojiakbarxon Olimxo'jayev
