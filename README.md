# 🛒 E-Commerce Application — Full Stack Solution

## 📋 About the Project

A full-featured e-commerce application built with **React + Node.js + MySQL**, deployed to production across **Vercel** (frontend), **Koyeb** (backend), and **TiDB Cloud** (database). Includes JWT authentication, payments, image uploads, email notifications, AI-powered recommendations, and a complete admin dashboard.

## 🌐 Live Deployment

| Layer    | Platform       | Description                    |
|----------|----------------|--------------------------------|
| Frontend | **Vercel**     | React SPA with automatic CI/CD |
| Backend  | **Koyeb**      | Node.js REST API (auto-deploy) |
| Database | **TiDB Cloud** | MySQL-compatible serverless DB |

---

## ✨ Features

### 🎨 Frontend
- **React 18** + **Vite** — fast SPA with modern hooks
- **Tailwind CSS v4** + **shadcn/ui** + **Radix UI** component system
- **React Router v7** for client-side navigation
- **Custom JWT Auth** — login, register, profile, password reset
- **Context API** for global state (auth, cart)
- **React Hook Form** + **Zod** for forms and validation
- **Stripe.js** for payment UI
- **Framer Motion** + **Magic UI** for animations
- **Recharts** for analytics dashboards
- **Cloudinary** for image delivery
- **EmailJS** for transactional emails
- **i18n** internationalization (PT/EN)
- **Responsive Design** — mobile-first

### 🔧 Backend
- **Node.js + Express** REST API (ESM modules)
- **Sequelize ORM** with **MySQL2** (TiDB Cloud compatible)
- **JWT Authentication** — custom implementation with `jsonwebtoken` + `bcrypt`
- **Rate Limiting** (`express-rate-limit`) and security (`helmet`, CORS)
- **File Upload** via **Cloudinary** (multer-storage-cloudinary)
- **Email Service** via **EmailJS**
- **Redis** for caching and session management
- **Stripe** for payment processing and webhooks
- **DeepSeek AI** for product recommendations
- **Swagger / OpenAPI** docs at `/api/docs`
- **Health Checks** at `/api/health`
- **Structured logging** via **Winston**

### 🚀 DevOps & Deploy
- **Vercel** — automatic frontend deployments from `main`
- **Koyeb** — automatic backend deployments from `main`
- **TiDB Cloud** — serverless MySQL-compatible database
- **Docker** multi-stage builds with **non-root containers**
- **Docker Compose** — single command to run entire stack locally
- **Nginx** reverse proxy with dynamic DNS resolution
- **GitHub Actions** CI/CD pipeline with security scanning

---

## ⚡ Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- Or: Node.js 20+ + pnpm + MySQL 8+ + Redis 7+

### Option A — Docker (Recommended)
```bash
git clone https://github.com/your-username/ecommerce.git
cd ecommerce

# Copy and configure environment variables
cp .env.example backend/.env
# Edit backend/.env with your values (JWT_SECRET, Cloudinary, Stripe, etc.)

# Start everything with one command
docker compose up -d
```

✅ All 4 services start automatically: **MySQL · Redis · Backend · Frontend**

| Frontend    | http://localhost:5173 (Vite)   |
| Backend API | http://localhost:4000/api      |
| Admin Panel | http://localhost:5173/admin    |
| API Docs    | http://localhost:4000/api/docs |

### Option B — Local Development (without Docker)
```bash
# Backend
cd backend && pnpm install && pnpm run dev

# Frontend (new terminal)
cd front-end && pnpm install && pnpm run dev
```

---

## 🏗️ Architecture

```
┌─────────────────────┐    ┌────────────────────────┐    ┌───────────────────────┐
│   Frontend          │    │       Backend           │    │      Database         │
│  React + Vite       │◄──►│  Node.js + Express      │◄──►│  TiDB Cloud / MySQL   │
│  Vercel / nginx     │    │  Koyeb / Docker         │    │  Port 3306            │
└─────────────────────┘    └────────────────────────┘    └───────────────────────┘
                                        │
                            ┌───────────────────────┐
                            │        Redis          │
                            │  Cache / Rate Limit   │
                            │  Port 6379            │
                            └───────────────────────┘
```

**External Services:**
- **Cloudinary** — Image storage & CDN delivery
- **Stripe** — Payment processing & webhooks
- **EmailJS** — Transactional emails
- **DeepSeek AI** — Product recommendation engine

---

## ✅ Functionality

### 👥 Users
- [x] Registration and login (JWT — custom implementation)
- [x] User profile management
- [x] Password recovery via email token
- [x] Order history
- [x] Shopping cart (persistent)
- [x] Favorites / wishlist

