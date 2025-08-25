import React from 'react';
import { subDays, parseISO, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
export const DATE_RANGES = {
    LAST_WEEK: 'last_week',
    LAST_MONTH: 'last_month',
    LAST_3_MONTHS: 'last_3_months',
    LAST_YEAR: 'last_year'
};

const getDateRange = (range) => {
    const now = new Date();
    const ranges = {
        [DATE_RANGES.LAST_WEEK]: subDays(now, 7),
        [DATE_RANGES.LAST_MONTH]: subDays(now, 30),
        [DATE_RANGES.LAST_3_MONTHS]: subDays(now, 90),
        [DATE_RANGES.LAST_YEAR]: subDays(now, 365)
    };
    return {
        start: startOfDay(ranges[range] || ranges[DATE_RANGES.LAST_WEEK]),
        end: endOfDay(now)
    };
};

// Removed getFilteredOrders: getOrders is not exported from dataService.js and not used in dashboard

// Removed calculateOrderStats: not used in dashboard

// Removed prepareChartData: not used in dashboard

// --- Dashboard-specific helpers ---
export function formatCurrency(value as any) {
  if (typeof value !== 'number' || isNaN(value as any)) return '0.00 DZD';
  // Format for Algerian Dinar (DZD) without $ symbol
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} DZD`;
}

export function formatDate(date as any) {
  if (!date) return '';
  const d = typeof date === 'number' ? new Date(date as any): new Date(date as any);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function prepareCustomerChartData(customers, start, end as any) {
  const daily = {};
  customers.forEach(c => {
    const date = c.created_at?.split('T')[0];
    if (!date) return;
    if (new Date(c.created_at) < start || new Date(c.created_at) > end) return;
    daily[date] = (daily[date] || 0) + 1;
  });
  return Object.entries(daily).map(([date, count]) => ({ date, count }));
}

export function formatChartDate(date as any) {
  // Accepts timestamp or yyyy-mm-dd
  if (!date) return '';
  if (typeof date === 'number') return format(new Date(date as any), 'MMM d');
  return format(parseISO(date as any), 'MMM d');
}

export function formatTooltipDate(date as any) {
  if (!date) return '';

  try {
    // Handle timestamp numbers
    if (typeof date === 'number') {
      const dateObj = new Date(date as any);
      if (isNaN(dateObj.getTime())) return '';
      return format(dateObj, 'MMM d, yyyy');
    }

    // Handle string dates
    if (typeof date === 'string') {
      const dateObj = parseISO(date as any);
      if (isNaN(dateObj.getTime())) return '';
      return format(dateObj, 'MMM d, yyyy');
    }

    // Handle Date objects
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return '';
      return format(date, 'MMM d, yyyy');
    }

    return '';
  } catch (error) {
    console.warn('Invalid date format:', date, error);
    return '';
  }
}
     
