# Nimbus Support Portal

Nimbus is a production-ready, Intercom-style AI support portal built with Next.js (App Router), MySQL, and OpenAI. It supports multi-department routing, AI bots with RAG, ticketing, and integrations.

## Highlights
- Multi-tenant businesses with departments, per-department bots, and routing.
- MySQL-backed storage with tenant-scoped data access.
- AI-first messenger widget with escalation paths.
- Help Center, customer portal, agent inbox, and admin console.
- Integrations hub with outbound/inbound webhooks.

## Scripts
- `npm run dev` — run local dev server
- `npm run build` — build for production
- `npm run lint` — lint code
- `npm run db:seed` — seed MySQL with demo data

## Repo Structure
```
app/                 Next.js routes and API handlers
components/          Shared UI components
db/                  MySQL schema
lib/                 Data access, RAG, and config services
scripts/             Seed script
```

See [SETUP.md](./SETUP.md) for complete setup and deployment instructions.
