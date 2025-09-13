/**
 * Analytics Page Tests
 * 
 * Comprehensive tests for the Analytics page
 * Tests data visualization, charts, filters, and analytics workflows
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AnalyticsPage from '../../pages/AnalyticsPage';

// Mock dependencies
vi.mock('../../services/analyticsApi', () => ({
  default: {
    getAnalyticsData: vi.fn(),
    getSalesData: vi.fn(),
    getCustomerData: vi.fn(),
    getProductPerformance: vi.fn(),
    getRevenueData: vi.fn(),
    getConversionRates: vi.fn(),
    exportAnalytics: vi.fn()
  }
}));

vi.mock('recharts', () => ({
  LineChart: vi.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  BarChart: vi.fn(({ children }) => <div data-testid="bar-chart">{children}</div>),
  PieChart: vi.fn(({ children }) => <div data-testid="pie-chart">{children}</div>),
  AreaChart: vi.fn(({ children }) => <div data-testid="area-chart">{children}</div>),
  XAxis: vi.fn(() => <div data-testid="x-axis" />),
  YAxis: vi.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: vi.fn(() => <div data-testid="grid" />),
  Tooltip: vi.fn(() => <div data-testid="tooltip" />),
  Legend: vi.fn(() => <div data-testid="legend" />),
  Line: vi.fn(() => <div data-testid="line" />),
  Bar: vi.fn(() => <div data-testid="bar" />),
  Pie: vi.fn(() => <div data-testid="pie" />),
  Area: vi.fn(() => <div data-testid="area" />),
  Cell: vi.fn(() => <div data-testid="cell" />),
  ResponsiveContainer: vi.fn(({ children }) => <div data-testid="responsive-container">{children}</div>)
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Test utilities
const theme = createTheme();

const renderAnalyticsPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AnalyticsPage {...props} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock data
const mockAnalyticsData = {
  overview: {
    totalRevenue: 125000.50,
    totalOrders: 890,
    avgOrderValue: 140.45,
    conversionRate: 3.2
  },
  salesTrend: [
    { date: '2025-01-01', sales: 5000, orders: 35 },
    { date: '2025-01-02', sales: 6200, orders: 42 },
    { date: '2025-01-03', sales: 4800, orders: 28 }
  ],
  productPerformance: [
    { product: 'Product A', sales: 15000, quantity: 120 },
    { product: 'Product B', sales: 12000, quantity: 95 },
    { product: 'Product C', sales: 8500, quantity: 68 }
  ],
  customerSegments: [
    { segment: 'Premium', value: 40, customers: 150 },
    { segment: 'Regular', value: 35, customers: 200 },
    { segment: 'Basic', value: 25, customers: 100 }
  ],
  revenueByChannel: [
    { channel: 'Website', revenue: 75000, percentage: 60 },
    { channel: 'Mobile App', revenue: 37500, percentage: 30 },
    { channel: 'API', revenue: 12500, percentage: 10 }
  ]
};

// ============================================================================
// ANALYTICS PAGE TESTS
// ============================================================================

describe('Analytics Page', () => {
  let mockAnalyticsApi;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockAnalyticsApi = require('../../services/analyticsApi').default;
    
    // Setup default mock responses
    mockAnalyticsApi.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockAnalyticsApi.getSalesData.mockResolvedValue(mockAnalyticsData.salesTrend);
    mockAnalyticsApi.getCustomerData.mockResolvedValue(mockAnalyticsData.customerSegments);
    mockAnalyticsApi.getProductPerformance.mockResolvedValue(mockAnalyticsData.productPerformance);
    mockAnalyticsApi.getRevenueData.mockResolvedValue(mockAnalyticsData.revenueByChannel);
    mockAnalyticsApi.getConversionRates.mockResolvedValue({ rate: 3.2, trend: 'up' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders analytics page without crashing', () => {
      renderAnalyticsPage();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays page title and description', () => {
      renderAnalyticsPage();
      expect(screen.getByText(/analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/comprehensive analytics/i)).toBeInTheDocument();
    });

    it('renders analytics tabs', () => {
      renderAnalyticsPage();
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
      expect(screen.getByText(/sales/i)).toBeInTheDocument();
      expect(screen.getByText(/customers/i)).toBeInTheDocument();
      expect(screen.getByText(/products/i)).toBeInTheDocument();
    });

    it('displays loading state initially', () => {
      renderAnalyticsPage();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DATA LOADING TESTS
  // ============================================================================

  describe('Data Loading', () => {
    it('loads analytics data on page mount', async () => {
      renderAnalyticsPage();
      
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledTimes(1);
      });
    });

    it('displays overview metrics after loading', async () => {
      renderAnalyticsPage();
      
      await waitFor(() => {
        expect(screen.getByText('$125,000.50')).toBeInTheDocument(); // Total revenue
        expect(screen.getByText('890')).toBeInTheDocument(); // Total orders
        expect(screen.getByText('$140.45')).toBeInTheDocument(); // Avg order value
        expect(screen.getByText('3.2%')).toBeInTheDocument(); // Conversion rate
      });
    });

    it('handles data loading errors gracefully', async () => {
      const error = new Error('Failed to load analytics data');
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(error);
      
      renderAnalyticsPage();
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });
    });

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      // Wait for initial load
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledTimes(1);
      });
      
      // Click refresh
      const refreshButton = screen.getByLabelText(/refresh/i);
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('switches to sales tab', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      const salesTab = screen.getByText(/sales/i);
      await user.click(salesTab);
      
      expect(salesTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to customers tab', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      const customersTab = screen.getByText(/customers/i);
      await user.click(customersTab);
      
      expect(customersTab).toHaveAttribute('aria-selected', 'true');
    });

    it('loads appropriate data for each tab', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      // Switch to sales tab
      const salesTab = screen.getByText(/sales/i);
      await user.click(salesTab);
      
      await waitFor(() => {
        expect(mockAnalyticsApi.getSalesData).toHaveBeenCalled();
      });
      
      // Switch to customers tab
      const customersTab = screen.getByText(/customers/i);
      await user.click(customersTab);
      
      await waitFor(() => {
        expect(mockAnalyticsApi.getCustomerData).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // CHART INTERACTIONS TESTS
  // ============================================================================

  describe('Chart Interactions', () => {
    it('renders sales trend chart', async () => {
      renderAnalyticsPage();
      
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    it('renders product performance chart', async () => {
      renderAnalyticsPage();
      
      const productsTab = screen.getByText(/products/i);
      await userEvent.setup().click(productsTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    it('renders customer segments pie chart', async () => {
      renderAnalyticsPage();
      
      const customersTab = screen.getByText(/customers/i);
      await userEvent.setup().click(customersTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });

    it('handles chart legend interactions', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      await waitFor(() => {
        expect(screen.getByTestId('legend')).toBeInTheDocument();
      });
      
      // Legend should be interactive
      const legend = screen.getByTestId('legend');
      expect(legend).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FILTERING TESTS
  // ============================================================================

  describe('Filtering and Date Range', () => {
    it('filters data by date range', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText(/date range/i)).toBeInTheDocument();
      });
      
      // Select date range
      const dateRangeSelector = screen.getByLabelText(/date range/i);
      await user.click(dateRangeSelector);
      await user.click(screen.getByText(/last 7 days/i));
      
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledWith(
          expect.objectContaining({
            dateRange: 'last7days'
          })
        );
      });
    });

    it('filters by product category', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      // Wait for filters to load
      await waitFor(() => {
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      });
      
      // Select category filter
      const categoryFilter = screen.getByLabelText(/category/i);
      await user.click(categoryFilter);
      await user.click(screen.getByText('Electronics'));
      
      expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Electronics'
        })
      );
    });

    it('combines multiple filters', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      // Apply date range filter
      const dateRangeSelector = screen.getByLabelText(/date range/i);
      await user.click(dateRangeSelector);
      await user.click(screen.getByText(/last 30 days/i));
      
      // Apply category filter
      const categoryFilter = screen.getByLabelText(/category/i);
      await user.click(categoryFilter);
      await user.click(screen.getByText('Electronics'));
      
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledWith(
          expect.objectContaining({
            dateRange: 'last30days',
            category: 'Electronics'
          })
        );
      });
    });

    it('clears all filters', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      // Apply some filters first
      const categoryFilter = screen.getByLabelText(/category/i);
      await user.click(categoryFilter);
      await user.click(screen.getByText('Electronics'));
      
      // Clear filters
      const clearButton = screen.getByText(/clear filters/i);
      await user.click(clearButton);
      
      expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: {}
        })
      );
    });
  });

  // ============================================================================
  // EXPORT FUNCTIONALITY TESTS
  // ============================================================================

  describe('Export Functionality', () => {
    it('exports analytics data to CSV', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      const exportButton = screen.getByLabelText(/export/i);
      await user.click(exportButton);
      await user.click(screen.getByText(/csv/i));
      
      await waitFor(() => {
        expect(mockAnalyticsApi.exportAnalytics).toHaveBeenCalledWith(
          'csv',
          expect.any(Object)
        );
      });
    });

    it('exports analytics data to Excel', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      const exportButton = screen.getByLabelText(/export/i);
      await user.click(exportButton);
      await user.click(screen.getByText(/excel/i));
      
      await waitFor(() => {
        expect(mockAnalyticsApi.exportAnalytics).toHaveBeenCalledWith(
          'excel',
          expect.any(Object)
        );
      });
    });

    it('exports chart as image', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      // Wait for chart to load
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
      
      const chartExportButton = screen.getByLabelText(/export chart/i);
      await user.click(chartExportButton);
      
      // Should trigger chart export
      expect(chartExportButton).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const error = new Error('Analytics API Error');
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(error);
      
      renderAnalyticsPage();
      
      await waitFor(() => {
        expect(screen.getByText(/analytics api error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });

    it('shows network error messages', async () => {
      const networkError = new Error('Network Error');
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(networkError);
      
      renderAnalyticsPage();
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('recovers from errors with retry', async () => {
      const user = userEvent.setup();
      
      // Start with error
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(new Error('Server Error'));
      
      renderAnalyticsPage();
      
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
      
      // Fix the API and retry
      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
      
      const retryButton = screen.getByText(/retry/i);
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('$125,000.50')).toBeInTheDocument(); // Data loaded
      });
    });
  });

  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================

  describe('Responsive Design', () => {
    it('adapts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderAnalyticsPage();
      
      const analyticsContainer = screen.getByRole('main');
      expect(analyticsContainer).toHaveClass('mobile-layout');
    });

    it('shows collapsed charts on tablet', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderAnalyticsPage();
      
      expect(screen.getByLabelText(/toggle charts/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper ARIA labels for charts', async () => {
      renderAnalyticsPage();
      
      await waitFor(() => {
        const chart = screen.getByTestId('line-chart');
        expect(chart).toHaveAttribute('aria-label');
      });
    });

    it('supports keyboard navigation for tabs', async () => {
      const user = userEvent.setup();
      renderAnalyticsPage();
      
      const overviewTab = screen.getByText(/overview/i);
      const salesTab = screen.getByText(/sales/i);
      
      // Focus on first tab
      overviewTab.focus();
      expect(overviewTab).toHaveFocus();
      
      // Navigate with keyboard
      await user.keyboard('{ArrowRight}');
      expect(salesTab).toHaveFocus();
    });

    it('announces data updates to screen readers', async () => {
      renderAnalyticsPage();
      
      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      });
    });
  });
});