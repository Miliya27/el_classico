# Jwala - El Classico (College Football Tournament Website)

A mobile-first website for a college football tournament. Viewers follow live scores, results, group tables, knockout bracket, player stats, and media. Admins manage live scoring and tournament setup.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript strict)
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (Postgres, Auth, Realtime, Storage)
- **Deployment:** Vercel

---

## Setup & Development Guide

### 1. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your Supabase URL and anonymous key in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
> **Security Note:** Never commit `.env.local` or expose service role keys in `NEXT_PUBLIC_` variables.

---

### 2. Supabase CLI Setup & Database Link
Log in to Supabase CLI and link your project:
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

---

### 3. Database Migrations Deployment
Push all versioned migrations from `supabase/migrations/` to your live Supabase Postgres database:
```bash
npx supabase db push
```

---

### 4. Database Seeding & Data Reset Scripts
- **Seeding Development Data:**
  Open Supabase Dashboard -> **SQL Editor**, paste and execute `supabase/seed/dev_seed.sql`. This populates 40 teams, 8 groups, 80 round-robin fixtures, plus played/live test matches.
- **Resetting Tournament Data:**
  To wipe all tournament data before real deployment, paste and execute `supabase/seed/reset_data.sql` in the SQL Editor.
- **Automated Schema Verification:**
  Paste and execute `supabase/tests/part-02-checks.sql` in the SQL Editor to run transactionally-isolated assertion checks.

---

### 5. Generate Supabase TypeScript Types
To sync database schema types to `src/types/database.ts` safely without UTF-16 character encoding issues:
```bash
npm run types:gen
```
*(Runs `scripts/gen-types.mjs` via `npx supabase gen types typescript --linked`)*.

---

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 7. Verification Status Page (`/status`)
Visit [http://localhost:3000/status](http://localhost:3000/status) to verify database connectivity.
The page is a dynamic server component that executes live queries against Supabase:
- **`Connected`:** Displays live row counts for `teams`, `matches`, and `match_events`.
- **`Error`:** Displays structured error details (`[code] message`) if queries fail or credentials are invalid.
- **`Missing configuration`:** Displayed when required `NEXT_PUBLIC_` environment variables are absent.

---

## Project Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React UI components
- `src/lib/` - Shared utilities (`env.ts`, typed Supabase browser/server client creators)
- `src/types/` - TypeScript type definitions (`database.ts`)
- `scripts/` - Maintenance scripts (`gen-types.mjs`)
- `supabase/` - Supabase migrations (`migrations/`), seed scripts (`seed/`), and checks (`tests/`)
- `docs/` - Project documentation and architecture specs
