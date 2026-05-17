# The Safe Space Global

A high-performance, SEO-optimised website for **The Safe Space Global** — a mental health platform for individuals, corporates, and schools.

Built with **Next.js 15** (frontend) and **Strapi v5** (headless CMS backend).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript) |
| CMS / Backend | Strapi v5 (self-hosted) |
| Database | SQLite (local dev) |
| Image Optimisation | imgproxy (Docker) |
| Deployment | Docker / standalone |

---

## Project Structure

```
thesafespaceglobal/
├── frontend/          # Next.js 15 app
├── backend/           # Strapi v5 CMS
├── docker-compose.yml # imgproxy service
└── README.md
```

---

## Prerequisites

Make sure the following are installed on your system:

- **Node.js** `>=20.x` and `<=24.x` (check with `node -v`)
- **npm** `>=6.0.0` (check with `npm -v`)
- **Docker** (optional — only needed for image proxy)

> If you switch Node versions, always run `npm rebuild` inside `backend/` to recompile native SQLite bindings.

---

## 1. Clone the Repository

```bash
git clone <your-repo-url> thesafespaceglobal
cd thesafespaceglobal
```

---

## 2. Backend Setup (Strapi v5)

### Install dependencies

```bash
cd backend
npm install
```

### Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `backend/.env` and ensure the following are set:

```dotenv
# Server
HOST=0.0.0.0
PORT=1337

# Secrets (generate random base64 strings for each)
APP_KEYS=<key1>,<key2>,<key3>,<key4>
API_TOKEN_SALT=<random>
ADMIN_JWT_SECRET=<random>
TRANSFER_TOKEN_SALT=<random>
ENCRYPTION_KEY=<random>
JWT_SECRET=<random>

# Database (SQLite for local dev — no extra setup needed)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Admin UI
STRAPI_DISABLE_UPDATE_NOTIFICATION=true
STRAPI_HIDE_STARTUP_MESSAGE=true
```

> You can generate secrets with: `openssl rand -base64 32`

### Create the database directory

```bash
mkdir -p .tmp
```

### Rebuild native modules (required if you switch Node versions)

```bash
npm rebuild
```

### Start the backend

```bash
npm run dev
```

Strapi admin will be available at: **http://localhost:1337/admin**

On first launch, you'll be prompted to **create an admin account**.

### Configure API Permissions

After creating your admin account:

1. Go to **Settings → Users & Permissions Plugin → Roles → Public**
2. For each content type (`Blog Post`, `Event`, `Service`, `Team Member`), enable **`find`** and **`findOne`**
3. Click **Save**

> Alternatively, use an **API Token** (recommended for production — see Step 3 below).

### Create API Token (Recommended)

1. Go to **Settings → API Tokens → Create new API Token**
2. Set **Token type** to `Read-only`, and **Duration** to `Unlimited`
3. Click **Save** and copy the generated token
4. Paste it into `frontend/.env.local` as `STRAPI_API_TOKEN=<token>`

### Register the Revalidation Webhook

So the frontend updates automatically when you publish content:

1. Go to **Settings → Webhooks → Create new webhook**
2. Set:
   - **Name**: `Frontend Revalidate`
   - **URL**: `http://localhost:3000/api/revalidate?secret=safespace-revalidate-2024`
   - **Events**: ✅ `Entry > Create`, `Entry > Update`, `Entry > Publish`, `Entry > Delete`
3. Click **Save**

---

## 3. Frontend Setup (Next.js 15)

### Install dependencies

```bash
cd frontend
npm install
```

### Configure environment

Create `frontend/.env.local`:

```bash
touch frontend/.env.local
```

Add the following:

```dotenv
# URL of your running Strapi backend
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# API token from Strapi (Settings → API Tokens)
STRAPI_API_TOKEN=<your-strapi-api-token>

# Must match the secret in your Strapi webhook URL
REVALIDATE_SECRET=safespace-revalidate-2024

# Email delivery for password reset, waitlist, orders, and contact forms
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=<your-email-address>
SMTP_APP_PASSWORD=<your-app-password>
SMTP_FROM=<your-email-address>
CONTACT_NOTIFY_EMAIL=<team-inbox@yourdomain.com>
```

Contact form submissions send a confirmation email back to the sender and a notification to the team inbox above.

If your provider still uses `SMTP_PASS` (or `SMTP_PASSWORD`), the API accepts it for compatibility, but `SMTP_APP_PASSWORD` is the preferred field for app-specific mail access.

### Start the frontend

```bash
npm run dev
```

The website will be available at: **http://localhost:3000**

---

## 4. Image Proxy (Optional)

imgproxy is used to serve optimised WebP images. Start it with Docker:

```bash
docker-compose up -d
```

The proxy will run at **http://localhost:8080**.

---

## 5. Running Both Simultaneously

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Content Types

The following content types are available in the Strapi admin:

| Content Type | Frontend Route | Fields |
|---|---|---|
| Blog Post | `/blog`, `/blog/[slug]` | title, slug, excerpt, body, featured_image, categories, tags, publish_date, author |
| Event | `/events`, `/events/[id]` | — |
| Service | `/services` | — |
| Team Member | `/about` | — |

> ⚠️ **Always use the Content-Type Builder in the Strapi Admin UI** to add/edit fields — never edit `schema.json` files manually to avoid typos breaking the schema.

---

## Publishing Content

1. Open **http://localhost:1337/admin**
2. Navigate to **Content Manager → Blog Post** (or another type)
3. Click **Create new entry**
4. Fill in the fields — the `slug` auto-generates from `title`
5. Click **Save**, then click **Publish**

> Draft entries are **not** returned by the API. You must click **Publish** for content to appear on the frontend.

---

## Common Errors & Fixes

### `SqliteError: unable to open database file`
The `.tmp/` directory is missing. Run:
```bash
mkdir -p backend/.tmp
```

### `Error: NODE_MODULE_VERSION mismatch`
You switched Node.js versions. Rebuild native modules:
```bash
cd backend && npm rebuild
```

### `403 Forbidden` on API calls
Either the Public role permissions aren't set, or the API token in `frontend/.env.local` is missing/wrong. See Step 2 → Configure API Permissions.

### Blank Strapi admin page
The `backend/src/admin/app.tsx` may have an invalid API call. Check that `bootstrap()` doesn't call methods that don't exist on the `StrapiApp` type in v5.

---

## Production Build

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Backend
```bash
cd backend
npm run build
npm start
```

---

## Managed by
**Wincore** — [wincoremedia.com](https://wincoremedia.com)
