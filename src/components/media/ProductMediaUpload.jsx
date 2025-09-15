import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as PreviewIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import mediaUploadService from '../../services/mediaUploadService';

/**
 * Product Media Upload Component
 * Handles image upload, preview, and management for products
 */
const ProductMediaUpload = ({ sku, existingImages = [], onImagesChange }) => {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [previewDialog, setPreviewDialog] = useState({ open: false, image: null });
  const [editDialog, setEditDialog] = useState({ open: false, image: null, index: -1 });

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles) => {
    const validFiles = [];
    const errors = [];

    // Validate files
    for (const file of acceptedFiles) {
      const validation = mediaUploadService.validateImageFile(file);

      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      toast.error(`Some files were rejected: ${errors.join(', ')}`);
    }

    if (validFiles.length === 0) return;

    // Upload files if SKU is provided
    if (sku) {
      setUploading(true);
      try {
        const results = await mediaUploadService.uploadProductImages(
          sku,
          validFiles,
          (progress) => setUploadProgress(progress),
        );

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        if (successful.length > 0) {
          toast.success(`${successful.length} images uploaded successfully`);

          // Add uploaded images to the list
          const newImages = successful.map((result, index) => ({
            id: Date.now() + index,
            file: validFiles[index],
            url: URL.createObjectURL(validFiles[index]),
            label: validFiles[index].name.replace(/\.[^/.]+$/, ''),
            position: images.length + index,
            types: index === 0 && images.length === 0 ? ['image', 'small_image', 'thumbnail'] : ['image'],
            disabled: false,
            uploaded: true,
          }));

          const updatedImages = [...images, ...newImages];

          setImages(updatedImages);
          onImagesChange?.(updatedImages);
        }

        if (failed.length > 0) {
          toast.error(`${failed.length} images failed to upload`);
        }
      } catch (error) {
        toast.error(`Upload failed: ${error.message}`);
      } finally {
        setUploading(false);
        setUploadProgress(null);
      }
    } else {
      // Just add to preview if no SKU (for new products)
      const newImages = validFiles.map((file, index) => ({
        id: Date.now() + index,
        file,
        url: URL.createObjectURL(file),
        label: file.name.replace(/\.[^/.]+$/, ''),
        position: images.length + index,
        types: index === 0 && images.length === 0 ? ['image', 'small_image', 'thumbnail'] : ['image'],
        disabled: false,
        uploaded: false,
      }));

      const updatedImages = [...images, ...newImages];

      setImages(updatedImages);
      onImagesChange?.(updatedImages);
    }
  }, [sku, images, onImagesChange]);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true,
    disabled: uploading,
  });

  // Handle drag end for reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedImages = Array.from(images);
    const [removed] = reorderedImages.splice(result.source.index, 1);

    reorderedImages.splice(result.destination.index, 0, removed);

    // Update positions
    const updatedImages = reorderedImages.map((img, index) => ({
      ...img,
      position: index,
    }));

    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  // Delete image
  const handleDeleteImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);

    setImages(updatedImages);
    onImagesChange?.(updatedImages);
    toast.success('Image removed');
  };

  // Edit image
  const handleEditImage = (image, index) => {
    setEditDialog({ open: true, image: { ...image }, index });
  };

  // Save edited image
  const handleSaveEdit = () => {
    const updatedImages = [...images];

    updatedImages[editDialog.index] = editDialog.image;
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
    setEditDialog({ open: false, image: null, index: -1 });
    toast.success('Image updated');
  };

  // Toggle image type
  const toggleImageType = (type) => {
    const updatedImage = { ...editDialog.image };

    if (updatedImage.types.includes(type)) {
      updatedImage.types = updatedImage.types.filter(t => t !== type);
    } else {
      updatedImage.types = [...updatedImage.types, type];
    }
    setEditDialog({ ...editDialog, image: updatedImage });
  };

  return (
    <Box>
      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'primary.light' : 'background.default',
          cursor: uploading ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          mb: 3,
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop images here...' : 'Upload Product Images'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Drag & drop images here, or click to select multiple files
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Supported formats: JPEG, PNG, GIF, WebP (Max 10MB each)
        </Typography>
      </Paper>

      {/* Upload Progress */}
      {uploading && uploadProgress && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Uploading: {uploadProgress.current} of {uploadProgress.total}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(uploadProgress.current / uploadProgress.total) * 100}
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {uploadProgress.fileName}
          </Typography>
        </Box>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Product Images ({images.length})
          </Typography>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <Grid
                  container
                  spacing={2}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {images.map((image, index) => (
                    <Draggable
                      key={image.id}
                      draggableId={image.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <Card
                            sx={{
                              position: 'relative',
                              transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                              boxShadow: snapshot.isDragging ? 4 : 1,
                            }}
                          >
                            {/* Drag Handle */}
                            <Box
                              {...provided.dragHandleProps}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
                                zIndex: 1,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                borderRadius: 1,
                                p: 0.5,
                              }}
                            >
                              <DragIcon sx={{ color: 'white', fontSize: 16 }} />
                            </Box>

                            {/* Main Image Badge */}
                            {image.types.includes('small_image') && (
                              <Chip
                                icon={<StarIcon />}
                                label="Main"
                                color="primary"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  zIndex: 1,
                                }}
                              />
                            )}

                            <CardMedia
                              component="img"
                              height="200"
                              image={image.url}
                              alt={image.label}
                              sx={{ objectFit: 'cover' }}
                            />

                            <CardContent sx={{ p: 1 }}>
                              <Typography variant="body2" noWrap>
                                {image.label}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                {image.types.map(type => (
                                  <Chip
                                    key={type}
                                    label={type}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.6rem', height: 16 }}
                                  />
                                ))}
                              </Box>
                              {image.uploaded && (
                                <Chip
                                  label="Uploaded"
                                  color="success"
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </CardContent>

                            <CardActions sx={{ p: 1, pt: 0 }}>
                              <IconButton
                                size="small"
                                onClick={() => setPreviewDialog({ open: true, image })}
                              >
                                <PreviewIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleEditImage(image, index)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteImage(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </CardActions>
                          </Card>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Grid>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, image: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {previewDialog.image && (
            <img
              src={previewDialog.image.url}
              alt={previewDialog.image.label}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, image: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, image: null, index: -1 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Edit Image
          </Typography>

          {editDialog.image && (
            <Box>
              <TextField
                fullWidth
                label="Image Label"
                value={editDialog.image.label}
                onChange={(e) => setEditDialog({
                  ...editDialog,
                  image: { ...editDialog.image, label: e.target.value },
                })}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Image Types
              </Typography>
              <Box sx={{ mb: 2 }}>
                {['image', 'small_image', 'thumbnail'].map(type => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Switch
                        checked={editDialog.image.types.includes(type)}
                        onChange={() => toggleImageType(type)}
                      />
                    }
                    label={type.replace('_', ' ').toUpperCase()}
                  />
                ))}
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={editDialog.image.disabled}
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      image: { ...editDialog.image, disabled: e.target.checked },
                    })}
                  />
                }
                label="Disabled"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, image: null, index: -1 })}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductMediaUpload;
