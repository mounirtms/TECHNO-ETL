import React from 'react';
import { Box, Grid, Card, useMediaQuery, CardContent, Typography, Link } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, STATS_CARD_HEIGHT, STATS_CARD_ZINDEX } from '../Layout/Constants';

const StyledCard = styled(Card)(({ theme, active, color = 'primary' }) => ({
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    height: '100%',
    minWidth: 200,  
    width: 200,     
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'scale(1.02)',
        boxShadow: theme.shadows[4],
    }
}));

const StatsCardContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: `${STATS_CARD_HEIGHT}px`,
    backgroundColor: 'transparent',
    overflow: 'hidden', 
    zIndex: STATS_CARD_ZINDEX,
    transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    padding: theme.spacing(0, 1) 
}));

const StatsCardWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between', 
    overflow: 'hidden' 
}));

const StatsCard = styled(Box)(({ theme, color = 'primary' }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: `linear-gradient(120deg, ${theme.palette[color].light} 0%, ${theme.palette[color].main} 100%)`,
    color: theme.palette.getContrastText(theme.palette[color].main),
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(0.5, 2),
    flex: 1,
    minWidth: 0,
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

const StatCard = ({ title, value, icon: Icon, color = 'primary', active, onClick }) => {
    const theme = useTheme();

    return (
        <StyledCard active={active} onClick={onClick} color={color}>
            <CardContent sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    width: '100%'
                }}>
                    {Icon && (
                        <Icon 
                            sx={{ 
                                fontSize: 32,  
                                color: theme.palette[color].main,
                                mr: 2
                            }} 
                        />
                    )}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden',
                        width: 'calc(100% - 50px)'
                    }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%'
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
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

const StatsCards = ({ cards }) => {
    const theme = useTheme();
    return (
        <StatsCardContainer>
            <StatsCardWrapper>
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <StatsCard key={index} color={card.color || 'primary'}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 56 }}>
                                {Icon && (
                                    <Icon sx={{ fontSize: 44, opacity: 0.85, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))' }} />
                                )}
                            </Box>
                            <StatsCardContent>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 700,
                                        letterSpacing: 0.5,
                                        opacity: 0.9,
                                        textTransform: 'uppercase',
                                        fontSize: 12
                                    }}
                                >
                                    {card.title}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: 18,
                                        letterSpacing: 0.5,
                                        mt: 0.5
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

export { StatsCards, StatCard };