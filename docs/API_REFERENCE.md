# 🔌 API Reference Documentation

## Overview

The Techno-ETL backend provides a comprehensive RESTful API that serves as a bridge between the React frontend, MDM database, and Magento e-commerce platform. Built with Node.js and Express, it offers caching, authentication, and data transformation capabilities.

## 🏗️ API Architecture

### **Server Configuration**

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:80',
    'http://localhost:3000',
    'https://your-production-domain.com'
  ],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/magento', require('./src/routes/magento'));
app.use('/api/cache', require('./src/routes/cache'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0-210725',
    environment: process.env.NODE_ENV
  });
});
```

### **Base URL & Authentication**

```
Base URL: http://localhost:5000/api
Production: https://your-domain.com/api

Authentication: Bearer Token (when required)
Content-Type: application/json
```

## 📊 Dashboard API Endpoints

### **GET /api/dashboard/stats**

Retrieve comprehensive dashboard statistics.

#### **Request**
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 2800000,
    "totalOrders": 1247,
    "totalProducts": 9114,
    "totalCustomers": 3892,
    "totalCategories": 156,
    "totalBrands": 89,
    "lowStockItems": 23,
    "pendingOrders": 12,
    "growthRates": {
      "revenue": 12.5,
      "orders": 8.2,
      "products": 2.1,
      "customers": 5.7
    },
    "lastUpdated": "2025-07-21T10:30:00Z"
  },
  "cached": true,
  "cacheExpiry": "2025-07-21T10:35:00Z"
}
```

#### **Implementation**
```javascript
// backend/src/routes/dashboard.js
router.get('/stats', async (req, res) => {
  try {
    // Check cache first
    const cached = await cacheService.get('dashboard-stats');
    if (cached) {
      return res.json({
        success: true,
        data: cached.data,
        cached: true,
        cacheExpiry: cached.expiry
      });
    }

    // Fetch from multiple sources
    const [mdmStats, magentoStats] = await Promise.all([
      databaseService.getDashboardStats(),
      magentoService.getOrderStats()
    ]);

    const stats = {
      ...mdmStats,
      ...magentoStats,
      lastUpdated: new Date().toISOString()
    };

    // Cache for 5 minutes
    await cacheService.set('dashboard-stats', stats, 300);

    res.json({
      success: true,
      data: stats,
      cached: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### **GET /api/dashboard/charts**

Retrieve chart data for dashboard analytics.

#### **Response**
```json
{
  "success": true,
  "data": {
    "ordersChart": [
      { "date": "2025-07-01", "orders": 45 },
      { "date": "2025-07-02", "orders": 52 }
    ],
    "customersChart": [
      { "month": "Jan", "customers": 320 },
      { "month": "Feb", "customers": 385 }
    ],
    "productStatsChart": [
      { "name": "Active", "value": 8500, "color": "#4caf50" },
      { "name": "Inactive", "value": 614, "color": "#f44336" }
    ],
    "brandChart": [
      { "name": "Samsung", "value": 1250, "percentage": 15.2 },
      { "name": "Apple", "value": 980, "percentage": 11.9 }
    ],
    "categoryChart": [
      {
        "name": "Electronics",
        "value": 3500,
        "children": [
          { "name": "Smartphones", "value": 1200 },
          { "name": "Laptops", "value": 800 }
        ]
      }
    ]
  }
}
```

## 🛍️ Products API Endpoints

### **GET /api/products**

Retrieve products with pagination, filtering, and sorting.

#### **Request Parameters**
```
page: number (default: 1)
limit: number (default: 100, max: 1000)
search: string (search in name, sku, description)
category: string (category filter)
brand: string (brand filter)
status: string (active, inactive, all)
sortBy: string (name, sku, price, created_at)
sortOrder: string (asc, desc)
```

#### **Request**
```http
GET /api/products?page=1&limit=50&search=samsung&category=smartphones&sortBy=name&sortOrder=asc
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "sku": "SAM-GAL-S24-256-BLK",
        "name": "Samsung Galaxy S24 Ultra 256GB Black",
        "description": "Latest Samsung flagship smartphone",
        "price": 1299.99,
        "stock": 45,
        "category": "Smartphones",
        "brand": "Samsung",
        "status": "active",
        "images": [
          "samsung-galaxy-s24-ultra-black-front.jpg",
          "samsung-galaxy-s24-ultra-black-back.jpg"
        ],
        "attributes": {
          "color": "Black",
          "storage": "256GB",
          "screen_size": "6.8 inches"
        },
        "magento_id": 12345,
        "created_at": "2025-07-01T10:00:00Z",
        "updated_at": "2025-07-20T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 9114,
      "totalPages": 183,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "search": "samsung",
      "category": "smartphones",
      "appliedFilters": 2
    }
  }
}
```

### **POST /api/products**

Create a new product.

#### **Request**
```json
{
  "sku": "NEW-PROD-001",
  "name": "New Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "category": "Electronics",
  "brand": "BrandName",
  "attributes": {
    "color": "Blue",
    "size": "Medium"
  },
  "images": ["image1.jpg", "image2.jpg"]
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "id": 9115,
    "sku": "NEW-PROD-001",
    "message": "Product created successfully"
  }
}
```

### **PUT /api/products/:id**

Update an existing product.

#### **Request**
```json
{
  "name": "Updated Product Name",
  "price": 109.99,
  "stock": 85
}
```

### **DELETE /api/products/:id**

Delete a product.

#### **Response**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### **POST /api/products/bulk**

Perform bulk operations on products.

#### **Request**
```json
{
  "operation": "update_stock",
  "products": [
    { "id": 1, "stock": 50 },
    { "id": 2, "stock": 75 }
  ]
}
```

#### **Supported Operations**
- `update_stock` - Update stock levels
- `update_prices` - Update product prices
- `change_status` - Change product status
- `assign_category` - Assign products to category
- `sync_magento` - Sync products to Magento

## 🗂️ Categories API Endpoints

### **GET /api/categories**

Retrieve category tree structure.

#### **Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic products",
      "parent_id": null,
      "level": 0,
      "product_count": 3500,
      "children": [
        {
          "id": 2,
          "name": "Smartphones",
          "slug": "smartphones",
          "parent_id": 1,
          "level": 1,
          "product_count": 1200,
          "children": []
        }
      ]
    }
  ]
}
```

