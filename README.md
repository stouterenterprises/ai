# Nimbus Support Portal

Nimbus is a production-ready, Intercom-style AI support portal built with Next.js (App Router), Supabase, and Vercel. It supports multi-department routing, AI bots with RAG, ticketing, and integrations.

## Highlights
- Multi-tenant businesses with departments, per-department bots, and routing.
- Supabase Auth + RLS enforced for every tenant boundary.
- AI-first messenger widget with escalation paths.
- Help Center, customer portal, agent inbox, and admin console.
- Integrations hub with outbound/inbound webhooks.

## Scripts
- `npm run dev` — run local dev server
- `npm run build` — build for production
- `npm run lint` — lint code
- `npm run db:seed` — seed Supabase with demo data

## Repo Structure
```
app/                 Next.js routes and API handlers
components/          Shared UI components
lib/                 Supabase, RAG, and config services
scripts/             Seed script
supabase/migrations/ Database migrations + RLS
```

See [SETUP.md](./SETUP.md) for complete setup and deployment instructions.
