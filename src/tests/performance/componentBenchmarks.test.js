import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { performance } from 'perf_hooks';

// Mock performance.mark and performance.measure for browsers that don't support it
if (typeof performance.mark === 'undefined') {
  performance.mark = vi.fn();
  performance.measure = vi.fn();
  performance.getEntriesByName = vi.fn(() => []);
  performance.clearMarks = vi.fn();
  performance.clearMeasures = vi.fn();
}

// Performance testing utilities
const measureRenderTime = async (component, testName) => {
  const startTime = performance.now();
  performance.mark(`${testName}-start`);
  
  const result = render(component);
  
  performance.mark(`${testName}-end`);
  const endTime = performance.now();
  
  performance.measure(`${testName}-duration`, `${testName}-start`, `${testName}-end`);
  
  return {
    renderTime: endTime - startTime,
    result
  };
};

const measureAsyncOperation = async (operation, testName) => {
  const startTime = performance.now();
  performance.mark(`${testName}-async-start`);
  
  await operation();
  
  performance.mark(`${testName}-async-end`);
  const endTime = performance.now();
  
  performance.measure(`${testName}-async-duration`, `${testName}-async-start`, `${testName}-async-end`);
  
  return endTime - startTime;
};

// Mock components for performance testing
const HeavyComponent = ({ itemCount = 1000 }) => {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: Math.random() * 1000
  }));

  return (
    <div data-testid="heavy-component">
      {items.map(item => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.name}: {item.value.toFixed(2)}
        </div>
      ))}
    </div>
  );
};

const OptimizedHeavyComponent = ({ itemCount = 1000 }) => {
  const items = React.useMemo(() => 
    Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random() * 1000
    })), [itemCount]
  );

  return (
    <div data-testid="optimized-heavy-component">
      {items.map(item => (
        <div key={item.id} data-testid={`optimized-item-${item.id}`}>
          {item.name}: {item.value.toFixed(2)}
        </div>
      ))}
    </div>
  );
};

const VirtualizedComponent = ({ itemCount = 10000 }) => {
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 50 });
  
  const items = React.useMemo(() => 
    Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random() * 1000
    })), [itemCount]
  );

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div data-testid="virtualized-component">
      <div data-testid="total-items">Total: {itemCount}</div>
      <div data-testid="visible-items">Visible: {visibleItems.length}</div>
      {visibleItems.map(item => (
        <div key={item.id} data-testid={`virtual-item-${item.id}`}>
          {item.name}: {item.value.toFixed(2)}
        </div>
      ))}
    </div>
  );
};

