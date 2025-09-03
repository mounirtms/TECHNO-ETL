import { memo, useState, useCallback, useMemo } from 'react';
import { Box, Grid, Card, Tabs, Tab, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { ComponentOptimizer } from '../../utils/componentOptimizer';
import { useGridState } from '../../hooks/useGridState';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import BaseComponent from '../base/BaseComponent';

const ProductEdit = memo(() => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  const { uploadMedia, isUploading } = useMediaUpload();
  
  // Grid state for gallery
  const galleryGridState = useGridState({
    pageSize: 50,
    sortModel: [{ field: 'position', sort: 'asc' }],
  });

  // Memoized handlers
  const handleTabChange = useCallback((_, newTab) => {
    setActiveTab(newTab);
  }, []);

  const handleMediaUpload = useCallback(async (files) => {
    try {
      await uploadMedia({
        productId: id,
        files,
        onProgress: (progress) => {
          console.log('Upload progress:', progress);
        },
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [id, uploadMedia]);

  // Tab panels
  const tabs = useMemo(() => [
    {
      id: 'general',
      label: 'General',
      component: <GeneralTab productId={id} />,
    },
    {
      id: 'attributes',
      label: 'Attributes',
      component: <AttributesTab productId={id} />,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      component: (
        <GalleryTab
          productId={id}
          gridState={galleryGridState}
          onUpload={handleMediaUpload}
          isUploading={isUploading}
        />
      ),
    },
    {
      id: 'categories',
      label: 'Categories',
      component: <CategoriesTab productId={id} />,
    },
  ], [id, galleryGridState, handleMediaUpload, isUploading]);

  return (
    <BaseComponent>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map(({ id, label }) => (
                <Tab key={id} value={id} label={label} />
              ))}
            </Tabs>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {/* Save handler */}}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Box mt={2}>
        {tabs.find(tab => tab.id === activeTab)?.component}
      </Box>
    </BaseComponent>
  );
});

// Add display name for debugging
ProductEdit.displayName = 'ProductEdit';

// Export optimized component
export default ComponentOptimizer.optimizeComponent(ProductEdit);