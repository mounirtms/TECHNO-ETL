# Magento Migration Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the complete Magento migration solution for the French office supplies store. The migration includes categories, attributes, attribute sets, and products with full data validation and error handling.

## Prerequisites

### System Requirements

- **PHP**: 8.1 or higher
- **Composer**: Latest version
- **Magento**: 2.4+ instance with API access
- **Memory**: Minimum 512MB PHP memory limit
- **Storage**: At least 1GB free space for logs and processed data

### Magento Configuration

1. **Enable API Access**
   ```bash
   # In Magento admin panel:
   # System > Extensions > Integrations
   # Create new integration with full API access
   ```

2. **Generate Admin Token**
   ```bash
   # Via API or admin panel
   # Store the token securely for configuration
   ```

3. **Configure Store Settings**
   - Ensure proper store views are configured
   - Set up tax classes if needed
   - Configure default attribute sets

## Installation Steps

### Step 1: Project Setup

1. **Clone/Download the Migration Tool**
   ```bash
   cd /path/to/your/project
   # Copy the magento-migration directory
   ```

2. **Install Dependencies**
   ```bash
   cd magento-migration
   composer install
   ```

3. **Create Configuration File**
   ```bash
   cp config/store-config.example.json config/store-config.json
   ```

4. **Configure Settings**
   Edit `config/store-config.json` with your Magento details:
   ```json
   {
     "magento": {
       "base_url": "https://your-magento-store.com",
       "admin_token": "your-admin-access-token-here",
       "store_id": 1,
       "website_id": 1,
       "store_view_code": "default"
     }
   }
   ```

### Step 2: Data Preparation

1. **Copy Source Data**
   ```bash
   # Copy your CSV files to data/source/
   cp /path/to/export_catalog_product.csv data/source/
   cp /path/to/sample.csv data/source/
   ```

2. **Prepare Images (Optional)**
   ```bash
   # Copy product images to data/source/images/
   mkdir -p data/source/images
   # Copy image files here
   ```

3. **Validate Data Structure**
   ```bash
   php scripts/validation/validate-csv.php data/source/export_catalog_product.csv
   ```

### Step 3: Migration Execution

#### Phase 1: Categories

1. **Create Category Hierarchy**
   ```bash
   php scripts/migration/create-categories.php
   ```

2. **Verify Category Creation**
   ```bash
   # Check logs/category-creation-*.log for results
   # Verify data/categories/category-mapping.json
   ```

#### Phase 2: Attributes

1. **Create Product Attributes**
   ```bash
   php scripts/migration/create-attributes.php
   ```

2. **Verify Attribute Creation**
   ```bash
   # Check logs/attribute-creation-*.log for results
   # Verify data/processed/attribute-mapping.json
   ```

#### Phase 3: Products

1. **Process and Migrate Products**
   ```bash
   php scripts/migration/migrate-products.php
   ```

2. **Monitor Progress**
   ```bash
   # Watch the console output for real-time progress
   # Check logs/product-migration-*.log for detailed logs
   ```

3. **Review Migration Report**
   ```bash
   # Check data/processed/migration-report-*.json
   # Review any failed products and errors
   ```

## Configuration Options

### Migration Settings

```json
{
  "migration": {
    "batch_size": 10,           // Products per batch
    "rate_limit_delay": 1,      // Seconds between requests
    "max_retries": 3,           // Retry attempts for failed requests
    "retry_delay": 2,           // Seconds between retries
    "timeout": 30,              // Request timeout
    "enable_logging": true,     // Enable detailed logging
    "log_level": "info"         // Log level (debug, info, warning, error)
  }
}
```

### Validation Settings

```json
{
  "validation": {
    "validate_skus": true,              // Validate SKU format
    "validate_categories": true,        // Validate category assignments
    "validate_attributes": true,        // Validate attribute values
    "validate_images": true,            // Validate image files
    "skip_existing_products": false,    // Skip products that already exist
    "update_existing_products": true    // Update existing products
  }
}
```

### Error Handling

```json
{
  "error_handling": {
    "continue_on_error": true,          // Continue migration on errors
    "max_errors_per_batch": 5,          // Stop batch if too many errors
    "create_error_report": true,        // Generate error reports
    "email_error_reports": false,       // Email error notifications
    "error_email": ""                   // Email address for notifications
  }
}
```

## Data Mapping

### Category Structure

The migration creates a 5-level category hierarchy:

```
Default Category
└── Tous les produits
    ├── SCOLAIRE
    │   ├── CALCULATRICES
    │   │   ├── CALCULATRICES SCIENTIFIQUES
    │   │   └── CALCULATRICES DE POCHE
    │   ├── ECRITURE & CORRECTION
    │   │   ├── STYLOS ENCRE GEL
    │   │   ├── STYLOS ENCRE LIQUIDE
    │   │   └── SURLIGNEUR
    │   └── COLORIAGE
    │       ├── FEUTRE POINTE FINE
    │       └── FEUTRES DE COLORIAGE
    ├── BUREAUTIQUE
    │   ├── CALCULATRICES
    │   └── ECRITURE & CORRECTION
    ├── LOISIRS CREATIFS
    ├── BEAUX ARTS
    └── BRICOLAGE
```

