#!/bin/bash

# Fresh Magento Installation Script
# Phase 1.3: Fresh Magento Installation
# 
# This script installs a fresh Magento instance in the beta environment

set -e  # Exit on any error

# Configuration
BETA_DB_NAME="beta_magento"
BETA_DB_USER="magento_user"
BETA_DB_PASS="your_password"
BETA_DB_HOST="localhost"
BETA_PATH="/var/www/beta.yourdomain.com"
BETA_URL="https://beta.yourdomain.com"
ADMIN_USER="admin"
ADMIN_PASS="SecurePassword123"
ADMIN_EMAIL="admin@yourdomain.com"
MAGENTO_VERSION="2.4.6"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Fresh Magento Installation${NC}"
echo "Date: $(date)"
echo "Target Path: $BETA_PATH"
echo "Target URL: $BETA_URL"
echo "Magento Version: $MAGENTO_VERSION"

# 1. Download Magento
echo -e "${YELLOW}📥 Downloading Magento...${NC}"

cd "$BETA_PATH"

# Check if composer is available
if ! command -v composer &> /dev/null; then
    echo -e "${RED}❌ Composer not found. Please install composer first.${NC}"
    exit 1
fi

# Download Magento using Composer
composer create-project --repository-url=https://repo.magento.com/ magento/project-community-edition="$MAGENTO_VERSION" . --no-interaction

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Magento downloaded successfully${NC}"
else
    echo -e "${RED}❌ Magento download failed${NC}"
    exit 1
fi

# 2. Set Permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"

find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod -R 777 var/
chmod -R 777 pub/
chmod -R 777 generated/
chmod u+x bin/magento

chown -R www-data:www-data .

echo -e "${GREEN}✅ Permissions set successfully${NC}"

# 3. Install Magento
echo -e "${YELLOW}⚙️ Installing Magento...${NC}"

php bin/magento setup:install \
  --base-url="$BETA_URL" \
  --db-host="$BETA_DB_HOST" \
  --db-name="$BETA_DB_NAME" \
  --db-user="$BETA_DB_USER" \
  --db-password="$BETA_DB_PASS" \
  --admin-firstname="Admin" \
  --admin-lastname="User" \
  --admin-email="$ADMIN_EMAIL" \
  --admin-user="$ADMIN_USER" \
  --admin-password="$ADMIN_PASS" \
  --language="fr_FR" \
  --currency="EUR" \
  --timezone="Europe/Paris" \
  --use-rewrites=1 \
  --backend-frontname="admin" \
  --search-engine="elasticsearch7" \
  --elasticsearch-host="localhost" \
  --elasticsearch-port="9200"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Magento installed successfully${NC}"
else
    echo -e "${RED}❌ Magento installation failed${NC}"
    exit 1
fi

# 4. Configure Developer Mode
echo -e "${YELLOW}🛠️ Configuring developer mode...${NC}"

php bin/magento deploy:mode:set developer
php bin/magento cache:disable

echo -e "${GREEN}✅ Developer mode configured${NC}"

# 5. Basic Configuration
echo -e "${YELLOW}⚙️ Applying basic configuration...${NC}"

# SEO Configuration
php bin/magento config:set web/seo/use_rewrites 1
php bin/magento config:set catalog/seo/product_use_categories 1
php bin/magento config:set catalog/seo/category_url_suffix ""
php bin/magento config:set catalog/seo/product_url_suffix ""

# Catalog Configuration
php bin/magento config:set catalog/frontend/flat_catalog_category 0
php bin/magento config:set catalog/frontend/flat_catalog_product 0
php bin/magento config:set catalog/frontend/grid_per_page_values "12,24,36"
php bin/magento config:set catalog/frontend/grid_per_page 24

# Performance Configuration
php bin/magento config:set dev/css/merge_css_files 1
php bin/magento config:set dev/css/minify_files 1
php bin/magento config:set dev/js/merge_files 1
php bin/magento config:set dev/js/minify_files 1

