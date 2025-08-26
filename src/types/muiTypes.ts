/**
 * MUI specific type definitions
 * This file contains proper typing for Material-UI components
 */

import { ElementType, ReactNode } from 'react';
import {
  CardProps as MuiCardProps,
  ButtonProps as MuiButtonProps,
  TextFieldProps as MuiTextFieldProps,
  SxProps,
  Theme
} from '@mui/material';

/**
 * Extended Card component props that include proper MUI typing
 */
export interface CardProps extends Omit<MuiCardProps, 'component'> {
  component?: ElementType;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  footerContent?: ReactNode;
  sx?: SxProps<Theme>;
  elevation?: number;
  children?: ReactNode;
/**
 * Extended Button component props that include proper MUI typing
 */
export interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  icon?: ElementType;
  iconPosition?: 'start' | 'end';
/**
 * Extended TextField component props that include proper MUI typing
 */
export interface TextFieldProps extends MuiTextFieldProps {
  helperText?: ReactNode;
  error?: boolean;
  errorMessage?: string;
/**
 * Extended Dialog/Modal props
 */
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  fullScreen?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
  sx?: SxProps<Theme>;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
/**
 * Common styling props for MUI components
 */
export interface MuiStylingProps {
  sx?: SxProps<Theme>;
  className?: string;
  style?: React.CSSProperties;
/**
 * Tab panel props
 */
export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
  sx?: SxProps<Theme>;
/**
 * DataGrid related props
 */
export interface DataGridProps {
  rows: any[];
  columns: any[];
  loading?: boolean;
  pagination?: boolean;
  autoHeight?: boolean;
  checkboxSelection?: boolean;
  disableColumnFilter?: boolean;
  disableColumnMenu?: boolean;
  disableDensitySelector?: boolean;
  disableSelectionOnClick?: boolean;
  hideFooterPagination?: boolean;
  page?: number;
  pageSize?: number;
  rowCount?: number;
  rowsPerPageOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSelectionModelChange?: (selection: any[]) => void;
  sx?: SxProps<Theme>;