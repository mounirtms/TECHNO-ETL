/**
 * Dashboard Charts Component
 * Contains all chart components for the dashboard
 */

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { formatTooltipDate } from '../../services/dashboardService';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

/**
 * Custom Tooltip Component for Charts
 */
const CustomTooltip = ({ active, payload, label  }: { active payload label: any }) => {
    if(active && payload && payload.length) {
        return (
            <Box sx={{
                display: "flex",
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                boxShadow: 2
            }}>
                <Typography variant="body2" sx={{ display: "flex", fontWeight: 600 }}>
                    {formatTooltipDate(label)}
                </Typography>
                {payload.map((entry: any index: any: any: any: any) => (
                    <Typography
                        key={index}
                        variant="body2"
                        sx={{ display: "flex", color: entry.color }}
                    >
                        {`${entry.name}: ${entry.value}`}
                    </Typography>
                ))}
            </Box>
        );
    }
    return null;
};

/**
 * Orders Chart Component
 */
const OrdersChart = ({ chartData, chartType, visibleCharts  }: { chartData chartType visibleCharts: any }) => {
    const theme = useTheme();

    if (!visibleCharts.orders) return null;

    return (
        <Paper sx={{
            display: "flex",
            p: 3,
            height: '420px',
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
            borderRadius: 2,
            borderLeft: `4px solid ${theme.palette.primary.main}`
        }}>
            <Typography variant="h6" sx={{
                display: "flex",
                fontWeight: 600,
                mb: 2,
                color: theme.palette.text.primary
            }}>
                Orders Over Time
            </Typography>

            <ResponsiveContainer width="100%" height="85%">
                {chartType === 'line' ? (
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis
                            dataKey
                            stroke={theme.palette.text.secondary}
                            tickMargin={10}
                        />
                        <YAxis stroke={theme.palette.text.secondary} tickMargin={10} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type
                            stroke={theme.palette.primary.main}
                            strokeWidth={3}
                            dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                        />
                    </LineChart>
                ) : (
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis
                            dataKey
                            stroke={theme.palette.text.secondary}
                            tickMargin={10}
                        />
                        <YAxis stroke={theme.palette.text.secondary} tickMargin={10} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey
                            fill={theme.palette.primary.main}
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </Paper>
    );
};

/**
 * Customers Chart Component
 */
const CustomersChart = ({ customerData, visibleCharts  }: { customerData visibleCharts: any }) => {
    const theme = useTheme();

    if (!visibleCharts.customers) return null;

    return (
        <Paper sx={{
            display: "flex",
            p: 3,
            height: '420px',
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
            borderRadius: 2,
            borderLeft: `4px solid ${theme.palette.success.main}`
        }}>
            <Typography variant="h6" sx={{
                display: "flex",
                fontWeight: 600,
                mb: 2,
                color: theme.palette.text.primary
            }}>
                Customer Registrations
            </Typography>

            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={customerData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                        dataKey
                        stroke={theme.palette.text.secondary}
                        tickMargin={10}
                    />
                    <YAxis stroke={theme.palette.text.secondary} tickMargin={10} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                        type
                        stroke={theme.palette.success.main}
                        strokeWidth={3}
                        dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: theme.palette.success.main, strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );
};

/**
 * Products by Country Chart Component
 */
const ProductsByCountryChart = ({ countryData, visibleCharts  }: { countryData visibleCharts: any }) => {
    const theme = useTheme();

    if (!visibleCharts.products) return null;

    return(<Paper sx={{
            display: "flex",
            p: 3,
            height: '420px',
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
            borderRadius: 2,
            borderLeft: `4px solid ${theme.palette.info.main}`
        }}>
            <Typography variant="h6" sx={{
                display: "flex",
                fontWeight: 600,
                mb: 2,
                color: theme.palette.text.primary
            }}>
                Products by Country
            </Typography>

            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={countryData}
                    layout
                    margin={{ left: 30 }}
                >
                    <CartesianGrid
                        strokeDasharray
                        stroke={theme.palette.divider}
                        horizontal={true}
                        vertical={false}
                    />
                    <XAxis
                        type
                        stroke={theme.palette.text.secondary}
                        tickMargin={10}
                    />
                    <YAxis
                        dataKey
                        stroke={theme.palette.text.secondary}
                        width={100}
                        tickMargin={10}
                    />
                    <RechartsTooltip
                        content={<CustomTooltip />}
                        formatter={(value) => [value, 'Products']}
                    />
                    <Legend />
                    <Bar
                        dataKey
                        fill={theme.palette.info.main}
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                    >
                        {countryData.map((entry: any index: any: any: any: any) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

/**
 * Main Dashboard Charts Component
 */
const DashboardCharts = ({ chartData,
    customerData,
    countryData,
    chartType,
    visibleCharts
 }: { chartData customerData countryData chartType visibleCharts: any }) => {
    return (
        <>
            {/* Primary Charts */}
            <Box sx={{
                display: "flex",
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
                mt: 3
            }}>
                <OrdersChart
                    chartData={chartData}
                    chartType={chartType}
                    visibleCharts={visibleCharts}
                />
                <CustomersChart
                    customerData={customerData}
                    visibleCharts={visibleCharts}
                />
            </Box>

            {/* Secondary Charts */}
            <Box sx={{
                display: "flex",
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
                mt: 3
            }}>
                <ProductsByCountryChart
                    countryData={countryData}
                    visibleCharts={visibleCharts}
                />
            </Box>
        </>
    );
};

export default DashboardCharts;