# Security Configuration
php bin/magento config:set admin/security/use_form_key 1
php bin/magento config:set admin/security/session_lifetime 7200

echo -e "${GREEN}✅ Basic configuration applied${NC}"

# 6. Install Sample Data (Optional)
echo -e "${YELLOW}📦 Installing sample data...${NC}"

# Skip sample data for clean installation
echo -e "${YELLOW}⏭️ Skipping sample data for clean installation${NC}"

# 7. Create Admin User
echo -e "${YELLOW}👤 Creating admin user...${NC}"

# Admin user already created during installation
echo -e "${GREEN}✅ Admin user created: $ADMIN_USER${NC}"

# 8. Final Setup
echo -e "${YELLOW}🔧 Final setup...${NC}"

# Reindex
php bin/magento indexer:reindex

# Clear cache
php bin/magento cache:flush

# Compile DI
php bin/magento setup:di:compile

# Deploy static content
php bin/magento setup:static-content:deploy fr_FR en_US -f

echo -e "${GREEN}✅ Final setup completed${NC}"

# 9. Verify Installation
echo -e "${YELLOW}🔍 Verifying installation...${NC}"

# Check if Magento is accessible
if curl -s -o /dev/null -w "%{http_code}" "$BETA_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend may not be accessible yet${NC}"
fi

# Check admin panel
if curl -s -o /dev/null -w "%{http_code}" "$BETA_URL/admin" | grep -q "200"; then
    echo -e "${GREEN}✅ Admin panel is accessible${NC}"
else
    echo -e "${YELLOW}⚠️ Admin panel may not be accessible yet${NC}"
fi

# 10. Generate Installation Report
DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="/var/backups/beta-migration/installation_report_$DATE.txt"

cat > "$REPORT_FILE" << EOF
Fresh Magento Installation Report
=================================
Date: $(date)
Magento Version: $MAGENTO_VERSION
Installation Path: $BETA_PATH
Base URL: $BETA_URL

Installation Details:
- Database: $BETA_DB_NAME
- Admin User: $ADMIN_USER
- Admin Email: $ADMIN_EMAIL
- Language: fr_FR
- Currency: EUR
- Timezone: Europe/Paris

Configuration Applied:
- Developer mode: ✅ Enabled
- URL Rewrites: ✅ Enabled
- SEO Settings: ✅ Configured
- Performance Settings: ✅ Optimized
- Security Settings: ✅ Enhanced

Verification:
- Frontend Access: $(curl -s -o /dev/null -w "%{http_code}" "$BETA_URL" 2>/dev/null || echo "Unknown")
- Admin Access: $(curl -s -o /dev/null -w "%{http_code}" "$BETA_URL/admin" 2>/dev/null || echo "Unknown")

Status: ✅ INSTALLATION COMPLETE

Next Steps:
1. Verify frontend and admin access
2. Run 04-import-optimized-categories.sh
3. Import product data
4. Configure additional settings
EOF

echo -e "${GREEN}✅ Installation report generated: $REPORT_FILE${NC}"

# 11. Final Summary
echo ""
echo -e "${GREEN}🎉 Fresh Magento Installation Completed Successfully!${NC}"
echo ""
echo "📊 Installation Summary:"
echo "  Magento Version: $MAGENTO_VERSION"
echo "  Installation Path: $BETA_PATH"
echo "  Base URL: $BETA_URL"
echo "  Admin URL: $BETA_URL/admin"
echo "  Admin User: $ADMIN_USER"
echo "  Admin Password: $ADMIN_PASS"
echo ""
echo "📋 Report: $REPORT_FILE"
echo ""
echo -e "${GREEN}✅ Beta environment is ready for catalog migration${NC}"
echo ""
echo "Next step: Run 04-import-optimized-categories.sh to import the optimized category structure"
