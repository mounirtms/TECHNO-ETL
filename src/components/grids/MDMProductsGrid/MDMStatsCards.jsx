/**
 * MDM Statistics Cards Component
 * Professional statistics display for MDM Products Grid
 *
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { StatsCards } from '../../common/StatsCards';
import {
  Category as CategoryIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  ReportProblem as ReportProblemIcon,
  SyncAlt as SyncAltIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

/**
 * MDM Statistics Cards Component
 * Displays comprehensive statistics for MDM inventory data
 *
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics data object
 * @param {number} props.stats.total - Total number of products
 * @param {number} props.stats.inStock - Number of products in stock
 * @param {number} props.stats.outOfStock - Number of products out of stock
 * @param {number} props.stats.lowStock - Number of products with low stock
 * @param {number} props.stats.newChanges - Number of recently changed products
 * @param {number} props.stats.synced - Number of synced products
 * @param {number} props.stats.averagePrice - Average product price
 * @param {number} props.stats.totalValue - Total inventory value
 * @returns {JSX.Element} MDM statistics cards
 */
const MDMStatsCards = ({ stats }) => {
  /**
   * Generate statistics cards configuration
   * Creates an array of card configurations with proper formatting
   */
  const statusCards = useMemo(() => [
    {
      title: 'Total Products',
      value: stats.total || 0,
      icon: CategoryIcon,
      color: 'primary',
      description: 'Total products in inventory',
    },
    {
      title: 'In Stock',
      value: stats.inStock || 0,
      icon: CheckCircleOutlineIcon,
      color: 'success',
      description: 'Products currently in stock',
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStock || 0,
      icon: ErrorOutlineIcon,
      color: 'error',
      description: 'Products currently out of stock',
    },
    {
      title: 'Low Stock',
      value: stats.lowStock || 0,
      icon: ReportProblemIcon,
      color: 'warning',
      description: 'Products with low stock levels',
    },
    {
      title: 'New Changes',
      value: stats.newChanges || 0,
      icon: SyncAltIcon,
      color: 'info',
      description: 'Recently updated products',
    },
    {
      title: 'Synced Items',
      value: stats.synced || 0,
      icon: TrendingUpIcon,
      color: 'success',
      description: 'Successfully synced products',
    },
    {
      title: 'Avg Price',
      value: `${(stats.averagePrice || 0).toFixed(2)} DZD`,
      icon: AttachMoneyIcon,
      color: 'secondary',
      description: 'Average product price',
    },
    {
      title: 'Total Value',
      value: `${((stats.totalValue || 0) / 1000).toFixed(1)}K DZD`,
      icon: AccountBalanceIcon,
      color: 'primary',
      description: 'Total inventory value',
    },
  ].slice(0, 8), [stats]);

  return <StatsCards cards={statusCards} />;
};

export default MDMStatsCards;