// Mock settings context for performance testing
const createMockSettingsContext = (settings = {}) => ({
  settings: {
    preferences: { 
      theme: 'light', 
      language: 'en',
      animations: true,
      ...settings.preferences 
    },
    gridSettings: { 
      defaultPageSize: 25,
      enableVirtualization: true,
      ...settings.gridSettings 
    },
    ...settings
  }
});

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Component Performance Benchmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performance.clearMarks?.();
    performance.clearMeasures?.();
  });

  describe('Render Performance', () => {
    it('measures basic component render time', async () => {
      const { renderTime } = await measureRenderTime(
        renderWithTheme(<div data-testid="simple">Simple Component</div>),
        'simple-component'
      );

      expect(renderTime).toBeLessThan(10); // Should render in less than 10ms
      expect(screen.getByTestId('simple')).toBeInTheDocument();
    });

    it('measures heavy component render time', async () => {
      const { renderTime } = await measureRenderTime(
        renderWithTheme(<HeavyComponent itemCount={100} />),
        'heavy-component'
      );

      expect(renderTime).toBeLessThan(100); // Should render 100 items in less than 100ms
      expect(screen.getByTestId('heavy-component')).toBeInTheDocument();
      expect(screen.getByTestId('item-0')).toBeInTheDocument();
      expect(screen.getByTestId('item-99')).toBeInTheDocument();
    });

    it('compares optimized vs non-optimized component performance', async () => {
      const itemCount = 500;

      const { renderTime: nonOptimizedTime } = await measureRenderTime(
        renderWithTheme(<HeavyComponent itemCount={itemCount} />),
        'non-optimized'
      );

      // Clear the DOM
      document.body.innerHTML = '';

      const { renderTime: optimizedTime } = await measureRenderTime(
        renderWithTheme(<OptimizedHeavyComponent itemCount={itemCount} />),
        'optimized'
      );

      // Optimized component should be at least as fast (allowing for some variance)
      expect(optimizedTime).toBeLessThanOrEqual(nonOptimizedTime * 1.2);
    });

    it('measures virtualized component performance with large datasets', async () => {
      const { renderTime } = await measureRenderTime(
        renderWithTheme(<VirtualizedComponent itemCount={10000} />),
        'virtualized-large'
      );

      expect(renderTime).toBeLessThan(50); // Should handle 10k items efficiently
      expect(screen.getByTestId('total-items')).toHaveTextContent('Total: 10000');
      expect(screen.getByTestId('visible-items')).toHaveTextContent('Visible: 50');
    });
  });

  describe('Settings Application Performance', () => {
    it('measures settings context update performance', async () => {
      const TestComponent = () => {
        const [settings, setSettings] = React.useState(createMockSettingsContext().settings);
        const [updateCount, setUpdateCount] = React.useState(0);

        React.useEffect(() => {
          setUpdateCount(prev => prev + 1);
        }, [settings]);

        const updateSettings = () => {
          setSettings(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              theme: prev.preferences.theme === 'light' ? 'dark' : 'light'
            }
          }));
        };

        return (
          <div data-testid="settings-test">
            <div data-testid="theme">{settings.preferences.theme}</div>
            <div data-testid="update-count">{updateCount}</div>
            <button data-testid="update-btn" onClick={updateSettings}>Update</button>
          </div>
        );
      };

      const { renderTime } = await measureRenderTime(
        renderWithTheme(<TestComponent />),
        'settings-context'
      );

      expect(renderTime).toBeLessThan(20);
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    it('measures DOM theme application performance', async () => {
      const applyThemeToDOM = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.setProperty('--primary-color', theme === 'dark' ? '#fff' : '#000');
      };

      const duration = await measureAsyncOperation(async () => {
        for (let i = 0; i < 100; i++) {
          applyThemeToDOM(i % 2 === 0 ? 'light' : 'dark');
        }
      }, 'theme-application');

      expect(duration).toBeLessThan(50); // 100 theme changes should take less than 50ms
    });
  });

  describe('Grid Performance', () => {
    it('measures grid rendering with different page sizes', async () => {
      const GridComponent = ({ pageSize }) => {
        const data = Array.from({ length: pageSize }, (_, i) => ({
          id: i,
          name: `Product ${i}`,
          price: Math.random() * 1000,
          status: i % 2 === 0 ? 'active' : 'inactive'
        }));

        return (
          <div data-testid="grid">
            <div data-testid="page-size">Page Size: {pageSize}</div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} data-testid={`row-${item.id}`}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      };

      const pageSizes = [25, 50, 100];
      const results = [];

      for (const pageSize of pageSizes) {
        document.body.innerHTML = '';
        
        const { renderTime } = await measureRenderTime(
          renderWithTheme(<GridComponent pageSize={pageSize} />),
          `grid-${pageSize}`
        );

        results.push({ pageSize, renderTime });
        
        expect(screen.getByTestId('page-size')).toHaveTextContent(`Page Size: ${pageSize}`);
        expect(screen.getByTestId(`row-${pageSize - 1}`)).toBeInTheDocument();
      }

      // Verify that render time scales reasonably with page size
      const smallPageTime = results.find(r => r.pageSize === 25).renderTime;
      const largePageTime = results.find(r => r.pageSize === 100).renderTime;
      
      // Large page should not be more than 5x slower than small page
      expect(largePageTime).toBeLessThan(smallPageTime * 5);
    });

    it('measures grid filtering performance', async () => {
      const FilterableGrid = () => {
        const [filter, setFilter] = React.useState('');
        const allData = React.useMemo(() => 
          Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Product ${i}`,
            category: i % 5 === 0 ? 'electronics' : 'other'
          })), []
        );

        const filteredData = React.useMemo(() => {
          if (!filter) return allData;
          return allData.filter(item => 
            item.name.toLowerCase().includes(filter.toLowerCase()) ||
            item.category.toLowerCase().includes(filter.toLowerCase())
          );
        }, [allData, filter]);

        return (
          <div data-testid="filterable-grid">
            <input 
              data-testid="filter-input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter products..."
            />
            <div data-testid="result-count">Results: {filteredData.length}</div>
            <div data-testid="filtered-items">
              {filteredData.slice(0, 10).map(item => (
                <div key={item.id}>{item.name} - {item.category}</div>
              ))}
            </div>
          </div>
        );
      };

      const { renderTime } = await measureRenderTime(
        renderWithTheme(<FilterableGrid />),
        'filterable-grid'
      );

      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('result-count')).toHaveTextContent('Results: 1000');
    });
  });

  describe('Memory Usage Performance', () => {
    it('measures memory usage during component lifecycle', async () => {
      const MemoryTestComponent = ({ shouldUnmount }) => {
        const [data] = React.useState(() => 
          Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            data: new Array(100).fill(`data-${i}`)
          }))
        );

        React.useEffect(() => {
          return () => {
            // Cleanup
          };
        }, []);

        if (shouldUnmount) return null;

        return (
          <div data-testid="memory-test">
            {data.slice(0, 10).map(item => (
              <div key={item.id}>{item.id}</div>
            ))}
          </div>
        );
      };

      // Initial render
      const { result, renderTime } = await measureRenderTime(
        renderWithTheme(<MemoryTestComponent shouldUnmount={false} />),
        'memory-test-mount'
      );

      expect(renderTime).toBeLessThan(50);
      expect(screen.getByTestId('memory-test')).toBeInTheDocument();

      // Unmount
      const unmountStartTime = performance.now();
      result.rerender(renderWithTheme(<MemoryTestComponent shouldUnmount={true} />));
      const unmountTime = performance.now() - unmountStartTime;

      expect(unmountTime).toBeLessThan(20);
      expect(screen.queryByTestId('memory-test')).not.toBeInTheDocument();
    });
  });

  describe('Animation Performance', () => {
    it('measures animation performance', async () => {
      const AnimatedComponent = ({ animate }) => {
        const [position, setPosition] = React.useState(0);

        React.useEffect(() => {
          if (animate) {
            const interval = setInterval(() => {
              setPosition(prev => (prev + 1) % 100);
            }, 16); // ~60fps

            return () => clearInterval(interval);
          }
        }, [animate]);

        return (
          <div 
            data-testid="animated-component"
            style={{
              transform: `translateX(${position}px)`,
              transition: 'transform 0.016s linear'
            }}
          >
            Position: {position}
          </div>
        );
      };

      const { renderTime } = await measureRenderTime(
        renderWithTheme(<AnimatedComponent animate={false} />),
        'animation-test'
      );

      expect(renderTime).toBeLessThan(20);
      expect(screen.getByTestId('animated-component')).toBeInTheDocument();
    });
  });

  describe('Bundle Size Impact', () => {
    it('measures component tree depth impact', async () => {
      const DeepComponent = ({ depth }) => {
        if (depth === 0) {
          return <div data-testid="leaf">Leaf</div>;
        }

        return (
          <div data-testid={`level-${depth}`}>
            <DeepComponent depth={depth - 1} />
          </div>
        );
      };

      const depths = [5, 10, 20];
      const results = [];

      for (const depth of depths) {
        document.body.innerHTML = '';
        
        const { renderTime } = await measureRenderTime(
          renderWithTheme(<DeepComponent depth={depth} />),
          `deep-${depth}`
        );

        results.push({ depth, renderTime });
        
        expect(screen.getByTestId('leaf')).toBeInTheDocument();
        expect(screen.getByTestId(`level-${depth}`)).toBeInTheDocument();
      }

      // Verify that render time doesn't grow exponentially with depth
      const shallow = results.find(r => r.depth === 5).renderTime;
      const deep = results.find(r => r.depth === 20).renderTime;
      
      expect(deep).toBeLessThan(shallow * 10); // Should not be more than 10x slower
    });
  });

  describe('Performance Regression Detection', () => {
    it('establishes performance baselines', async () => {
      const baselines = {
        simpleComponent: 10,
        heavyComponent100Items: 100,
        virtualizedComponent10k: 50,
        settingsUpdate: 20,
        gridRender25Items: 50,
        gridRender100Items: 200
      };

      // Test simple component
      const { renderTime: simpleTime } = await measureRenderTime(
        renderWithTheme(<div>Simple</div>),
        'baseline-simple'
      );
      expect(simpleTime).toBeLessThan(baselines.simpleComponent);

      // Test heavy component
      document.body.innerHTML = '';
      const { renderTime: heavyTime } = await measureRenderTime(
        renderWithTheme(<HeavyComponent itemCount={100} />),
        'baseline-heavy'
      );
      expect(heavyTime).toBeLessThan(baselines.heavyComponent100Items);

      // Test virtualized component
      document.body.innerHTML = '';
      const { renderTime: virtualTime } = await measureRenderTime(
        renderWithTheme(<VirtualizedComponent itemCount={10000} />),
        'baseline-virtual'
      );
      expect(virtualTime).toBeLessThan(baselines.virtualizedComponent10k);

      // Log results for monitoring
      console.log('Performance Baselines:', {
        simple: simpleTime,
        heavy: heavyTime,
        virtual: virtualTime
      });
    });
  });
});