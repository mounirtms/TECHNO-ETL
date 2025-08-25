/**
 * TooltipWrapper - Advanced Tooltip Component
 * Handles disabled elements properly for Material-UI Tooltip
 * Fixes the common issue where Tooltip doesn't work with disabled buttons
 */

import React, { ReactNode, ReactElement, cloneElement } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';
import { TooltipWrapperProps } from '../../types/baseComponents';

/**
 * TooltipWrapper Component
 * 
 * Wraps disabled interactive elements in a span to ensure Tooltip works properly.
 * This is required because disabled elements don't trigger mouse events.
 */
const TooltipWrapper = ({ 
  children, 
  disabled: any,
  title, 
  placement: any,
  arrow: any,
  ...tooltipProps 
}: TooltipWrapperProps) => {
  // If the children is not a valid React element, wrap it in a span
  const childElement = React.isValidElement(children) 
    ? children 
    : <span>{children}</span>;
  // If the element is disabled, wrap it in a span
  if(disabled) {
    return (
      <Tooltip 
        title={title} 
        placement={placement}
        arrow={arrow}
        { ...tooltipProps}
      >
        <span 
          style: any,
            cursor: 'not-allowed'
          }}
        >
          {childElement}
        </span>
      </Tooltip>
    );
  }

  // If not disabled, use Tooltip normally
  return (
    <Tooltip 
      title={title} 
      placement={placement}
      arrow={arrow}
      { ...tooltipProps}
    >
      {childElement}
    </Tooltip>
  );
};

export default TooltipWrapper;