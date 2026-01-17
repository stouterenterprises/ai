# Nimbus Support Portal Setup

## Quick Start (Recommended)

**Best Option for Your Setup:** Use Vercel with your phpMyAdmin database. No SSH or terminal needed - everything is automated.

1. Push code to GitHub
2. Connect GitHub to Vercel (click a button)
3. Set environment variables in Vercel dashboard
4. Done - Vercel builds and deploys automatically

---

## Authentication Setup

Your app requires authentication to access admin, agent, and customer portal areas.

### Step 1: Generate Admin Password Hash

Run the password hash generator:

```bash
npx ts-node scripts/generate-password-hash.ts
```

Follow the prompts and copy the hash value.

### Step 2: Set Environment Variables

Add these to your `.env.local` (local development) or Vercel dashboard (production):

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<paste the hash from Step 1>
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

### Step 3: Login

- Go to `/login`
- Email: `admin@example.com`
- Password: The password you entered in Step 1
- You'll be able to access `/admin`, `/agent`, and `/portal`

---

## Database (phpMyAdmin / MySQL)

### Step 1: Create a MySQL Database

1. Log into your **cPanel** hosting control panel
2. Find and click **"MySQL Databases"** (or similar)
3. Under "Create New Database":
   - Database name: `nimbus` (or your preferred name)
   - Click **"Create Database"**
4. Note your **database name** - you'll need it later

### Step 2: Create a Database User

1. Still in MySQL Databases section, find "MySQL Users"
2. Under "Add New User":
   - Username: `nimbus_user` (or your preferred username)
   - Password: Create a **strong password** and save it
   - Click **"Create User"**
3. Note your **username and password** - required for Vercel setup

### Step 3: Assign Privileges

1. Under "Add User to Database":
   - User: Select the user you just created
   - Database: Select `nimbus` (or your database name)
   - Click **"Add"**
2. Check the following permissions:
   - ✅ SELECT
   - ✅ INSERT
   - ✅ UPDATE
   - ✅ DELETE
   - ✅ CREATE
   - ✅ ALTER
   - ✅ INDEX
3. Click **"Make Changes"**

### Step 4: Import Database Schema

1. Log into **phpMyAdmin** (usually accessible from cPanel)
2. In the left sidebar, click your database name (`nimbus`)
3. Click the **"Import"** tab at the top
4. Upload the file: `db/schema.sql` (from this repository)
5. Click **"Import"**
6. Wait for success message - your database is now set up!

### Step 5: Enable Remote MySQL Access

**Important:** Vercel needs to connect to your database from remote servers. You must enable remote access in cPanel.

1. In cPanel, find and click **"Remote MySQL"** (or "Remote Database Access")
2. Under "Add a Host":
   - Add `%` (single percent sign - allows all IPs)
   - Click **"Add Host"**
3. Confirm the host appears in the list

**Why this is safe:**
- ✅ Only works with the correct username and password
- ✅ Your database password is your real security layer
- ✅ You'll store credentials securely in Vercel (not in code)
- ✅ Vercel's strong password requirement prevents unauthorized access

### Step 6: Find Your MYSQL_HOST

For remote connections from Vercel, you may need your actual server hostname instead of `localhost`.

1. In cPanel, go to **"MySQL Databases"** again
2. Look for **"MySQL Connection Information"** or **"Remote Connection Information"**
3. Find your **Server Address** or **Hostname**
   - This might look like: `123.45.67.89` or `mysql.yourdomain.com`
4. Use this as your `MYSQL_HOST` value for Vercel (not `localhost`)

### Step 7: Summary of Credentials You Need for Vercel

Write these down - you'll need them in the next step:
```
MYSQL_HOST = your_server_address (from Step 6 - Remote Connection Info)
MYSQL_PORT = 3306 (default)
MYSQL_USER = nimbus_user (what you created in Step 2)
MYSQL_PASSWORD = your_strong_password (what you set in Step 2)
MYSQL_DATABASE = nimbus (what you created in Step 1)
```

**Important:** Use the remote server address from Step 6, NOT `localhost`. Vercel is remote and cannot access `localhost`.

## Deploy with Vercel (No SSH Required)

### Prerequisites
- GitHub account with the repository pushed
- Vercel account (free at vercel.com)
- phpMyAdmin database credentials from your hosting

### Steps

1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js config

2. **Add Environment Variables**
   - In Vercel Project → Settings → Environment Variables
   - Add the following:
     ```
     MYSQL_HOST = your_remote_server_address (from cPanel Remote MySQL Connection Info, NOT localhost)
     MYSQL_PORT = 3306
     MYSQL_USER = your_database_user (from Step 2)
     MYSQL_PASSWORD = your_database_password (from Step 2)
     MYSQL_DATABASE = your_database_name (from Step 1)
     AI_PROVIDER_KEY = your_openai_api_key
     WEBHOOK_SIGNING_SECRET = your_random_secret
     TWILIO_ACCOUNT_SID = (optional)
     TWILIO_AUTH_TOKEN = (optional)
     TWILIO_PHONE_NUMBER = (optional)
     ```

3. **Deploy**
   - Click "Deploy"
   - Vercel automatically runs `npm install` and `npm run build`
   - Your app is live in ~2-3 minutes

4. **Update Code Later**
   - Push changes to GitHub: `git push origin claude/fix-messenger-widget-preview-fENaT`
   - Vercel automatically redeploys

### Why Vercel for You
- ✅ **No SSH/Terminal needed** - everything through web UI
- ✅ **Automatic builds** - no manual `npm install` or `npm run build`
- ✅ **Connects to your MySQL** - uses environment variables
- ✅ **Free tier** - generous limits for small projects
- ✅ **Automatic deploys** - pushes to GitHub trigger builds

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

## cPanel Node.js Hosting (Advanced - Requires SSH)

If your hosting supports Node.js apps and you have SSH access, you can deploy directly to your server without Vercel. However, since you don't have SSH access, **use Vercel instead** (see above).

**Note:** Direct hosting requires:
- SSH terminal access
- Manual `npm install` and `npm run build` commands
- Process manager like PM2 to keep app running
- Manual restarts on code updates

Vercel is simpler and handles all of this automatically.

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
