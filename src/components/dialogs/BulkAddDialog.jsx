import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

const BulkAddDialog = ({ open, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    // Only accept one file for now
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      if (file.type !== 'text/csv') {
        toast.error('Only .csv files are accepted.');

        return;
      }
      setFiles([file]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files[0]);
      onClose();
    } else {
      toast.error('Please select a file to upload.');
    }
  };

  const handleRemoveFile = () => {
    setFiles([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Add Products from CSV</DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${isDragActive ? 'primary.main' : 'grey.500'}`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            mt: 2,
            backgroundColor: isDragActive ? 'action.hover' : 'transparent',
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500' }} />
          <Typography>
            {isDragActive ? 'Drop the file here ...' : 'Drag \'n\' drop a CSV file here, or click to select a file'}
          </Typography>
        </Box>
        {files.length > 0 && (
          <List>
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={handleRemoveFile}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <InsertDriveFileIcon />
              </ListItemIcon>
              <ListItemText
                primary={files[0].name}
                secondary={`${(files[0].size / 1024).toFixed(2)} KB`}
              />
            </ListItem>
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpload} variant="contained" disabled={files.length === 0}>
                    Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAddDialog;
