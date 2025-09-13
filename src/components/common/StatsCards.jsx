import React, { memo, useMemo } from 'react';
import { Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

// Modern Base Components
import BaseCard from '../base/BaseCard';

// Constants
import { DRAWER_WIDTH, COLLAPSED_WIDTH, STATS_CARD_HEIGHT, STATS_CARD_ZINDEX } from '../Layout/Constants';

/**
 * Modernized StatsCards Container using BaseCard
 * 
 * Features:
 * - BaseCard integration for consistency
 * - React 18 patterns with memo and useMemo
 * - Responsive design with modern grid layout
 * - Enhanced accessibility and performance
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */
const StatsCardContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 80,
    backgroundColor: 'transparent',
    padding: theme.spacing(0.5, 1),
    overflow: 'hidden',
    zIndex: STATS_CARD_ZINDEX,
    transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    })
}));

const StatsCardWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5),
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexWrap: 'wrap',
    [theme.breakpoints.down('md')]: {
        gap: theme.spacing(1),
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: theme.spacing(0.5),
        justifyContent: 'flex-start'
    }
}));

/**
 * Individual Stat Card using BaseCard
 */
const StatCard = memo(({ title, value, icon, color = 'primary', active, onClick }) => {
  return (
    <BaseCard
      variant="stats"
      title={title}
      value={value}
      icon={icon}
      color={color}
      onClick={onClick}
      sx={{
        minWidth: 160,
        width: 160,
        '@media (max-width: 960px)': {
          minWidth: 140,
          width: 140,
        },
        '@media (max-width: 600px)': {
          minWidth: '100%',
          width: '100%',
          maxWidth: 300,
        },
        cursor: onClick ? 'pointer' : 'default',
        transform: active ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.2s ease'
      }}
    />
  );
});

StatCard.displayName = 'StatCard';

/**
 * Modernized StatsCards Component using BaseCard
 * 
 * Features:
 * - BaseCard integration for consistency
 * - React.memo for performance optimization
 * - useMemo for expensive computations
 * - Modern responsive design
 * 
 * @param {Array} cards - Array of card objects
 * @returns {React.Component} StatsCards component
 */
const StatsCards = memo(({ cards }) => {
  // Memoized card validation and processing
  const processedCards = useMemo(() => {
    if (!Array.isArray(cards)) {
      console.warn('StatsCards: cards prop is not an array:', cards);
      return [];
    }
    
    return cards.map((card, index) => ({
      ...card,
      id: card.id || `stats-card-${index}`,
      color: card.color || 'primary'
    }));
  }, [cards]);

  // Early return if no cards
  if (processedCards.length === 0) {
    return null;
  }

  return (
    <StatsCardContainer>
      <StatsCardWrapper>
        {processedCards.map((card) => (
          <BaseCard
            key={card.id}
            variant="stats"
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            onClick={card.onClick}
            trend={card.trend}
            percentage={card.percentage}
            loading={card.loading}
            sx={{
              minWidth: 160,
              width: 160,
              '@media (max-width: 960px)': {
                minWidth: 140,
                width: 140,
              },
              '@media (max-width: 600px)': {
                minWidth: '100%',
                width: '100%',
                maxWidth: 300,
              },
              cursor: card.onClick ? 'pointer' : 'default'
            }}
          />
        ))}
      </StatsCardWrapper>
    </StatsCardContainer>
  );
});

StatsCards.displayName = 'StatsCards';

export { StatsCards, StatCard };
export default StatsCards;