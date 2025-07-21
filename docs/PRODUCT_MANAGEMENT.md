# 🛠️ Product Management Tools Documentation

## Overview

The Product Management system provides a comprehensive suite of tools for managing e-commerce product catalogs with advanced image processing, bulk operations, and seamless Magento integration. Built with a professional tabbed interface, it offers 4 specialized tools for complete product lifecycle management.

## 🎯 Core Features

### **Professional Tabbed Interface**
- **Tab 1: Product Management** - Core product catalog operations
- **Tab 2: Image Renaming Tool** - Automated image renaming with CSV mapping
- **Tab 3: Image Resizing Tool** - Standardized image processing (1200x1200)
- **Tab 4: Catalog Tools** - Smart caching and data management

### **Advanced Image Processing**
- **Automated Renaming** - Transform camera references to descriptive names
- **Standardized Resizing** - 1200x1200 pixels with white background padding
- **Batch Processing** - Handle multiple images simultaneously
- **Progress Tracking** - Real-time processing feedback
- **Quality Optimization** - 90% JPEG compression for optimal file sizes

### **Smart Caching System**
- **1-Hour Cache Expiry** - Automatic cache invalidation
- **Performance Optimization** - Reduced API calls and faster data access
- **Manual Refresh** - Force cache updates when needed
- **Status Indicators** - Visual cache status and last updated time

## 📋 Component Architecture

### **Main Product Management Page**

```jsx
// src/pages/ProductManagementPage.jsx
import React, { useState } from 'react';
import { Tabs, Tab, Box, Paper } from '@mui/material';

const ProductManagementPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [imageProcessing, setImageProcessing] = useState({
    renaming: { inProgress: false, results: [] },
    resizing: { inProgress: false, results: [] }
  });

  const tabs = [
    { label: 'Product Management', icon: <ProductIcon /> },
    { label: 'Image Renaming', icon: <ImageIcon /> },
    { label: 'Image Resizing', icon: <ResizeIcon /> },
    { label: 'Catalog Tools', icon: <ToolsIcon /> }
  ];

  return (
    <Container maxWidth="xl">
      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} icon={tab.icon} />
          ))}
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <ProductManagementTab />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <ImageRenamingTab 
            processing={imageProcessing.renaming}
            onProcess={handleImageRenaming}
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <ImageResizingTab 
            processing={imageProcessing.resizing}
            onProcess={handleImageResizing}
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <CatalogToolsTab />
        </TabPanel>
      </Paper>
    </Container>
  );
};
```

## 🖼️ Image Processing Tools

### **Image Renaming Tool (Tab 2)**

#### **Purpose & Functionality**
Transform camera reference images (e.g., `IMG_001.jpg`, `DSC_1234.jpg`) into descriptive product names using CSV mapping files.

#### **Component Structure**

```jsx
// Image Renaming Tab Component
const ImageRenamingTab = ({ processing, onProcess }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [mappingData, setMappingData] = useState([]);

  const handleCSVUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const mapping = parseCSV(csv);
      setMappingData(mapping);
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (files) => {
    setImageFiles(Array.from(files));
  };

  const processRenaming = async () => {
    const results = [];
    
    for (const image of imageFiles) {
      try {
        const mapping = findMapping(image.name, mappingData);
        if (mapping) {
          const newName = generateProductName(mapping);
          const renamedFile = await renameFile(image, newName);
          results.push({
            original: image.name,
            renamed: newName,
            status: 'success'
          });
        } else {
          results.push({
            original: image.name,
            status: 'no_mapping'
          });
        }
      } catch (error) {
        results.push({
          original: image.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    onProcess(results);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* CSV Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📄 CSV Mapping File
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload a CSV file with image reference mappings
              </Typography>
              
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleCSVUpload(e.target.files[0])}
                style={{ display: 'none' }}
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outlined" component="span" fullWidth>
                  Upload CSV Mapping
                </Button>
              </label>
              
              {csvFile && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  CSV loaded: {mappingData.length} mappings found
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Image Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🖼️ Image Files
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select images to rename using the CSV mapping
              </Typography>
              
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                style={{ display: 'none' }}
                id="images-upload"
              />
              <label htmlFor="images-upload">
                <Button variant="outlined" component="span" fullWidth>
                  Select Images
                </Button>
              </label>
              
              {imageFiles.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {imageFiles.length} images selected
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Processing Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  ⚙️ Processing
                </Typography>
                <Button
                  variant="contained"
                  onClick={processRenaming}
                  disabled={!csvFile || imageFiles.length === 0 || processing.inProgress}
                  startIcon={processing.inProgress ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                >
                  {processing.inProgress ? 'Processing...' : 'Start Renaming'}
                </Button>
              </Box>
              
              {processing.inProgress && (
                <LinearProgress sx={{ mb: 2 }} />
              )}
              
              {processing.results.length > 0 && (
                <ProcessingResults results={processing.results} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
```

