# Magento Migration Node.js System

A comprehensive Node.js-based migration system with RESTful web services architecture for migrating data to Magento 2. Specifically designed for the French office supplies store with optimized migration order and performance.

## 🚀 Features

- **RESTful Web Services Architecture**: Modular services for each migration component
- **Optimized Migration Order**: Strategic sequence to minimize API calls and ensure data integrity
- **Comprehensive Error Handling**: Robust error management with detailed logging
- **Performance Optimized**: Batch processing, rate limiting, and memory management
- **French Localization Support**: UTF-8 encoding, French decimal formats, and special characters
- **Production Ready**: Professional code structure with monitoring and health checks

## 📋 Migration Order (Optimized for Performance)

1. **Simple Products First** - Create basic products with default values
2. **Attributes Management** - Create custom attributes with predefined options
3. **Attribute Sets** - Configure attribute sets and groups
4. **Enhanced Product Configuration** - Add custom attributes to products
5. **Category Assignment** - Optimize category-to-product relationships
6. **Configurable Products** - Handle product variants and configurations
7. **Media Management** - Handle product images and media gallery (final step)

## 🛠 Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Magento 2.4+ instance with API access
- Admin access token for Magento API

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd magento-migration-nodejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Magento configuration
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Magento API Configuration
MAGENTO_BASE_URL=https://your-magento-store.com
MAGENTO_ADMIN_TOKEN=your-admin-access-token-here

# Migration Performance Settings
BATCH_SIZE_SIMPLE_PRODUCTS=20
REQUESTS_PER_SECOND=2
DELAY_BETWEEN_BATCHES=1000
```

### Key Configuration Options

- **Batch Sizes**: Optimized for different operations (products: 20, attributes: 15, etc.)
- **Rate Limiting**: Prevents API overload (2 requests/second default)
- **Error Handling**: Continue on error, maximum errors per batch
- **Performance Monitoring**: Memory usage, progress reporting

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system information

### Product Migration
- `POST /api/products/simple` - Create simple products with default values
- `POST /api/products/configurable` - Create configurable products (coming soon)
- `POST /api/products/enhance` - Add custom attributes to products (coming soon)

### Attribute Management
- `POST /api/attributes/create` - Create custom attributes (coming soon)
- `POST /api/attributes/sets` - Configure attribute sets (coming soon)

### Category Management
- `POST /api/categories/create` - Create category hierarchy (coming soon)
- `POST /api/categories/assign` - Assign products to categories (coming soon)

### Migration Orchestration
- `POST /api/orchestrator/migrate` - Run complete migration process (coming soon)
- `GET /api/orchestrator/status` - Get migration status (coming soon)

## 📊 Usage Examples

### Create Simple Products

```bash
curl -X POST http://localhost:3000/api/products/simple \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "sku": "CASIO-FX-82MS-2",
        "name": "Calculatrice scientifique CASIO FX-82MS-2",
        "price": 15.99,
        "weight": 0.5,
        "description": "Calculatrice scientifique avec 240 fonctions",
        "qty": 100
      }
    ],
    "options": {
      "skipExisting": false,
      "updateExisting": false,
      "validateOnly": false
    }
  }'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

### API Documentation

```bash
curl http://localhost:3000/api/docs
```

## 📁 Project Structure

```
magento-migration-nodejs/
├── app.js                 # Main application server
├── package.json           # Dependencies and scripts
├── .env.example           # Environment configuration template
├── config/
│   └── app-config.js      # Application configuration
├── services/              # RESTful service modules
│   ├── product-migration.js    # Product migration service
│   ├── attribute-migration.js  # Attribute management service
│   ├── category-migration.js   # Category management service
│   ├── orchestrator.js         # Migration orchestration
│   └── health-check.js         # Health monitoring
├── utils/                 # Utility modules
│   ├── logger.js          # Centralized logging
│   └── magento-client.js  # Magento API client
├── templates/             # JSON templates for data structures
│   └── simple-product.json     # Simple product template
├── logs/                  # Application logs
├── data/                  # Data files and exports
└── docs/                  # Documentation
```

## 🔧 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Adding New Services

1. Create service file in `services/` directory
2. Implement Express router with endpoints
3. Add route to main `app.js`
4. Create corresponding JSON templates
5. Add tests and documentation

## 📝 Logging

The system provides comprehensive logging:

- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **Migration logs**: `logs/migration.log`

Log levels: `error`, `warn`, `info`, `debug`

## 🚨 Error Handling

- **Validation Errors**: Input validation with detailed error messages
- **API Errors**: Magento API error handling with retry logic
- **Batch Errors**: Continue processing on individual failures
- **System Errors**: Graceful degradation and error reporting

## 📈 Performance Features

- **Batch Processing**: Configurable batch sizes for optimal performance
- **Rate Limiting**: Prevents API overload and respects server limits
- **Memory Management**: Efficient memory usage with garbage collection
- **Progress Reporting**: Real-time progress tracking and reporting
- **Retry Logic**: Automatic retry for failed requests with exponential backoff

## 🌍 French Localization

- **UTF-8 Encoding**: Full support for French characters (é, è, à, etc.)
- **Decimal Format**: French comma decimal separator conversion
- **Category Names**: Preserves French category hierarchy
- **Product Names**: Maintains French product descriptions and names

## 🔒 Security

- **Rate Limiting**: Prevents abuse and overload
- **Input Validation**: Comprehensive input sanitization
- **Error Sanitization**: Prevents information leakage
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection

## 📚 API Documentation

Visit `http://localhost:3000/api/docs` for interactive API documentation with examples and payload structures.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- Check the health endpoint: `/api/health/detailed`
- Review logs in the `logs/` directory
- Consult the API documentation: `/api/docs`
- Check configuration validation errors

## 🔄 Migration Workflow

1. **Health Check**: Verify system and API connectivity
2. **Simple Products**: Create basic product structure
3. **Attributes**: Set up custom attributes and options
4. **Attribute Sets**: Configure product attribute groupings
5. **Product Enhancement**: Add custom attributes to products
6. **Categories**: Create category hierarchy
7. **Category Assignment**: Link products to categories
8. **Configurable Products**: Handle product variants
9. **Media Management**: Upload and assign product images

This optimized workflow ensures data integrity and minimizes API calls for maximum performance.