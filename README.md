# gurumates

Find trusted tutors. Post a need, chat safely, unlock contact with coins. **Classroom (video) is later** — after unlock, parties use in-app chat plus phone/WhatsApp.

## Run locally

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/health

SQLite lives at `apps/api/prisma/dev.db`.

Without `STRIPE_SECRET_KEY`, coin packs and escrow pay instantly (sandbox). With Stripe test/live keys, Checkout is used.

## Auth

- Email + password, then email OTP and mobile OTP on `/verify`
- Google: set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Authorized redirect: `http://localhost:3000/auth/google/callback`
- Email/SMS OTP: sandbox prints the code in the API log (and on screen when `AUTH_OTP_ECHO=true`). Production: `RESEND_API_KEY` and/or Twilio env vars.

## Demo logins (password `password123`)

- Student: `student@wtws.dev` (150 coins)
- Tutor: `amina@wtws.dev` (200 coins) — switch to Tutor in the header
- Admin: `admin@wtws.dev`

## Loop

1. Log in as Amina, switch to Tutor, open Tutor jobs, apply with coins.
2. Log in as Priya, open Messages, book, **Pay into escrow**.
3. Phone and WhatsApp unlock. Release to tutor (12% platform fee) or dispute.
4. Wallet: buy coin packs (sandbox or Stripe). Premium = 1-hour early job access.

## Open GA extras

- Terms, privacy, refunds, cookies, support, status
- Account export / delete
- Student onboarding after register
- Admin: tickets, unread coin refunds, escrow refunds