### Custom Attributes

| Attribute Code | Type | Description |
|---------------|------|-------------|
| `mgs_brand` | Select | Product brand (CASIO, PILOT, etc.) |
| `techno_ref` | Text | Technical reference number |
| `color` | Select | Product color variants |
| `dimension` | Text | Physical dimensions |
| `capacity` | Text | Functional capacity |
| `diameter` | Select | Pen/tool diameter |

### Attribute Sets

| Attribute Set | Usage |
|--------------|-------|
| Office Supplies General | Default for all products |
| Calculators | Calculator-specific products |
| Writing Instruments | Pens, markers, etc. |
| Art Supplies | Creative and art materials |
| Electronic Equipment | Electronic devices |

## Monitoring and Troubleshooting

### Log Files

All operations generate detailed log files in the `logs/` directory:

- `category-creation-*.log` - Category creation logs
- `attribute-creation-*.log` - Attribute creation logs
- `product-migration-*.log` - Product migration logs
- `api-client-*.log` - API communication logs
- `data-processing-*.log` - Data processing logs

### Common Issues

#### API Connection Issues

**Problem**: "Cannot connect to Magento API"
**Solution**:
1. Verify base_url is correct
2. Check admin_token is valid
3. Ensure Magento API is enabled
4. Check firewall/network connectivity

#### Memory Issues

**Problem**: "Fatal error: Allowed memory size exhausted"
**Solution**:
1. Increase memory_limit in config
2. Reduce batch_size
3. Process data in smaller chunks

#### Rate Limiting

**Problem**: "Too many requests" errors
**Solution**:
1. Increase rate_limit_delay
2. Reduce batch_size
3. Check Magento rate limiting settings

#### Data Validation Errors

**Problem**: Products failing validation
**Solution**:
1. Check validation-errors-*.json files
2. Fix data issues in source CSV
3. Adjust validation settings if needed

### Performance Optimization

1. **Batch Size Tuning**
   - Start with batch_size: 5-10
   - Increase gradually based on performance
   - Monitor memory usage and response times

2. **Rate Limiting**
   - Adjust rate_limit_delay based on server capacity
   - Monitor API response times
   - Consider server load during migration

3. **Memory Management**
   - Set appropriate memory_limit
   - Process large datasets in chunks
   - Clear processed data from memory

## Validation and Testing

### Pre-Migration Validation

1. **Test API Connection**
   ```bash
   php scripts/validation/test-api-connection.php
   ```

2. **Validate CSV Data**
   ```bash
   php scripts/validation/validate-csv.php data/source/export_catalog_product.csv
   ```

3. **Check Category Structure**
   ```bash
   php scripts/validation/validate-categories.php
   ```

### Post-Migration Validation

1. **Verify Product Count**
   ```bash
   # Compare source CSV count with migrated products
   # Check migration report for discrepancies
   ```

2. **Test Product Display**
   ```bash
   # Visit frontend to verify products display correctly
   # Check category assignments
   # Verify attribute values
   ```

3. **Validate Search and Filtering**
   ```bash
   # Test product search functionality
   # Verify attribute-based filtering
   # Check category navigation
   ```

## Rollback Procedures

### Category Rollback

```bash
# Categories can be disabled rather than deleted
php scripts/rollback/disable-categories.php
```

### Product Rollback

```bash
# Products can be deleted by SKU list
php scripts/rollback/delete-products.php --sku-file=data/processed/migrated-skus.txt
```

### Attribute Rollback

```bash
# Custom attributes can be removed
php scripts/rollback/remove-attributes.php
```

## Next Steps

After successful migration:

1. **Configure SEO Settings**
   - Set up URL rewrites
   - Configure meta tags
   - Optimize category descriptions

2. **Set Up Inventory Management**
   - Configure stock levels
   - Set up inventory tracking
   - Configure low stock alerts

3. **Configure Pricing**
   - Set up price rules
   - Configure tax settings
   - Set up customer group pricing

4. **Test Functionality**
   - Place test orders
   - Test payment processing
   - Verify email notifications

5. **Performance Optimization**
   - Enable caching
   - Optimize database
   - Configure CDN if needed

## Support and Maintenance

### Regular Maintenance

- Monitor log files for errors
- Update product data as needed
- Backup migration configurations
- Keep API tokens secure and updated

### Getting Help

- Check troubleshooting section
- Review log files for detailed error information
- Consult Magento documentation for API-specific issues
- Contact system administrator for server-related issues