/**
 * Enhanced Media Upload Service
 * Professional bulk image processing with SKU matching, renaming, and resizing
 * Handles raw images with reference patterns and multiple images per product
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import magentoApi from './magentoApi';
import { toast } from 'react-toastify';

/**
 * Advanced image compression and resizing with professional quality
 */
const processImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.9,
      format = 'jpeg',
      backgroundColor = '#FFFFFF'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      const aspectRatio = width / height;

      // Determine new dimensions
      if (width > height) {
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
      } else {
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      // Set canvas to target size with background
      canvas.width = maxWidth;
      canvas.height = maxHeight;

      // Fill with background color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, maxWidth, maxHeight);

      // Center the image
      const x = (maxWidth - width) / 2;
      const y = (maxHeight - height) / 2;

      // Draw image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new file with processed content
            const processedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            });
            resolve(processedFile);
          } else {
            reject(new Error('Failed to process image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Enhanced CSV parsing with flexible column detection
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }
        
        // Parse headers with flexible detection
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];
        
        // Enhanced column detection
        const skuIndex = headers.findIndex(h => 
          h.includes('sku') || h.includes('ref') || h.includes('reference') || h.includes('code')
        );
        
        const imageIndex = headers.findIndex(h => 
          h.includes('image') || h.includes('photo') || h.includes('picture') || 
          h.includes('media') || h.includes('filename') || h.includes('file')
        );
        
        const nameIndex = headers.findIndex(h => 
          h.includes('name') || h.includes('title') || h.includes('description')
        );
        
        if (skuIndex === -1) {
          reject(new Error('CSV must contain a SKU/Reference column'));
          return;
        }
        
        // Parse data rows with enhanced validation
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length >= Math.max(skuIndex + 1, imageIndex + 1)) {
            const sku = values[skuIndex];
            const imageName = imageIndex !== -1 ? values[imageIndex] : '';
            const productName = nameIndex !== -1 ? values[nameIndex] : '';
            
            if (sku) {
              data.push({
                sku: sku,
                imageName: imageName,
                productName: productName,
                row: i + 1,
                originalData: values
              });
            }
          }
        }
        
        resolve({
          headers,
          data,
          skuColumn: headers[skuIndex],
          imageColumn: imageIndex !== -1 ? headers[imageIndex] : null,
          nameColumn: nameIndex !== -1 ? headers[nameIndex] : null,
          totalRows: data.length
        });
      } catch (error) {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading CSV file'));
    reader.readAsText(file);
  });
};

/**
 * Advanced image matching with reference patterns and multiple image support
 */
