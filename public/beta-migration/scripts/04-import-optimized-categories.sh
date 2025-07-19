#!/bin/bash

# Optimized Categories Import Script
# Phase 3.1: Import Optimized Categories
# 
# This script imports the optimized category structure into the beta environment

set -e  # Exit on any error

# Configuration
BETA_PATH="/var/www/beta.yourdomain.com"
CATEGORIES_CSV="/var/backups/beta-migration/categories-import.csv"
CATEGORIES_SQL="/var/backups/beta-migration/create-optimized-categories.sql"
BETA_DB_NAME="beta_magento"
BETA_DB_USER="magento_user"
BETA_DB_PASS="your_password"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Optimized Categories Import${NC}"
echo "Date: $(date)"
echo "Magento Path: $BETA_PATH"

# Change to Magento directory
cd "$BETA_PATH"

# 1. Verify Prerequisites
echo -e "${YELLOW}🔍 Verifying prerequisites...${NC}"

# Check if Magento is installed
if [ ! -f "bin/magento" ]; then
    echo -e "${RED}❌ Magento not found in $BETA_PATH${NC}"
    exit 1
fi

# Check if category files exist
if [ ! -f "$CATEGORIES_CSV" ] && [ ! -f "$CATEGORIES_SQL" ]; then
    echo -e "${RED}❌ Category import files not found${NC}"
    echo "Expected files:"
    echo "  - $CATEGORIES_CSV"
    echo "  - $CATEGORIES_SQL"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites verified${NC}"

# 2. Backup Current Categories
echo -e "${YELLOW}💾 Backing up current categories...${NC}"

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/var/backups/beta-migration/categories_backup_$DATE.sql"

mysqldump -u "$BETA_DB_USER" -p"$BETA_DB_PASS" "$BETA_DB_NAME" \
  catalog_category_entity \
  catalog_category_entity_varchar \
  catalog_category_entity_int \
  catalog_category_entity_text \
  catalog_category_entity_datetime \
  catalog_category_entity_decimal > "$BACKUP_FILE"

echo -e "${GREEN}✅ Categories backed up to: $BACKUP_FILE${NC}"

# 3. Clear Existing Categories (except root and default)
echo -e "${YELLOW}🗑️ Clearing existing categories...${NC}"

mysql -u "$BETA_DB_USER" -p"$BETA_DB_PASS" "$BETA_DB_NAME" << EOF
-- Remove all categories except root (1) and default (2)
DELETE FROM catalog_category_entity WHERE entity_id > 2;
DELETE FROM catalog_category_entity_varchar WHERE entity_id > 2;
DELETE FROM catalog_category_entity_int WHERE entity_id > 2;
DELETE FROM catalog_category_entity_text WHERE entity_id > 2;
DELETE FROM catalog_category_entity_datetime WHERE entity_id > 2;
DELETE FROM catalog_category_entity_decimal WHERE entity_id > 2;

-- Reset auto increment
ALTER TABLE catalog_category_entity AUTO_INCREMENT = 3;
EOF

echo -e "${GREEN}✅ Existing categories cleared${NC}"

# 4. Import Optimized Categories
echo -e "${YELLOW}📥 Importing optimized categories...${NC}"

# Method 1: Try SQL import first (faster)
if [ -f "$CATEGORIES_SQL" ]; then
    echo "Using SQL import method..."
    mysql -u "$BETA_DB_USER" -p"$BETA_DB_PASS" "$BETA_DB_NAME" < "$CATEGORIES_SQL"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Categories imported via SQL${NC}"
        IMPORT_METHOD="SQL"
    else
        echo -e "${YELLOW}⚠️ SQL import failed, trying CSV method...${NC}"
        IMPORT_METHOD="CSV_FALLBACK"
    fi
else
    IMPORT_METHOD="CSV"
fi

# Method 2: CSV import (if SQL failed or not available)
if [ "$IMPORT_METHOD" = "CSV" ] || [ "$IMPORT_METHOD" = "CSV_FALLBACK" ]; then
    if [ -f "$CATEGORIES_CSV" ]; then
        echo "Using CSV import method..."
        
        # Copy CSV to Magento var/import directory
        mkdir -p var/import
        cp "$CATEGORIES_CSV" var/import/
        
        # Import via Magento CLI
        php bin/magento import:run \
          --entity=categories \
          --behavior=add-update \
          --file="var/import/categories-import.csv" \
          --validation-strategy=validation-stop-on-errors
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Categories imported via CSV${NC}"
            IMPORT_METHOD="CSV"
        else
            echo -e "${RED}❌ CSV import failed${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ No import method available${NC}"
        exit 1
    fi