### **POST /api/categories**

Create a new category.

#### **Request**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "parent_id": 1
}
```

## 🛒 Magento Integration Endpoints

### **GET /api/magento/products**

Retrieve products from Magento API.

#### **Request Parameters**
```
searchCriteria[pageSize]: number
searchCriteria[currentPage]: number
searchCriteria[filterGroups][0][filters][0][field]: string
searchCriteria[filterGroups][0][filters][0][value]: string
```

### **POST /api/magento/products/sync**

Sync products from MDM to Magento.

#### **Request**
```json
{
  "product_ids": [1, 2, 3, 4, 5],
  "sync_options": {
    "update_existing": true,
    "create_new": true,
    "sync_images": true,
    "sync_stock": true
  }
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "synced": 4,
    "created": 2,
    "updated": 2,
    "failed": 1,
    "results": [
      {
        "mdm_id": 1,
        "magento_id": 12345,
        "status": "updated",
        "message": "Product synced successfully"
      }
    ]
  }
}
```

## 💾 Cache Management Endpoints

### **GET /api/cache/stats**

Get cache statistics and status.

#### **Response**
```json
{
  "success": true,
  "data": {
    "redis_connected": true,
    "total_keys": 45,
    "memory_usage": "2.5MB",
    "hit_rate": 85.2,
    "cache_entries": [
      {
        "key": "dashboard-stats",
        "size": "1.2KB",
        "ttl": 245,
        "last_accessed": "2025-07-21T10:30:00Z"
      }
    ]
  }
}
```

### **DELETE /api/cache/clear**

Clear cache entries.

#### **Request**
```json
{
  "pattern": "dashboard-*",
  "confirm": true
}
```

## 🔧 Database Service Layer

### **Database Connection**

```javascript
// backend/src/services/databaseService.js
const sql = require('mssql');

class DatabaseService {
  constructor() {
    this.config = {
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 1433,
      options: {
        encrypt: true,
        trustServerCertificate: true
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    };
  }

  async connect() {
    try {
      this.pool = await sql.connect(this.config);
      console.log('✅ Connected to MDM DB successfully!');
      return this.pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async executeQuery(query, params = {}) {
    try {
      const request = this.pool.request();
      
      // Add parameters
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM Products WHERE Status = 'Active') as totalProducts,
        (SELECT COUNT(*) FROM Categories WHERE Status = 'Active') as totalCategories,
        (SELECT COUNT(*) FROM Brands WHERE Status = 'Active') as totalBrands,
        (SELECT COUNT(*) FROM Products WHERE Stock < 10) as lowStockItems
    `;
    
    const result = await this.executeQuery(query);
    return result[0];
  }

  async getProducts(filters = {}) {
    let query = `
      SELECT 
        p.Id,
        p.SKU,
        p.Name,
        p.Description,
        p.Price,
        p.Stock,
        p.Status,
        c.Name as Category,
        b.Name as Brand,
        p.CreatedAt,
        p.UpdatedAt
      FROM Products p
      LEFT JOIN Categories c ON p.CategoryId = c.Id
      LEFT JOIN Brands b ON p.BrandId = b.Id
      WHERE 1=1
    `;

    const params = {};

    if (filters.search) {
      query += ` AND (p.Name LIKE @search OR p.SKU LIKE @search OR p.Description LIKE @search)`;
      params.search = `%${filters.search}%`;
    }

    if (filters.category) {
      query += ` AND c.Name = @category`;
      params.category = filters.category;
    }

    if (filters.brand) {
      query += ` AND b.Name = @brand`;
      params.brand = filters.brand;
    }

    if (filters.status && filters.status !== 'all') {
      query += ` AND p.Status = @status`;
      params.status = filters.status;
    }

    // Sorting
    const sortBy = filters.sortBy || 'Name';
    const sortOrder = filters.sortOrder || 'ASC';
    query += ` ORDER BY p.${sortBy} ${sortOrder}`;

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 100;
    const offset = (page - 1) * limit;

    query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    params.offset = offset;
    params.limit = limit;

    const products = await this.executeQuery(query, params);
    
    // Get total count
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY.*/, '');
    const countResult = await this.executeQuery(countQuery, params);
    const total = countResult[0].total;

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
}

module.exports = new DatabaseService();
```

## 🔐 Authentication & Security

### **JWT Authentication**

```javascript
// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

### **Rate Limiting**

```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter };
```

---

*Continue reading the next sections for Database Integration, Deployment Guide, and Troubleshooting...*
