import { memo, useCallback, useState } from 'react';
import { Box, Grid, Card, IconButton, Tooltip, LinearProgress } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { ComponentOptimizer } from '../../utils/componentOptimizer';
import BaseComponent from '../base/BaseComponent';

const GalleryTab = memo(({ 
  productId, 
  gridState, 
  onUpload, 
  isUploading 
}) => {
  const [dragActive, setDragActive] = useState(false);

  // Dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    },
    multiple: true,
    maxSize: 5242880, // 5MB
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDrop: (files) => {
      setDragActive(false);
      onUpload(files);
    },
  });

  // Delete handler
  const handleDelete = useCallback((imageId) => {
    // Implement delete logic
    console.log('Delete image:', imageId);
  }, []);

  return (
    <BaseComponent>
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 2,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <UploadIcon color="primary" sx={{ fontSize: 40 }} />
          <Box sx={{ textAlign: 'center' }}>
            <strong>Drop files here or click to upload</strong>
            <br />
            Supported formats: JPG, PNG, GIF, WebP (max 5MB)
          </Box>
        </Box>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Image Grid */}
      <Grid container spacing={2}>
        {gridState.items?.map((image) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
            <Card>
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '100%', // 1:1 Aspect ratio
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src={image.url}
                  alt={image.label || 'Product image'}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* Image Actions */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    p: 1,
                    display: 'flex',
                    gap: 1,
                    bgcolor: 'rgba(0,0,0,0.5)',
                  }}
                >
                  <Tooltip title="Delete image">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(image.id)}
                      sx={{ color: 'white' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </BaseComponent>
  );
});

// Add display name for debugging
GalleryTab.displayName = 'GalleryTab';

// Export optimized component
export default ComponentOptimizer.optimizeComponent(GalleryTab);