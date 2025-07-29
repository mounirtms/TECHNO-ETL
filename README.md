# TECHNO-ETL

![TECHNO-ETL Logo](https://img.shields.io/badge/TECHNO--ETL-v1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

A comprehensive ETL (Extract, Transform, Load) system for managing data synchronization between MDM (Master Data Management) and Magento e-commerce platform. Built by **Mounir Abderrahmani**.

## 🚀 Features

### 🔄 **Data Synchronization**
- **MDM Integration**: Seamless connection to Master Data Management systems
- **Real-time Sync**: Live data synchronization capabilities with configurable intervals
- **Bulk Operations**: Efficient bulk data processing for large datasets
- **Error Handling**: Comprehensive error tracking and recovery mechanisms

### 🛒 **Magento Integration**
- **REST API Proxy**: Direct proxy to all Magento REST API endpoints
- **Authentication**: Automatic token management and renewal
- **Multi-Store Support**: Handle multiple Magento stores and websites
- **Inventory Management**: Multi-Source Inventory (MSI) support

### 📊 **Dashboard & Monitoring**
- **Real-time Dashboard**: Live monitoring of sync operations and system health
- **Performance Metrics**: Resource utilization tracking and analytics
- **Task Management**: Built-in task tracking and voting system
- **Audit Logs**: Comprehensive logging and audit trails

### 🔧 **Developer Experience**
- **Swagger Documentation**: Interactive API documentation
- **TypeScript Support**: Full TypeScript support for better development experience
- **Hot Reload**: Development servers with hot reload capabilities
- **Testing Suite**: Comprehensive test coverage

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Systems       │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • MDM Database  │
│ • Task Mgmt     │    │ • Sync Services │    │ • Magento API   │
│ • Monitoring    │    │ • Proxy Layer   │    │ • Redis Cache   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend Components
- **Express.js Server**: RESTful API with comprehensive endpoints
- **Database Layer**: SQL Server connections with connection pooling
- **Sync Services**: Automated data synchronization with error recovery
- **Proxy Layer**: Magento REST API proxy with authentication
- **Cron Jobs**: Scheduled tasks for automated operations

### Frontend Components
- **React Application**: Modern SPA with responsive design
- **Dashboard**: Real-time data visualization and control panels
- **Task Interface**: User-friendly task management system
- **Notification System**: Real-time updates and alerts

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **SQL Server** (for MDM database)
- **Redis** (optional, for caching)
- **Git** for version control

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/TECHNO-ETL.git
cd TECHNO-ETL
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../
npm install
```

4. **Configure environment variables:**
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your database and API credentials

# Frontend configuration  
cp .env.example .env
# Edit .env with your frontend configuration
```

5. **Start development servers:**
```bash
# Terminal 1: Backend server
cd backend
npm run dev

# Terminal 2: Frontend server
cd ../
npm start
```

6. **Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

## 📚 API Documentation

### Interactive Documentation
Access the comprehensive Swagger API documentation:
- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-domain.com/api-docs

### Key API Endpoints

#### 🔄 **MDM Operations**
```bash
# Get price data from MDM database
GET /api/mdm/prices?limit=100&sku=PROD-001

# Sync processed prices to Magento
POST /api/mdm/prices/sync-to-magento
{
  "products": [{"sku": "PROD-001", "currentPrice": 29.99, "newPrice": 32.99}]
}

# Get stock data with source filtering
GET /api/mdm/inventory/stocks?sourceCode=MAIN&limit=50

# Sync stocks for specific source (MDM Grid operation)
POST /api/mdm/inventory/sync-stocks
{
  "sourceCode": "MAIN",
  "products": [{"sku": "PROD-001", "quantity": 100}]
}

# Bulk stock sync (Dashboard operation)
POST /api/mdm/inventory/sync-all-stocks

# Get available data sources
GET /api/mdm/sources
```

#### 🛒 **Magento Proxy (Official API Mirror)**
```bash
# Get products (mirrors /rest/V1/products)
GET /api/magento/products?searchCriteria[pageSize]=200&searchCriteria[currentPage]=1

# Get categories (mirrors /rest/V1/categories)
GET /api/magento/categories

# Get orders (mirrors /rest/V1/orders)
GET /api/magento/orders?searchCriteria[pageSize]=50

# Get admin token (mirrors /rest/V1/integration/admin/token)
POST /api/magento/admin/token

# Get inventory sources (mirrors /rest/V1/inventory/sources)
GET /api/magento/inventory/sources
```

#### 📊 **System & Monitoring**
```bash
# Health check
GET /api/health

# System metrics
GET /api/metrics

# Task management
GET /api/task/features
GET /api/task/categories
GET /api/task/stats
```

## ⚙️ Configuration

### Database Configuration
Configure your MDM database in `backend/src/config/database.js`:

```javascript
export const dbConfig = {
  server: 'your-sql-server.com',
  database: 'MDM_REPORT',
  user: 'your-username',
  password: 'your-password',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  }
};
```

### Magento Configuration
Set up Magento API credentials in `backend/src/config/magento.js`:

```javascript
export const cloudConfig = {
  baseURL: 'https://your-magento-store.com',
  username: 'your-api-username',
  password: 'your-api-password',
  timeout: 30000,
  retries: 3
};
```

### Environment Variables
```bash
# Backend (.env)
NODE_ENV=development
PORT=5000
DB_SERVER=your-sql-server
DB_DATABASE=MDM_REPORT
DB_USER=your-username
DB_PASSWORD=your-password
MAGENTO_BASE_URL=https://your-magento-store.com
MAGENTO_USERNAME=your-api-username
MAGENTO_PASSWORD=your-api-password
REDIS_URL=redis://localhost:6379

# Frontend (.env)
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

## 🛠️ Development

### Backend Development
```bash
cd backend

# Development with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start:prod

# Run with PM2
npm run pm2:start
```

### Frontend Development
```bash
# Development server
npm start

# Production build
npm run build

# Test the build locally
npm run serve
```

### Code Quality
```bash
# Backend linting
cd backend
npm run lint
npm run lint:fix

# Frontend linting
npm run lint
npm run lint:fix

# Run tests
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Build backend
cd backend
npm run build:prod

# Build frontend
cd ../
npm run build
```

### PM2 Deployment (Recommended)
```bash
cd backend

# Start with PM2
npm run pm2:start

# Monitor
npm run pm2:status
npm run pm2:logs
npm run pm2:monit

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

## 📊 Monitoring & Maintenance

### Health Monitoring
- **Backend Health**: http://localhost:5000/api/health
- **System Metrics**: http://localhost:5000/api/metrics
- **PM2 Monitoring**: `npm run pm2:monit`

### Logging
```bash
# Application logs
tail -f backend/logs/combined-$(date +%Y-%m-%d).log

# PM2 logs
npm run pm2:logs

# Error logs
tail -f backend/logs/error-$(date +%Y-%m-%d).log
```

### Performance Optimization
- **Database**: Connection pooling and query optimization
- **Caching**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for API responses
- **Rate Limiting**: API rate limiting to prevent abuse

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
npm run test:db

# Verify connection string
node -e "console.log(process.env.DB_SERVER)"
```

#### Magento API Issues
```bash
# Test Magento connectivity
curl -X POST "http://localhost:5000/api/magento/admin/token"

# Check Magento credentials
npm run test:magento
```

#### Performance Issues
```bash
# Check system resources
npm run metrics

# Monitor PM2 processes
npm run pm2:monit

# Analyze bundle size
npm run build:analyze
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Follow semantic versioning

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mounir Abderrahmani**
- Email: mounir.ab@techno-dz.com
- Contact: mounir.webdev.tms@gmail.com
- GitHub: [@mounir-abderrahmani](https://github.com/mounir-abderrahmani)

## 🆘 Support

### Documentation
- **API Documentation**: [Swagger UI](http://localhost:5000/api-docs)
- **User Guide**: [docs/user-guide.md](docs/user-guide.md)
- **Developer Guide**: [docs/developer-guide.md](docs/developer-guide.md)

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/your-org/TECHNO-ETL/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/TECHNO-ETL/discussions)
- **Email**: mounir.webdev.tms@gmail.com

### Magento API Reference
This backend serves as a proxy to Magento web services. For detailed Magento API documentation, refer to:
- [Magento REST API Documentation](https://devdocs.magento.com/guides/v2.4/rest/bk-rest.html)
- [Magento Web API Authentication](https://devdocs.magento.com/guides/v2.4/get-started/authentication/gs-authentication.html)

---

**Built with ❤️ by Mounir Abderrahmani**