#### **CSV Mapping Format**

```csv
reference,product_name,category,brand
IMG_001,Samsung Galaxy S24 Ultra 256GB Black,Smartphones,Samsung
IMG_002,iPhone 15 Pro Max 512GB Natural Titanium,Smartphones,Apple
DSC_1234,MacBook Pro 16 M3 Max 1TB Space Black,Laptops,Apple
```

#### **Renaming Logic**

```javascript
const generateProductName = (mapping) => {
  const { product_name, category, brand } = mapping;
  
  // Generate SEO-friendly filename
  const cleanName = product_name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .trim();
    
  return `${brand.toLowerCase()}-${cleanName}.jpg`;
};

// Example output: "samsung-galaxy-s24-ultra-256gb-black.jpg"
```

### **Image Resizing Tool (Tab 3)**

#### **Purpose & Functionality**
Standardize product images to 1200x1200 pixels with white background padding while preserving aspect ratios.

#### **Component Structure**

```jsx
// Image Resizing Tab Component
const ImageResizingTab = ({ processing, onProcess }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [resizeSettings, setResizeSettings] = useState({
    width: 1200,
    height: 1200,
    backgroundColor: '#FFFFFF',
    quality: 0.9,
    format: 'jpeg'
  });

  const processResizing = async () => {
    const results = [];
    
    for (const image of selectedImages) {
      try {
        const resizedImage = await resizeImage(image, resizeSettings);
        results.push({
          original: image.name,
          originalSize: `${image.width}x${image.height}`,
          newSize: `${resizeSettings.width}x${resizeSettings.height}`,
          originalFileSize: formatFileSize(image.size),
          newFileSize: formatFileSize(resizedImage.size),
          status: 'success',
          blob: resizedImage
        });
      } catch (error) {
        results.push({
          original: image.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    onProcess(results);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Settings Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚙️ Resize Settings
              </Typography>
              
              <TextField
                label="Width"
                type="number"
                value={resizeSettings.width}
                onChange={(e) => setResizeSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Height"
                type="number"
                value={resizeSettings.height}
                onChange={(e) => setResizeSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Quality"
                type="number"
                inputProps={{ min: 0.1, max: 1, step: 0.1 }}
                value={resizeSettings.quality}
                onChange={(e) => setResizeSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                fullWidth
                margin="normal"
                helperText="0.1 (low) to 1.0 (high)"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Background Color</InputLabel>
                <Select
                  value={resizeSettings.backgroundColor}
                  onChange={(e) => setResizeSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                >
                  <MenuItem value="#FFFFFF">White</MenuItem>
                  <MenuItem value="#000000">Black</MenuItem>
                  <MenuItem value="transparent">Transparent</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Image Selection */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🖼️ Image Selection
              </Typography>
              
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelection}
                style={{ display: 'none' }}
                id="resize-images-upload"
              />
              <label htmlFor="resize-images-upload">
                <Button variant="outlined" component="span" fullWidth sx={{ mb: 2 }}>
                  Select Images to Resize
                </Button>
              </label>
              
              {selectedImages.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedImages.length} images selected
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={processResizing}
                    disabled={processing.inProgress}
                    startIcon={processing.inProgress ? <CircularProgress size={20} /> : <PhotoSizeSelectActualIcon />}
                    fullWidth
                  >
                    {processing.inProgress ? 'Resizing...' : 'Start Resizing'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        {processing.results.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Processing Results
                </Typography>
                <ResizingResults results={processing.results} />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
```

#### **Image Resizing Logic**

```javascript
const resizeImage = (file, settings) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const { width: targetWidth, height: targetHeight, backgroundColor, quality } = settings;
      
      // Calculate scaling to fit within target dimensions while preserving aspect ratio
      const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Center the image
      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;
      
      // Set canvas dimensions
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // Draw scaled image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Convert to blob
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
```

## 🗂️ Catalog Tools (Tab 4)

### **Smart Caching System**