export const matchImagesWithCSV = (csvData, imageFiles) => {
  const matches = [];
  const unmatched = {
    csvRows: [],
    imageFiles: [...imageFiles]
  };
  
  // Create enhanced image file mapping
  const imageFileMap = new Map();
  const usedFiles = new Set();
  
  imageFiles.forEach(file => {
    const fileName = file.name.toLowerCase();
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    
    // Extract reference patterns (reference_1, reference_2, etc.)
    const referenceMatch = baseName.match(/^(.+?)(?:_(\d+))?$/);
    const baseReference = referenceMatch ? referenceMatch[1] : baseName;
    const imageNumber = referenceMatch && referenceMatch[2] ? parseInt(referenceMatch[2]) : 0;
    
    // Store with various keys for flexible matching
    const keys = [
      fileName,
      baseName,
      baseReference,
      baseName.replace(/[-_\s]/g, ''),
      baseReference.replace(/[-_\s]/g, '')
    ];
    
    keys.forEach(key => {
      if (!imageFileMap.has(key)) {
        imageFileMap.set(key, []);
      }
      imageFileMap.get(key).push({
        file,
        baseReference,
        imageNumber,
        originalName: fileName
      });
    });
  });
  
  // Enhanced matching algorithm
  csvData.data.forEach(row => {
    const { sku, imageName, productName } = row;
    const matchedImages = [];
    
    // Strategy 1: Direct image name match
    if (imageName) {
      const imageNameLower = imageName.toLowerCase();
      const imageNameBase = imageNameLower.replace(/\.[^/.]+$/, '');
      
      const directMatches = imageFileMap.get(imageNameLower) || 
                           imageFileMap.get(imageNameBase) || 
                           imageFileMap.get(imageNameBase.replace(/[-_\s]/g, '')) || 
                           [];
      
      matchedImages.push(...directMatches);
    }
    
    // Strategy 2: SKU-based matching
    const skuLower = sku.toLowerCase();
    const skuMatches = imageFileMap.get(skuLower) || 
                      imageFileMap.get(skuLower.replace(/[-_\s]/g, '')) || 
                      [];
    
    matchedImages.push(...skuMatches);
    
    // Strategy 3: Fuzzy matching with product name
    if (productName && matchedImages.length === 0) {
      const productWords = productName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      
      for (const [key, images] of imageFileMap.entries()) {
        if (productWords.some(word => key.includes(word))) {
          matchedImages.push(...images);
          break;
        }
      }
    }
    
    // Remove duplicates and sort by image number
    const uniqueMatches = Array.from(
      new Map(matchedImages.map(m => [m.file.name, m])).values()
    ).sort((a, b) => a.imageNumber - b.imageNumber);
    
    if (uniqueMatches.length > 0) {
      uniqueMatches.forEach((match, index) => {
        if (!usedFiles.has(match.file.name)) {
          matches.push({
            sku: sku,
            imageName: imageName || `${sku}_${index + 1}`,
            productName: productName,
            file: match.file,
            csvRow: row.row,
            imageIndex: index,
            totalImages: uniqueMatches.length,
            baseReference: match.baseReference,
            originalImageName: match.originalName
          });
          
          usedFiles.add(match.file.name);
          
          // Remove from unmatched
          const unmatchedIndex = unmatched.imageFiles.findIndex(f => f.name === match.file.name);
          if (unmatchedIndex !== -1) {
            unmatched.imageFiles.splice(unmatchedIndex, 1);
          }
        }
      });
    } else {
      unmatched.csvRows.push(row);
    }
  });
  
  return {
    matches,
    unmatched,
    stats: {
      totalCSVRows: csvData.data.length,
      totalImages: imageFiles.length,
      matched: matches.length,
      uniqueProducts: new Set(matches.map(m => m.sku)).size,
      unmatchedCSV: unmatched.csvRows.length,
      unmatchedImages: unmatched.imageFiles.length,
      multipleImagesProducts: Object.values(
        matches.reduce((acc, match) => {
          if (!acc[match.sku]) acc[match.sku] = 0;
          acc[match.sku]++;
          return acc;
        }, {})
      ).filter(count => count > 1).length
    }
  };
};

/**
 * Professional bulk upload with image processing pipeline
 */
