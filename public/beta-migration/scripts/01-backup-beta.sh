#!/bin/bash

# Beta Environment Backup Script
# Phase 1.1: Backup Current Beta Environment
# 
# This script creates comprehensive backups of the beta environment
# before starting the migration process.

set -e  # Exit on any error

# Configuration
BETA_DB_NAME="beta_magento"
BETA_DB_USER="magento_user"
BETA_DB_PASS="your_password"
BETA_PATH="/var/www/beta.yourdomain.com"
BACKUP_DIR="/var/backups/beta-migration"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Beta Environment Backup${NC}"
echo "Date: $(date)"
echo "Backup Directory: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Database Backup
echo -e "${YELLOW}📊 Creating database backup...${NC}"
mysqldump -u "$BETA_DB_USER" -p"$BETA_DB_PASS" "$BETA_DB_NAME" > "$BACKUP_DIR/beta_database_$DATE.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup completed: beta_database_$DATE.sql${NC}"
    # Compress database backup
    gzip "$BACKUP_DIR/beta_database_$DATE.sql"
    echo -e "${GREEN}✅ Database backup compressed${NC}"
else
    echo -e "${RED}❌ Database backup failed${NC}"
    exit 1
fi

# 2. Files Backup
echo -e "${YELLOW}📁 Creating files backup...${NC}"
tar -czf "$BACKUP_DIR/beta_files_$DATE.tar.gz" -C "$BETA_PATH" .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files backup completed: beta_files_$DATE.tar.gz${NC}"
else
    echo -e "${RED}❌ Files backup failed${NC}"
    exit 1
fi

# 3. Configuration Backup
echo -e "${YELLOW}⚙️ Creating configuration backup...${NC}"
mkdir -p "$BACKUP_DIR/config_$DATE"
cp "$BETA_PATH/app/etc/env.php" "$BACKUP_DIR/config_$DATE/"
cp "$BETA_PATH/app/etc/config.php" "$BACKUP_DIR/config_$DATE/"
cp "$BETA_PATH/.htaccess" "$BACKUP_DIR/config_$DATE/" 2>/dev/null || true

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuration backup completed${NC}"
else
    echo -e "${RED}❌ Configuration backup failed${NC}"
    exit 1
fi

# 4. Media Files Backup (if large, create separate backup)
echo -e "${YELLOW}🖼️ Creating media files backup...${NC}"
if [ -d "$BETA_PATH/pub/media" ]; then
    tar -czf "$BACKUP_DIR/beta_media_$DATE.tar.gz" -C "$BETA_PATH/pub" media
    echo -e "${GREEN}✅ Media files backup completed: beta_media_$DATE.tar.gz${NC}"
fi

# 5. Generate backup report
echo -e "${YELLOW}📋 Generating backup report...${NC}"
cat > "$BACKUP_DIR/backup_report_$DATE.txt" << EOF
Beta Environment Backup Report
==============================
Date: $(date)
Backup Directory: $BACKUP_DIR

Files Created:
- Database: beta_database_$DATE.sql.gz ($(du -h "$BACKUP_DIR/beta_database_$DATE.sql.gz" | cut -f1))
- Files: beta_files_$DATE.tar.gz ($(du -h "$BACKUP_DIR/beta_files_$DATE.tar.gz" | cut -f1))
- Media: beta_media_$DATE.tar.gz ($(du -h "$BACKUP_DIR/beta_media_$DATE.tar.gz" | cut -f1))
- Config: config_$DATE/ directory

Total Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)

Backup Verification:
- Database backup: $([ -f "$BACKUP_DIR/beta_database_$DATE.sql.gz" ] && echo "✅ OK" || echo "❌ FAILED")
- Files backup: $([ -f "$BACKUP_DIR/beta_files_$DATE.tar.gz" ] && echo "✅ OK" || echo "❌ FAILED")
- Media backup: $([ -f "$BACKUP_DIR/beta_media_$DATE.tar.gz" ] && echo "✅ OK" || echo "❌ FAILED")
- Config backup: $([ -d "$BACKUP_DIR/config_$DATE" ] && echo "✅ OK" || echo "❌ FAILED")

