/**
 * TypeScript definitions for TooltipWrapper component
 */

import { ReactNode, ComponentProps, RefObject } from 'react';
import { TooltipProps, SxProps, Theme } from '@mui/material';

export interface TooltipWrapperProps extends Omit<TooltipProps, 'children'> {
  /** The element to wrap with tooltip functionality */
  children: ReactNode;
  
  /** Whether the wrapped element is disabled */
  disabled?: boolean;
  
  /** Tooltip text content */
  title: ReactNode;
  
  /** System prop for styling */
  sx?: SxProps<Theme>;
  
  /** CSS class name */
  className?: string;
  
  /** Ref to the wrapper element */
  ref?: RefObject<HTMLElement>;
declare const TooltipWrapper: React.ForwardRefExoticComponent<
  TooltipWrapperProps & React.RefAttributes<HTMLElement>
>;

export default TooltipWrapper;