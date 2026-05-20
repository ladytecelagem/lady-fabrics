# Lady Fabrics — Enterprise Textile Platform 

Architectural textile intelligence platform. Next.js 16 · Sanity CMS · Supabase · Railway.

## Stack
- **Next.js 16** (App Router, RSC, Server Actions)
- **TypeScript** strict
- **Tailwind v4** + custom design tokens
- **Framer Motion** + Lenis smooth scroll
- **Sanity CMS** (embedded studio at `/studio`)
- **Supabase** (auth, RLS, storage, ops data)
- **next-intl** (en, pt, es)
- **Anthropic SDK** (PDF sample-book vision parsing)
- **Railway** deploy

## Setup

```bash
git clone https://github.com/ladytecelagem/lady-fabrics.git
cd lady-fabrics
cp .env.example .env.local
npm install
```

Fill `.env.local` with Sanity, Supabase and Anthropic credentials.

```bash
npm run dev          # site at :3000
# Studio at :3000/studio
# Admin at :3000/admin
```

## Sanity
1. Create project at sanity.io/manage.
2. Set `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET=production`.
3. Generate API token (Editor) → `SANITY_API_WRITE_TOKEN`.
4. Add CORS origin for your domain.
5. Configure webhook → `POST /api/revalidate` with `SANITY_WEBHOOK_SECRET`.

## Supabase
1. Create project → grab URL + anon + service keys.
2. Apply migrations:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
3. Create your admin user in Auth → set role to `superadmin` in `profiles`:
   ```sql
   update profiles set role='superadmin' where email='you@example.com';
   ```

## Architecture

```
app/
  (site)/          Public site (i18n)
  (admin)/admin/   Operational admin (Supabase auth)
  studio/          Embedded Sanity Studio
  api/             Server routes (sample-request, pdf-parse, revalidate…)
components/
  site/  admin/  sample-book/  motion/  ui/
lib/
  sanity/  supabase/  i18n/  pdf/  auth/
sanity/schemas/    Content model
supabase/migrations/  DB + RLS
```

## Sample Book PDF Pipeline
1. Admin uploads PDF → `sample-books-source` bucket
2. Job inserted in `sample_book_jobs`
3. `/api/pdf-parse` renders pages → uploads to `sample-books-pages`
4. AI vision extracts patterns / colors / notes per page
5. Pages synced to Sanity `sampleBook.pages[]`
6. Public viewer at `/sample-books/[slug]`

## Deploy (Railway)
1. Connect GitHub repo
2. Add env vars (see `.env.example`)
3. Deploy — `railway.json` + `nixpacks.toml` handle build

## License
Proprietary © Lady Fabrics Corp.
