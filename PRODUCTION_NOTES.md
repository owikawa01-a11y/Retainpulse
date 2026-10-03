# RetainPulse — Production Notes

## What was hardened

- Centralized server-side Supabase service-role client.
- Added authenticated `/api/dashboard` endpoint so dashboard data is scoped server-side to the logged-in account.
- Added event ownership checks to answer, retention, and decision routes.
- Added lead intake rate limiting, strict email validation, HTTP/HTTPS URL validation, and MRR allowlisting.
- Removed the unused legacy `/api/events` endpoint.
- Removed legacy Paddle/Dodo payment code and dependency from the active project.
- Hardened retention-copy validation so AI cannot silently change the concrete discount/duration terms.
- Fixed widget cancellation paths so every created event can reach a final decision, including "Skip and cancel".
- Made the pause UI match the server-selected pause offer instead of showing an unrelated second offer.
- Added widget request timeouts and basic focus/body-scroll handling.
- Removed fake/default customer MRR values from demo flows.
- Changed recovered-MRR calculation to count only `stayed` events with reported MRR.
- Removed unsupported legal/marketing claims from the codebase.
- Removed the hardcoded owner email; configure `OWNER_EMAIL` in `.env.local`/Vercel instead.
- Updated README branding to RetainPulse.

## Required environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://retainpulse.pro
GROQ_API_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
RESEND_API_KEY=...
OWNER_EMAIL=...
```

## Important external configuration

1. Verify `retainpulse.pro` in Resend and use `hello@retainpulse.pro` as the sender.
2. Set `OWNER_EMAIL` in Vercel.
3. Set `NEXT_PUBLIC_APP_URL=https://retainpulse.pro` in Vercel.
4. Configure Supabase Auth Site URL and Redirect URLs for the production domain.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
6. Keep Supabase RLS enabled even though authenticated dashboard reads are additionally scoped server-side.
7. If the GitHub repository has been renamed, update the repository metadata in `package.json` accordingly.

## Local verification

```bash
npm install
npm run build
npm run dev
```

Then test:

- signup/login/logout
- dashboard loading
- embed page and public key
- reason -> follow-up -> answer -> offer -> accept/cancel
- skip and cancel from both widget steps
- pause offer path
- dashboard event appears after cancellation
- CSV export
- `/book` lead submission
- owner + customer email delivery
- wrong `event_id` + wrong `public_key` returns `EVENT_NOT_FOUND`
- no MRR configured means no fake recovered-MRR number
