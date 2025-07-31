# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### **Backend Server Issues**

#### **Issue: Server Won't Start**

**Symptoms:**
```
Error: Cannot find module 'C:\hotech\Techno-ETL\backend\index.js'
Module type of file is not specified and it doesn't parse as CommonJS
```

**Solutions:**

1. **Check File Paths:**
```bash
# Verify the correct file exists
ls -la backend/dist/index.js  # Should exist after build
ls -la backend/server.js      # Source file

# Check package.json scripts
grep "server" package.json
```

2. **Fix Module Type Issues:**
```json
// Add to backend/package.json
{
  "type": "module",
  "main": "server.js"
}
```

3. **Build the Backend:**
```bash
npm run build  # This copies backend to dist/
```

4. **Use Correct Start Command:**
```bash
# Development
npm run backend

# Production
npm run server:production
# or
node backend/dist/index.js
```

#### **Issue: Database Connection Failed**

**Symptoms:**
```
❌ Database connection failed: ConnectionError: Failed to connect to localhost:1433
```

**Solutions:**

1. **Check Database Server:**
```bash
# Test SQL Server connectivity
telnet your-server 1433
# or
sqlcmd -S your-server -U username -P password -Q "SELECT 1"
```

2. **Verify Environment Variables:**
```bash
# Check .env file
cat backend/.env | grep DB_

# Required variables:
DB_SERVER=your-server
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_PORT=1433
DB_ENCRYPT=true
```

3. **Check Firewall Settings:**
```bash
# Windows: Allow SQL Server through firewall
netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=TCP localport=1433

# Linux: Open port 1433
sudo ufw allow 1433/tcp
```

4. **SQL Server Configuration:**
```sql
-- Enable TCP/IP connections
EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', 
     N'Software\Microsoft\MSSQLServer\MSSQLServer', 
     N'LoginMode', REG_DWORD, 2;

-- Restart SQL Server service after this change
```

#### **Issue: Magento API Connection Failed**

**Symptoms:**
```
❌ Magento Authentication failed: 401 Unauthorized
Error: connect ECONNREFUSED magento-instance.com:443
```

**Solutions:**

1. **Verify API Credentials:**
```bash
# Test Magento API manually
curl -X GET "https://your-magento.com/rest/V1/products" \
  -H "Authorization: Bearer your-token"

# Or with basic auth
curl -X GET "https://your-magento.com/rest/V1/products" \
  -u "username:password"
```

2. **Check Environment Variables:**
```bash
MAGENTO_BASE_URL=https://your-magento-instance.com
MAGENTO_API_TOKEN=your_api_token
MAGENTO_API_VERSION=V1
MAGENTO_TIMEOUT=30000
```

3. **Magento Configuration:**
```php
// In Magento admin: System > Integrations
// Create new integration with required permissions:
// - Catalog
// - Sales
// - Customers
// - System
```

### **Frontend Issues**

#### **Issue: React Router Warnings**

**Symptoms:**
```
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7
```

**Solution:**
```jsx
// In src/main.jsx
<Router
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
```

#### **Issue: MUI Tooltip Warnings**

**Symptoms:**
```
MUI: You are providing a disabled `button` child to the Tooltip component.
A disabled element does not fire events.
```

**Solution:**
```jsx
// Wrap disabled buttons with span
<Tooltip title="Button tooltip">
  <span>
    <Button disabled={isDisabled}>
      Button Text
    </Button>
  </span>
</Tooltip>
```

#### **Issue: Build Failures**

**Symptoms:**
```
Error: Cannot resolve module '@mui/x-data-grid'
npm ERR! peer dep missing: react@"^18.0.0"
```

**Solutions:**

1. **Install with Legacy Peer Deps:**
```bash
npm install --legacy-peer-deps
```

2. **Clear Cache and Reinstall:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

3. **Check Node.js Version:**
```bash
node --version  # Should be 18.0.0+
npm --version   # Should be 8.0.0+
```

### **Performance Issues**

#### **Issue: Slow Dashboard Loading**

**Symptoms:**
- Dashboard takes >5 seconds to load
- High memory usage
- Unresponsive UI

**Solutions:**

1. **Enable Caching:**
```javascript
// Check if caching is enabled
const cacheEnabled = localStorage.getItem('dashboardSettings');
console.log('Cache enabled:', JSON.parse(cacheEnabled)?.general?.autoRefresh);
```

2. **Optimize Chart Data:**
```javascript
// Limit chart data points
const optimizeChartData = (data) => {
  if (data.length > 100) {
    // Sample data to reduce points
    const step = Math.ceil(data.length / 100);
    return data.filter((_, index) => index % step === 0);
  }
  return data;
};
```

3. **Enable Compact Mode:**
```javascript
// In dashboard settings
setDashboardSettings(prev => ({
  ...prev,
  general: { ...prev.general, compactMode: true }
}));
```

#### **Issue: Memory Leaks**

**Symptoms:**
- Browser tab uses increasing memory
- Application becomes slow over time
- Browser crashes

**Solutions:**

1. **Check for Unmounted Component Updates:**
```javascript
useEffect(() => {
  let mounted = true;
  
  const fetchData = async () => {
    const data = await api.getData();
    if (mounted) {
      setData(data);
    }
  };
  
  fetchData();
  
  return () => {
    mounted = false;
  };
}, []);
```

2. **Clear Intervals and Timeouts:**
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

