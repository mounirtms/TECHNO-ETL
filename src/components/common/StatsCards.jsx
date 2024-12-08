import React from 'react';
import { Box, Grid, Card, useMediaQuery , CardContent, Typography, Paper } from '@mui/material';
import { styled,useTheme } from '@mui/material/styles';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, STATS_CARD_HEIGHT } from '../Layout/Constants';

const StyledCard = styled(Card)(({ theme, active, color = 'primary' }) => ({
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    backgroundColor: active ? theme.palette[color].main : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: active ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
    height: '100%',
    minWidth: 200,
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        backgroundColor: active 
            ? theme.palette[color].dark 
            : theme.palette.action.hover,
        transform: 'scale(1.05)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
    },
    '&::before': active ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: theme.palette[color].dark
    } : {}
}));

const StatCard = ({ title, value, icon: Icon, color = 'primary', active, onClick }) => {
    const theme = useTheme(); // Access the theme

    return (
        <StyledCard active={active} onClick={onClick} color={color}>
            <CardContent sx={{ p: '14px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Icon sx={{ fontSize: 40, color: theme.palette[color].main }} />
                        <Box sx={{ ml: 2 }}>
                            <Typography variant="h8" component="div" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            <Typography variant="body2" color="text.secondary">{value}</Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </StyledCard>
    );
};
const StatsCards = ({ cards, sidebarOpen }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Dynamically calculate width based on sidebar state
    const calculateWidth = () => {
        if (isMobile) return '100%';
        return `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`;
    };

    return (
        <Box 
            sx={{
                position: 'fixed',
                bottom: '28px', // Just above the footer
              
                width: calculateWidth(),
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderTop: '1px solid',
                borderColor: 'divider',
                px: 1,
                py: 0.5,
                backdropFilter: 'blur(8px)',
                transition: theme.transitions.create(['width', 'left'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                '@media (max-width: 600px)': {
                    left: 0,
                    width: '100%'
                }
            }}
        >
            <Grid 
                container 
                spacing={1} 
                alignItems="center" 
                justifyContent="space-between"
            >
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <Grid item xs key={index}>
                            <Paper 
                                elevation={1} 
                                sx={{ 
                                    p: 0.5, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    height: STATS_CARD_HEIGHT,
                                    backgroundColor: theme.palette.background.paper
                                }}
                            >
                                <Icon 
                                    sx={{ 
                                        fontSize: '1rem', 
                                        mr: 1, 
                                        color: theme.palette.text.secondary 
                                    }} 
                                />
                                <Box>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            display: 'block',
                                            fontSize: '0.625rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            opacity: 0.7,
                                            lineHeight: 1
                                        }}
                                    >
                                        {card.title}
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem',
                                            lineHeight: 1
                                        }}
                                    >
                                        {card.value}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export { StatsCards, StatCard };