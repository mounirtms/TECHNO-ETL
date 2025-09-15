/**
 * Test Utilities
 *
 * Common utilities and helper functions for tests
 */

import { render } from '@testing-library/react';
import React from 'react';

/**
 * Custom render function with providers if needed
 * @param {ReactElement} ui - The component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
export const customRender = (ui, options = {}) => {
  // Add providers here if needed (e.g., ThemeProvider, Router, etc.)
  const Wrapper = ({ children }) => (
    <React.Fragment>
      {children}
    </React.Fragment>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Mock API response helper
 * @param {any} data - The data to return in the mock response
 * @param {boolean} shouldResolve - Whether the promise should resolve or reject
 * @param {number} delay - Delay in ms before resolving/rejecting
 * @returns {Promise} Mock API response
 */
export const mockApiResponse = (data, shouldResolve = true, delay = 0) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldResolve) {
        resolve(data);
      } else {
        reject(new Error('Mock API Error'));
      }
    }, delay);
  });
};

/**
 * Create mock data for grids
 * @param {string} type - Type of data to create
 * @param {number} count - Number of items to create
 * @returns {Array} Mock data array
 */
export const createMockGridData = (type, count = 5) => {
  const data = [];

  for (let i = 1; i <= count; i++) {
    switch (type) {
    case 'products':
      data.push({
        id: i,
        sku: `SKU-${i.toString().padStart(3, '0')}`,
        name: `Product ${i}`,
        price: Math.random() * 100,
        status: Math.random() > 0.5 ? 1 : 0,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      break;

    case 'categories':
      data.push({
        id: i,
        name: `Category ${i}`,
        parent_id: Math.random() > 0.7 ? Math.floor(Math.random() * i) : 0,
        level: Math.floor(Math.random() * 3) + 1,
        product_count: Math.floor(Math.random() * 100),
      });
      break;

    case 'orders':
      data.push({
        id: i,
        increment_id: `00000000${i}`,
        status: ['pending', 'processing', 'complete', 'cancelled'][Math.floor(Math.random() * 4)],
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        grand_total: Math.random() * 500,
        currency_code: 'USD',
      });
      break;

    case 'customers':
      data.push({
        id: i,
        email: `user${i}@example.com`,
        firstname: `First${i}`,
        lastname: `Last${i}`,
        group_id: Math.floor(Math.random() * 3) + 1,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: Math.random() > 0.1,
      });
      break;

    default:
      data.push({ id: i, name: `Item ${i}` });
    }
  }

  return data;
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override render method
export { customRender as render };
