import { styled } from '@mui/material/styles';
import { AppBar, Drawer, IconButton, ListItem } from '@mui/material';

// Drawer width constant
const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 65;

export const StyledAppBar = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'collapsed'
})(({ theme, open, collapsed }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px)`,
        marginLeft: `${collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export const StyledDrawer = styled(Drawer)(({ theme, collapsed }) => ({
    width: collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
        width: collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
        backgroundColor: theme.palette.background.paper,
        borderRight: 'none',
        boxShadow: theme.shadows[3],
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
    },
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    transition: theme.transitions.create(['background-color', 'transform'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&:active': {
        transform: 'scale(0.95)',
    }
}));

export const StyledListItem = styled(ListItem)(({ theme }) => ({
    margin: '4px 10px',
    borderRadius: theme.shape.borderRadius * 2,
    transition: theme.transitions.create(['background-color', 'color', 'padding-left'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&.Mui-selected': {
        backgroundColor: `${theme.palette.primary.main}15`,
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: `${theme.palette.primary.main}25`,
        },
        '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
        }
    },
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        paddingLeft: theme.spacing(2.5),
    },
    '& .MuiListItemIcon-root': {
        minWidth: 40,
        color: theme.palette.text.secondary,
        transition: theme.transitions.create('color', {
            duration: theme.transitions.duration.shorter,
        }),
    },
    '& .MuiListItemText-primary': {
        fontSize: '0.95rem',
        fontWeight: 500,
    }
}));