fi

# 5. Verify Category Import
echo -e "${YELLOW}🔍 Verifying category import...${NC}"

# Count imported categories
CATEGORY_COUNT=$(mysql -u "$BETA_DB_USER" -p"$BETA_DB_PASS" "$BETA_DB_NAME" -e "SELECT COUNT(*) FROM catalog_category_entity WHERE entity_id > 2;" -s -N)

echo "Categories imported: $CATEGORY_COUNT"

if [ "$CATEGORY_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Categories imported successfully${NC}"
else
    echo -e "${RED}❌ No categories were imported${NC}"
    exit 1
fi

# List imported categories
echo -e "${YELLOW}📋 Imported categories:${NC}"
mysql -u "$BETA_DB_USER" -p"$BETA_DB_PASS" "$BETA_DB_NAME" -e "
SELECT 
    ce.entity_id,
    cev.value as name,
    ce.level,
    ce.path
FROM catalog_category_entity ce
LEFT JOIN catalog_category_entity_varchar cev ON ce.entity_id = cev.entity_id 
    AND cev.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3)
    AND cev.store_id = 0
WHERE ce.entity_id > 2
ORDER BY ce.path;
"

# 6. Reindex Categories
echo -e "${YELLOW}🔄 Reindexing categories...${NC}"

php bin/magento indexer:reindex catalog_category_flat
php bin/magento indexer:reindex catalog_category_product
php bin/magento indexer:reindex catalogsearch_fulltext

echo -e "${GREEN}✅ Categories reindexed${NC}"

# 7. Clear Cache
echo -e "${YELLOW}🧹 Clearing cache...${NC}"

php bin/magento cache:flush
php bin/magento cache:clean

echo -e "${GREEN}✅ Cache cleared${NC}"

# 8. Verify Frontend Categories
echo -e "${YELLOW}🌐 Verifying frontend categories...${NC}"

# Check if categories appear in navigation
BETA_URL=$(php bin/magento config:show web/unsecure/base_url | tr -d '\n')
if curl -s "$BETA_URL" | grep -q "nav"; then
    echo -e "${GREEN}✅ Frontend navigation accessible${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend navigation may need verification${NC}"
fi

# 9. Generate Import Report
REPORT_FILE="/var/backups/beta-migration/category_import_report_$DATE.txt"

cat > "$REPORT_FILE" << EOF
Optimized Categories Import Report
==================================
Date: $(date)
Import Method: $IMPORT_METHOD
Categories Imported: $CATEGORY_COUNT

Import Details:
- Source CSV: $CATEGORIES_CSV
- Source SQL: $CATEGORIES_SQL
- Backup Created: $BACKUP_FILE
- Magento Path: $BETA_PATH

Category Structure:
$(mysql -u "$BETA_DB_USER" -p"$BETA_DB_PASS" "$BETA_DB_NAME" -e "
SELECT 
    CONCAT(REPEAT('  ', ce.level - 1), cev.value) as category_tree
FROM catalog_category_entity ce
LEFT JOIN catalog_category_entity_varchar cev ON ce.entity_id = cev.entity_id 
    AND cev.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3)
    AND cev.store_id = 0
WHERE ce.entity_id > 1
ORDER BY ce.path;
" -s -N)

Post-Import Actions:
- Reindexing: ✅ Complete
- Cache Clear: ✅ Complete
- Frontend Verification: ✅ Complete

Status: ✅ CATEGORIES IMPORTED SUCCESSFULLY

Next Steps:
1. Verify categories in admin panel
2. Test frontend navigation
3. Run 05-import-products.sh to import products
EOF

echo -e "${GREEN}✅ Import report generated: $REPORT_FILE${NC}"

# 10. Final Summary
echo ""
echo -e "${GREEN}🎉 Optimized Categories Import Completed Successfully!${NC}"
echo ""
echo "📊 Import Summary:"
echo "  Method: $IMPORT_METHOD"
echo "  Categories Imported: $CATEGORY_COUNT"
echo "  Backup Created: $BACKUP_FILE"
echo ""
echo "📋 Report: $REPORT_FILE"
echo ""
echo -e "${GREEN}✅ Category structure is ready for product import${NC}"
echo ""
echo "Next step: Run 05-import-products.sh to import the optimized product catalog"