3. **Monitor Memory Usage:**
```javascript
// Add to development tools
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    console.log('Memory usage:', performance.memory);
  }, 10000);
}
```

### **Data Issues**

#### **Issue: Products Not Syncing**

**Symptoms:**
- Sync button shows success but no products appear in Magento
- Products exist in MDM but not in frontend grid

**Solutions:**

1. **Check API Endpoints:**
```bash
# Test product sync endpoint
curl -X POST "http://localhost:5000/api/magento/products/sync" \
  -H "Content-Type: application/json" \
  -d '{"product_ids": [1, 2, 3]}'
```

2. **Verify Database Data:**
```sql
-- Check products in MDM
SELECT TOP 10 * FROM Products WHERE Status = 'Active';

-- Check sync status
SELECT * FROM SyncLog WHERE EntityType = 'Product' ORDER BY CreatedAt DESC;
```

3. **Check Magento Logs:**
```bash
# Magento error logs
tail -f var/log/exception.log
tail -f var/log/system.log
```

#### **Issue: Image Processing Fails**

**Symptoms:**
- Image renaming/resizing shows errors
- Processed images are corrupted

**Solutions:**

1. **Check File Permissions:**
```bash
# Ensure upload directory is writable
chmod 755 uploads/
chown www-data:www-data uploads/  # Linux
```

2. **Verify File Size Limits:**
```javascript
// Check file size before processing
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

3. **Test Image Processing:**
```javascript
// Test with a small image first
const testImage = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
await processImage(testImage);
```

### **Authentication Issues**

#### **Issue: JWT Token Expired**

**Symptoms:**
```
403 Forbidden: Invalid or expired token
User logged out unexpectedly
```

**Solutions:**

1. **Implement Token Refresh:**
```javascript
// Auto-refresh tokens before expiry
const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    localStorage.setItem('token', response.data.token);
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
  }
};

// Check token expiry
const checkTokenExpiry = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    
    if (Date.now() > expiry - 60000) { // Refresh 1 minute before expiry
      refreshToken();
    }
  }
};
```

2. **Handle 401 Responses:**
```javascript
// Axios interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### **Deployment Issues**

#### **Issue: PM2 Process Crashes**

**Symptoms:**
```
PM2 process status: errored
Application not responding
High CPU usage before crash
```

**Solutions:**

1. **Check PM2 Logs:**
```bash
pm2 logs techno-etl-backend --lines 100
pm2 show techno-etl-backend
```

2. **Increase Memory Limit:**
```javascript
// In ecosystem.config.js
module.exports = {
  apps: [{
    name: 'techno-etl-backend',
    script: './dist/backend/index.js',
    max_memory_restart: '2G',  // Increase from 1G
    node_args: '--max-old-space-size=2048'
  }]
};
```

3. **Add Error Handling:**
```javascript
// In server.js
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
```

#### **Issue: Nginx 502 Bad Gateway**

**Symptoms:**
- Frontend loads but API calls fail
- Nginx error: "connect() failed (111: Connection refused)"

**Solutions:**

1. **Check Backend Status:**
```bash
pm2 status
curl http://localhost:5000/api/health
```

2. **Verify Nginx Configuration:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

3. **Check Nginx Logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### **Debugging Tools**

#### **Enable Debug Mode**

```javascript
// Frontend debugging
localStorage.setItem('debug', 'true');

// Backend debugging
DEBUG=* node backend/server.js
```

#### **Performance Monitoring**

```javascript
// Add performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
```

#### **Network Debugging**

```bash
# Monitor network traffic
sudo tcpdump -i any port 5000
sudo netstat -tulpn | grep :5000

# Test API endpoints
curl -v http://localhost:5000/api/health
```

### **Emergency Recovery**

#### **Quick Recovery Steps**

1. **Restart All Services:**
```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart redis
```

2. **Clear All Caches:**
```bash
# Clear Redis cache
redis-cli FLUSHALL

# Clear browser cache
# In browser: Ctrl+Shift+Delete

# Clear application cache
rm -rf /tmp/techno-etl-cache/*
```

3. **Rollback to Previous Version:**
```bash
# If using git deployment
git checkout previous-stable-tag
npm run build
pm2 restart techno-etl-backend
```

#### **Health Check Script**

```bash
#!/bin/bash
# comprehensive-health-check.sh

echo "=== Techno-ETL Health Check ==="

# Check backend
echo "Checking backend..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: FAILED"
    pm2 restart techno-etl-backend
fi

# Check database
echo "Checking database..."
if sqlcmd -S $DB_SERVER -U $DB_USERNAME -P $DB_PASSWORD -Q "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Database: OK"
else
    echo "❌ Database: FAILED"
fi

# Check Redis
echo "Checking Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: OK"
else
    echo "❌ Redis: FAILED"
    sudo systemctl restart redis
fi

# Check disk space
echo "Checking disk space..."
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 90 ]; then
    echo "✅ Disk space: OK ($DISK_USAGE%)"
else
    echo "⚠️ Disk space: WARNING ($DISK_USAGE%)"
fi

# Check memory
echo "Checking memory..."
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -lt 90 ]; then
    echo "✅ Memory: OK ($MEMORY_USAGE%)"
else
    echo "⚠️ Memory: WARNING ($MEMORY_USAGE%)"
fi

echo "=== Health Check Complete ==="
```

---

**For additional support:**
- Check the GitHub Issues page
- Review the API documentation
- Contact the development team
- Check system logs for detailed error messages