#### **Purpose & Functionality**
Optimize performance by caching frequently accessed catalog data (attributes, brands, categories) with intelligent expiry and refresh mechanisms.

#### **Component Structure**

```jsx
// Catalog Tools Tab Component
const CatalogToolsTab = () => {
  const [cacheData, setCacheData] = useState({
    attributes: { data: [], lastUpdated: null, status: 'empty' },
    brands: { data: [], lastUpdated: null, status: 'empty' },
    categories: { data: [], lastUpdated: null, status: 'empty' }
  });

  const refreshCache = async (type) => {
    setCacheData(prev => ({
      ...prev,
      [type]: { ...prev[type], status: 'loading' }
    }));

    try {
      const data = await fetchCatalogData(type);
      const timestamp = new Date().toISOString();
      
      setCacheData(prev => ({
        ...prev,
        [type]: {
          data,
          lastUpdated: timestamp,
          status: 'loaded'
        }
      }));
      
      // Store in localStorage with expiry
      localStorage.setItem(`cache_${type}`, JSON.stringify({
        data,
        timestamp,
        expiry: Date.now() + (60 * 60 * 1000) // 1 hour
      }));
      
    } catch (error) {
      setCacheData(prev => ({
        ...prev,
        [type]: { ...prev[type], status: 'error' }
      }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Attributes Cache */}
        <Grid item xs={12} md={4}>
          <CacheCard
            title="Product Attributes"
            icon="🔧"
            data={cacheData.attributes}
            onRefresh={() => refreshCache('attributes')}
          />
        </Grid>

        {/* Brands Cache */}
        <Grid item xs={12} md={4}>
          <CacheCard
            title="Brands"
            icon="🏷️"
            data={cacheData.brands}
            onRefresh={() => refreshCache('brands')}
          />
        </Grid>

        {/* Categories Cache */}
        <Grid item xs={12} md={4}>
          <CacheCard
            title="Categories"
            icon="📂"
            data={cacheData.categories}
            onRefresh={() => refreshCache('categories')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Cache Card Component
const CacheCard = ({ title, icon, data, onRefresh }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'loaded': return 'success';
      case 'loading': return 'info';
      case 'error': return 'error';
      default: return 'grey';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'loaded': return 'Cached';
      case 'loading': return 'Loading...';
      case 'error': return 'Error';
      default: return 'Empty';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ mr: 1 }}>{icon}</Typography>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Chip
            label={getStatusText(data.status)}
            color={getStatusColor(data.status)}
            size="small"
            sx={{ mb: 1 }}
          />
          
          {data.data.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {data.data.length} items cached
            </Typography>
          )}
          
          {data.lastUpdated && (
            <Typography variant="caption" color="text.secondary" display="block">
              Last updated: {formatRelativeTime(data.lastUpdated)}
            </Typography>
          )}
        </Box>
        
        <Button
          variant="outlined"
          onClick={onRefresh}
          disabled={data.status === 'loading'}
          startIcon={data.status === 'loading' ? <CircularProgress size={16} /> : <RefreshIcon />}
          fullWidth
        >
          {data.status === 'loading' ? 'Refreshing...' : 'Refresh Cache'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### **Cache Management Logic**

```javascript
// Cache service for catalog data
class CatalogCacheService {
  constructor() {
    this.CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  }

  async get(key) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp, expiry } = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return { data, timestamp };
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  set(key, data) {
    try {
      const cacheItem = {
        data,
        timestamp: new Date().toISOString(),
        expiry: Date.now() + this.CACHE_DURATION
      };
      
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  clear(key) {
    if (key) {
      localStorage.removeItem(`cache_${key}`);
    } else {
      // Clear all cache
      Object.keys(localStorage)
        .filter(k => k.startsWith('cache_'))
        .forEach(k => localStorage.removeItem(k));
    }
  }

  getStats() {
    const cacheKeys = Object.keys(localStorage)
      .filter(k => k.startsWith('cache_'));
    
    let totalSize = 0;
    const items = cacheKeys.map(key => {
      const data = localStorage.getItem(key);
      const size = new Blob([data]).size;
      totalSize += size;
      
      return {
        key: key.replace('cache_', ''),
        size,
        data: JSON.parse(data)
      };
    });

    return {
      itemCount: items.length,
      totalSize,
      items
    };
  }
}
```

---

*Continue reading the next sections for Grid System, API Reference, and Database Integration...*
