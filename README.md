# 🚀 TECHNO-ETL v2.1.0

**A comprehensive ETL (Extract, Transform, Load) solution with advanced analytics, bug bounty program, and real-time synchronization capabilities.**

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/techno-dz/techno-etl)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18+-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

## 🌟 Overview

TECHNO-ETL is a modern, full-stack enterprise application designed to streamline data operations between multiple systems including Magento, MDM (Master Data Management), and various data sources. Built with React.js frontend and Node.js backend, it provides a robust platform for data synchronization, analytics, and management with an integrated bug bounty program for quality assurance.

## ✨ Key Features

### 🔄 **Data Synchronization**
- **Real-time sync** between Magento and MDM systems
- **Bidirectional data flow** with intelligent conflict resolution
- **Automated scheduling** with cron-based jobs and monitoring
- **Advanced error handling** with retry mechanisms and fallbacks

### 📊 **Advanced Analytics & Dashboards**
- **Interactive dashboards** with real-time metrics and KPIs
- **Custom charts** and visualizations using Recharts
- **Performance monitoring** with system resource tracking
- **Export capabilities** (PDF, Excel, CSV) with custom formatting

### 🐛 **Bug Bounty Program** *(NEW in v2.1.0)*
- **Professional reward system** ($25 - $3,375 based on severity)
- **Firebase integration** for real-time bug tracking
- **Quality-based scoring** with multipliers
- **Gamified leaderboard** with tester rankings
- **Admin panel** for bug review and management

### 🎯 **Product Management**
- **Unified product catalog** across multiple systems
- **Bulk operations** for efficient data management
- **Category management** with hierarchical structures
- **Advanced inventory tracking** and stock management

### 🔐 **Security & Performance**
- **Role-based access control** (RBAC) with JWT
- **API rate limiting** and comprehensive security headers
- **Redis caching** with intelligent cache invalidation
- **Optimized database queries** with connection pooling

### 🎨 **Modern UI/UX**
- **Professional responsive design** for all devices
- **Dark/Light theme** support with system preference detection
- **Multi-language** internationalization (EN, FR, AR, ES)
- **Accessibility** compliant (WCAG 2.1 AA)
- **Smooth animations** and micro-interactions

## 🏗️ Architecture

### **Frontend (React.js + Vite)**
```
src/
├── components/          # Reusable UI components
│   ├── bugBounty/      # Bug bounty system components
│   ├── common/         # Shared components
│   ├── grids/          # Data grid components
│   └── Layout/         # Layout components
├── pages/              # Application pages
├── services/           # API service layer
├── contexts/           # React contexts (Theme, Language, Tabs)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and error handling
└── assets/             # Static assets and translations
```

### **Backend (Node.js + Express)**
```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   └── utils/          # Utility functions
├── swagger/            # API documentation
├── production/         # Production configurations
└── dist/              # Built production files
```

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** 18+ and npm
- **SQL Server** (for MDM data)
- **Redis** (for caching) - Optional but recommended
- **Magento 2.4+** instance
- **Firebase** project (for bug bounty system)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/techno-dz/techno-etl.git
cd techno-etl
```

2. **Install dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
```

3. **Environment Configuration**
```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env

# Configure your environment variables (see below)
```

4. **Start Development Servers**
```bash
# Start both frontend and backend
npm run start:full

# Or start separately
npm run dev          # Frontend (http://localhost:3000)
cd backend && npm run dev  # Backend (http://localhost:5000)
```

## 📋 Environment Configuration

### **Frontend (.env)**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAGENTO_BASE_URL=https://your-magento-store.com

# Firebase Configuration (for Bug Bounty)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Development
VITE_NODE_ENV=development
```

### **Backend (backend/.env)**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_SERVER=localhost
DB_DATABASE=MDM_REPORT
DB_USER=sa
DB_PASSWORD=your-secure-password
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# Magento Configuration
MAGENTO_BASE_URL=https://your-magento-store.com
MAGENTO_ADMIN_TOKEN=your-admin-token
MAGENTO_CONSUMER_KEY=your-consumer-key
MAGENTO_CONSUMER_SECRET=your-consumer-secret

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Security
JWT_SECRET=your-super-secure-jwt-secret
API_RATE_LIMIT=100
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🔧 Available Scripts

### **Frontend Scripts**
```bash
npm run dev          # Start development server (Vite)
npm run start        # Start development server (alias)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run dev:full     # Start both frontend and backend
```

### **Backend Scripts**
```bash
npm run dev          # Start with nodemon (development)
npm run start        # Start production server
npm run build        # Build for production
npm run build:prod   # Build backend with production optimizations
npm run pm2:start    # Start with PM2
npm run pm2:stop     # Stop PM2 processes
npm run pm2:logs     # View PM2 logs
npm run pm2:restart  # Restart PM2 processes
```

## 📊 API Documentation

### **Interactive Documentation**
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/api/health`
- **API Status**: `http://localhost:5000/api/status`

### **Core API Endpoints**

#### **MDM Operations**
```http
GET    /api/mdm/prices              # Get price data with filtering
POST   /api/mdm/sync/prices         # Sync prices to Magento
GET    /api/mdm/inventory/stocks    # Get stock data
POST   /api/mdm/inventory/sync      # Sync stocks to Magento
GET    /api/mdm/sources             # Get available sources
```

