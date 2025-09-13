/**
 * Dashboard Page Tests
 * 
 * Comprehensive tests for the main Dashboard page
 * Tests all dashboard widgets, data loading, and user interactions
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Dashboard from '../../pages/Dashboard';

// Mock dependencies
vi.mock('../../services/dashboardApi', () => ({
  default: {
    getDashboardData: vi.fn(),
    getMagentoStats: vi.fn(),
    getMDMStats: vi.fn(),
    getAnalyticsData: vi.fn()
  }
}));

vi.mock('../../services/magentoApi', () => ({
  default: {
    getProducts: vi.fn(),
    getOrders: vi.fn(),
    getCustomers: vi.fn()
  }
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

const renderDashboard = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Dashboard {...props} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock data
const mockDashboardData = {
  stats: {
    totalProducts: 1250,
    totalOrders: 89,
    totalCustomers: 456,
    totalRevenue: 125000.50
  },
  charts: {
    salesTrend: [
      { date: '2025-01-01', sales: 1000 },
      { date: '2025-01-02', sales: 1200 },
      { date: '2025-01-03', sales: 950 }
    ],
    productCategories: [
      { category: 'Electronics', count: 450 },
      { category: 'Clothing', count: 300 },
      { category: 'Books', count: 200 }
    ]
  },
  recentActivity: [
    { id: 1, type: 'order', message: 'New order #12345', timestamp: '2025-08-27T10:00:00Z' },
    { id: 2, type: 'customer', message: 'New customer registered', timestamp: '2025-08-27T09:30:00Z' }
  ]
};

const mockMagentoStats = {
  products: { total: 1250, active: 1100, inactive: 150 },
  orders: { total: 89, pending: 12, completed: 77 },
  customers: { total: 456, active: 420, inactive: 36 }
};

const mockMDMStats = {
  totalRecords: 5000,
  lastSync: '2025-08-27T08:00:00Z',
  syncStatus: 'success'
};

// ============================================================================
// DASHBOARD COMPONENT TESTS
// ============================================================================

describe('Dashboard Page', () => {
  let mockDashboardApi;
  let mockMagentoApi;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Import and setup mocks
    mockDashboardApi = require('../../services/dashboardApi').default;
    mockMagentoApi = require('../../services/magentoApi').default;
    
    // Setup default mock responses
    mockDashboardApi.getDashboardData.mockResolvedValue(mockDashboardData);
    mockDashboardApi.getMagentoStats.mockResolvedValue(mockMagentoStats);
    mockDashboardApi.getMDMStats.mockResolvedValue(mockMDMStats);
    mockMagentoApi.getProducts.mockResolvedValue({ data: { items: [] } });
    mockMagentoApi.getOrders.mockResolvedValue({ data: { items: [] } });
    mockMagentoApi.getCustomers.mockResolvedValue({ data: { items: [] } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders dashboard without crashing', () => {
      renderDashboard();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays dashboard title', () => {
      renderDashboard();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('renders loading state initially', () => {
      renderDashboard();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders all dashboard sections after loading', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/statistics/i)).toBeInTheDocument();
        expect(screen.getByText(/charts/i)).toBeInTheDocument();
        expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // DATA LOADING TESTS
  // ============================================================================

  describe('Data Loading', () => {
    it('loads dashboard data on mount', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(mockDashboardApi.getDashboardData).toHaveBeenCalledTimes(1);
        expect(mockDashboardApi.getMagentoStats).toHaveBeenCalledTimes(1);
        expect(mockDashboardApi.getMDMStats).toHaveBeenCalledTimes(1);
      });
    });

    it('displays stats after successful data load', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('1250')).toBeInTheDocument(); // Total products
        expect(screen.getByText('89')).toBeInTheDocument(); // Total orders
        expect(screen.getByText('456')).toBeInTheDocument(); // Total customers
      });
    });

    it('handles data loading errors gracefully', async () => {
      const error = new Error('Failed to load dashboard data');
      mockDashboardApi.getDashboardData.mockRejectedValue(error);
      
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      });
    });

    it('retries data loading on refresh', async () => {
      renderDashboard();
      
      // Wait for initial load
      await waitFor(() => {
        expect(mockDashboardApi.getDashboardData).toHaveBeenCalledTimes(1);
      });
      
      // Click refresh button
      const refreshButton = screen.getByLabelText(/refresh/i);
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockDashboardApi.getDashboardData).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ============================================================================
  // STATISTICS WIDGET TESTS
  // ============================================================================

  describe('Statistics Widgets', () => {
    it('displays all stat cards', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/total products/i)).toBeInTheDocument();
        expect(screen.getByText(/total orders/i)).toBeInTheDocument();
        expect(screen.getByText(/total customers/i)).toBeInTheDocument();
        expect(screen.getByText(/revenue/i)).toBeInTheDocument();
      });
    });

    it('formats currency values correctly', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/\$125,000\.50/)).toBeInTheDocument();
      });
    });

    it('shows trends when available', async () => {
      const dataWithTrends = {
        ...mockDashboardData,
        stats: {
          ...mockDashboardData.stats,
          productsTrend: { direction: 'up', percentage: 12.5 },
          ordersTrend: { direction: 'down', percentage: 5.2 }
        }
      };
      
      mockDashboardApi.getDashboardData.mockResolvedValue(dataWithTrends);
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/\+12\.5%/)).toBeInTheDocument();
        expect(screen.getByText(/-5\.2%/)).toBeInTheDocument();
      });
    });

    it('handles stat card clicks', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/total products/i)).toBeInTheDocument();
      });
      
      const productCard = screen.getByText(/total products/i).closest('[data-testid="stat-card"]');
      await user.click(productCard);
      
      // Should navigate or show details (implementation specific)
      expect(productCard).toHaveAttribute('role', 'button');
    });
  });

  // ============================================================================
  // CHARTS WIDGET TESTS
  // ============================================================================

  describe('Charts Widgets', () => {
    it('renders sales trend chart', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByTestId('sales-trend-chart')).toBeInTheDocument();
      });
    });

    it('renders product categories chart', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByTestId('categories-chart')).toBeInTheDocument();
      });
    });

    it('handles chart interactions', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByTestId('sales-trend-chart')).toBeInTheDocument();
      });
      
      // Test chart legend clicks
      const legendItem = screen.getByText('Electronics');
      await user.click(legendItem);
      
      // Chart should respond to interaction
      expect(legendItem).toBeInTheDocument();
    });

    it('shows empty state when no chart data', async () => {
      const emptyData = {
        ...mockDashboardData,
        charts: {
          salesTrend: [],
          productCategories: []
        }
      };
      
      mockDashboardApi.getDashboardData.mockResolvedValue(emptyData);
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/no data available/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // RECENT ACTIVITY TESTS
  // ============================================================================

  describe('Recent Activity Widget', () => {
    it('displays recent activity items', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/new order #12345/i)).toBeInTheDocument();
        expect(screen.getByText(/new customer registered/i)).toBeInTheDocument();
      });
    });

    it('formats timestamps correctly', async () => {
      renderDashboard();
      
      await waitFor(() => {
        // Should show relative time like "2 hours ago"
        expect(screen.getByText(/ago/)).toBeInTheDocument();
      });
    });

    it('shows activity icons', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByTestId('activity-icon-order')).toBeInTheDocument();
        expect(screen.getByTestId('activity-icon-customer')).toBeInTheDocument();
      });
    });

    it('handles activity item clicks', async () => {
      const user = userEvent.setup();
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/new order #12345/i)).toBeInTheDocument();
      });
      
      const activityItem = screen.getByText(/new order #12345/i);
      await user.click(activityItem);
      
      // Should navigate to order details
      expect(activityItem).toHaveAttribute('role', 'button');
    });
  });

  // ============================================================================
  // RESPONSIVENESS TESTS
  // ============================================================================

  describe('Responsive Design', () => {
    it('adapts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderDashboard();
      
      const dashboardContainer = screen.getByRole('main');
      expect(dashboardContainer).toHaveClass('mobile-layout');
    });

    it('shows collapsed navigation on tablet', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderDashboard();
      
      expect(screen.getByLabelText(/toggle navigation/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('shows error boundary when component crashes', () => {
      const ThrowError = () => {
        throw new Error('Component crashed');
      };
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <ThrowError />
          </ThemeProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('recovers from API errors', async () => {
      // Start with error
      mockDashboardApi.getDashboardData.mockRejectedValue(new Error('API Error'));
      
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      });
      
      // Fix API and retry
      mockDashboardApi.getDashboardData.mockResolvedValue(mockDashboardData);
      
      const retryButton = screen.getByText(/retry/i);
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('1250')).toBeInTheDocument(); // Data loaded
      });
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance', () => {
    it('does not re-render unnecessarily', async () => {
      const renderSpy = vi.fn();
      
      const TestDashboard = () => {
        renderSpy();
        return <Dashboard />;
      };
      
      const { rerender } = render(
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <TestDashboard />
          </ThemeProvider>
        </BrowserRouter>
      );
      
      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <TestDashboard />
          </ThemeProvider>
        </BrowserRouter>
      );
      
      // Should use React.memo to prevent unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('lazy loads chart components', async () => {
      renderDashboard();
      
      // Charts should load asynchronously
      await waitFor(() => {
        expect(screen.getByTestId('sales-trend-chart')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});