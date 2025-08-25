import React from 'react';
/**
 * Media Upload Service
 * Handles product image uploads and bulk media operations
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import magentoApi from './magentoApi';
import { toast } from 'react-toastify';

/**
 * Default matching settings for bulk upload
 */
export const DEFAULT_MATCHING_SETTINGS = {
  caseSensitive: false,
  exactMatch: false,
  ignoreExtensions: true,
  ignoreSeparators: true,
  allowPartialMatch: true,
  matchThreshold: 0.8,
  autoMatch: true,
  skipUnmatched: false,
  overwriteExisting: false,
  validateSKU: true,
  maxFileSize: 8 * 1024 * 1024, // 8MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  compressionQuality: 0.8,
  maxDimensions: { width: 1920, height: 1920 }
};

/**
 * Compress and resize image if needed
 */
const compressImage = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if(width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      canvas.toBlob(resolve, file.type, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert file to base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data:image/jpeg;base64, prefix
      const base64 = reader.result?.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Upload single image for a product
 */
export const uploadProductImage = async (sku, imageFile, imageData = {}) => {
  try {
    // Compress image if it's too large (over 3MB)
    let processedFile = imageFile;
    if(imageFile.size > 3 * 1024 * 1024) {
      console.log(`🗜️ Compressing large image: ${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)}MB)`);
      processedFile = await compressImage(imageFile, 1920, 1920, 0.8);
      console.log(`✅ Compressed to: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Convert image file to base64
    const base64Content = await fileToBase64(processedFile);

    // Log final payload size for debugging
    const estimatedPayloadSize = (base64Content.length * 0.75) / 1024 / 1024; // Rough estimate in MB
    console.log(`📦 Final payload size estimate: ${estimatedPayloadSize.toFixed(2)}MB`);

    // Prepare the entry object as expected by Magento API
    const entry = {
      media_type: 'image',
      label: imageData?.label || imageFile.name.replace(/\.[^/.]+$/, ""),
      position: imageData?.position || 0,
      disabled: imageData?.disabled || false,
      types: imageData?.types || ['image'],
      content: {
        base64_encoded_data: base64Content,
        type: processedFile.type || imageFile.type,
        name: imageFile.name
      },
      ...imageData
    };

    // Upload to Magento API with entry wrapper
    const response = await magentoApi.uploadProductMedia(sku, { entry });

    return {
      success: true,
      data: response,
      message: `Image uploaded successfully for ${sku}`
    };
  } catch(error: any) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to upload image for ${sku}: ${error.message}`
    };
  }
};

/**
 * Upload multiple images for a product
 */
export const uploadProductImages = async (sku, imageFiles, progressCallback) => {
  const results = [];
  
  for(let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    
    if(progressCallback) {
      progressCallback({
        current: i + 1,
        total: imageFiles.length,
        fileName: file.name,
        sku: sku
      });
    }
    
    const result = await uploadProductImage(sku, file, {
      position: i,
      label: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      types: i ===0 ? ['image', 'small_image', 'thumbnail'] : ['image']
    });
    
    results.push(result);
    
    // Small delay to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
};

/**
 * Parse CSV file for bulk upload
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv?.split('\n').filter((line: any: any) => line.trim());
        
        if(lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }
        
        const headers = lines[0]?.split(',').map((h: any: any) => h.trim().toLowerCase());
        const data = [];
        
        // Find required columns
        const skuIndex = headers.findIndex(h => h.includes('sku'));
        const imageIndex = headers.findIndex(h => h.includes('image') || h.includes('photo') || h.includes('picture'));
        
        if(skuIndex ===-1) {
          reject(new Error('CSV must contain a SKU column'));
          return;
        }
        
        if(imageIndex ===-1) {
          reject(new Error('CSV must contain an image filename column'));
          return;
        }
        
        // Parse data rows
        for(let i = 1; i < lines.length; i++) {
          const values = lines[i]?.split(',').map((v: any: any) => v.trim());
          
          if (values.length >= Math.max(skuIndex, imageIndex) + 1) {
            const sku = values[skuIndex];
            const imageName = values[imageIndex];
            
            if(sku && imageName) {
              data.push({
                sku: sku,
                imageName: imageName,
                row: i + 1
              });
            }
          }
        }
        
        resolve({
          headers,
          data,
          skuColumn: headers[skuIndex],
          imageColumn: headers[imageIndex]
        });
      } catch(error: any) {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading CSV file'));
    reader.readAsText(file);
  });
};

/**
 * Match images with CSV data
 */
export const matchImagesWithCSV = (csvData, imageFiles) => {
  const matches = [];
  const unmatched = {
    csvRows: [],
    imageFiles: []
  };
  
  const imageFileMap = new Map();
  imageFiles.forEach((file) => {
    // Create variations of the filename for matching
    const baseName = file.name.toLowerCase();
    const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "");
    
    imageFileMap.set(baseName, file);
    imageFileMap.set(nameWithoutExt, file);
    
    // Also try with common separators replaced
    const normalizedName = nameWithoutExt.replace(/[-_\s]/g, '');
    imageFileMap.set(normalizedName, file);
  });
  
  // Match CSV rows with images
  csvData.data.forEach((row) => {
    const imageName = row.imageName.toLowerCase();
    const imageNameWithoutExt = imageName.replace(/\.[^/.]+$/, "");
    const normalizedImageName = imageNameWithoutExt.replace(/[-_\s]/g, '');
    
    let matchedFile = imageFileMap.get(imageName) || 
                     imageFileMap.get(imageNameWithoutExt) ||
                     imageFileMap.get(normalizedImageName);
    
    if(matchedFile) {
      matches.push({
        sku: row.sku,
        imageName: row.imageName,
        file: matchedFile,
        csvRow: row.row
      });
      
      // Remove from map to avoid duplicate matches
      imageFileMap.delete(imageName);
      imageFileMap.delete(imageNameWithoutExt);
      imageFileMap.delete(normalizedImageName);
    } else {
      unmatched.csvRows.push(row);
    }
  });
  
  // Remaining files are unmatched
  imageFileMap.forEach((file) => {
    unmatched.imageFiles.push(file);
  });
  
  return {
    matches,
    unmatched,
    stats: {
      totalCSVRows: csvData.data.length,
      totalImages: imageFiles.length,
      matched: matches.length,
      unmatchedCSV: unmatched.csvRows.length,
      unmatchedImages: unmatched.imageFiles.length
    }
  };
};

/**
 * Bulk upload images based on CSV matching
 */
export const bulkUploadImages = async (matches, progressCallback) => {
  const results = [];
  let completed = 0;
  
  for (const match of matches) {
    try {
      if(progressCallback) {
        progressCallback({
          current: completed + 1,
          total: matches.length,
          sku: match.sku,
          fileName: match.file.name,
          status: 'uploading'
        });
      }
      
      const result = await uploadProductImage(match.sku, match.file, {
        label: match.imageName.replace(/\.[^/.]+$/, ""),
        types: ['image', 'small_image', 'thumbnail']
      });
      
      results.push({ ...match,
        result,
        status: result.success ? 'success' : 'error'
      });
      
      completed++;
      
      if(progressCallback) {
        progressCallback({
          current: completed,
          total: matches.length,
          sku: match.sku,
          fileName: match.file.name,
          status: result.success ? 'success' : 'error',
          message: result.message
        });
      }
      
      // Delay between uploads to prevent server overload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch(error: any) {
      results.push({ ...match,
        result: {
          success: false,
          error: error.message
        },
        status: 'error'
      });
      
      completed++;
    }
  }
  
  return results;
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  // Reduced max size to account for base64 encoding overhead (~33% increase)
  // and server payload limits. Large files will be compressed automatically.
  const maxSize = 8 * 1024 * 1024; // 8MB (will be ~10.6MB as base64)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  if(file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${maxSize / 1024 / 1024}MB (large images will be compressed automatically)`
    };
  }

  return { valid: true };
};

/**
 * Get image preview URL
 */
export const getImagePreviewURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default {
  uploadProductImage,
  uploadProductImages,
  parseCSVFile,
  matchImagesWithCSV,
  bulkUploadImages,
  validateImageFile,
  getImagePreviewURL
};
