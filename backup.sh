#!/bin/bash

# MySQL Backup Script Configuration
DATE=$(date +%F)
DB_HOST="localhost"
DB_NAME="technadminy7_dBT8x12y22"
DB_USER="technadminy7_ntdbusr24"
DB_PASS=";rqYNwT={U8R"

BACKUP_DIR="/backup/$DATE"
SQL_FILE="${BACKUP_DIR}/${DB_NAME}_backup.sql"
WASABI_REMOTE="wasabi:magento-backups/$DATE"
LOG_FILE="/var/log/db_backup.log"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Start logging
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_message "Starting backup for $DB_NAME"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    log_message "ERROR: Backup folder does not exist: $BACKUP_DIR"
    exit 1
fi
log_message "Backup folder exists: $BACKUP_DIR"

# Dump the MySQL database
log_message "Dumping database to $SQL_FILE..."
if ! mysqldump -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" > "$SQL_FILE"; then
    log_message "ERROR: MySQL dump failed!"
    exit 1
fi
log_message "MySQL dump complete."

# Set permissions so rclone can read everything
if ! chmod -R o+rX "$BACKUP_DIR"; then
    log_message "ERROR: Failed to set permissions on backup directory."
    exit 1
fi

# Upload to Wasabi using rclone
log_message "Uploading to Wasabi remote: $WASABI_REMOTE"
if ! rclone copy "$BACKUP_DIR" "$WASABI_REMOTE" --progress >> "$LOG_FILE" 2>&1; then
    log_message "ERROR: Upload to Wasabi failed!"
    exit 1
fi
log_message "Upload complete."

# Final log
log_message "✅ Backup successful."
echo "" >> "$LOG_FILE"