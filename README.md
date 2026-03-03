# 🛒 E-Commerce Application — Full Stack Solution

## 📋 About the Project

A full-featured e-commerce application built with **React + Node.js + MySQL (TiDB Cloud)**, deployed to production across **Vercel** (frontend), **Koyeb** (backend), and **TiDB Cloud** (database). Includes authentication, payments, image uploads, email notifications, AI-powered recommendations, and a full admin dashboard.

## 🌐 Live Deployment

| Layer    | Platform      | Description                        |
|----------|---------------|------------------------------------|
| Frontend | **Vercel**    | React SPA with automatic CI/CD     |
| Backend  | **Koyeb**     | Node.js REST API (auto-deploy)     |
| Database | **TiDB Cloud**| MySQL-compatible serverless DB     |

## ✨ Features

### 🎨 Frontend
- **React 18** with modern hooks and Vite
- **Tailwind CSS v4** + **shadcn/ui** + **Radix UI** component system
- **React Router v7** for SPA navigation
- **Clerk** for authentication (sign-up, sign-in, OAuth)
- **Context API** for global state management
- **React Hook Form** + **Zod** for forms and validation
- **Stripe.js** for payment UI
- **Framer Motion** for animations
- **Recharts / Chart.js** for analytics dashboards
- **Cloudinary** for image delivery
- **EmailJS** for client-side email (order confirmations, password reset)
- **i18n** internationalization support
- **PWA Ready** with service workers
- **Responsive Design** — mobile-first

### 🔧 Backend
- **Node.js + Express** REST API (ESM modules)
- **Sequelize ORM** with **MySQL2** (TiDB Cloud)
- **Clerk SDK** for server-side authentication verification
- **JWT** with refresh tokens (fallback / session layer)
- **Rate Limiting** (`express-rate-limit`) and security (`helmet`, CORS)
- **File Upload** via **Cloudinary** (multer-storage-cloudinary)
- **Email Service** via **EmailJS**
- **Redis** for caching and session management
- **Stripe** for payment processing and webhooks
- **DeepSeek AI** for product recommendations
- **Swagger / OpenAPI** docs at `/api/docs`
- **Health Checks** at `/api/health`
- **Structured logging** via **Winston** + **express-winston**

### 🚀 DevOps & Deploy
- **Vercel** — automatic frontend deployments from `main` branch
- **Koyeb** — automatic backend deployments from `main` branch
- **TiDB Cloud** — serverless MySQL-compatible database
- **Docker** multi-stage builds (local dev & self-hosted option)
- **Docker Compose** for local orchestration
- **GitHub Actions** CI/CD pipeline
- **Nginx** reverse proxy with SSL (local/self-hosted)
- **Non-root containers** for security

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- pnpm
- Docker & Docker Compose (optional)
- A TiDB Cloud (or local MySQL 8.0+) instance
- Redis 7+

### 1. Clone & Install
```bash
git clone https://github.com/your-username/ecommerce.git
cd ecommerce

# Backend
cd backend && pnpm install

# Frontend
cd ../front-end && pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in your values — see "Environment Variables" section below
```

### 3. Run with Docker (Recommended)
```bash
# Start all services
docker-compose up -d
```

### 4. Run without Docker
```bash
# Terminal 1 — Backend
cd backend && pnpm run dev

# Terminal 2 — Frontend
cd front-end && pnpm run dev
```

### 5. Access the Application
| Service      | URL                            |
|--------------|--------------------------------|
| Frontend     | http://localhost:3000          |
| Backend API  | http://localhost:4000          |
| Admin Panel  | http://localhost:3000/admin    |
| API Docs     | http://localhost:4000/api/docs |

---

## 🏗️ Architecture

```
┌────────────────────┐    ┌───────────────────────┐    ┌──────────────────────┐
│   Frontend         │    │      Backend           │    │     Database          │
│   (React + Vite)   │◄──►│  (Node.js + Express)  │◄──►│  (TiDB Cloud / MySQL) │
│   Vercel           │    │  Koyeb                 │    │  Port: 4000 → TiDB    │
└────────────────────┘    └───────────────────────┘    └──────────────────────┘
          │                          │
          │               ┌──────────────────┐
          │               │     Redis        │
          └───────────────│  (Cache/Session) │
                          │  Port: 6379      │
                          └──────────────────┘
```

**External Services:**
- **Clerk** — Authentication (OAuth, JWT, social logins)
- **Cloudinary** — Image storage & CDN delivery
- **Stripe** — Payment processing & webhooks
- **EmailJS** — Transactional emails
- **DeepSeek AI** — Product recommendation engine

---

## ✅ Functionality

### 👥 Users
- [x] Registration and authentication (Clerk)
- [x] User profile management
- [x] Order history
- [x] Shopping cart
- [x] Favorites / wishlist
- [x] Password recovery

### 🛍️ Products
- [x] Product catalog with pagination
- [x] Search and filters
- [x] Product details
- [x] Image uploads via Cloudinary
- [x] Reviews and ratings
- [x] AI-powered recommendations (DeepSeek)

