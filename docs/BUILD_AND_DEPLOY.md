# TECHNO-ETL Build & Deployment Guide

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Development Environment](#development-environment)
- [Frontend Build Process](#frontend-build-process)
- [Backend Setup & Commands](#backend-setup--commands)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)
- [CI/CD Pipeline](#cicd-pipeline)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **Sharp**: For image processing (auto-installed)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd Techno-ETL

# Install all dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Copy environment files
cp .env.example .env
cp .env.development.example .env.development
cp .env.production.example .env.production

# Start development servers
npm run dev:full
```

---

## 🛠️ Development Environment

### Available Scripts

#### Frontend Development
```bash
# Start frontend development server (port 80)
npm run dev
npm start

# Start with specific host/port
npm run dev -- --host 0.0.0.0 --port 3000

# Build for development
npm run build:dev

# Preview production build
npm run preview
```

#### Backend Development
```bash
# Start backend development server
npm run backend

# Start backend production server
npm run server

# Backend with specific environment
cd backend && NODE_ENV=development npm run dev
```

#### Full Stack Development
```bash
# Start both frontend and backend
npm run dev:full
npm run start:full

# Start all services (frontend, backend, docs)
npm run start:all
```

### Development Workflow
1. **Frontend**: Vite dev server with HMR on port 80
2. **Backend**: Express server on port 5000
3. **Hot Reload**: Automatic refresh on file changes
4. **API Proxy**: Frontend proxies API calls to backend

---

## 🏗️ Frontend Build Process

### Build Commands
```bash
# Clean build (recommended)
npm run build:clean

# Production build
npm run build

# Development build
npm run build:dev

# Staging build
npm run build:staging

# Optimized build with all checks
npm run build:optimized
```

### Build Process Details

#### 1. Pre-build Checks
```bash
# Security audit
npm run security:audit

# Linting
npm run lint:fix

# Quick tests
npm run test:quick
```

#### 2. Build Configuration
- **Vite**: Modern build tool with optimized bundling
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Images, fonts, and static files
- **Source Maps**: Available in development builds

#### 3. Build Outputs
```
dist/
├── assets/           # Bundled JS/CSS with hashes
├── images/          # Optimized images
├── index.html       # Entry point
└── manifest.json    # PWA manifest
```

### Build Optimization
```bash
# Analyze bundle size
npm run build:analyze

# Bundle visualization
npm run build && npx vite-bundle-analyzer dist
```

---

## 🔧 Backend Setup & Commands

### Environment Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

### Backend Commands
```bash
# Development server with hot reload
npm run dev

# Production server
npm run start
npm run prod

# Build backend
npm run build
npm run build:prod

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

### Backend Configuration
```javascript
// backend/config/index.js
module.exports = {
  port: process.env.PORT || 5000,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME
  },
  magento: {
    baseUrl: process.env.MAGENTO_BASE_URL,
    apiKey: process.env.MAGENTO_API_KEY
  }
};
```

### Required Environment Variables
```bash
# Backend .env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=techno_etl
DB_USER=root
DB_PASS=password
MAGENTO_BASE_URL=https://your-magento.com
MAGENTO_API_KEY=your-api-key
JWT_SECRET=your-jwt-secret
```

---

## 🚀 Production Deployment

### Production Build Process
```bash
# Complete production build
npm run build:optimized

# This runs:
# 1. Clean all build artifacts
# 2. Security audit
# 3. Lint and fix code
# 4. Run tests
# 5. Build frontend (optimized)
# 6. Build backend (optimized)
# 7. Build documentation
# 8. Combine distributions
```

### Deployment Steps

#### 1. Frontend Deployment (Static)
```bash
# Build for production
npm run build

# Deploy to static hosting (Vercel, Netlify, etc.)
# Upload dist/ folder contents

# Or serve with nginx
sudo cp -r dist/* /var/www/html/
```

#### 2. Backend Deployment (Node.js)
```bash
# Build backend
cd backend && npm run build:prod

# Install production dependencies only
npm ci --production

# Start with PM2 (recommended)
pm2 start ecosystem.config.cjs --env production

# Or start directly
NODE_ENV=production npm start
```

#### 3. Full Stack Deployment
```bash
# Build everything
npm run build:all

# Deploy combined distribution
cd dist_prod
npm install --production
npm start
```

### Production Environment Variables
```bash
# Frontend (.env.production)
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true

# Backend (production .env)
NODE_ENV=production
PORT=5000
DB_HOST=your-production-db
MAGENTO_BASE_URL=https://your-production-magento.com
REDIS_URL=redis://your-redis-server:6379
```

---

## ⚙️ Environment Configuration

### Environment Files Structure
```
.env                    # Default environment
.env.development       # Development overrides
.env.production        # Production overrides
.env.staging          # Staging overrides
.env.local            # Local overrides (gitignored)
```

### Frontend Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_MAGENTO_BASE_URL=https://your-magento.com

# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_PROJECT_ID=your-project-id

# Build Configuration
VITE_BUILD_VERSION=1.0.0
VITE_BUILD_DATE=2024-01-01
```

### Backend Environment Variables
```bash
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=techno_etl
DB_USER=root
DB_PASS=password

# External APIs
MAGENTO_BASE_URL=https://your-magento.com
MAGENTO_API_KEY=your-api-key
CEGID_API_URL=https://your-cegid.com
CEGID_API_KEY=your-cegid-key

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
CORS_ORIGIN=http://localhost:3000

# Redis (optional)
REDIS_URL=redis://localhost:6379

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

---

## 🔍 Troubleshooting

### Common Build Issues

#### 1. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use Node Version Manager
nvm install 18
nvm use 18
```

#### 2. Memory Issues During Build
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### 3. Sharp Installation Issues
```bash
# Reinstall Sharp
npm uninstall sharp
npm install sharp --platform=linux --arch=x64
```

#### 4. Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Runtime Issues

#### 1. API Connection Issues
```bash
# Check backend server
curl http://localhost:5000/api/health

# Check environment variables
echo $VITE_API_BASE_URL
```

#### 2. Database Connection Issues
```bash
# Test database connection
cd backend
npm run db:test

# Check database logs
tail -f /var/log/mysql/error.log
```

#### 3. Image Processing Issues
```bash
# Check Sharp installation
node -e "console.log(require('sharp'))"

# Test image processing
cd backend
npm run test:images
```

### Performance Issues

#### 1. Slow Build Times
```bash
# Use build cache
npm run build -- --cache

# Parallel builds
npm run build -- --parallel
```

#### 2. Large Bundle Size
```bash
# Analyze bundle
npm run build:analyze

# Check for duplicate dependencies
npx duplicate-package-checker-webpack-plugin
```

---

## ⚡ Performance Optimization

### Frontend Optimization

#### 1. Code Splitting
```javascript
// Lazy load components
const ProductManagement = lazy(() => import('./pages/ProductManagement'));

// Route-based splitting (already implemented)
const routes = [
  { path: '/products', component: lazy(() => import('./pages/Products')) }
];
```

#### 2. Bundle Optimization
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts']
        }
      }
    }
  }
};
```

#### 3. Asset Optimization
```bash
# Image optimization
npm install --save-dev vite-plugin-imagemin

# PWA optimization
npm install --save-dev vite-plugin-pwa
```

### Backend Optimization

#### 1. Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_date ON orders(created_at);
```

#### 2. Caching Strategy
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache API responses
app.get('/api/products', cache('5 minutes'), getProducts);
```

#### 3. API Optimization
```javascript
// Pagination
app.get('/api/products', (req, res) => {
  const { page = 1, limit = 25 } = req.query;
  // Implement pagination
});

// Compression
app.use(compression());
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test:quick
      - run: npm run security:audit

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build:optimized
      
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Production
        run: |
          # Your deployment script here
          echo "Deploying to production..."
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:optimized

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=database
    depends_on:
      - database

  database:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=techno_etl
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

---

## 📊 Monitoring & Logging

### Application Monitoring
```javascript
// Add to main.jsx
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

if (import.meta.env.PROD) {
  const analytics = getAnalytics(app);
  // Track page views, errors, performance
}
```

### Error Tracking
```javascript
// Error boundary with logging
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to external service
    console.error('Application Error:', error, errorInfo);
    
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }
}
```

### Performance Monitoring
```javascript
// Performance metrics
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance:', entry.name, entry.duration);
  }
});

observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
```

---

## 🔐 Security Considerations

### Frontend Security
```javascript
// Content Security Policy
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">

// Environment variable validation
const requiredEnvVars = ['VITE_API_BASE_URL', 'VITE_FIREBASE_API_KEY'];
requiredEnvVars.forEach(envVar => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### Backend Security
```javascript
// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

---

## 📝 Maintenance & Updates

### Regular Maintenance Tasks
```bash
# Update dependencies
npm update
npm audit fix

# Clean build artifacts
npm run clean:all

# Database maintenance
npm run db:optimize

# Log rotation
logrotate /etc/logrotate.d/techno-etl
```

### Version Management
```bash
# Update version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 📞 Support & Resources

### Documentation
- [Frontend Documentation](./FRONTEND.md)
- [Backend API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Component Library](./COMPONENTS.md)

### Useful Commands Reference
```bash
# Quick development start
npm run dev:full

# Production build and deploy
npm run build:optimized

# Troubleshooting
npm run clean:all && npm install

# Performance analysis
npm run build:analyze

# Security check
npm run security:audit
```

### Contact Information
- **Developer**: Mounir Abderrahmani
- **Email**: mounir.webdev.tms@gmail.com
- **GitHub**: [mounir1.github.io](https://mounir1.github.io)

---

*Last Updated: January 2024*
*Version: 2.1.0*