Next Steps:
1. Verify backup integrity
2. Test restore procedure
3. Proceed with beta environment wipe
EOF

echo -e "${GREEN}✅ Backup report generated: backup_report_$DATE.txt${NC}"

# 6. Verify backup integrity
echo -e "${YELLOW}🔍 Verifying backup integrity...${NC}"

# Test database backup
echo "Testing database backup..."
gunzip -t "$BACKUP_DIR/beta_database_$DATE.sql.gz"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup integrity verified${NC}"
else
    echo -e "${RED}❌ Database backup integrity check failed${NC}"
    exit 1
fi

# Test files backup
echo "Testing files backup..."
tar -tzf "$BACKUP_DIR/beta_files_$DATE.tar.gz" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files backup integrity verified${NC}"
else
    echo -e "${RED}❌ Files backup integrity check failed${NC}"
    exit 1
fi

# 7. Create restore script
echo -e "${YELLOW}📝 Creating restore script...${NC}"
cat > "$BACKUP_DIR/restore_beta_$DATE.sh" << EOF
#!/bin/bash
# Beta Environment Restore Script
# Generated: $(date)

set -e

BETA_DB_NAME="$BETA_DB_NAME"
BETA_DB_USER="$BETA_DB_USER"
BETA_DB_PASS="$BETA_DB_PASS"
BETA_PATH="$BETA_PATH"
BACKUP_DIR="$BACKUP_DIR"

echo "🔄 Restoring beta environment from backup $DATE..."

# Restore database
echo "Restoring database..."
gunzip -c "$BACKUP_DIR/beta_database_$DATE.sql.gz" | mysql -u "\$BETA_DB_USER" -p"\$BETA_DB_PASS" "\$BETA_DB_NAME"

# Restore files
echo "Restoring files..."
rm -rf "\$BETA_PATH"/*
rm -rf "\$BETA_PATH"/.*
tar -xzf "$BACKUP_DIR/beta_files_$DATE.tar.gz" -C "\$BETA_PATH"

# Restore media
echo "Restoring media..."
tar -xzf "$BACKUP_DIR/beta_media_$DATE.tar.gz" -C "\$BETA_PATH/pub"

# Set permissions
echo "Setting permissions..."
find "\$BETA_PATH" -type f -exec chmod 644 {} \\;
find "\$BETA_PATH" -type d -exec chmod 755 {} \\;
chmod -R 777 "\$BETA_PATH/var/"
chmod -R 777 "\$BETA_PATH/pub/"
chmod -R 777 "\$BETA_PATH/generated/"

echo "✅ Beta environment restored successfully!"
EOF

chmod +x "$BACKUP_DIR/restore_beta_$DATE.sh"
echo -e "${GREEN}✅ Restore script created: restore_beta_$DATE.sh${NC}"

# 8. Final summary
echo ""
echo -e "${GREEN}🎉 Beta Environment Backup Completed Successfully!${NC}"
echo ""
echo "📊 Backup Summary:"
echo "  Database: $(du -h "$BACKUP_DIR/beta_database_$DATE.sql.gz" | cut -f1)"
echo "  Files: $(du -h "$BACKUP_DIR/beta_files_$DATE.tar.gz" | cut -f1)"
echo "  Media: $(du -h "$BACKUP_DIR/beta_media_$DATE.tar.gz" | cut -f1)"
echo "  Total: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo ""
echo "📁 Backup Location: $BACKUP_DIR"
echo "📋 Report: backup_report_$DATE.txt"
echo "🔄 Restore Script: restore_beta_$DATE.sh"
echo ""
echo -e "${YELLOW}⚠️  Keep these backups safe before proceeding with migration!${NC}"
echo ""
echo "Next step: Run 02-wipe-beta.sh to clean the beta environment"
