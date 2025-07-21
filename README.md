# Techno ETL - Magento Product Management System

A comprehensive React-based admin dashboard for Magento product management with advanced ETL capabilities, featuring modern UI components, floating action buttons, and professional product catalog management.

## 🚀 Features

### Frontend Features
- **Modern React 18** with Material-UI 5 components
- **Dark Mode Support** with theme switching
- **RTL Support** for Arabic/Hebrew languages
- **Responsive Design** optimized for all devices
- **Advanced Data Grids** with filtering, sorting, and pagination
- **Floating Action Buttons (FAB)** for space-efficient UI
- **Floating Windows** with popover interfaces
- **Product Catalog Management** with bulk operations
- **Category Tree Management** with hierarchical structure
- **Manual Data Refresh** capabilities
- **Professional Dashboard** with statistics cards

### Backend Features
- **Node.js Express Server** with production optimization
- **MDM Database Integration** with SQL Server support
- **Magento API Proxy** with caching and authentication
- **RESTful API Endpoints** for all operations
- **CORS Configuration** for multiple origins
- **Production Build System** with webpack optimization
- **Health Check Endpoints** for monitoring
- **Error Handling** with comprehensive logging

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- SQL Server (for MDM database)
- Magento 2 instance (optional, for live data)

### Development Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Techno-ETL
```

2. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update database connection settings
   - Configure Magento API credentials (optional)

4. **Start development servers:**

**Frontend (React):**
```bash
npm run dev
# Runs on http://localhost:80
```

**Backend (Node.js):**
```bash
npm run backend
# Runs on http://localhost:5000
```

### Production Deployment

1. **Build the project:**
```bash
npm run build
```

2. **Deploy backend:**
```bash
cd dist/backend
node index.js
# OR
node start-server.js production
```

3. **Serve frontend:**
```bash
npx serve -s dist -l 80
```

## 📁 Project Structure

```
Techno-ETL/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── grids/               # Data grid components
│   │   ├── dialogs/             # Modal dialogs
│   │   ├── layout/              # Layout components
│   │   └── dashboard/           # Dashboard components
│   ├── services/                # API services
│   ├── assets/                  # Static assets and data
│   ├── config/                  # Configuration files
│   └── App.jsx                  # Main application component
├── backend/                     # Node.js backend server
│   ├── src/                     # Backend source code
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic services
│   │   ├── middleware/          # Express middleware
│   │   └── utils/               # Utility functions
│   ├── queries/                 # SQL query files
│   └── server.js                # Main server file
├── dist/                        # Production build output
│   ├── backend/                 # Built backend files
│   └── [frontend files]         # Built frontend files
└── .vscode/                     # VS Code configuration
    └── launch.json              # Debug configurations
```

## 🎨 Key Components

### Frontend Components
- **`ProductsGrid.jsx`** - Simple product listing with sync functionality
- **`ProductCatalogManagement.jsx`** - Advanced product management with FABs
- **`UnifiedGrid.jsx`** - Standardized grid foundation for all data tables
- **`FloatingActionButtons`** - Space-efficient action interfaces
- **`BulkOperationDialogs`** - Bulk product management dialogs
- **`CategoryTreeDialog`** - Hierarchical category management

### Backend Services
- **`magentoService.js`** - Magento API integration and proxy
- **`databaseService.js`** - MDM database operations
- **`cacheService.js`** - Redis caching layer
- **`authService.js`** - Authentication and authorization

## 🔧 VS Code Launch Configurations

The project includes comprehensive VS Code launch configurations for easy development and debugging:

### Development Configurations
- **Launch Chrome against localhost** - Opens frontend in Chrome debugger
- **Run Dev** - Starts development server with hot reload
- **Run Backend (inspect)** - Starts backend with Node.js inspector
- **Run Server (backend/server.js)** - Direct server execution
- **Run Auth Server (nodemon)** - Authentication server with auto-restart

### Production Configurations
- **Run Production Backend (dist/backend)** - Runs built backend directly
- **Run Production Backend with Startup Script** - Uses startup script for production
- **Test Production Build** - Builds and tests production version
- **Serve Production Frontend** - Serves built frontend files

### Utility Configurations
- **Build Project** - Builds entire project for production
- **Preview Build (vite preview)** - Previews production build
- **Run Clean Script** - Cleans build artifacts
- **Lint Code** - Runs ESLint for code quality
- **Deploy to Firebase** - Deploys to Firebase hosting

## 📦 Dependencies

### Frontend Dependencies
- **React 18** - Modern React with concurrent features
- **Material-UI 5** - Comprehensive React UI framework
- **MUI X-Data-Grid** - Advanced data grid components
- **Emotion** - CSS-in-JS styling solution
- **Stylis** - CSS preprocessor for RTL support
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Backend Dependencies
- **Express.js** - Web application framework
- **MSSQL** - SQL Server database driver
- **Redis/IORedis** - Caching and session storage
- **Axios** - HTTP client for external APIs
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression middleware

## 🌐 Environment Variables

### Frontend Environment Variables
```env
VITE_MAGENTO_URL=https://your-magento-instance.com
VITE_MAGENTO_USERNAME=your_api_username
VITE_MAGENTO_PASSWORD=your_api_password
VITE_MAGENTO_AUTH_TYPE=basic
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_SERVER=your-sql-server
DB_DATABASE=your_database
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
REDIS_URL=redis://localhost:6379
MAGENTO_BASE_URL=https://your-magento-instance.com
MAGENTO_API_TOKEN=your_magento_token
```

## 🏗️ Development Standards

### Code Quality
- **ESLint Configuration** - Enforces consistent code style
- **Prettier Integration** - Automatic code formatting
- **TypeScript Support** - Type safety for better development experience
- **Component Documentation** - JSDoc comments for all components
- **Git Hooks** - Pre-commit hooks for code quality

### Architecture Principles
- **Modular Design** - Separation of concerns with clear boundaries
- **Reusable Components** - DRY principle with shared components
- **Service Layer** - Business logic separated from UI components
- **Error Boundaries** - Graceful error handling throughout the app
- **Performance Optimization** - React.memo, virtualization, and lazy loading

### Naming Conventions
- **Components** - PascalCase (e.g., `ProductCatalogManagement`)
- **Files** - PascalCase for components, camelCase for utilities
- **Variables** - camelCase for JavaScript, kebab-case for CSS
- **Constants** - UPPER_SNAKE_CASE for configuration values
- **API Endpoints** - RESTful naming with clear resource identification

## 📚 API Documentation

### Backend API Endpoints

#### Products
- `GET /api/products` - List all products with pagination
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update existing product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/bulk` - Bulk operations on products

