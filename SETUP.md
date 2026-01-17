# Nimbus Support Portal Setup Guide

## Quick Start (Recommended)

**Tech Stack:** Supabase (PostgreSQL) + Next.js + Vercel

This setup works perfectly with Vercel and requires no terminal access.

1. Create a free Supabase account
2. Push code to GitHub
3. Connect to Vercel (click a button)
4. Add environment variables
5. Done - your portal is live!

---

## Step-by-Step Setup

### Step 1: Create a Supabase Account

Supabase is a PostgreSQL database in the cloud - perfect for Vercel.

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub or email
4. Create a new project:
   - **Project name:** `nimbus-portal` (or your preferred name)
   - **Password:** Create a strong password and save it
   - **Region:** Choose closest to your users (e.g., US East)
   - Click **"Create new project"**
5. Wait 1-2 minutes for the project to initialize

### Step 2: Get Your Supabase Credentials

Once your project is ready:

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL** → Use this for `NEXT_PUBLIC_SUPABASE_URL`
   - **Service Role Key** (marked as "secret") → Use this for `SUPABASE_SERVICE_ROLE_KEY`

**Save these somewhere safe** - you'll need them in a moment.

### Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste this SQL into the editor:

```sql
-- Create businesses table
create table if not exists businesses (
  id char(36) primary key,
  name varchar(255) not null,
  slug varchar(255) unique not null,
  allow_department_picker tinyint(1) default 1,
  default_department_id char(36) null,
  created_at timestamp default current_timestamp
);

-- Create departments table
create table if not exists departments (
  id char(36) primary key,
  business_id char(36) not null,
  name varchar(255) not null,
  description text,
  enabled_channels json,
  routing_keywords json,
  default_queue varchar(255),
  hours json,
  branding json,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade
);

-- Create tickets table
create table if not exists tickets (
  id char(36) primary key,
  business_id char(36) not null,
  department_id char(36),
  conversation_id char(36),
  subject varchar(255) not null,
  status varchar(50) default 'open',
  priority varchar(50) default 'medium',
  assignee_id char(36),
  tags json,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null,
  foreign key (conversation_id) references conversations(id) on delete set null
);

-- Create conversations table
create table if not exists conversations (
  id char(36) primary key,
  business_id char(36) not null,
  department_id char(36),
  customer_id char(36),
  subject varchar(255),
  status varchar(50) default 'open',
  channel varchar(50) default 'chat',
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

-- Create jobs table
create table if not exists jobs (
  id bigint unsigned primary key auto_increment,
  business_id char(36) not null,
  type varchar(255) not null,
  payload json not null,
  status varchar(50) default 'queued',
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade
);
```

4. Click **"Run"** (or ⌘+Enter / Ctrl+Enter)
5. You should see "Success" for each table created

### Step 4: Generate Admin Password

You need a secure password hash for logging into the admin panel.

**Two options:**

**Option A: Generate it locally (if you can run commands)**
```bash
npx ts-node scripts/generate-password-hash.ts
```
Follow the prompts and copy the hash.

**Option B: Use a pre-generated hash**
Use this test hash (replace later with your own):
```
$2b$10$G/c7o2SiYrZ/1dbToB0nbOxgBN8e9AFrLsstTYFforTaqSHENgu8q
```
Admin email: `admin@example.com`
Admin password: `admin123`

### Step 5: Deploy to Vercel

1. Push your code to GitHub (if not already done)
   ```bash
   git push origin claude/fix-messenger-widget-preview-fENaT
   ```

2. Go to https://vercel.com and sign in

3. Click **"Add New Project"**

4. Import your GitHub repository

5. Add Environment Variables:
   - In **Settings** → **Environment Variables**, add these:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
   ADMIN_EMAIL = admin@example.com
   ADMIN_PASSWORD_HASH = $2b$10$G/c7o2SiYrZ/1dbToB0nbOxgBN8e9AFrLsstTYFforTaqSHENgu8q
   NEXTAUTH_SECRET = your-random-secret-here
   AI_PROVIDER_KEY = your_openai_api_key_here
   WEBHOOK_SIGNING_SECRET = your_random_webhook_secret
   ```

6. Click **"Deploy"**

7. Wait 2-3 minutes for deployment to complete

### Step 6: Login and Test

1. Visit your deployed site (Vercel gives you a URL like `your-project.vercel.app`)
2. Go to `/login`
3. Login with:
   - Email: `admin@example.com`
   - Password: `admin123` (or whatever you set)

4. Try these workflows:
   - **Create a Business** → Admin page → Add Business
   - **Create a Department** → Click business → Add Department
   - **Test the Widget** → Go to `/widget` page
   - **Escalate** → Click chat widget, then "Request Human Support"
   - **Agent Inbox** → Go to `/agent` to see tickets
   - **Customer Portal** → Go to `/portal` to view tickets

---

## Local Development

If you want to develop locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD_HASH=your_hash
   NEXTAUTH_SECRET=your_secret
   AI_PROVIDER_KEY=your_openai_key
   WEBHOOK_SIGNING_SECRET=your_secret
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

---

## Features Implemented

- ✅ **Admin Console** - Manage multiple businesses and departments
- ✅ **Authentication** - Secure admin login with password hashing
- ✅ **Messenger Widget** - Intercom-style chat bubble for customers
- ✅ **Chat Escalation** - Convert chats to support tickets
- ✅ **Agent Inbox** - Manage and update ticket status
- ✅ **Customer Portal** - View tickets and status
- ✅ **API Endpoints** - Full REST API for all operations
- ✅ **Vercel Ready** - Deploy with one click

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Database access token | `eyJhbGc...` |
| `ADMIN_EMAIL` | Admin login email | `admin@example.com` |
| `ADMIN_PASSWORD_HASH` | Bcrypt password hash | `$2b$10$...` |
| `NEXTAUTH_SECRET` | Session encryption secret | `random-string` |
| `AI_PROVIDER_KEY` | OpenAI API key | `sk-...` |
| `WEBHOOK_SIGNING_SECRET` | Webhook verification secret | `random-string` |

## Troubleshooting

### "Failed to load businesses" Error
- Check Supabase environment variables are set correctly in Vercel
- Verify database tables exist (run SQL in Supabase SQL Editor)

### Can't login
- Use the email and password you set (default: `admin@example.com` / `admin123`)
- Check `ADMIN_PASSWORD_HASH` is set correctly in Vercel

### Widget not showing
- Go to `/widget` page to see the live widget preview
- Check browser console for errors (F12)

### Need to change admin password
- Run `npx ts-node scripts/generate-password-hash.ts` locally
- Update `ADMIN_PASSWORD_HASH` in Vercel settings
- Redeploy

---

## Support

For issues:
1. Check Vercel deployment logs (Deployments → click latest → Logs tab)
2. Check browser console (F12 → Console tab)
3. Check Supabase dashboard for database errors
