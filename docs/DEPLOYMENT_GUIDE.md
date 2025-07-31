# 🚀 Deployment Guide & Troubleshooting

## Production Deployment

### **System Requirements**

#### **Server Specifications**
- **OS**: Windows Server 2019+ or Ubuntu 20.04+
- **CPU**: 4 cores minimum, 8 cores recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 100GB SSD minimum
- **Network**: 1Gbps connection recommended

#### **Software Requirements**
- **Node.js**: 18.0.0 LTS or higher
- **SQL Server**: 2017 or higher (Express edition supported)
- **Redis**: 6.0+ (optional but recommended)
- **Nginx/Apache**: For reverse proxy and SSL termination
- **PM2**: For process management

### **Pre-Deployment Checklist**

```bash
# 1. Verify Node.js version
node --version  # Should be 18.0.0+

# 2. Check npm version
npm --version   # Should be 8.0.0+

# 3. Test database connectivity
sqlcmd -S your-server -U username -P password -Q "SELECT 1"

# 4. Verify Redis connection (if using)
redis-cli ping

# 5. Check available disk space
df -h  # Linux
dir    # Windows

# 6. Verify network connectivity to Magento
curl -I https://your-magento-instance.com/rest/V1/products
```

### **Step-by-Step Deployment**

#### **1. Prepare the Server**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y  # Ubuntu
# or
choco upgrade all  # Windows with Chocolatey

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Create application directory
sudo mkdir -p /opt/techno-etl
sudo chown $USER:$USER /opt/techno-etl
```

#### **2. Build the Application**

```bash
# On development machine or CI/CD pipeline
git clone <repository-url>
cd Techno-ETL

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# Create deployment package
tar -czf techno-etl-production.tar.gz dist/ package.json package-lock.json
```

#### **3. Deploy to Server**

```bash
# Transfer files to server
scp techno-etl-production.tar.gz user@server:/opt/techno-etl/

# On server: Extract and setup
cd /opt/techno-etl
tar -xzf techno-etl-production.tar.gz

# Install production dependencies
cd dist/backend
npm install --production --legacy-peer-deps

# Set up environment variables
cp .env.example .env
nano .env  # Configure your environment
```

#### **4. Configure Environment Variables**

```bash
# /opt/techno-etl/dist/backend/.env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DB_SERVER=your-sql-server.database.windows.net
DB_DATABASE=TechnoETL_Production
DB_USERNAME=techno_user
DB_PASSWORD=your_secure_password
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Magento Configuration
MAGENTO_BASE_URL=https://your-magento-instance.com
MAGENTO_API_TOKEN=your_production_token
MAGENTO_TIMEOUT=30000

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/techno-etl/app.log

# File Upload
UPLOAD_PATH=/opt/techno-etl/uploads
MAX_FILE_SIZE=10485760
```

#### **5. Set Up Process Management with PM2**

```bash
# Create PM2 ecosystem file
cat > /opt/techno-etl/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'techno-etl-backend',
    script: './dist/backend/index.js',
    cwd: '/opt/techno-etl',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/techno-etl/error.log',
    out_file: '/var/log/techno-etl/out.log',
    log_file: '/var/log/techno-etl/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/techno-etl
sudo chown $USER:$USER /var/log/techno-etl

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command
```

#### **6. Configure Nginx Reverse Proxy**

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/techno-etl << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Frontend (Static Files)
    location / {
        root /opt/techno-etl/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File uploads
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/techno-etl /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

#### **7. Set Up SSL Certificate**

```bash
# Using Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

#### **8. Configure Firewall**

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Or iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5000 -j DROP  # Block direct backend access
```

### **Database Setup**

#### **SQL Server Configuration**

```sql
-- Create database
CREATE DATABASE TechnoETL_Production;
GO

-- Create user
CREATE LOGIN techno_user WITH PASSWORD = 'your_secure_password';
GO

USE TechnoETL_Production;
GO

CREATE USER techno_user FOR LOGIN techno_user;
GO