export const bulkUploadImages = async (matches, progressCallback, options = {}) => {
  const {
    processImages = true,
    imageQuality = 0.9,
    targetSize = 1200,
    batchSize = 3,
    delayBetweenBatches = 2000
  } = options;
  
  const results = [];
  let completed = 0;
  
  // Group matches by SKU for batch processing
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.sku]) acc[match.sku] = [];
    acc[match.sku].push(match);
    return acc;
  }, {});
  
  const skus = Object.keys(groupedMatches);
  
  for (let i = 0; i < skus.length; i += batchSize) {
    const batch = skus.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map(async (sku) => {
      const skuMatches = groupedMatches[sku];
      const skuResults = [];
      
      for (const match of skuMatches) {
        try {
          if (progressCallback) {
            progressCallback({
              current: completed + 1,
              total: matches.length,
              sku: match.sku,
              fileName: match.file.name,
              status: 'processing',
              stage: processImages ? 'Processing image...' : 'Uploading...'
            });
          }
          
          let processedFile = match.file;
          
          // Process image if enabled
          if (processImages) {
            try {
              processedFile = await processImage(match.file, {
                maxWidth: targetSize,
                maxHeight: targetSize,
                quality: imageQuality,
                format: 'jpeg'
              });
              
              console.log(`✅ Processed ${match.file.name}: ${(match.file.size / 1024 / 1024).toFixed(2)}MB → ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
            } catch (processError) {
              console.warn(`⚠️ Failed to process ${match.file.name}, using original:`, processError);
            }
          }
          
          // Generate appropriate filename
          const fileExtension = processedFile.type.split('/')[1] || 'jpg';
          const finalFileName = match.imageIndex > 0 
            ? `${match.imageName}_${match.imageIndex + 1}.${fileExtension}`
            : `${match.imageName}.${fileExtension}`;
          
          if (progressCallback) {
            progressCallback({
              current: completed + 1,
              total: matches.length,
              sku: match.sku,
              fileName: finalFileName,
              status: 'uploading',
              stage: 'Uploading to Magento...'
            });
          }
          
          // Upload to Magento
          const uploadResult = await uploadProductImage(match.sku, processedFile, {
            label: match.productName || match.imageName,
            position: match.imageIndex,
            types: match.imageIndex === 0 ? ['image', 'small_image', 'thumbnail'] : ['image'],
            fileName: finalFileName
          });
          
          skuResults.push({
            ...match,
            result: uploadResult,
            status: uploadResult.success ? 'success' : 'error',
            processedFileName: finalFileName,
            originalSize: match.file.size,
            processedSize: processedFile.size
          });
          
          completed++;
          
          if (progressCallback) {
            progressCallback({
              current: completed,
              total: matches.length,
              sku: match.sku,
              fileName: finalFileName,
              status: uploadResult.success ? 'success' : 'error',
              stage: uploadResult.success ? 'Completed' : 'Failed',
              message: uploadResult.message
            });
          }
          
        } catch (error) {
          skuResults.push({
            ...match,
            result: {
              success: false,
              error: error.message,
              message: `Failed to process ${match.file.name}: ${error.message}`
            },
            status: 'error'
          });
          
          completed++;
        }
      }
      
      return skuResults;
    });
    
    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.flat());
    
    // Delay between batches to prevent server overload
    if (i + batchSize < skus.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
};

/**
 * Enhanced image upload with better error handling
 */
const uploadProductImage = async (sku, imageFile, imageData = {}) => {
  try {
    // Convert to base64
    const base64Content = await fileToBase64(imageFile);
    
    // Prepare entry for Magento API
    const entry = {
      media_type: 'image',
      label: imageData.label || imageFile.name.replace(/\.[^/.]+$/, ""),
      position: imageData.position || 0,
      disabled: false,
      types: imageData.types || ['image'],
      content: {
        base64_encoded_data: base64Content,
        type: imageFile.type,
        name: imageData.fileName || imageFile.name
      }
    };
    
    const response = await magentoApi.uploadProductMedia(sku, { entry });
    
    return {
      success: true,
      data: response,
      message: `Image uploaded successfully for ${sku}`,
      mediaId: response?.id,
      mediaUrl: response?.file
    };
  } catch (error) {
    console.error(`Error uploading image for ${sku}:`, error);
    return {
      success: false,
      error: error.message,
      message: `Failed to upload image for ${sku}: ${error.message}`
    };
  }
};

/**
 * Convert file to base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Enhanced file validation with detailed feedback
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const extension = file.name.toLowerCase().match(/\.[^/.]+$/)?.[0];
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`
      };
    }
  }
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: ${maxSize / 1024 / 1024}MB`
    };
  }
  
  // Check minimum dimensions (if possible)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        resolve({
          valid: false,
          error: 'Image too small. Minimum dimensions: 100x100 pixels'
        });
      } else {
        resolve({
          valid: true,
          dimensions: { width: img.width, height: img.height },
          size: file.size
        });
      }
    };
    img.onerror = () => {
      resolve({
        valid: false,
        error: 'Invalid image file or corrupted'
      });
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Batch validate multiple files
 */
export const validateImageFiles = async (files) => {
  const results = [];
  
  for (const file of files) {
    const validation = await validateImageFile(file);
    results.push({
      file,
      ...validation
    });
  }
  
  return {
    valid: results.filter(r => r.valid),
    invalid: results.filter(r => !r.valid),
    totalSize: results.reduce((sum, r) => sum + r.file.size, 0)
  };
};

/**
 * Generate processing statistics
 */
export const generateProcessingStats = (results) => {
  const stats = {
    total: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
    totalOriginalSize: results.reduce((sum, r) => sum + (r.originalSize || 0), 0),
    totalProcessedSize: results.reduce((sum, r) => sum + (r.processedSize || 0), 0),
    uniqueProducts: new Set(results.map(r => r.sku)).size,
    averageImagesPerProduct: 0,
    processingTime: 0
  };
  
  stats.averageImagesPerProduct = stats.uniqueProducts > 0 ? 
    (stats.total / stats.uniqueProducts).toFixed(1) : 0;
  
  stats.compressionRatio = stats.totalOriginalSize > 0 ? 
    ((stats.totalOriginalSize - stats.totalProcessedSize) / stats.totalOriginalSize * 100).toFixed(1) : 0;
  
  return stats;
};

export default {
  parseCSVFile,
  matchImagesWithCSV,
  bulkUploadImages,
  validateImageFile,
  validateImageFiles,
  generateProcessingStats,
  processImage
};