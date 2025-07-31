# 🚀 Techno-ETL Comprehensive Documentation

**Version:** 1.0.0-210725  
**Release Date:** July 21, 2025  
**Build Status:** ✅ Production Ready  

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Dashboard System](#dashboard-system)
3. [Product Management Tools](#product-management-tools)
4. [Grid System & Magento Integration](#grid-system--magento-integration)
5. [API Reference](#api-reference)
6. [Database & MDM Correlation](#database--mdm-correlation)
7. [Deployment Guide](#deployment-guide)
8. [Performance & Future Features](#performance--future-features)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### System Architecture

Techno-ETL is a comprehensive e-commerce management system built with modern web technologies, designed to bridge the gap between Magento e-commerce platforms and Master Data Management (MDM) systems.

#### **Core Components**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                     │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  Product Mgmt  │  Grids  │  Image Tools     │
├─────────────────────────────────────────────────────────────┤
│                    Backend (Node.js)                       │
├─────────────────────────────────────────────────────────────┤
│  API Gateway  │  Caching  │  Authentication  │  Proxy      │
├─────────────────────────────────────────────────────────────┤
│     MDM Database     │           Magento API              │
│    (SQL Server)      │        (REST/GraphQL)              │
└─────────────────────────────────────────────────────────────┘
```

#### **Technology Stack**

**Frontend Technologies:**
- **React 18** - Modern React with concurrent features
- **Material-UI 5** - Professional component library
- **MUI X-Data-Grid** - Advanced data grid components
- **React Router v6** - Client-side routing with v7 compatibility
- **Axios** - HTTP client for API communication
- **i18next** - Internationalization framework

**Backend Technologies:**
- **Node.js 18+** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MSSQL** - SQL Server database driver
- **Redis** - Caching and session storage
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

**Database & Integration:**
- **SQL Server** - Master Data Management (MDM)
- **Magento 2 API** - E-commerce platform integration
- **Redis Cache** - Performance optimization
- **File System** - Image processing and storage

### Key Features

#### **🏢 Enterprise-Level Dashboard**
- **8 Professional Stat Cards** with real-time metrics
- **Interactive Charts** with customizable visibility
- **Advanced Settings** with persistent preferences
- **Responsive Design** for all screen sizes
- **Real-time Updates** with auto-refresh capabilities

#### **🛠️ Professional Product Management**
- **Tabbed Interface** with 4 specialized tools
- **Image Processing** (renaming, resizing, optimization)
- **Bulk Operations** for efficient catalog management
- **Smart Caching** for improved performance
- **CSV Integration** for data import/export

#### **📊 Advanced Grid System**
- **Unified Grid Architecture** with standardized components
- **Magento Integration** with real-time synchronization
- **MDM Correlation** for data consistency
- **Virtual Scrolling** for large datasets
- **Context Menus** and floating action buttons

#### **🔧 Image Processing Suite**
- **Automated Renaming** with CSV mapping
- **Standardized Resizing** (1200x1200 with white padding)
- **Batch Processing** with progress tracking
- **Quality Optimization** with 90% JPEG compression
- **Professional Feedback** with detailed results

### System Requirements

#### **Development Environment**
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher (or yarn equivalent)
- **Git** for version control
- **VS Code** (recommended IDE)

#### **Production Environment**
- **Server OS** Windows Server 2019+ or Linux
- **Node.js** 18.0.0 LTS or higher
- **SQL Server** 2017 or higher
- **Memory** 4GB RAM minimum, 8GB recommended
- **Storage** 50GB minimum for application and data
- **Network** Stable internet connection for Magento API

#### **Optional Components**
- **Redis Server** for enhanced caching
- **Nginx/Apache** for reverse proxy
- **SSL Certificate** for HTTPS
- **PM2** for process management

### Installation & Setup

#### **Quick Start**

```bash
# Clone the repository
git clone <repository-url>
cd Techno-ETL

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development
npm run dev          # Frontend (port 80)
npm run backend      # Backend (port 5000)
```

#### **Production Build**

```bash
# Build the application
npm run build

# Start production server
npm run server:production

# Or use PM2 for process management
pm2 start backend/dist/index.js --name "techno-etl"
```

### Project Structure

```
Techno-ETL/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── DashboardSettings.jsx
│   │   │   ├── EnhancedStatsCards.jsx
│   │   │   └── QuickActions.jsx
│   │   ├── grids/               # Data grid components
│   │   │   ├── UnifiedGrid.jsx
│   │   │   ├── ProductsGrid.jsx
│   │   │   └── EnhancedBaseGrid.jsx
│   │   ├── charts/              # Chart components
│   │   │   ├── OrdersChart.jsx
│   │   │   ├── CategoryTreeChart.jsx
│   │   │   └── BrandDistributionChart.jsx
│   │   └── layout/              # Layout components
│   ├── pages/                   # Page components
│   │   ├── Dashboard.jsx
│   │   ├── ProductManagementPage.jsx
│   │   └── ChartsPage.jsx
│   ├── services/                # API services
│   │   ├── api.js
│   │   ├── magentoService.js
│   │   └── cacheService.js
│   ├── config/                  # Configuration files
│   │   ├── gridConfig.js
│   │   └── theme.js
│   └── assets/                  # Static assets
│       ├── data/
│       └── images/
├── backend/                     # Node.js backend server
│   ├── src/                     # Backend source code
│   │   ├── routes/              # API routes
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   └── dashboard.js
│   │   ├── services/            # Business logic
│   │   │   ├── magentoService.js
│   │   │   ├── databaseService.js
│   │   │   └── cacheService.js
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── cors.js
│   │   │   └── errorHandler.js
│   │   └── utils/               # Utility functions
│   ├── queries/                 # SQL query files
│   │   ├── products.sql
│   │   ├── categories.sql
│   │   └── dashboard.sql
│   ├── dist/                    # Built backend files
│   ├── server.js                # Main server file
│   └── package.json             # Backend dependencies
├── docs/                        # Documentation
│   ├── COMPREHENSIVE_DOCUMENTATION.md
│   ├── GRID_DOCUMENTATION.md
│   ├── API_REFERENCE.md
│   └── src/                     # Documentation React app
├── dist/                        # Production build output
├── .vscode/                     # VS Code configuration
│   └── launch.json              # Debug configurations
├── package.json                 # Main dependencies
├── vite.config.js              # Vite configuration
└── README.md                    # Project overview
```

### Environment Configuration

#### **Frontend Environment Variables (.env)**

```env
# Magento Configuration
VITE_MAGENTO_URL=https://your-magento-instance.com
VITE_MAGENTO_USERNAME=your_api_username
VITE_MAGENTO_PASSWORD=your_api_password
VITE_MAGENTO_AUTH_TYPE=basic

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENABLE_MOCK_DATA=false

# Feature Flags
VITE_ENABLE_DASHBOARD_ANALYTICS=true
VITE_ENABLE_IMAGE_PROCESSING=true
VITE_ENABLE_BULK_OPERATIONS=true

# Development Settings
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

#### **Backend Environment Variables**

```env
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DB_SERVER=your-sql-server
DB_DATABASE=your_database
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Magento API Configuration
MAGENTO_BASE_URL=https://your-magento-instance.com
MAGENTO_API_TOKEN=your_magento_token
MAGENTO_API_VERSION=V1
MAGENTO_TIMEOUT=30000

# Security Configuration
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
CORS_ORIGINS=http://localhost:80,https://your-domain.com

# File Processing
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,csv

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### Development Workflow

#### **VS Code Launch Configurations**

The project includes comprehensive VS Code launch configurations for efficient development:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome against localhost",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:80",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "name": "Run Dev",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vite",
      "args": ["--port", "80"],
      "console": "integratedTerminal"
    },
    {
      "name": "Run Backend (inspect)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

#### **Git Workflow**

```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request for review
# After approval, merge to main
git checkout main
git pull origin main
git merge feature/new-feature
git push origin main
```

### Code Quality Standards

#### **ESLint Configuration**

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/prop-types": "off",
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

#### **Naming Conventions**

- **Components**: PascalCase (e.g., `EnhancedStatsCards`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase for JavaScript
- **Constants**: UPPER_SNAKE_CASE
- **CSS Classes**: kebab-case
- **API Endpoints**: RESTful naming

---

*This documentation continues with detailed sections for each component...*
