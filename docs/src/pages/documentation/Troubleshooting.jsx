import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  InputAdornment
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  CheckCircle as SolutionIcon
} from '@mui/icons-material';

const Troubleshooting = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const troubleshootingCategories = [
    {
      title: 'Database Connection Issues',
      icon: <ErrorIcon />,
      severity: 'error',
      issues: [
        {
          problem: 'Cannot connect to SQL Server database',
          symptoms: ['Connection timeout errors', 'Authentication failures', 'Database not found errors'],
          causes: ['Incorrect connection string', 'SQL Server not running', 'Firewall blocking connection', 'Invalid credentials'],
          solutions: [
            'Verify SQL Server is running: `sudo systemctl status mssql-server`',
            'Check connection string in .env file',
            'Test connection: `sqlcmd -S localhost -U sa -P password`',
            'Configure firewall: `sudo ufw allow 1433`',
            'Verify user permissions in SQL Server'
          ],
          code: `-- Test database connection
SELECT @@VERSION;
SELECT DB_NAME();

-- Check user permissions
SELECT 
    dp.name AS principal_name,
    dp.type_desc AS principal_type,
    o.name AS object_name,
    p.permission_name,
    p.state_desc AS permission_state
FROM sys.database_permissions p
LEFT JOIN sys.objects o ON p.major_id = o.object_id
LEFT JOIN sys.database_principals dp ON p.grantee_principal_id = dp.principal_id;`
        },
        {
          problem: 'Database queries timing out',
          symptoms: ['Slow query performance', 'Timeout errors', 'High CPU usage'],
          causes: ['Missing indexes', 'Large dataset queries', 'Blocking queries', 'Insufficient resources'],
          solutions: [
            'Add indexes on frequently queried columns',
            'Optimize queries with EXPLAIN PLAN',
            'Implement query pagination',
            'Monitor blocking queries: `sp_who2`',
            'Increase connection timeout settings'
          ],
          code: `-- Find slow queries
SELECT TOP 10
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
    qs.total_logical_reads / qs.execution_count AS avg_logical_reads,
    SUBSTRING(qt.text, qs.statement_start_offset/2+1,
        (CASE WHEN qs.statement_end_offset = -1
            THEN LEN(CONVERT(nvarchar(max), qt.text)) * 2
            ELSE qs.statement_end_offset end - qs.statement_start_offset)/2) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) AS qt
ORDER BY avg_elapsed_time DESC;`
        }
      ]
    },
    {
      title: 'API & Synchronization Issues',
      icon: <WarningIcon />,
      severity: 'warning',
      issues: [
        {
          problem: 'Magento API authentication failures',
          symptoms: ['401 Unauthorized errors', 'Invalid token messages', 'API calls failing'],
          causes: ['Expired access token', 'Invalid API credentials', 'Magento API disabled', 'Rate limiting'],
          solutions: [
            'Regenerate Magento access token',
            'Verify API credentials in .env file',
            'Check Magento API status in admin panel',
            'Implement token refresh mechanism',
            'Add retry logic with exponential backoff'
          ],
          code: `// Test Magento API connection
const testMagentoConnection = async () => {
  try {
    const response = await fetch(\`\${MAGENTO_BASE_URL}/rest/V1/products?searchCriteria[pageSize]=1\`, {
      headers: {
        'Authorization': \`Bearer \${MAGENTO_API_TOKEN}\`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Magento API connection successful');
      return true;
    } else {
      console.error('❌ Magento API error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Magento API connection failed:', error);
    return false;
  }
};`
        },
        {
          problem: 'ETL synchronization failures',
          symptoms: ['Sync jobs failing', 'Data inconsistencies', 'Partial sync completion'],
          causes: ['Network connectivity issues', 'Data validation errors', 'Resource constraints', 'Concurrent sync conflicts'],
          solutions: [
            'Check network connectivity to all systems',
            'Review sync logs for specific errors',
            'Implement data validation before sync',
            'Add sync job queuing and retry mechanisms',
            'Monitor system resources during sync'
          ],
          code: `// Sync monitoring and recovery
const monitorSyncHealth = async () => {
  const syncStatus = await getSyncStatus();
  
  if (syncStatus.failed > 0) {
    console.warn(\`⚠️ \${syncStatus.failed} sync jobs failed\`);
    
    // Retry failed jobs
    const failedJobs = await getFailedSyncJobs();
    for (const job of failedJobs) {
      if (job.retryCount < 3) {
        await retrySyncJob(job.id);
      } else {
        await markJobForManualReview(job.id);
      }
    }
  }
  
  return syncStatus;
};`
        }
      ]
    },
    {
      title: 'Frontend Application Issues',
      icon: <BugIcon />,
      severity: 'info',
      issues: [
        {
          problem: 'Application not loading or white screen',
          symptoms: ['Blank page display', 'JavaScript errors in console', 'Build errors'],
          causes: ['Build configuration issues', 'Missing environment variables', 'JavaScript errors', 'Network connectivity'],
          solutions: [
            'Check browser console for JavaScript errors',
            'Verify all environment variables are set',
            'Clear browser cache and cookies',
            'Rebuild application: `npm run build`',
            'Check network connectivity to API endpoints'
          ],
          code: `// Debug frontend issues
// Check environment variables
console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
console.log('Firebase Config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '✓' : '✗',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✓' : '✗',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✓' : '✗'
});

// Test API connectivity
fetch(process.env.REACT_APP_API_BASE_URL + '/health')
  .then(response => {
    if (response.ok) {
      console.log('✅ API connection successful');
    } else {
      console.error('❌ API connection failed:', response.status);
    }
  })
  .catch(error => {
    console.error('❌ Network error:', error);
  });`
        },
        {
          problem: 'Grid performance issues',
          symptoms: ['Slow grid rendering', 'Browser freezing', 'Memory leaks'],
          causes: ['Large datasets without virtualization', 'Memory leaks in components', 'Inefficient re-renders'],
          solutions: [
            'Enable grid virtualization for large datasets',
            'Implement pagination for data loading',
            'Use React.memo for expensive components',
            'Monitor memory usage in browser dev tools',
            'Implement proper cleanup in useEffect hooks'
          ],
          code: `// Optimize grid performance
const OptimizedGrid = React.memo(({ data, columns }) => {
  // Use virtualization for large datasets
  const virtualizedProps = useMemo(() => ({
    enableVirtualization: data.length > 100,
    rowBuffer: 10,
    columnBuffer: 2
  }), [data.length]);
  
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(row => ({
      ...row,
      _id: row.id || generateId()
    }));
  }, [data]);
  
  return (
    <BaseGrid
      data={processedData}
      columns={columns}
      {...virtualizedProps}
    />
  );
});`
        }
      ]
    },
    {
      title: 'Performance & Resource Issues',
      icon: <InfoIcon />,
      severity: 'info',
      issues: [
        {
          problem: 'High memory usage',
          symptoms: ['System slowdown', 'Out of memory errors', 'Process crashes'],
          causes: ['Memory leaks', 'Large dataset processing', 'Inefficient caching', 'Resource not being freed'],
          solutions: [
            'Monitor memory usage: `htop` or `free -h`',
            'Implement proper garbage collection',
            'Use streaming for large data processing',
            'Configure appropriate cache limits',
            'Restart services periodically if needed'
          ],
          code: `// Memory monitoring script
const monitorMemoryUsage = () => {
  const used = process.memoryUsage();
  
  console.log('Memory Usage:');
  for (let key in used) {
    console.log(\`\${key}: \${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB\`);
  }
  
  // Alert if memory usage is high
  const heapUsedMB = used.heapUsed / 1024 / 1024;
  if (heapUsedMB > 500) {
    console.warn('⚠️ High memory usage detected:', heapUsedMB, 'MB');
    
    // Trigger garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('🗑️ Garbage collection triggered');
    }
  }
};

// Run every 5 minutes
setInterval(monitorMemoryUsage, 5 * 60 * 1000);`
        }
      ]
    }
  ];

  const filteredCategories = troubleshootingCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.issues.some(issue =>
      issue.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🔧 Troubleshooting Guide
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Comprehensive troubleshooting guide for TECHNO-ETL issues and solutions
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Common Issues" color="primary" />
              <Chip label="Step-by-step Solutions" color="success" />
              <Chip label="Code Examples" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <TextField
              placeholder="Search for issues, symptoms, or solutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '100%', maxWidth: 600 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </motion.div>

        {/* Quick Help */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>🆘 Quick Help</Typography>
            <Typography variant="body1">
              Use the search box above to quickly find solutions to specific issues. Each troubleshooting section includes 
              symptoms, causes, step-by-step solutions, and code examples. For urgent issues, check the error logs first 
              and follow the diagnostic steps provided.
            </Typography>
          </Alert>
        </motion.div>

        {/* Troubleshooting Categories */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🔍 Common Issues & Solutions
          </Typography>
          
          {filteredCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: `${getSeverityColor(category.severity)}.main` }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={600}>
                    {category.title}
                  </Typography>
                  <Chip 
                    label={category.severity.toUpperCase()} 
                    color={getSeverityColor(category.severity)} 
                    size="small" 
                    sx={{ ml: 2 }}
                  />
                </Box>

                {category.issues.map((issue, issueIndex) => (
                  <Accordion key={issueIndex} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" fontWeight={600}>
                        {issue.problem}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {/* Symptoms */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error.main">
                            🔍 Symptoms:
                          </Typography>
                          <List dense>
                            {issue.symptoms.map((symptom, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <ErrorIcon color="error" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={symptom} />
                              </ListItem>
                            ))}
                          </List>

                          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="warning.main" sx={{ mt: 2 }}>
                            ⚠️ Possible Causes:
                          </Typography>
                          <List dense>
                            {issue.causes.map((cause, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <WarningIcon color="warning" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={cause} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>

                        {/* Solutions */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="success.main">
                            ✅ Solutions:
                          </Typography>
                          <List dense>
                            {issue.solutions.map((solution, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <SolutionIcon color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={solution} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>

                        {/* Code Example */}
                        {issue.code && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary.main">
                              💻 Code Example:
                            </Typography>
                            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
                              <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                                {issue.code}
                              </pre>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div variants={itemVariants}>
          <Alert severity="error" sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>🚨 Emergency Support</Typography>
            <Typography variant="body1">
              <strong>For critical production issues:</strong><br />
              📧 Email: mounir.ab@techno-dz.com<br />
              📧 Alternative: mounir.webdev.tms@gmail.com<br />
              📞 Include "URGENT - TECHNO-ETL" in subject line<br />
              🕐 Response time: Within 2 hours during business hours
            </Typography>
          </Alert>
        </motion.div>

        {/* Additional Resources */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, mt: 6, fontWeight: 600 }}>
            📚 Additional Resources
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Log Files Location
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Application: /var/log/techno-etl/" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Nginx: /var/log/nginx/" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="SQL Server: /var/opt/mssql/log/" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="PM2: ~/.pm2/logs/" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary.main">
                    Useful Commands
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="pm2 status - Check app status" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="pm2 logs - View application logs" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="systemctl status nginx - Check web server" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="htop - Monitor system resources" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    Health Check URLs
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="/api/health - API health status" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="/api/db-health - Database connectivity" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="/api/sync-status - Sync job status" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="/api/metrics - Performance metrics" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default Troubleshooting;