#### **Magento Proxy**
```http
GET    /api/magento/products        # Get products
POST   /api/magento/products        # Create product
PUT    /api/magento/products/:id    # Update product
DELETE /api/magento/products/:id    # Delete product
GET    /api/magento/categories      # Get categories
GET    /api/magento/orders          # Get orders
```

#### **Bug Bounty System** *(NEW)*
```http
GET    /api/bugs                    # Get bug reports
POST   /api/bugs                    # Submit bug report
PUT    /api/bugs/:id                # Update bug status
GET    /api/bugs/leaderboard        # Get tester leaderboard
GET    /api/bugs/stats              # Get bug statistics
```

#### **Analytics & Reporting**
```http
GET    /api/analytics/dashboard     # Dashboard metrics
GET    /api/analytics/reports       # Generate reports
POST   /api/analytics/export        # Export data
GET    /api/analytics/performance   # Performance metrics
```

## 🗃️ Combining Frontend, Backend, and Docs

We've set up a build process that combines frontend, backend, and documentation into a single production-ready distribution:

```bash
npm run build:optimized
```

This command will:
1. Clean any existing builds.
2. Lint and fix the code.
3. Build the frontend, backend, and documentation.
4. Combine all three into the `dist_prod` directory.

## 🐛 Bug Bounty Program

### **Reward Structure**
| Category | Base Reward | Multiplier | Max Reward |
|----------|-------------|------------|------------|
| **Critical** | $500 | 3.0x | $3,375 |
| **High** | $200 | 2.0x | $600 |
| **Medium** | $100 | 1.5x | $225 |
| **Low** | $50 | 1.0x | $75 |
| **Enhancement** | $25 | 0.8x | $30 |

### **Quality Multipliers**
- **⭐⭐⭐⭐⭐ Excellent**: 1.5x bonus
- **⭐⭐⭐⭐ Good**: 1.2x bonus
- **⭐⭐⭐ Average**: 1.0x standard
- **⭐⭐ Poor**: 0.8x reduction
- **⭐ Very Poor**: 0.5x reduction

### **How to Participate**
1. Navigate to `/bug-bounty` in the application
2. Click the "+" button to report a bug
3. Fill out the comprehensive bug report form
4. Track your submissions and earnings
5. Climb the leaderboard!

## 📞 Support & Contact

### **Technical Support**
- **Primary Contact**: mounir.ab@techno-dz.com
- **Development Support**: mounir.webdev.tms@gmail.com
- **Bug Reports**: Use the integrated bug bounty system
- **Feature Requests**: Submit via GitHub Issues

### **Documentation**
- **API Documentation**: `http://localhost:5000/api-docs`
- **Bug Bounty Guide**: [BUG_BOUNTY_README.md](BUG_BOUNTY_README.md)
- **Deployment Guide**: [docs/deployment.md](docs/deployment.md)
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React.js** and **Material-UI** teams for excellent frameworks
- **Node.js** and **Express.js** communities for robust backend tools
- **Firebase** team for real-time database capabilities
- **Vite** team for lightning-fast development experience
- All **contributors** and **beta testers** for their valuable feedback

---

**🚀 Built with ❤️ by Mounir Abderrahmani**
- **Email**: mounir.ab@techno-dz.com
- **Contact**: mounir.webdev.tms@gmail.com

*Last updated: August 5, 2025 - Version 2.1.0*

# Techno-ETL Development Summary (August 2025)

## Major Enhancements & Features

### 1. Unified Grid System
- All grid components (BaseGrid, EnhancedBaseGrid, OptimizedDataGrid) have been unified into a single, feature-rich BaseGrid.
- Duplicate and deprecated grid files have been removed.
- All usages now reference the unified grid, ensuring consistency and maintainability.

### 2. CMS Pages & Blocks Management
- EnhancedCmsPagesGrid now supports editing and creating CMS Pages and Blocks with a professional dialog.
- The dialog features tabs for General, Content (with a ReactQuill HTML editor), SEO, and Advanced fields.
- All content changes are saved directly to Magento using the correct API POST/PUT calls.
- Improved error handling, validation, and user feedback.
- Fixed React warnings (findDOMNode, validateDOMNesting) for a cleaner developer experience.

### 3. CMS Blocks Grid
- Added an Edit action to CmsBlocksGrid, allowing direct editing of the content field with a ReactQuill HTML editor.
- All changes are saved to Magento via the API.

### 4. License Management (Backend Utility)
- Utility functions for checking and setting user license status using Firebase.
- Ready for UI integration to allow admin assignment of licenses and permissions.

### 5. UI/UX & Code Quality
- Improved error boundaries and feedback for all grids.
- Enhanced stats cards and toolbar for CMS management.
- Fixed all known React warnings and improved code structure for maintainability.

## How to Use
- Manage CMS Pages/Blocks from the CMS grid. Use the edit button to open the dialog and update content, SEO, and advanced fields. All changes are synced with Magento.
- License management utilities are available in `src/utils/licenseUtils.js` and can be integrated into an admin UI as needed.

## Next Steps
- (Optional) Build a UI for license and permission management, connecting to Firebase.
- Continue to tune and optimize the grid and CMS management experience as needed.

---

**All changes have been tested and are working as intended.**

For more details, see the in-code comments and documentation in each component.