### 🛍️ Products
- [x] Product catalog with pagination and filters
- [x] Product detail pages
- [x] Image uploads via Cloudinary
- [x] Reviews and ratings
- [x] AI-powered recommendations (DeepSeek)

### 📦 Orders
- [x] Order creation and management
- [x] Order status tracking
- [x] Email notifications (EmailJS)
- [x] Order cancellation

### 👨‍💼 Admin Dashboard
- [x] Metrics and charts (Recharts)
- [x] Product CRUD + image management
- [x] Category management
- [x] Order management & status updates
- [x] User management

### 💳 Payments
- [x] Stripe integration (card payments)
- [x] Stripe Webhooks

---

## 🔐 Environment Variables

Copy `.env.example` to `backend/.env` and fill in your values.

**Required for production:**

| Variable | Description |
|---|---|
| `JWT_SECRET` | Strong random secret for JWT signing |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Database credentials |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe keys |
| `EMAILJS_SERVICE_ID` / `EMAILJS_PUBLIC_KEY` | EmailJS config |
| `DEEPSEEK_API_KEY` | DeepSeek AI API key |
| `FRONTEND_URL` / `CORS_ORIGIN` | Frontend URL (for CORS) |
| `VITE_API_URL` | Backend API URL (used by frontend build) |

---

## 🗃️ Database

```bash
cd backend

# Run all pending migrations
pnpm run migrate:latest

# Rollback last migration
pnpm run migrate:rollback

# Seed database with sample data
pnpm run migrate:seed
```

---

## 📦 Scripts

### Backend
```bash
pnpm run dev          # Development with hot reload
pnpm run start        # Production
pnpm run test         # Jest test suite
pnpm run lint         # ESLint
pnpm run migrate:latest   # Run DB migrations
pnpm run create-admin     # Create admin user
```

### Frontend
```bash
pnpm run dev          # Development (Vite)
pnpm run build        # Production build
pnpm run lint         # ESLint
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker compose up -d

# View real-time logs
docker compose logs -f

# Rebuild a specific service after code changes
docker compose up -d --build backend

# Stop all services
docker compose down

# Stop and remove volumes (resets database)
docker compose down -v

# Production (self-hosted)
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔒 Security

| Feature | Status |
|---|---|
| Custom JWT authentication | ✅ |
| Password hashing (bcrypt, cost 12) | ✅ |
| Rate limiting (express-rate-limit) | ✅ |
| CORS configured | ✅ |
| Helmet.js security headers | ✅ |
| Input validation (express-validator + Zod) | ✅ |
| SQL injection protection (Sequelize ORM) | ✅ |
| Non-root Docker containers | ✅ |
| Stripe webhook signature verification | ✅ |
| Trivy vulnerability scanning (CI/CD) | ✅ |

---

## 🚀 Deployment

### Frontend → Vercel
1. Connect the `front-end/` directory to Vercel
2. Set `VITE_API_URL` and other `VITE_*` environment variables
3. Deployments trigger automatically on push to `main`

### Backend → Koyeb
1. Connect the `backend/` directory to Koyeb
2. Set all environment variables in the Koyeb service settings
3. Koyeb auto-deploys on push to `main`

### Database → TiDB Cloud
1. Create a **Serverless** cluster on [TiDB Cloud](https://tidbcloud.com)
2. Set `DB_*` variables with the connection details
3. Run migrations: `pnpm run migrate:latest`

### CI/CD Pipeline (GitHub Actions)
On every push to `main` or `develop`:
- ✅ Code quality checks (ESLint)
- ✅ Backend test suite (Jest)
- ✅ Frontend production build validation
- ✅ Security scanning (Trivy + pnpm audit)
- ✅ Docker image build & push to GHCR
- ✅ Automatic deployment

---

## 🤝 Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit (`git commit -m 'feat: add new feature'`)
4. Push (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📞 Contact

- 📧 danielnunda@gmail.com

---

## 🙏 Acknowledgements

[React](https://reactjs.org/) · [Node.js](https://nodejs.org/) · [Express](https://expressjs.com/) · [Sequelize](https://sequelize.org/) · [TiDB Cloud](https://tidbcloud.com/) · [Vercel](https://vercel.com/) · [Koyeb](https://www.koyeb.com/) · [Cloudinary](https://cloudinary.com/) · [Stripe](https://stripe.com/) · [Tailwind CSS](https://tailwindcss.com/) · [shadcn/ui](https://ui.shadcn.com/) · [Docker](https://www.docker.com/)

---

**🌐 Vercel Frontend · ⚡ Koyeb Backend · 🗄️ TiDB Cloud · 🔐 JWT Auth · 💳 Stripe Payments**
