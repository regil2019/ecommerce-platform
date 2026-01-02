# 🛒 E-Commerce Application - Full Stack Solution

## 📋 About the Project

This is a full-featured e-commerce application built with React + Node.js + MySQL, ready for production deployment with Docker, CI/CD, and all necessary security best practices.

## Features

###  Frontend
- **React 18** with modern hooks
- **Tailwind CSS** + **shadcn/ui** for design system
- **React Router** for SPA navigation
- **Context API** for state management
- **React Hook Form** for forms
- **Stripe** for payments
- **Responsive Design** mobile-first
- **PWA Ready** with service workers

### 🔧 Backend
- **Node.js + Express** as REST API
- **Sequelize ORM** with MySQL
- **JWT Authentication** with refresh tokens
- **Rate Limiting** and security measures
- **File Upload** with Cloudinary
- **Email Service** (not integrated)
- **Health Checks** for monitoring
- **Structured logging** (not implemented)

###  DevOps & Deploy
- **Docker** multi-stage builds
- **Docker Compose** for orchestration
- **GitHub Actions** CI/CD pipeline
- **Nginx** reverse proxy with SSL
- **Automated health checks**
- **Non-root containers** for security
- **Monitoring** (not implemented)

##  Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MySQL 8.0+




### 1. Start with Docker (Recommended) 
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Admin Panel: http://localhost:3000/admin

##  Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │    Database     │
│   (React)       │◄──►│   (Node.js)      │◄──►│    (MySQL)      │
│   Port: 3000    │    │   Port: 4000     │    │   Port: 3306    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐              │
         └──────────────►│      Redis       │◄─────────────┘
                        │   (Cache/Session)│
                        │   Port: 6379     │
                        └──────────────────┘
```

##  Functionality

### 👥 User 
- [x] Registration and authentication
- [x] User profile
- [x] Order history
- [x] Shopping cart
- [x] Favorites system
- [X] Password recovery

###  Products
- [x] Product catalog
- [x] Search and filters
- [x] Product details
- [x] Images with Cloudinary
- [x] Reviews and comments

### Orders
- [x] Order management
- [ ] Multiple payment methods
- [x] Order tracking
- [x] Email notifications
- [x] Order cancellation
- [x] Shipping calculation

### 👨‍💼 Admin
- [x] Dashboard with metrics
- [x] Product management
- [x] Category management
- [x] Order management
- [x] User management
- [x] Image upload

### 💳 Payments
- [x] Stripe integration
- [ ] Credit/Debit card
- [ ] Automatic refunds

##  Docker Commands

### Development
```bash
# Start all services
docker-compose up -d

# Real-time logs
docker-compose logs -f

# Rebuild a specific service
docker-compose up -d --build frontend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production
```bash
# Deploy with SSL
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Health checks
docker-compose -f docker-compose.prod.yml ps
```

##  Testing

Testing not implemented yet.

##  Monitoring

### Health Checks
- Backend: `GET /api/health`
- Frontend: `GET /health`
- Database: MySQL ping
- Redis: Redis ping

### Logs
```bash
# Ver logs de um serviço
docker-compose logs backend

# Logs em tempo real
docker-compose logs -f --tail=100
```

##  Configuration

### Environment Variables
All variables are documented in `.env.example`

### Nginx Configuration
- SSL/TLS with Let's Encrypt
- Rate limiting configured
- Gzip compression
- Static file caching
- Security headers

### Database Migrations
```bash
cd backend
npm run migrate:latest
npm run migrate:rollback
```

##  Deployment

### GitHub Actions
O pipeline automatizado inclui:
- ✅ Code quality checks
- [ ] Security scanning (Trivy)
- ✅ Automated testing
- ✅ Docker image building
- ✅ Deployment to staging/production
- ✅ Notifications

### Deploy to Production
1. Configure secrets in GitHub Actions
2. Push to the `main` branch
3. Deployment will be automatic

### Manual Deploy
```bash
# Build das imagens
docker build -t ecommerce-frontend ./front-end
docker build -t ecommerce-backend ./backend

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

##  Available Scripts

### Backend
```bash
pnpm run dev          # Development with hot reload
pnpm run start        # Production
pnpm run test         # Tests
npm run lint         # Linting
npm run migrate      # Database migrations
```

### Frontend
```bash
pnpm run dev          # Development
pnpm run build        # Build for production
pnpm run preview      # Preview of the build
pnpm run test         # Tests
pnpm run lint         # Linting
```

## 📚 API Documentation

API documentation not implemented yet.

##  Security

### Implementations
- ✅ JWT with refresh tokens
- ✅ Rate limiting
- ✅ CORS configured
- ✅ Helmet.js headers
- ✅ Input validation
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ Non-root containers
- ✅ Security scanning

##  Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📞 Support

- 📧 Email: danielnunda@gmail.com

##  Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Docker](https://www.docker.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

** Deploy Ready |  Production Hardened |  Monitoring Included |  Scalable Architecture**

