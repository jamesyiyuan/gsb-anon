# GSB Anon

Anonymous posting board gated to `@gsb.columbia.edu` email addresses. Next.js
(App Router) + Supabase (Postgres, Auth via magic link, Row-Level Security).

Every account gets a random pseudonym (`anon_x7f3k`) on signup. Posts and
comments only ever show the pseudonym — the real email is never stored
alongside content, and Row-Level Security prevents the client from reading
anyone's email at all.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public
   key**.
3. Copy `.env.local.example` to `.env.local` and paste them in:

   ```bash
   cp .env.local.example .env.local
   ```

## 2. Run the database migration

In the Supabase dashboard, open **SQL Editor**, paste the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and
run it. This creates the `profiles`/`posts`/`comments`/`reports` tables, the
RLS policies, and a trigger that rejects any signup whose email isn't
`@gsb.columbia.edu` (this is a second, server-side check — the app itself
also blocks non-GSB emails before ever calling Supabase).

## 3. Allow the local callback URL

The app uses Supabase's default magic-link email (click a link, no code to
type). The link redirects back to `/auth/callback` in this app, so that URL
needs to be on Supabase's allowlist:

- **Authentication → URL Configuration → Redirect URLs** — add
  `http://localhost:3000/auth/callback` (and later, your production URL's
  `/auth/callback` once deployed).

`signInWithOtp` in [`src/app/login/LoginForm.tsx`](src/app/login/LoginForm.tsx)
sends the link; [`src/app/auth/callback/route.ts`](src/app/auth/callback/route.ts)
exchanges it for a signed-in session when the student clicks it.

> Supabase's built-in email sender is rate-limited (a handful of emails per
> hour) — fine for testing, not for a real launch. Before opening this up to
> your cohort, add a custom SMTP provider (e.g. Resend, Postmark) under
> **Project Settings → Auth → SMTP Settings**.

## 4. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to
`/login` until you sign in with a `@gsb.columbia.edu` address.

Session refresh and the signed-out redirect run in [`proxy.ts`](proxy.ts) —
the Next.js 16 replacement for `middleware.ts` (same behavior, renamed file
and export).

## 5. Deploy

Push this repo to GitHub, then import it on [Vercel](https://vercel.com/new).
Add the same two env vars from `.env.local` in the Vercel project settings.
That's it — free tier covers this comfortably.

## How the anonymity boundary works

- `profiles` stores only `id` (= `auth.users.id`) and `pseudonym`. No email,
  no name.
- `posts` and `comments` reference `profiles.id`, never the raw user id from
  a client-visible column, and RLS policies (`supabase/migrations/0001_init.sql`)
  restrict every table to what a signed-in user should see.
- The `reports` table has no `select` policy at all — reports can be filed by
  any signed-in user but only read via the Supabase dashboard or a
  service-role key, i.e. by you, for moderation.
- Real identity (email) can still be recovered by whoever holds the Supabase
  service-role key or receives a legal subpoena — this is pseudonymity, not
  cryptographic anonymity. Say this explicitly in your app's ToS/FAQ so users
  aren't misled about what "anonymous" means here.

## What's intentionally left out (v1)

- Moderation UI (review reports from the Supabase dashboard for now).
- Rate limiting on posting (add before a real launch — e.g. Vercel
  proxy or Supabase Edge Functions).
- Push/email notifications, likes, search.
