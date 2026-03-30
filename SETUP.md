# LumoCommerce — Setup Guide for Buyers

> Full-stack AI E-commerce | React 18 + Node.js + MySQL + Stripe + DeepSeek AI

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| pnpm | 8+ | `npm i -g pnpm` |
| MySQL | 8+ | https://dev.mysql.com/downloads/ |
| Git | any | https://git-scm.com |

---

## Step 1 — Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example backend/.env
```

Open `backend/.env` and fill in every `REPLACE_WITH_*` field:

| Variable | Where to get it |
|---|---|
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `DB_*` | Your MySQL credentials |
| `ADMIN_EMAIL` | The email you want for the admin account |
| `ADMIN_PASSWORD` | A strong password (min 8 chars) |
| `ADMIN_EMAILS` | Same as `ADMIN_EMAIL` |
| `CLOUDINARY_*` | https://cloudinary.com → Dashboard |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | https://dashboard.stripe.com/webhooks |
| `EMAILJS_*` | https://www.emailjs.com → Account |
| `DEEPSEEK_API_KEY` | https://platform.deepseek.com → API Keys |
| `FRONTEND_URL` | Your frontend URL (e.g. `https://your-store.vercel.app`) |

---

## Step 2 — Database Setup

Create the MySQL database:

```sql
CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Step 3 — Install & Start

```bash
# Backend
cd backend
pnpm install
pnpm start        # Tables are auto-created on first run

# Create admin account (run once)
node scripts/create-admin.js

# Frontend
cd ../front-end
pnpm install
pnpm run dev      # Development
pnpm run build    # Production build
```

---

## Step 4 — Deploy to Production (Recommended Stack)

### Frontend → Vercel (free)
1. Import repo at https://vercel.com/new
2. Set build command: `cd front-end && pnpm install && pnpm run build`
3. Set output dir: `front-end/dist`
4. Add env var: `VITE_API_URL=https://your-backend.koyeb.app/api`

### Backend → Koyeb (free tier)
1. Create account at https://koyeb.com
2. New App → GitHub → select this repo
3. Build command: `cd backend && pnpm install`
4. Start command: `node backend/server.js`
5. Add all `backend/.env` variables in Koyeb's environment settings

### Database → TiDB Cloud (free tier, MySQL-compatible)
1. Create cluster at https://tidbcloud.com
2. Get connection string → paste as `DATABASE_URL` in Koyeb

---

## Step 5 — Stripe Webhooks

In Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://your-backend.koyeb.app/api/payment/webhook`
- Events: `checkout.session.completed`, `payment_intent.succeeded`

Copy the **signing secret** → `STRIPE_WEBHOOK_SECRET` in your env.

---

## Default Admin Access

After running `node scripts/create-admin.js`:
- **URL**: `https://your-store/admin`
- **Email**: whatever you set in `ADMIN_EMAIL`
- **Password**: whatever you set in `ADMIN_PASSWORD`

---

## Project Structure

```
ecommerce/
├── backend/
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # Sequelize models (auto-migrated)
│   │   ├── middleware/  # Auth, rate limiting
│   │   ├── services/    # Email, AI, Stripe
│   │   └── config/      # env, database
│   └── scripts/         # Admin creation, seeding
└── front-end/
    └── src/
        ├── pages/       # public/ and admin/
        ├── components/  # Reusable UI
        ├── hooks/       # useCart, useAuth, etc.
        └── i18n/        # EN / PT / RU translations
```

---

## Support

Purchased via Gumroad/Lemon Squeezy? Reply to your purchase receipt for support.  
Includes **30 days of setup support**.
