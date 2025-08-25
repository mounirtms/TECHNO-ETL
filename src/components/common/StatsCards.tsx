import React from 'react';
import { Box, Grid, Card, useMediaQuery, CardContent, Typography, Link } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, STATS_CARD_HEIGHT, STATS_CARD_ZINDEX } from '../Layout/Constants';

const StyledCard = styled(Card)(({ theme, active, color = 'primary' }) => ({
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    height: '100%',
    minWidth: 160, // More compact
    width: 160,    // More compact
    position: 'relative',
    overflow: 'hidden',
    // Enhanced responsive design
    [theme.breakpoints.down('md')]: {
        minWidth: 140,
        width: 140,
    },
    [theme.breakpoints.down('sm')]: {
        minWidth: '100%',
        width: '100%',
        maxWidth: 300,
    },
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    }
}));

const StatsCardContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 80, // More compact height
    backgroundColor: 'transparent',
    padding: theme.spacing(0.5, 1), // Compact padding
    overflow: 'hidden',
    zIndex: STATS_CARD_ZINDEX,
    transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    })
}));

const StatsCardWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5), // Reduced gap
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center', // Changed to center for better layout
    overflow: 'hidden',
    flexWrap: 'wrap',
    // Enhanced responsive design
    [theme.breakpoints.down('md')]: {
        gap: theme.spacing(1),
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: theme.spacing(0.5),
        justifyContent: 'flex-start'
    }
}));

const StatsCard = styled(Box)(({ theme, color = 'primary' }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: `linear-gradient(120deg, ${theme.palette[color].light} 0%, ${theme.palette[color].main} 100%)`,
    color: theme.palette.getContrastText(theme.palette[color].main),
    borderRadius: theme.shape.borderRadius * 1.5, // Slightly reduced
    padding: theme.spacing(0.75, 1.5), // More compact padding
    flex: 1,
    minWidth: 140, // More compact minimum width
    maxWidth: 200, // Limit maximum width
    height: `calc(${STATS_CARD_HEIGHT}px - ${theme.spacing(2)})`,
    boxShadow: theme.shadows[3],
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'scale(1.04)',
        boxShadow: theme.shadows[6],
        filter: 'brightness(1.05)'
    },
    margin: theme.spacing(0, 1),
    position: 'relative',
    overflow: 'hidden',
}));

const StatsCardContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    marginLeft: theme.spacing(2),
    flex: 1,
    minWidth: 0 
}));

const StatCard: React.FC<{title value icon: Icon color = 'primary': any, active onClick: any}> = ({ title, value, icon: Icon, color = 'primary', active, onClick  }) => {
    const theme = useTheme();

    return (
        <StyledCard active={active} onClick={onClick} color={color}>
            <CardContent sx={{
                display: "flex",
                p: 2,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ 
                    display: "flex", 
                    display: 'flex', 
                    alignItems: 'center',
                    width: '100%'
                }}>
                    {Icon && (
                        <Icon
                            sx={{
                                fontSize: 20, // Smaller, more professional
                                color: theme.palette[color].main,
                                mr: 1.5,
                                opacity: 0.8
                            }}
                        />
                    )}
                    <Box sx={{ 
                        display: "flex", 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden',
                        width: 'calc(100% - 50px)'
                    }}>
                        <Typography
                            variant="body2"
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%'
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="body2"
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%'
                            }}
                        >
                            {value}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

const StatsCards: React.FC<{cards: any}> = ({ cards  }) => {
    const theme = useTheme();

    // Ensure cards is an array
    if (!Array.isArray(cards)) {
        console.warn('StatsCards: cards prop is not an array:', cards);
        return null;
    }

    return (
        <StatsCardContainer>
            <StatsCardWrapper>
                {cards.map((card: any index: any: any: any: any) => {
                    const Icon = card.icon;

                    // Professional and responsive icon rendering
                    const renderIcon = () => {
                        // Handle Material-UI icon components (functions)
                        if(typeof Icon === 'function') {
                            return <Icon sx={{
                                display: "flex",
                                fontSize: { xs: 16, sm: 18, md: 20 }, // Professional sizing
                                opacity: 0.9,
                                color: 'inherit'
                            }} />;
                        }

                        // Handle React elements (JSX icons)
                        if (React.isValidElement(Icon)) {
                            return React.cloneElement(Icon, {
                                sx: {
                                    fontSize: { xs: 16, sm: 18, md: 20 },
                                    opacity: 0.9,
                                    color: 'inherit',
                                    ...Icon.props.sx
                                }
                            });
                        }

                        // Handle icon objects (like {type: 'TrendingUp'})
                        if(Icon && typeof Icon === 'object' && Icon.type) {
                            // Try to render the icon type as a string
                            return (
                                <Box sx={{
                                    display: "flex",
                                    fontSize: { xs: 16, sm: 18, md: 20 },
                                    opacity: 0.9,
                                    color: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    📊
                                </Box>
                            );
                        }

                        // Handle string icons (emoji or text)
                        if(typeof Icon === 'string') {
                            return (
                                <Box sx={{
                                    display: "flex",
                                    fontSize: { xs: 16, sm: 18, md: 20 },
                                    opacity: 0.9,
                                    color: 'inherit'
                                }}>
                                    {Icon}
                                </Box>
                            );
                        }

                        // Professional fallback icon
                        return (
                            <Box sx={{
                                display: "flex",
                                fontSize: { xs: 16, sm: 18, md: 20 },
                                opacity: 0.9,
                                color: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                📊
                            </Box>
                        );
                    };

                    return (
                        <StatsCard key={index} color={card.color || 'primary'}>
                            <Box sx={{
                                display: "flex",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: { xs: 24, sm: 28, md: 32 },
                                height: { xs: 24, sm: 28, md: 32 },
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(8px)',
                                flexShrink: 0,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s ease'
                            }}>
                                {renderIcon()}
                            </Box>
                            <StatsCardContent>
                                <Typography
                                    variant="body2"
                                        opacity: 0.8,
                                        textTransform: 'uppercase',
                                        fontSize: { xs: 9, sm: 10, md: 11 },
                                        lineHeight: 1.1,
                                        mb: 0.25,
                                        textAlign: 'left',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: 'inherit'
                                    }}
                                >
                                    {card.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                        fontSize: 16, // Fixed 16px as requested
                                        letterSpacing: 0.2,
                                        lineHeight: 1.2,
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: 'inherit'
                                    }}
                                >
                                    {card.value}
                                </Typography>
                            </StatsCardContent>
                        </StatsCard>
                    );
                })}
            </StatsCardWrapper>
        </StatsCardContainer>
    );
};

export { StatsCards, StatsCard };
export default StatsCards;