import { styled } from '@mui/material/styles';
import { AppBar, Drawer, IconButton, ListItem } from '@mui/material';
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from './Constants';

export const StyledAppBar = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isRTL'
})(({ theme, open, isRTL }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
    backdropFilter: 'blur(8px)',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
    ...(isRTL ? {
        marginRight: open ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
    } : {
        marginLeft: open ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
    }),
    width: isRTL ? 
        (open ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${COLLAPSED_WIDTH}px)`) : 
        (open ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${COLLAPSED_WIDTH}px)`),
}));

export const StyledDrawer = styled(Drawer)(({ theme, open, isRTL }) => ({
    width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
        borderRight: isRTL ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
        borderLeft: isRTL ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
        boxShadow: theme.palette.mode === 'light' ? 
            (isRTL ? '-2px 0 4px rgba(0,0,0,0.05)' : '2px 0 4px rgba(0,0,0,0.05)') : 
            (isRTL ? '-2px 0 4px rgba(0,0,0,0.3)' : '2px 0 4px rgba(0,0,0,0.3)'),
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        ...(isRTL ? { right: 0 } : { left: 0 }),
    },
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    backgroundColor: 'transparent',
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&.active': {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.action.selected,
    },
}));

export const StyledListItem = styled(ListItem)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5, 1),
    transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.shortest,
    }),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&.active': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '& .MuiListItemIcon-root': {
            color: theme.palette.primary.contrastText,
        },
    },
}));

export const CollapsedTooltip = styled('div')(({ theme }) => ({
    position: 'absolute',
    left: '100%',
    top: 0,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
    whiteSpace: 'nowrap',
    zIndex: theme.zIndex.tooltip,
    marginLeft: theme.spacing(1),
    '&::before': {
        content: '""',
        position: 'absolute',
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: `6px solid ${theme.palette.background.paper}`,
    },
}));