#!/bin/bash

# Beta Environment Wipe Script
# Phase 1.2: Wipe Beta Database and Files
# 
# This script completely wipes the beta environment to prepare
# for a fresh Magento installation.

set -e  # Exit on any error

# Configuration
BETA_DB_NAME="beta_magento"
BETA_DB_USER="magento_user"
BETA_DB_PASS="your_password"
BETA_PATH="/var/www/beta.yourdomain.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  DANGER: Beta Environment Wipe${NC}"
echo -e "${RED}This will completely destroy the current beta environment!${NC}"
echo ""
echo "Target Database: $BETA_DB_NAME"
echo "Target Path: $BETA_PATH"
echo ""

# Safety confirmation
read -p "Are you sure you want to proceed? Type 'WIPE BETA' to confirm: " confirmation
if [ "$confirmation" != "WIPE BETA" ]; then
    echo -e "${YELLOW}❌ Operation cancelled${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Starting Beta Environment Wipe${NC}"
echo "Date: $(date)"

# 1. Wipe Database
echo -e "${YELLOW}🗃️ Wiping database...${NC}"

# Create SQL script to drop all tables
mysql -u "$BETA_DB_USER" -p"$BETA_DB_PASS" -e "
SET FOREIGN_KEY_CHECKS = 0;
SET @tables = NULL;
SELECT GROUP_CONCAT(table_name) INTO @tables
FROM information_schema.tables 
WHERE table_schema = '$BETA_DB_NAME';

SET @tables = CONCAT('DROP TABLE IF EXISTS ', @tables);
PREPARE stmt FROM @tables;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET FOREIGN_KEY_CHECKS = 1;
" "$BETA_DB_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database wiped successfully${NC}"
else
    echo -e "${RED}❌ Database wipe failed${NC}"
    exit 1
fi

# 2. Wipe Files
echo -e "${YELLOW}📁 Wiping files...${NC}"

# Remove all files and directories (except hidden files first)
if [ -d "$BETA_PATH" ]; then
    rm -rf "$BETA_PATH"/*
    
    # Remove hidden files and directories
    find "$BETA_PATH" -name ".*" -not -name "." -not -name ".." -exec rm -rf {} + 2>/dev/null || true
    
    echo -e "${GREEN}✅ Files wiped successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Beta path does not exist: $BETA_PATH${NC}"
fi

# 3. Verify Wipe
echo -e "${YELLOW}🔍 Verifying wipe...${NC}"

# Check database is empty
table_count=$(mysql -u "$BETA_DB_USER" -p"$BETA_DB_PASS" -e "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '$BETA_DB_NAME';" -s -N)

if [ "$table_count" -eq 0 ]; then
    echo -e "${GREEN}✅ Database is empty${NC}"
else
    echo -e "${RED}❌ Database still contains $table_count tables${NC}"
    exit 1
fi

# Check directory is empty
if [ -d "$BETA_PATH" ]; then
    file_count=$(find "$BETA_PATH" -type f | wc -l)
    if [ "$file_count" -eq 0 ]; then
        echo -e "${GREEN}✅ Directory is empty${NC}"
    else
        echo -e "${RED}❌ Directory still contains $file_count files${NC}"
        exit 1
    fi
fi

# 4. Prepare for fresh installation
echo -e "${YELLOW}📝 Preparing for fresh installation...${NC}"

# Ensure directory exists with correct permissions
mkdir -p "$BETA_PATH"
chown www-data:www-data "$BETA_PATH"
chmod 755 "$BETA_PATH"

echo -e "${GREEN}✅ Directory prepared for installation${NC}"

# 5. Generate wipe report
DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="/var/backups/beta-migration/wipe_report_$DATE.txt"

cat > "$REPORT_FILE" << EOF
Beta Environment Wipe Report
============================
Date: $(date)
Database: $BETA_DB_NAME
Path: $BETA_PATH

Wipe Results:
- Database tables removed: ✅ Complete
- Files removed: ✅ Complete
- Directory prepared: ✅ Complete

Verification:
- Database table count: $table_count
- Remaining files: $([ -d "$BETA_PATH" ] && find "$BETA_PATH" -type f | wc -l || echo "0")

Status: ✅ READY FOR FRESH INSTALLATION

Next Steps:
1. Run 03-install-fresh-magento.sh
2. Configure basic settings
3. Import optimized catalog structure
EOF

echo -e "${GREEN}✅ Wipe report generated: $REPORT_FILE${NC}"

# 6. Final summary
echo ""
echo -e "${GREEN}🎉 Beta Environment Wipe Completed Successfully!${NC}"
echo ""
echo "📊 Wipe Summary:"
echo "  Database: ✅ All tables removed"
echo "  Files: ✅ All files removed"
echo "  Directory: ✅ Prepared for installation"
echo ""
echo "📋 Report: $REPORT_FILE"
echo ""
echo -e "${GREEN}✅ Beta environment is now clean and ready for fresh installation${NC}"
echo ""
echo "Next step: Run 03-install-fresh-magento.sh to install fresh Magento"
