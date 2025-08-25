import React from 'react';
/**
 * Calligraph Media Upload Service
 * Specialized for Calligraph CSV structure with ref-based image matching
 * Handles raw images with reference naming patterns and multiple images per SKU
 * 
 * @author Techno-ETL Team
 * @version 2.1.0
 */

import magentoApi from './magentoApi';
import { toast } from 'react-toastify';

/**
 * Professional image processing with Canvas API (Sharp-like quality)
 */
const processImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth
      maxHeight
      quality
      format
      backgroundColor
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      const aspectRatio = width / height;

      // Determine new dimensions
      if(width > height) {
        if(width > maxWidth) {
          width
        }
      } else {
        if(height > maxHeight) {
          height
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
      canvas.toBlob((blob) => {
          if(blob) {
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
 * Enhanced CSV parsing specifically for Calligraph structure
 */
export const parseCalligraphCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv?.split('\n').filter((line: any: any: any: any) => line.trim());
        
        if(lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }
        
        // Parse headers - Calligraph CSV has specific structure
        const headers = lines[0]?.split(',').map((h: any: any: any: any) => h.trim().toLowerCase());
        const data = [];
        
        // Find required columns for Calligraph CSV
        const skuIndex = headers.findIndex(h => h === 'sku');
        const refIndex = headers.findIndex(h => h === 'ref');
        const imageNameIndex = headers.findIndex(h => h === 'image name');
        const nameIndex = headers.findIndex(h => h === 'name');
        
        console.log('📊 CSV Column Mapping:');
        console.log(`   SKU: ${skuIndex >= 0 ? headers[skuIndex] : 'NOT FOUND'}`);
        console.log(`   REF: ${refIndex >= 0 ? headers[refIndex] : 'NOT FOUND'}`);
        console.log(`   Image Name: ${imageNameIndex >= 0 ? headers[imageNameIndex] : 'NOT FOUND'}`);
        console.log(`   Product Name: ${nameIndex >= 0 ? headers[nameIndex] : 'NOT FOUND'}`);
        
        if(skuIndex ===-1) {
          reject(new Error('CSV must contain a "sku" column'));
          return;
        }
        
        if(refIndex ===-1) {
          reject(new Error('CSV must contain a "ref" column'));
          return;
        }
        
        // Parse data rows
        for(let i = 1; i < lines.length; i++) {
          const values = lines[i]?.split(',').map((v: any: any: any: any) => v.trim().replace(/"/g, ''));
          
          if (values.length >= Math.max(skuIndex + 1, refIndex + 1)) {
            const sku = values[skuIndex];
            const ref = values[refIndex];
            const imageName = imageNameIndex >= 0 ? values[imageNameIndex] : '';
            const productName = nameIndex >= 0 ? values[nameIndex] : '';
            
            if(sku && ref) {
              data.push({
                sku: sku.trim(),
                ref: ref.trim(),
                imageName: imageName.trim(),
                productName: productName.trim(),
                row: i + 1,
                originalData: values
              });
            }
          }
        }
        
        console.log(`✅ Parsed ${data.length} products from CSV`);
        
        resolve({
          headers,
          data,
          skuColumn: headers[skuIndex],
          refColumn: headers[refIndex],
          imageNameColumn: imageNameIndex >= 0 ? headers[imageNameIndex] : null,
          productNameColumn: nameIndex >= 0 ? headers[nameIndex] : null,
          totalRows: data.length
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
 * Advanced image matching specifically for Calligraph reference patterns
 * Matches images based on REF column first, then falls back to other strategies
 */
export const matchImagesWithCalligraphCSV = (csvData, imageFiles) => {
  const matches = [];
  const unmatched = {
    csvRows: [],
    imageFiles: [...imageFiles]
  };
  
  // Create reference-based image mapping
  const imageFileMap = new Map();
  const usedFiles = new Set();
  
  console.log('🔍 Processing image files for Calligraph reference matching...');
  
  imageFiles.forEach((file) => {
    const fileName = file.name.toLowerCase();
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    
    // Extract reference patterns - optimized for Calligraph naming
    let baseReference = '';
    let imageNumber = 1;
    
    // Pattern matching for Calligraph references
    const patterns = [
      // Pattern 1: Direct reference with number (7203C_1, 7203C_2)
      baseName.match(/^([a-zA-Z0-9]+[cC]?)_(\d+)$/),
      // Pattern 2: Direct reference without number (7203C)
      baseName.match(/^([a-zA-Z0-9]+[cC]?)$/),
      // Pattern 3: Reference with dash (7203C-1, 7203C-image)
      baseName.match(/^([a-zA-Z0-9]+[cC]?)[-_](.+)$/),
      // Pattern 4: Reference anywhere in filename
      baseName.match(/([a-zA-Z0-9]+[cC]?)/g)
    ];
    
    if(patterns[0]) {
      // 7203C_1 format
      baseReference
    } else if(patterns[1]) {
      // 7203C format
      baseReference
    } else if(patterns[2]) {
      // 7203C-something format
      baseReference
    } else if(patterns[3] && patterns[3].length > 0) {
      // Find the most likely reference (ending with C and having numbers)
      const likelyRef = patterns[3].find(ref => 
        ref.match(/\d+[cC]$/) || ref.match(/^[a-zA-Z0-9]+[cC]$/)
      );
      baseReference
    } else {
      // Fallback: use the whole basename
      baseReference
    }
    
    // Store with multiple key variations for flexible matching
    const keys = [
      baseReference,
      baseReference.toLowerCase(),
      fileName,
      baseName
    ];
    
    keys.forEach((key) => {
      if (!imageFileMap.has(key)) {
        imageFileMap.set(key, []);
      }
      imageFileMap.get(key).push({
        file,
        baseReference,
        imageNumber,
        originalName: fileName,
        extractedRef: baseReference
      });
    });
    
    console.log(`📁 Mapped: ${fileName} -> REF: ${baseReference}, #: ${imageNumber}`);
  });
  
  console.log('🔍 Matching CSV rows with images using REF column...');
  
  // Match CSV rows with images based on REF column
  csvData.data.forEach((row) => {
    const { sku, ref, imageName, productName } = row;
    const matchedImages = [];
    
    console.log(`🔍 Processing: SKU=${sku}, REF=${ref}, ImageName=${imageName}`);
    
    // PRIMARY STRATEGY: Match by REF column (most important for Calligraph)
    if(ref) {
      const refUpper = ref.toUpperCase();
      const refLower = ref.toLowerCase();
      
      // Look for exact reference matches
      const refMatches = [
        ...(imageFileMap.get(refUpper) || []),
        ...(imageFileMap.get(refLower) || []),
        ...(imageFileMap.get(ref) || [])
      ];
      
      // Remove duplicates based on file name
      const uniqueRefMatches = Array.from(new Map(refMatches.map((m: any: any: any: any) => [m.file.name, m])).values()
      );
      
      matchedImages.push(...uniqueRefMatches);
      
      if(uniqueRefMatches.length > 0) {
        console.log(`✅ Found ${uniqueRefMatches.length} images for REF ${ref}`);
      }
    }
    
    // SECONDARY STRATEGY: Match by image name if no ref matches
    if(matchedImages.length ===0 && imageName) {
      const imageNameLower = imageName.toLowerCase();
      
      // Try to find images that match the image name
      for (const [key, images] of imageFileMap.entries()) {
        if (key.includes(imageNameLower) || imageNameLower.includes(key)) {
          matchedImages.push(...images);
          console.log(`📋 Found ${images.length} images via image name matching`);
          break;
        }
      }
    }
    
    // TERTIARY STRATEGY: Fuzzy matching with product name
    if(matchedImages.length ===0 && productName) {
      const productWords = productName.toLowerCase()
        ?.split(/\s+/)
        .filter((w: any: any: any: any) => w.length > 4) // Only significant words
        .slice(0, 2); // Limit to first 2 words
      
      for (const [key, images] of imageFileMap.entries()) {
        if (productWords.some(word => key.toLowerCase().includes(word))) {
          matchedImages.push(...images);
          console.log(`📋 Found ${images.length} images via product name fuzzy matching`);
          break;
        }
      }
    }
    
    // Sort matched images by image number for consistent ordering
    const sortedMatches = matchedImages
      .filter((match: any: any: any: any) => !usedFiles.has(match.file.name)) // Only unused files
      .sort((a, b) => a.imageNumber - b.imageNumber);
    
    if(sortedMatches.length > 0) {
      sortedMatches.forEach((match, index) => {
        // Generate proper renamed filename using image name from CSV
        const baseImageName = imageName || ref || sku;
        const finalImageName = sortedMatches.length > 1 
          ? `${baseImageName}_${index + 1}` 
          : baseImageName;
        
        matches.push({
          sku: sku,
          ref: ref,
          imageName: imageName,
          productName: productName,
          file: match.file,
          csvRow: row.row,
          imageIndex: index,
          totalImages: sortedMatches.length,
          baseReference: match.baseReference,
          originalImageName: match.originalName,
          finalImageName: finalImageName,
          extractedRef: match.extractedRef,
          matchStrategy: ref && match.extractedRef ===ref.toUpperCase() ? 'ref' : 
                       imageName ? 'imageName' : 'fuzzy'
        });
        
        usedFiles.add(match.file.name);
        
        // Remove from unmatched
        const unmatchedIndex = unmatched.imageFiles.findIndex(f => f.name ===match.file.name);
        if(unmatchedIndex !== -1) {
          unmatched.imageFiles.splice(unmatchedIndex, 1);
        }
        
        console.log(`✅ MATCHED: ${match.file.name} -> ${finalImageName} (SKU: ${sku}, Strategy: ${matches[matches.length - 1].matchStrategy})`);
      });
    } else {
      unmatched.csvRows.push(row);
      console.log(`❌ NO MATCH: SKU=${sku}, REF=${ref}`);
    }
  });
  
  // Generate comprehensive statistics
  const stats = {
    totalCSVRows: csvData.data.length,
    totalImages: imageFiles.length,
    matched: matches.length,
    uniqueProducts: new Set(matches.map((m: any: any: any: any) => m.sku)).size,
    unmatchedCSV: unmatched.csvRows.length,
    unmatchedImages: unmatched.imageFiles.length,
    multipleImagesProducts: Object.values(matches.reduce((acc: any: any match: any: any: any: any) => {
        if (!acc[match.sku]) acc[match.sku] = 0;
        acc[match.sku]++;
        return acc;
      }, {})
    ).filter((count: any: any: any: any) => count > 1).length,
    averageImagesPerProduct: matches.length > 0 ? 
      (matches.length / new Set(matches.map((m: any: any: any: any) => m.sku)).size).toFixed(1) : 0,
    matchStrategies: {
      ref: matches.filter((m: any: any: any: any) => m.matchStrategy === 'ref').length,
      imageName: matches.filter((m: any: any: any: any) => m.matchStrategy === 'imageName').length,
      fuzzy: matches.filter((m: any: any: any: any) => m.matchStrategy === 'fuzzy').length
    }
  };
  
  console.log('📊 MATCHING COMPLETE:');
  console.log(`   Total matches: ${stats.matched}`);
  console.log(`   Unique products: ${stats.uniqueProducts}`);
  console.log(`   Multiple images products: ${stats.multipleImagesProducts}`);
  console.log(`   Match strategies: REF=${stats.matchStrategies.ref}, Name=${stats.matchStrategies.imageName}, Fuzzy=${stats.matchStrategies.fuzzy}`);
  
  return {
    matches,
    unmatched,
    stats
  };
};

/**
 * Professional bulk upload with Calligraph-specific processing
 */
export const bulkUploadCalligraphImages = async (matches, progressCallback, options = {}) => {
  const {
    processImages
    imageQuality
    targetSize
    batchSize
    delayBetweenBatches
  } = options;
  
  const results = [];
  let completed = 0;
  
  console.log(`🚀 Starting bulk upload of ${matches.length} images...`);
  
  // Group matches by SKU for batch processing
  const groupedMatches = matches.reduce((acc: any match: any: any: any: any) => {
    if (!acc[match.sku]) acc[match.sku] = [];
    acc[match.sku].push(match);
    return acc;
  }, {});
  
  const skus = Object.keys(groupedMatches);
  console.log(`📦 Processing ${skus.length} products in batches of ${batchSize}`);
  
  for(let i = 0; i < skus.length; i += batchSize) {
    const batch = skus.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map(async (sku) => {
      const skuMatches = groupedMatches[sku];
      const skuResults = [];
      
      console.log(`🔄 Processing SKU ${sku} with ${skuMatches.length} images`);
      
      for (const match of skuMatches) {
        try {
          if(progressCallback) {
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
          if(processImages) {
            try {
              processedFile = await processImage(match.file, {
                maxWidth: targetSize,
                maxHeight: targetSize,
                quality: imageQuality,
                format: 'jpeg'
              });
              
              console.log(`✅ Processed ${match.file.name}: ${(match.file.size / 1024 / 1024).toFixed(2)}MB → ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
            } catch(processError: any) {
              console.warn(`⚠️ Failed to process ${match.file.name}, using original:`, processError);
            }
          }
          
          // Generate final filename for Magento
          const fileExtension = processedFile.type?.split('/')[1] || 'jpg';
          const finalFileName = `${match.finalImageName}.${fileExtension}`;
          
          if(progressCallback) {
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
            label: match.productName || match.finalImageName,
            position: match.imageIndex,
            types: match.imageIndex ===0 ? ['image', 'small_image', 'thumbnail'] : ['image'],
            fileName: finalFileName
          });
          
          skuResults.push({ ...match,
            result: uploadResult,
            status: uploadResult.success ? 'success' : 'error',
            processedFileName: finalFileName,
            originalSize: match.file.size,
            processedSize: processedFile.size,
            compressionRatio: processImages ? 
              (((match.file.size - processedFile.size) / match.file.size) * 100).toFixed(1) : '0'
          });
          
          completed++;
          
          if(progressCallback) {
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
          
          console.log(`${uploadResult.success ? '✅' : '❌'} Upload ${uploadResult.success ? 'successful' : 'failed'}: ${finalFileName} -> SKU ${match.sku}`);
          
        } catch(error: any) {
          console.error(`💥 Error processing ${match.file.name}:`, error);
          skuResults.push({ ...match,
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
    
    console.log(`📦 Batch ${Math.floor(i / batchSize) + 1} completed`);
    
    // Delay between batches to prevent server overload
    if(i + batchSize < skus.length) {
      console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  console.log('🎉 Bulk upload completed!');
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
      label: imageData?.label || imageFile.name.replace(/\.[^/.]+$/, ""),
      position: imageData?.position || 0,
      disabled: false,
      types: imageData?.types || ['image'],
      content: {
        base64_encoded_data: base64Content,
        type: imageFile.type,
        name: imageData?.fileName || imageFile.name
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
  } catch(error: any) {
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
      const base64 = reader.result?.split(',')[1];
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
  if(file.size > maxSize) {
    return {
      valid: false,
      error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: ${maxSize / 1024 / 1024}MB`
    };
  }
  
  return { valid: true };
};

/**
 * Batch validate multiple files
 */
export const validateImageFiles = async(files) => {
  const results = [];
  
  for (const file of files) {
    const validation = validateImageFile(file);
    results.push({
      file,
      ...validation
    });
  }
  
  return {
    valid: results.filter((r: any: any: any: any) => r.valid),
    invalid: results.filter((r: any: any: any: any) => !r.valid),
    totalSize: results.reduce((sum: any: any r: any: any: any: any) => sum + r.file.size, 0)
  };
};

/**
 * Generate comprehensive processing statistics
 */
export const generateProcessingStats = (results) => {
  const stats = {
    total: results.length,
    successful: results.filter((r: any: any: any: any) => r.status === 'success').length,
    failed: results.filter((r: any: any: any: any) => r.status === 'error').length,
    totalOriginalSize: results.reduce((sum: any: any r: any: any: any: any) => sum + (r.originalSize || 0), 0),
    totalProcessedSize: results.reduce((sum: any: any r: any: any: any: any) => sum + (r.processedSize || 0), 0),
    uniqueProducts: new Set(results.map((r: any: any: any: any) => r.sku)).size,
    averageImagesPerProduct: 0,
    processingTime: 0,
    matchStrategies: {
      ref: results.filter((r: any: any: any: any) => r.matchStrategy === 'ref').length,
      imageName: results.filter((r: any: any: any: any) => r.matchStrategy === 'imageName').length,
      fuzzy: results.filter((r: any: any: any: any) => r.matchStrategy === 'fuzzy').length
    }
  };
  
  stats.averageImagesPerProduct = stats.uniqueProducts > 0 ? 
    (stats.total / stats.uniqueProducts).toFixed(1) : 0;
  
  stats.compressionRatio = stats.totalOriginalSize > 0 ? 
    ((stats.totalOriginalSize - stats.totalProcessedSize) / stats.totalOriginalSize * 100).toFixed(1) : 0;
  
  stats.successRate = stats.total > 0 ? 
    ((stats.successful / stats.total) * 100).toFixed(1) : 0;
  
  return stats;
};

export default {
  parseCalligraphCSV,
  matchImagesWithCalligraphCSV,
  bulkUploadCalligraphImages,
  validateImageFile,
  validateImageFiles,
  generateProcessingStats,
  processImage
};