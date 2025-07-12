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
export function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function prepareCustomerChartData(customers, start, end) {
  const daily = {};
  customers.forEach(c => {
    const date = c.created_at?.split('T')[0];
    if (!date) return;
    if (new Date(c.created_at) < start || new Date(c.created_at) > end) return;
    daily[date] = (daily[date] || 0) + 1;
  });
  return Object.entries(daily).map(([date, count]) => ({ date, count }));
}

export function formatChartDate(date) {
  // Accepts timestamp or yyyy-mm-dd
  if (!date) return '';
  if (typeof date === 'number') return format(new Date(date), 'MMM d');
  return format(parseISO(date), 'MMM d');
}

export function formatTooltipDate(date) {
  if (!date) return '';
  if (typeof date === 'number') return format(new Date(date), 'MMM d, yyyy');
  return format(parseISO(date), 'MMM d, yyyy');
}
     
