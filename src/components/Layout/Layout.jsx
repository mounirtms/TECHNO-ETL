import React, { useState } from 'react';
import { 
    Box, 
    useTheme, 
    useMediaQuery 
} from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import TabPanel from './TabPanel';
import Footer from './Footer';
import { TabProvider } from '../../contexts/TabContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, FOOTER_HEIGHT } from './Constants';

const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    return (
        <LanguageProvider>
            <TabProvider sidebarOpen={sidebarOpen}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: '100vh' 
                }}>
                    <Header
                        isDrawerCollapsed={!sidebarOpen}
                        handleDrawerToggle={() => setSidebarOpen(prev => !prev)}
                    />
                    <Box sx={{ 
                        display: 'flex', 
                        flexGrow: 1,
                        paddingBottom: `${FOOTER_HEIGHT}px` 
                    }}>
                        <Sidebar 
                            open={sidebarOpen} 
                            toggleDrawer={() => setSidebarOpen(prev => !prev)} 
                        />
                        <Box 
                            component="main" 
                            sx={{ 
                                flexGrow: 1, 
                                width: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`,
                                overflow: 'hidden'
                            }}
                        >
                            <TabPanel sidebarOpen={sidebarOpen} />
                        </Box>
                    </Box>
                    <Footer sidebarOpen={sidebarOpen} />
                </Box>
            </TabProvider>
        </LanguageProvider>
    );
};
export default Layout;