import { subDays, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { getOrders } from './dataService';

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

export const getFilteredOrders = (dateRange = DATE_RANGES.LAST_WEEK) => {
    const orders = getOrders();
    const { start, end } = getDateRange(dateRange);
    
    return orders.filter(order => {
        const orderDate = parseISO(order.created_at);
        return isWithinInterval(orderDate, { start, end });
    });
};

export const calculateOrderStats = (orders) => {
    return orders.reduce((stats, order) => {
        stats.total += 1;
        stats[order.status] = (stats[order.status] || 0) + 1;
        stats.revenue += parseFloat(order.grand_total) || 0;
        return stats;
    }, {
        total: 0,
        revenue: 0,
        processing: 0,
        pending: 0,
        completed: 0,
        canceled: 0
    });
};

export const prepareChartData = (orders) => {
    const dailyData = orders.reduce((acc, order) => {
        const date = order.created_at.split('T')[0];
        if (!acc[date]) {
            acc[date] = {
                date,
                orders: 0,
                revenue: 0
            };
        }
        acc[date].orders += 1;
        acc[date].revenue += parseFloat(order.grand_total) || 0;
        return acc;
    }, {});

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
};
