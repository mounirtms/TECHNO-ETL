# 🚀 TECHNO-ETL Deployment Guide

This guide covers deployment strategies for TECHNO-ETL in various environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Production Build](#production-build)
- [Deployment Methods](#deployment-methods)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements

#### **Minimum Requirements**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: 100 Mbps

#### **Recommended Requirements**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: 1 Gbps

### Software Dependencies

#### **Required Software**
- **Node.js** 18+ LTS
- **npm** 9+ or **yarn** 1.22+
- **SQL Server** 2019+ or **Azure SQL**
- **Redis** 6+ (optional but recommended)

#### **Optional Software**
- **PM2** for process management
- **Nginx** for reverse proxy
- **Docker** for containerization
- **Git** for version control

## 🌍 Environment Setup

### **Development Environment**
```bash
# Clone repository
git clone https://github.com/techno-dz/techno-etl.git
cd techno-etl

# Install dependencies
npm install
cd backend && npm install

# Configure environment
cp .env.example .env
cp backend/.env.example backend/.env

# Start development servers
npm run dev:full
```

### **Staging Environment**
```bash
# Build for staging
npm run build
cd backend && npm run build

# Configure staging environment
export NODE_ENV=staging
export PORT=5000

# Start with PM2
npm run pm2:start
```

### **Production Environment**
```bash
# Build for production
npm run build:prod
cd backend && npm run build:prod

# Configure production environment
export NODE_ENV=production
export PORT=5000

# Start with PM2 cluster mode
npm run pm2:start:cluster
```

## 🏗️ Production Build

### **Frontend Build**

1. **Install dependencies**
```bash
npm ci --production=false
```

2. **Build application**
```bash
npm run build
```

3. **Verify build**
```bash
npm run preview
```

### **Backend Build**

1. **Install dependencies**
```bash
cd backend
npm ci --production=false
```

2. **Build application**
```bash
npm run build:prod
```

3. **Install production dependencies**
```bash
npm ci --production=true
```

### **Build Optimization**

#### **Frontend Optimizations**
- **Code splitting** by routes and components
- **Tree shaking** to remove unused code
- **Asset optimization** (images, fonts)
- **Bundle analysis** for size optimization

#### **Backend Optimizations**
- **Minification** of JavaScript files
- **Environment-specific** configurations
- **Dependency optimization** for production
- **Security hardening** configurations

## 🚀 Deployment Methods

### **Method 1: PM2 Deployment (Recommended)**

#### **Setup PM2**
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'techno-etl-backend',
    script: './dist/server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
```

#### **Deploy with PM2**
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

# Monitor processes
pm2 monit
```

### **Method 2: Docker Deployment**

#### **Create Dockerfile**
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Backend Dockerfile
FROM node:18-alpine AS backend-build
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production=false
COPY backend/ .
RUN npm run build:prod

# Production image
FROM node:18-alpine
WORKDIR /app

# Copy backend build
COPY --from=backend-build /app/dist ./backend/dist
COPY --from=backend-build /app/node_modules ./backend/node_modules
COPY --from=backend-build /app/package.json ./backend/

# Copy frontend build
COPY --from=frontend-build /app/dist ./frontend/dist

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "backend/dist/server.js"]
```

#### **Docker Compose**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_SERVER=db
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
    ports:
      - "1433:1433"
    volumes:
      - db_data:/var/opt/mssql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  db_data:
  redis_data:
```

### **Method 3: Cloud Deployment**

#### **Azure App Service**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name techno-etl-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name techno-etl-plan \
  --resource-group techno-etl-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group techno-etl-rg \
  --plan techno-etl-plan \
  --name techno-etl-app \
  --runtime "NODE|18-lts"

# Deploy application
az webapp deployment source config-zip \
  --resource-group techno-etl-rg \
  --name techno-etl-app \
  --src ./build.zip
```

#### **AWS Elastic Beanstalk**
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init techno-etl --platform node.js

# Create environment
eb create production

# Deploy application
eb deploy
```

## 🔧 Configuration

### **Environment Variables**

#### **Production Environment (.env)**
```env
# Application
NODE_ENV=production
PORT=5000
APP_NAME=TECHNO-ETL
APP_VERSION=2.1.0

# Database
DB_SERVER=your-production-db.database.windows.net
DB_DATABASE=MDM_REPORT
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false

# Magento
MAGENTO_BASE_URL=https://your-production-store.com
MAGENTO_ADMIN_TOKEN=your-production-token
MAGENTO_CONSUMER_KEY=your-consumer-key
MAGENTO_CONSUMER_SECRET=your-consumer-secret

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
API_RATE_LIMIT=1000
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/techno-etl/app.log

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
```

### **Nginx Configuration**
```nginx
upstream techno_etl {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static files
    location /static/ {
        alias /var/www/techno-etl/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://techno_etl;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/techno-etl/frontend;
    }
}
```

## 📊 Monitoring & Maintenance

### **Health Monitoring**

#### **Application Health**
```bash
# Check application status
curl -f http://localhost:5000/api/health

# Check PM2 processes
pm2 status

# Check system resources
pm2 monit
```

#### **Database Health**
```bash
# Check database connectivity
npm run test:db

# Monitor database performance
npm run db:monitor
```

### **Log Management**

#### **Application Logs**
```bash
# View real-time logs
pm2 logs

# View specific application logs
pm2 logs techno-etl-backend

# Rotate logs
pm2 install pm2-logrotate
```

#### **System Logs**
```bash
# System logs
journalctl -u techno-etl

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### **Performance Monitoring**

#### **Application Metrics**
- **Response time** monitoring
- **Error rate** tracking
- **Memory usage** monitoring
- **CPU utilization** tracking

#### **Database Metrics**
- **Query performance** monitoring
- **Connection pool** status
- **Deadlock** detection
- **Index usage** analysis

## 🔧 Troubleshooting

### **Common Issues**

#### **Application Won't Start**
```bash
# Check logs
pm2 logs techno-etl-backend

# Check environment variables
printenv | grep NODE_ENV

# Check port availability
netstat -tulpn | grep :5000
```

#### **Database Connection Issues**
```bash
# Test database connectivity
telnet your-db-server 1433

# Check connection string
node -e "console.log(process.env.DB_SERVER)"

# Test SQL connection
npm run test:db
```

#### **High Memory Usage**
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart techno-etl-backend

# Check for memory leaks
node --inspect dist/server.js
```

### **Performance Issues**

#### **Slow Response Times**
1. **Check database queries** for optimization opportunities
2. **Enable Redis caching** for frequently accessed data
3. **Optimize API endpoints** with proper indexing
4. **Scale horizontally** with more instances

#### **High CPU Usage**
1. **Profile application** to identify bottlenecks
2. **Optimize algorithms** and data processing
3. **Implement caching** strategies
4. **Scale vertically** with more CPU cores

## 📞 Support

### **Getting Help**
- **Documentation**: Check this guide and API docs
- **Logs**: Always check application and system logs first
- **Community**: GitHub Issues and Discussions
- **Direct Support**: mounir.webdev.tms@gmail.com

### **Emergency Contacts**
- **Primary**: mounir.ab@techno-dz.com
- **Technical**: mounir.webdev.tms@gmail.com
- **On-call**: Available during business hours (GMT+1)

---

**🚀 Happy Deploying!**

*Built with ❤️ by Mounir Abderrahmani*
