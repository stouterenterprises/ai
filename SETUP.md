# Nimbus Support Portal Setup

## Vercel + Supabase (no CLI)
### Supabase Database
1. Create a Supabase project.
2. Open **SQL Editor** and run the schema in `db/schema.postgres.sql`.
3. Grab the **Connection string** from **Settings → Database**.
   - Prefer the pooled connection string for serverless.
   - Ensure the connection string includes `?sslmode=require`.
4. Save the connection string for the `DATABASE_URL` environment variable.

### Vercel Deployment
1. Import the GitHub repo into Vercel.
2. Vercel should auto-detect Next.js (the included `vercel.json` can stay default).
3. Add environment variables in **Project → Settings → Environment Variables**:
   - `DATABASE_URL` (Supabase connection string)
   - `AI_PROVIDER_KEY`
   - `WEBHOOK_SIGNING_SECRET`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `SKIPCALLS_API_KEY` (optional)
   - `SKIPCALLS_WEBHOOK_SECRET` (optional)
4. Deploy. Vercel will build with `npm run build` automatically.

### Supabase Notes
- `DATABASE_URL` takes precedence over MySQL credentials.
- The seed script (`npm run db:seed`) supports both MySQL and Postgres as long as the database URL or MySQL credentials are set.

## Database (phpMyAdmin / MySQL)
1. Log into your AccuWeb hosting control panel.
2. Create a MySQL database and user (note host, username, and password).
3. Open phpMyAdmin and import the schema from `db/schema.sql`.
4. (Optional) Create a database user with minimum privileges:
   - `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `INDEX` on the Nimbus database.

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
   - `DATABASE_URL` (Supabase Postgres connection string, optional)
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
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

## AccuWeb Deployment (Node.js App)
1. Create a Node.js application in AccuWeb (select the latest LTS Node version).
2. Point the app root to your deployed repository (or upload the build files).
3. Set the environment variables from `.env.local` in the AccuWeb Node.js app settings.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Build the app:
   ```bash
   npm run build
   ```
6. Start the app:
   ```bash
   npm run start
   ```
7. Ensure the hosting firewall allows outbound HTTPS for OpenAI, Twilio, Zapier, etc.

## Webhooks
### Zapier (Webhooks by Zapier)
1. Create a new Zap with **Catch Hook**.
2. Copy the hook URL into the `integrations` table (provider `zapier`).
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