-- Grant permissions
ALTER ROLE db_datareader ADD MEMBER techno_user;
ALTER ROLE db_datawriter ADD MEMBER techno_user;
ALTER ROLE db_ddladmin ADD MEMBER techno_user;
GO

-- Create tables (run your schema scripts)
-- ... your table creation scripts here ...
```

#### **Database Migration**

```bash
# Run database migrations
cd /opt/techno-etl/dist/backend
node scripts/migrate.js

# Seed initial data
node scripts/seed.js
```

### **Monitoring & Logging**

#### **PM2 Monitoring**

```bash
# View application status
pm2 status

# View logs
pm2 logs techno-etl-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart techno-etl-backend

# Reload application (zero-downtime)
pm2 reload techno-etl-backend
```

#### **Log Rotation**

```bash
# Configure logrotate
sudo tee /etc/logrotate.d/techno-etl << 'EOF'
/var/log/techno-etl/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 techno-etl techno-etl
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

#### **Health Monitoring**

```bash
# Create health check script
cat > /opt/techno-etl/health-check.sh << 'EOF'
#!/bin/bash

# Check if backend is responding
HEALTH_URL="http://localhost:5000/api/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $HTTP_STATUS -eq 200 ]; then
    echo "$(date): Backend is healthy"
    exit 0
else
    echo "$(date): Backend is unhealthy (HTTP $HTTP_STATUS)"
    # Restart the application
    pm2 restart techno-etl-backend
    exit 1
fi
EOF

chmod +x /opt/techno-etl/health-check.sh

# Add to crontab for regular health checks
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/techno-etl/health-check.sh >> /var/log/techno-etl/health.log 2>&1") | crontab -
```

### **Backup Strategy**

#### **Database Backup**

```bash
# Create backup script
cat > /opt/techno-etl/backup-db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/techno-etl"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/techno_etl_$DATE.bak"

mkdir -p $BACKUP_DIR

# SQL Server backup
sqlcmd -S $DB_SERVER -U $DB_USERNAME -P $DB_PASSWORD -Q "BACKUP DATABASE TechnoETL_Production TO DISK = '$BACKUP_FILE'"

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.bak.gz" -mtime +30 -delete

echo "$(date): Database backup completed: $BACKUP_FILE.gz"
EOF

chmod +x /opt/techno-etl/backup-db.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/techno-etl/backup-db.sh >> /var/log/techno-etl/backup.log 2>&1") | crontab -
```

#### **Application Backup**

```bash
# Create application backup script
cat > /opt/techno-etl/backup-app.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/techno-etl"
DATE=$(date +%Y%m%d_%H%M%S)
APP_BACKUP="$BACKUP_DIR/app_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $APP_BACKUP -C /opt/techno-etl dist/ uploads/ .env ecosystem.config.js

# Remove old backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "$(date): Application backup completed: $APP_BACKUP"
EOF

chmod +x /opt/techno-etl/backup-app.sh
```

### **Performance Optimization**

#### **Node.js Optimization**

```bash
# Optimize Node.js settings
export NODE_OPTIONS="--max-old-space-size=2048 --optimize-for-size"

# Enable production optimizations
export NODE_ENV=production
export NPM_CONFIG_PRODUCTION=true
```

#### **Database Optimization**

```sql
-- Create indexes for better performance
CREATE INDEX IX_Products_Status ON Products(Status);
CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Products_BrandId ON Products(BrandId);
CREATE INDEX IX_Products_SKU ON Products(SKU);
CREATE INDEX IX_Products_Name ON Products(Name);

-- Update statistics
UPDATE STATISTICS Products;
UPDATE STATISTICS Categories;
UPDATE STATISTICS Brands;
```

#### **Redis Configuration**

```bash
# Optimize Redis configuration
sudo tee -a /etc/redis/redis.conf << 'EOF'
# Memory optimization
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Network
tcp-keepalive 300
timeout 0

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
EOF

sudo systemctl restart redis
```

---

*Continue reading for Troubleshooting section and Performance Monitoring...*
