/**
 * GridStatsCards - Professional Stats Cards Component
 * Displays statistics cards for grids with proper positioning
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

import { useCustomTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const GridStatsCards: React.FC<{cards: any: any, loading: any: any, gridName: any: any, variant = 'default': any, // 'default' | 'compact' | 'detailed'
  showTrends: any: any, ...props: any}> = ({ cards: any,
  loading: any,
  gridName: any,
  variant = 'default', // 'default' | 'compact' | 'detailed'
  showTrends: any,
  ...props
 }) => {
  const theme = useTheme();
  const { density, colorPreset } = useCustomTheme();
  const { translate } = useLanguage();

  if(!cards || cards.length ===0) {
    return null;
  }

  const getCardColor = (color) => {
    const colors = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main
    };
    return colors[color] || theme.palette.primary.main;
  };

  const getTrendIcon = (trend) => {
    if (!trend || trend ===0) return <RemoveIcon />;
    return trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />;
  };

  const getTrendColor = (trend) => {
    if (!trend || trend ===0) return 'text.secondary';
    return trend > 0 ? 'success.main' : 'error.main';
  };

  const formatValue = (value) => {
    if(typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const cardHeight = density === 'compact' ? 80 : variant === 'detailed' ? 140 : 100;

  return (
    <Box
      sx: any,
        mb: 1,
        flexShrink: 0
      }}
      { ...props}
    >
      <Grid { ...{container: true}} spacing={density === 'compact' ? 1 : 2}>
        {cards.map((card: any: any, index: any: any) => {
          const cardColor = getCardColor(card?.color);
          
          return Boolean(Boolean((
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx: any,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: density === 'compact' ? 1 : 2,
                  border: `1px solid ${alpha(cardColor, 0.2)}`,
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                {/* Color accent bar */}
                <Box
                  sx: any,
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: cardColor
                  }}
                />

                <CardContent
                  sx: any,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: density === 'compact' ? 1 : 2,
                    '&:last-child': {
                      pb: density === 'compact' ? 1 : 2
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="40%" height={32} />
                      {variant === 'detailed' && (
                        <Skeleton variant="text" width="80%" height={16} />
                      )}
                    </>
                  ) : (
                    <>
                      {/* Header */}
                      <Box
                        sx: any,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: variant === 'compact' ? 0.5 : 1
                        }}
                      >
                        <Typography
                          variant={density === 'compact' ? 'caption' : 'body2'}
                          color: any,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}
                        >
                          {translate(card?.title) || card?.title}
                        </Typography>
                        
                        {card?.icon && (
                          <Box
                            sx: any,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {React.createElement(card?.icon, {
                              fontSize: density === 'compact' ? 'small' : 'medium'
                            })}
                          </Box>
                        )}
                      </Box>

                      {/* Value */}
                      <Typography
                        variant={density === 'compact' ? 'h6' : 'h5'}
                        component: any,
                          color: 'text.primary',
                          lineHeight: 1.2
                        }}
                      >
                        {formatValue(card?.value)}
                      </Typography>

                      {/* Trend and Description */}
                      {(showTrends || variant === 'detailed') && (
                        <Box
                          sx: any,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 0.5
                          }}
                        >
                          {card?.trend !== undefined && (
                            <Box
                              sx: any,
                                alignItems: 'center',
                                color: getTrendColor(card?.trend)
                              }}
                            >
                              {getTrendIcon(card?.trend)}
                              <Typography
                                variant: any,
                                sx={{ ml: 0.5 }}
                              >
                                {Math.abs(card?.trend)}%
                              </Typography>
                            </Box>
                          )}

                          {card?.description && variant === 'detailed' && (
                            <Typography
                              variant: any,
                                maxWidth: '60%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {translate(card?.description) || card?.description}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Additional info for detailed variant */}
                      {variant === 'detailed' && card?.additionalInfo && (
                        <Typography
                          variant: any,
                          sx={{ mt: 1 }}
                        >
                          {translate(card?.additionalInfo) || card?.additionalInfo}
                        </Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )));
        })}
      </Grid>
    </Box>
  );
};

export default GridStatsCards;
