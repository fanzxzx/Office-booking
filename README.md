# Office spaces and gear — deployable version

A real standalone web app (not tied to a Claude chat) for booking 2 meeting
rooms and shared equipment, with a live database and emailed 15-minute
reminders. Works on laptop, iPhone, and Android — it's just a website.

## Stack
- **Next.js** — the app itself
- **Supabase** — free hosted Postgres database
- **Resend** — free tier email sending for reminders
- **Vercel** — free hosting + a scheduled job ("cron") that checks for
  upcoming bookings every minute and emails reminders, even if nobody has
  the site open

## 1. Put the code on GitHub
1. Create a new repo at github.com (e.g. `office-booking`).
2. Upload everything in this folder to that repo (drag-and-drop on the
   GitHub website works fine, or `git init && git add . && git commit -m "init" && git push`).

## 2. Set up Supabase (the database)
1. Go to supabase.com → New project. Pick any name/region, set a database password (save it somewhere).
2. Once it's created, open **SQL Editor** → New query.
3. Paste in the contents of `sql/schema.sql` from this project and click Run.
   This creates the rooms, bookings, and equipment tables, with the two
   meeting rooms and three starter equipment items already in place.
4. Go to **Project Settings → API**. Copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret — it has full access)

## 3. Set up Resend (for reminder emails)
1. Go to resend.com → sign up free → API Keys → create one. This is `RESEND_API_KEY`.
2. Under Domains, either verify your own domain, or for quick testing use
   their sandbox sender. Whatever sending address you end up with is
   `REMINDER_FROM_EMAIL`.

## 4. Deploy on Vercel
1. Go to vercel.com → New Project → import the GitHub repo you created.
2. Before deploying, add these Environment Variables (Settings → Environment Variables), using the values from steps 2–3:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `REMINDER_FROM_EMAIL`
   - `CRON_SECRET` — make up any long random string yourself
3. Click Deploy. Vercel will give you a live URL (e.g. `office-booking.vercel.app`) — that's the link to share with your office.
4. `vercel.json` already tells Vercel to run `/api/reminders` every minute automatically (this is the Cron Jobs feature, included free on Vercel's Hobby plan). No extra setup needed — it starts working as soon as you deploy.

## Trying it locally first (optional)
```
npm install
cp .env.example .env.local   # then fill in the real values
npm run dev
```
Open http://localhost:3000

## Customizing
- Room names/hours: top of `app/page.js` (`ROOMS`, `OFFICE_START`, `OFFICE_END`) — also update `OFFICE_START`/`OFFICE_END` checks if you add stricter validation later.
- Reminder timing (currently 15 minutes before): `app/api/reminders/route.js`.
- This currently has no login — anyone with the link can book or cancel anything, matching what you asked for (name/email captured per booking, but no accounts). If you later want to restrict who can cancel a booking, that's a bigger change (real auth) — just ask.
