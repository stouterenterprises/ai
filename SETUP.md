# Nimbus Support Portal Setup

## Database (phpMyAdmin / MySQL) - Recommended
1. Log into your AccuWeb hosting control panel.
2. Create a MySQL database and user (note host, username, and password).
3. Open phpMyAdmin and import the schema from `db/schema.sql`.
4. (Optional) Create a database user with minimum privileges:
   - `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `INDEX` on the Nimbus database.

## Vercel Deployment with phpMyAdmin
1. Import the GitHub repo into Vercel.
2. Vercel should auto-detect Next.js (the included `vercel.json` can stay default).
3. Add environment variables in **Project → Settings → Environment Variables**:
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
4. Deploy. Vercel will build with `npm run build` automatically.

## Local Development
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Populate `.env.local` with your phpMyAdmin credentials:
   - `MYSQL_HOST` - Your MySQL server hostname
   - `MYSQL_PORT` - Your MySQL port (default: 3306)
   - `MYSQL_USER` - Your MySQL username
   - `MYSQL_PASSWORD` - Your MySQL password
   - `MYSQL_DATABASE` - Your database name
   - `AI_PROVIDER_KEY` - Your OpenAI API key
   - `WEBHOOK_SIGNING_SECRET` - A random secret for webhook verification
   - `TWILIO_ACCOUNT_SID` (optional)
   - `TWILIO_AUTH_TOKEN` (optional)
   - `TWILIO_PHONE_NUMBER` (optional)
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

## Messenger Widget Setup

The Nimbus messenger widget is an Intercom-style chat bubble that you can embed on any website to provide AI-powered support to your customers.

### How It Works
- **Simple Embed**: Add a single line of code to your website
- **Persistent Chat Bubble**: Appears in the bottom-right corner like Intercom
- **AI-Powered Responses**: Uses your knowledge base and RAG engine
- **Department Routing**: Supports automatic and manual department selection
- **No Dependencies**: Pure JavaScript, no external libraries required

### Embedding the Widget
1. Navigate to `/widget` in your Nimbus portal
2. Copy the provided snippet code (button in the top section)
3. Paste it into the `<head>` or before the closing `</body>` tag of any website

### Sample Snippet
```html
<script src="https://your-domain.com/widget.js" data-business="YOUR_BUSINESS_ID"></script>
```

### Configuration
- **`src`**: Your Nimbus domain URL followed by `/widget.js`
- **`data-business`**: Your business ID (found in the admin dashboard)

### Widget Features
- **Chat Bubble**: Floating button that expands into a chat window
- **Real-time Messages**: Instant responses from AI with loading indicators
- **Message History**: Maintains conversation in the current session
- **Responsive Design**: Works perfectly on mobile and desktop
- **Auto-routing**: Routes messages to the correct department based on your rules

### Testing the Widget
1. Go to `/widget` in your portal
2. Click "Start a conversation" to test the preview
3. Select a specific department or use "Auto-route (recommended)"
4. Send a test message to verify it's working

### Troubleshooting
- **Widget doesn't appear**: Ensure the URL in the snippet matches your domain
- **No responses**: Check that your business ID is correct in the `data-business` attribute
- **Chat bubble positioning**: The widget appears 20px from bottom-right corner (customizable via CSS)

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
