import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, active }) => ({
    cursor: 'pointer',
    transition: 'all 0.3s',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1], // Reduced shadow for a flatter look
    padding: theme.spacing(1), // Reduced padding
    '&:hover': {
        transform: 'translateY(-2px)', // Subtle hover effect
        boxShadow: theme.shadows[3]
    },
    ...(active && {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        borderStyle: 'solid'
    })
}));

const StatCard = ({ title, value, icon: Icon, color, active, onClick }) => (
    <StyledCard active={active} onClick={onClick}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Icon sx={{ color: `${color}.main`, mr: 1, fontSize: 24 }} /> {/* Reduced icon size */}
                <Typography variant="subtitle2" component="div" color={color} sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                {value}
            </Typography>
        </CardContent>
    </StyledCard>
);

const StatsCards = ({ cards }) => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
        {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
                <StatCard {...card} />
            </Grid>
        ))}
    </Grid>
);

export { StatsCards, StatCard };