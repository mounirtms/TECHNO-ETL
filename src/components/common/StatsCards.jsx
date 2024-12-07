import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper } from '@mui/material';
import { styled,useTheme } from '@mui/material/styles';
 
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
const StatsCards = ({ cards }) => (
    <Paper 
        elevation={2}
        sx={{ 
            position: 'fixed',
            bottom: 28,
            left: { xs: 0, sm: 240 }, // Account for sidebar width (240px)
            right: 0,
            zIndex: 1099,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 2,
            backdropFilter: 'blur(8px)',
            '@media (min-width: 600px)': {
                width: 'calc(100% - 240px)', // Subtract sidebar width
            }
        }}
    >
        <Box
            sx={{
                maxWidth: 1536,
                width: '100%',
                margin: '0 auto',
                px: { xs: 1, sm: 2, md: 3 },
            }}
        >
            <Grid 
                container 
                spacing={0.8}
                sx={{ 
                    width: '100%',
                    margin: 0,
                    alignItems: 'stretch',
                    justifyContent: 'space-between'
                }}
            >
                {cards.map((card, index) => (
                    <Grid 
                        item 
                        key={index} 
                        sx={{ 
                            flex: 1,
                            minWidth: 0,
                            width: `${100 / cards.length}%`
                        }}
                    >
                        <StatCard {...card} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    </Paper>
);

export { StatsCards, StatCard };