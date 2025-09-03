/**
 * TooltipWrapper - Advanced Tooltip Component
 * Handles disabled elements properly for Material-UI Tooltip
 * Fixes the common issue where Tooltip doesn't work with disabled buttons
 */

import React from 'react';
import { Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * TooltipWrapper Component
 *
 * Wraps disabled interactive elements in a span to ensure Tooltip works properly.
 * This is required because disabled elements don't trigger mouse events.
 */
const TooltipWrapper = ({
  children,
  disabled = false,
  title,
  placement = 'top',
  arrow = true,
  ...tooltipProps
}) => {
  // If the element is disabled, wrap it in a span
  if (disabled) {
    return (
      <Tooltip
        title={title}
        placement={placement}
        arrow={arrow}
        {...tooltipProps}
      >
        <span
          style={{
            display: 'inline-block',
            cursor: 'not-allowed',
          }}
        >
          {children}
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
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
};

TooltipWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
  placement: PropTypes.oneOf([
    'bottom-end',
    'bottom-start',
    'bottom',
    'left-end',
    'left-start',
    'left',
    'right-end',
    'right-start',
    'right',
    'top-end',
    'top-start',
    'top',
  ]),
  arrow: PropTypes.bool,
};

export default TooltipWrapper;
