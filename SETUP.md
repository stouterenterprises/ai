# Nimbus Support Portal Setup

## Supabase
1. Create a new Supabase project.
2. In **SQL Editor**, run the migration SQL from `supabase/migrations/0001_init.sql`.
3. Enable pgvector (already in the migration). Verify under **Database → Extensions**.
4. Create storage buckets:
   - `attachments` (private)
   - `kb-assets` (public)
5. Configure Auth:
   - Enable email/password.
   - (Optional) Enable OAuth providers.
6. Set **Site URL** and **Redirect URLs**:
   - Local: `http://localhost:3000`
   - Vercel: `https://YOUR_APP.vercel.app`
7. Enable Realtime for tables:
   - `conversations`, `messages`, `tickets`, `ticket_comments`

## Local Development
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Populate `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_PROVIDER_KEY`
   - `WEBHOOK_SIGNING_SECRET`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `SKIPCALLS_API_KEY` (optional)
   - `SKIPCALLS_WEBHOOK_SECRET` (optional)
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Seed demo data:
   ```bash
   npm run db:seed
   ```

## GitHub + Vercel
1. Push the repo to GitHub.
2. Import the repository into Vercel.
3. Set the environment variables in Vercel (same as `.env.local`).
4. Deploy.
5. Update Supabase **Site URL** and **Redirect URLs** with your Vercel domain.
6. Verify login and data access in production.

## Webhooks
### Zapier (Webhooks by Zapier)
1. Create a new Zap with **Catch Hook**.
2. Copy the hook URL into the `integrations` table.
3. Configure event types:
   - `conversation.started`, `message.sent`, `ticket.created`, `ticket.status_changed`, `conversation.escalated_to_human`, `kb.article.published`.

### Twilio
1. Configure your Twilio phone number to point to `https://YOUR_DOMAIN/api/webhooks`.
2. Include `x-nimbus-signature` header using your webhook signing secret.

### SkipCalls
1. Set webhook to `https://YOUR_DOMAIN/api/webhooks`.
2. Verify signature using `SKIPCALLS_WEBHOOK_SECRET`.

### CRM + Zendesk
1. Add connector records in `integrations` with provider `hubspot`, `salesforce`, `zoho`, `pipedrive`, or `zendesk`.
2. Store OAuth tokens in the `config` JSON.
3. Configure outbound webhooks for ticket updates.

## Smoke Test Checklist
- Create a business and multiple departments.
- Ingest a website via `/api/ingest`.
- Load `/widget` and start a conversation.
- Verify AI answers include citations.
- Escalate to agent and create a ticket.
- Confirm the ticket appears in `/portal`.
- Trigger a Zapier webhook.