#### Categories
- `GET /api/categories` - Get category tree
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Attributes
- `GET /api/attributes` - List product attributes
- `POST /api/attributes/refresh` - Manual refresh attributes from Magento

#### Health & Monitoring
- `GET /api/health` - Health check endpoint
- `GET /api/status` - Detailed system status

## 🚀 Production Deployment Guide

### Server Requirements
- **Node.js 18+** - Runtime environment
- **SQL Server** - Database server
- **Redis** (optional) - Caching layer
- **Reverse Proxy** - Nginx or Apache for production
- **SSL Certificate** - HTTPS support

### Deployment Steps

1. **Build the application:**
```bash
npm run build
```

2. **Copy dist folder to production server:**
```bash
scp -r dist/ user@server:/path/to/app/
```

3. **Install production dependencies:**
```bash
cd /path/to/app/dist/backend
npm install --production
```

4. **Start the backend server:**
```bash
# Method 1: Direct execution
node index.js

# Method 2: With startup script
node start-server.js production

# Method 3: With PM2 (recommended)
pm2 start index.js --name "techno-etl-backend"
```

5. **Serve frontend files:**
```bash
# Using serve package
npx serve -s /path/to/app/dist -l 80

# Or configure Nginx to serve static files
```

### Production Monitoring

- **Health Check**: `GET /api/health`
- **System Status**: `GET /api/status`
- **Logs**: Check application logs for errors
- **Performance**: Monitor CPU, memory, and database connections

## 🔍 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Check if port is available
netstat -an | grep :5000

# Check environment variables
echo $NODE_ENV
echo $PORT
```

#### Database Connection Issues
```bash
# Test SQL Server connection
sqlcmd -S server -U username -P password

# Check connection string in environment variables
# Verify firewall settings
```

#### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Check for peer dependency conflicts
npm ls
```

#### Magento API Issues
- Verify API credentials and permissions
- Check Magento API endpoint accessibility
- Review CORS settings in Magento admin
- Validate authentication token expiration

## 📈 Performance Optimization

### Frontend Optimizations
- **Code Splitting** - Lazy loading of components
- **Virtual Scrolling** - Efficient rendering of large datasets
- **React.memo** - Prevent unnecessary re-renders
- **Image Optimization** - Compressed and responsive images
- **Bundle Analysis** - Monitor bundle size and dependencies

### Backend Optimizations
- **Database Indexing** - Optimize query performance
- **Redis Caching** - Cache frequently accessed data
- **Connection Pooling** - Efficient database connections
- **Compression** - Gzip response compression
- **Rate Limiting** - Prevent API abuse

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'feat: add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Create a Pull Request

### Code Review Guidelines
- Ensure all tests pass
- Follow established coding standards
- Include documentation for new features
- Update README if necessary
- Test in both development and production environments

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Material-UI Team** - For the excellent React UI framework
- **React Team** - For the amazing React library
- **Express.js Team** - For the robust web framework
- **Microsoft** - For SQL Server and development tools
- **Open Source Community** - For countless helpful libraries and tools

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation
- Contact the development team

---

**Built with ❤️ by the Techno ETL Team**
