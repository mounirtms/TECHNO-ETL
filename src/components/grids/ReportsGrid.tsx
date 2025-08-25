/**
 * Reports Grid Component
 * Displays reports and analytics in a grid format
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Divider
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Mock reports data
const mockReports = [
  {
    id: 'RPT-001',
    name: 'Sales Performance Report',
    type: 'sales',
    category: 'Financial',
    description: 'Monthly sales performance analysis with trends and forecasts',
    lastGenerated: '2024-01-15',
    frequency: 'Monthly',
    status: 'ready',
    size: '2.4 MB',
    format: 'PDF',
    chartType: 'line'
  },
  {
    id: 'RPT-002',
    name: 'Inventory Status Report',
    type: 'inventory',
    category: 'Operations',
    description: 'Current inventory levels and stock movement analysis',
    lastGenerated: '2024-01-16',
    frequency: 'Weekly',
    status: 'generating',
    size: '1.8 MB',
    format: 'Excel',
    chartType: 'bar'
  },
  {
    id: 'RPT-003',
    name: 'Customer Analytics Report',
    type: 'customer',
    category: 'Marketing',
    description: 'Customer behavior analysis and segmentation insights',
    lastGenerated: '2024-01-14',
    frequency: 'Quarterly',
    status: 'ready',
    size: '3.2 MB',
    format: 'PDF',
    chartType: 'pie'
  },
  {
    id: 'RPT-004',
    name: 'Product Performance Report',
    type: 'product',
    category: 'Operations',
    description: 'Top performing products and category analysis',
    lastGenerated: '2024-01-13',
    frequency: 'Monthly',
    status: 'ready',
    size: '1.5 MB',
    format: 'PDF',
    chartType: 'bar'
  },
  {
    id: 'RPT-005',
    name: 'Financial Summary Report',
    type: 'financial',
    category: 'Financial',
    description: 'Comprehensive financial overview with P&L analysis',
    lastGenerated: '2024-01-12',
    frequency: 'Monthly',
    status: 'scheduled',
    size: '4.1 MB',
    format: 'Excel',
    chartType: 'line'
  }
];

const getStatusColor = (status) => {
  switch(status) {
    case 'ready': return 'success';
    case 'generating': return 'info';
    case 'scheduled': return 'warning';
    case 'error': return 'error';
    default: return 'default';
  }
};

const getChartIcon = (chartType) => {
  switch(chartType) {
    case 'line': return <LineChartIcon />;
    case 'bar': return <BarChartIcon />;
    case 'pie': return <PieChartIcon />;
    default: return <ReportIcon />;
  }
};

const ReportsGrid: React.FC<{data: any, onDataChange: any, onBadgeUpdate: any}> = ({ data, onDataChange, onBadgeUpdate  }) => {
  const { t } = useTranslation();
  const [reports, setReports] = useState(mockReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter reports based on search query
  const filteredReports = reports.filter((report: any: any) =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update badge count for ready reports
  useEffect(() => {
    const readyReports = reports.filter((r: any: any) => r.status === 'ready').length;
    onBadgeUpdate?.(readyReports);
  }, [reports, onBadgeUpdate]);

  const handleCreateReport = () => {
    console.log('Create new report');
  };

  const handleViewReport = (reportId) => {
    console.log('View report:', reportId);
  };

  const handleDownloadReport = (reportId) => {
    console.log('Download report:', reportId);
  };

  const handleScheduleReport = (reportId) => {
    console.log('Schedule report:', reportId);
  };

  return Boolean(Boolean((
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2">
          {t('Reports & Analytics')}
        </Typography>
        <Button
          variant: any,
          startIcon={<AddIcon />}
          onClick={handleCreateReport}
        >
          {t('Create Report')}
        </Button>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        placeholder={t('Search reports...')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps: any,
        }}
        sx={{ mb: 3 }}
      />

      {/* Reports Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 2 }}>
        {filteredReports.map((report: any: any) => (
          <Card key={report.id} sx={{ height: 'fit-content' }}>
            <CardContent>
              <Stack spacing={2}>
                {/* Report Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getChartIcon(report.chartType)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div" noWrap>
                        {report.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.id}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={report.status}
                    color={getStatusColor(report.status)}
                    size: any,
                {/* Category and Type */}
                <Stack direction="row" spacing={1}>
                  <Chip label={report.category} variant="outlined" size="small" />
                  <Chip label={report.type} variant="outlined" size="small" />
                </Stack>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {report.description}
                </Typography>

                <Divider />

                {/* Report Details */}
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('Last Generated')}
                    </Typography>
                    <Typography variant="body2">
                      {report.lastGenerated}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('Frequency')}
                    </Typography>
                    <Typography variant="body2">
                      {report.frequency}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('Format')}
                    </Typography>
                    <Typography variant="body2">
                      {report.format}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('Size')}
                    </Typography>
                    <Typography variant="body2">
                      {report.size}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Tooltip title={t('View Report')}>
                    <IconButton 
                      size: any,
                      onClick={() => handleViewReport(report.id)}
                      disabled={report.status !== 'ready'}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Download Report')}>
                    <IconButton 
                      size: any,
                      onClick={() => handleDownloadReport(report.id)}
                      disabled={report.status !== 'ready'}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Schedule Report')}>
                    <IconButton size="small" onClick={() => handleScheduleReport(report.id)}>
                      <ScheduleIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Progress indicator for generating reports */}
                {report.status === 'generating' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      border: '2px solid #f3f3f3',
                      borderTop: '2px solid #1976d2',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }} />
                    <Typography variant="caption" color="text.secondary">
                      {t('Generating report...')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Empty State */}
      {filteredReports.length ===0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? t('No reports found') : t('No reports yet')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? t('Try adjusting your search') : t('Create your first report to get insights')}
          </Typography>
        </Box>
      )}
    </Box>
  )));
};

export default ReportsGrid;
