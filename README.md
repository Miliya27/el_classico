# Jwala - El Classico (College Football Tournament Website)

A mobile-first website for a college football tournament. Viewers follow live scores, results, group tables, knockout bracket, player stats, and media. Admins manage live scoring and tournament setup.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript strict)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (Postgres, Auth, Realtime, Storage)
- **Deployment:** Vercel

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Miliya27/el_classico.git
   cd el_classico
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Verify Supabase Connection:**
   Visit [http://localhost:3000/status](http://localhost:3000/status) to verify connection to Supabase.

## Project Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React UI components
- `src/lib/` - Shared libraries (Supabase client/server helpers)
- `src/types/` - TypeScript type definitions
- `supabase/` - Supabase CLI configuration and migrations
- `docs/` - Documentation and project reports