### 📦 Orders
- [x] Order management
- [x] Order tracking
- [x] Email notifications (EmailJS)
- [x] Order cancellation
- [x] Shipping calculation
- [ ] Multiple payment methods

### 👨‍💼 Admin
- [x] Dashboard with metrics and charts
- [x] Product management (CRUD)
- [x] Category management
- [x] Order management
- [x] User management
- [x] Image upload (Cloudinary)

### 💳 Payments
- [x] Stripe integration
- [x] Credit/Debit card (via Stripe)
- [x] Stripe Webhooks
- [ ] Automatic refunds

---

## 🔐 Environment Variables

All variables are documented in `.env.example`. Below are the **required** ones for production:

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | TiDB Cloud credentials |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Redis connection |
| `JWT_SECRET` | JWT signing secret |
| `CLERK_SECRET_KEY` | Clerk backend SDK key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe keys |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `EMAILJS_SERVICE_ID` / `EMAILJS_PUBLIC_KEY` / `EMAILJS_PRIVATE_KEY` | EmailJS config |
| `DEEPSEEK_API_KEY` | DeepSeek AI API key |
| `VITE_API_URL` | Full URL of the backend API (Koyeb URL) |
| `FRONTEND_URL` / `CORS_ORIGIN` | Vercel frontend URL |

---

## 🗃️ Database Migrations

```bash
cd backend

# Run all pending migrations
pnpm run migrate:latest

# Rollback last migration
pnpm run migrate:rollback

# Seed database
pnpm run migrate:seed

# Create admin user
pnpm run create-admin
```

---

## 📦 Available Scripts

### Backend
```bash
pnpm run dev          # Development with hot reload (nodemon)
pnpm run start        # Production
pnpm run test         # Run Jest test suite
pnpm run lint         # ESLint check
pnpm run lint:fix     # ESLint auto-fix
pnpm run migrate:latest   # Run DB migrations
pnpm run migrate:rollback # Rollback DB migrations
pnpm run migrate:seed     # Seed database
pnpm run create-admin     # Create admin user
```

### Frontend
```bash
pnpm run dev          # Development (Vite)
pnpm run build        # Production build
pnpm run preview      # Preview production build
pnpm run lint         # ESLint check
pnpm run lint:fix     # ESLint auto-fix
```

---

## 🐳 Docker Commands (Local / Self-Hosted)

```bash
# Start all services (development)
docker-compose up -d

# Real-time logs
docker-compose logs -f

# Rebuild a specific service
docker-compose up -d --build backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Production (self-hosted)
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Monitoring & Health Checks

| Endpoint | Description |
|---|---|
| `GET /api/health` | Backend health status |
| `GET /api/docs` | Swagger API documentation |

### Logs
```bash
# Service logs
docker-compose logs backend

# Real-time logs
docker-compose logs -f --tail=100
```

---

## 📚 API Documentation

Interactive Swagger docs are available at:
- **Local:** http://localhost:4000/api/docs
- **Production:** `https://<your-koyeb-url>/api/docs`

---

## 🔒 Security

| Feature | Status |
|---|---|
| Clerk authentication | ✅ |
| JWT with refresh tokens | ✅ |
| Rate limiting | ✅ |
| CORS configured | ✅ |
| Helmet.js security headers | ✅ |
| Input validation (express-validator + Zod) | ✅ |
| SQL injection protection (Sequelize ORM) | ✅ |
| XSS protection | ✅ |
| Non-root Docker containers | ✅ |
| Stripe webhook signature verification | ✅ |

---

## 🚀 Deployment

### Frontend → Vercel
1. Connect the `front-end/` directory to Vercel
2. Set all `VITE_*` environment variables in the Vercel dashboard
3. Deployments trigger automatically on push to `main`

### Backend → Koyeb
1. Connect the `backend/` directory to Koyeb
2. Set all environment variables in the Koyeb service settings
3. Koyeb auto-deploys on push to `main`

### Database → TiDB Cloud
1. Create a **Serverless** cluster on [TiDB Cloud](https://tidbcloud.com)
2. Copy the connection string and set `DB_*` variables accordingly
3. Run migrations: `pnpm run migrate:latest`

### GitHub Actions (CI/CD)
The automated pipeline includes:
- ✅ Code quality checks
- ✅ Automated testing
- ✅ Docker image building
- ✅ Deployment notifications
- [ ] Security scanning (Trivy — planned)

---

## 🤝 Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📞 Support

- 📧 Email: danielnunda@gmail.com

---

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [TiDB Cloud](https://tidbcloud.com/)
- [Vercel](https://vercel.com/)
- [Koyeb](https://www.koyeb.com/)
- [Clerk](https://clerk.com/)
- [Cloudinary](https://cloudinary.com/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Docker](https://www.docker.com/)

---

**🌐 Vercel Frontend | ⚡ Koyeb Backend | 🗄️ TiDB Cloud Database | 🔐 Clerk Auth | 💳 Stripe Payments**
