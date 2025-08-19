/**
 * Optimized Media Upload Service
 * Unified service for both Basic and Professional upload modes
 * Advanced matching with configurable settings and conditions
 * 
 * @author Techno-ETL Team
 * @version 2.0.0 - OPTIMIZED UNIFIED SERVICE
 */

import magentoApi from './magentoApi';
import { toast } from 'react-toastify';

/**
 * Default matching settings
 */
export const DEFAULT_MATCHING_SETTINGS = {
  // Matching strategies (in order of priority)
  strategies: {
    exact: true,           // Exact filename matching
    normalized: true,      // Remove dashes, spaces, special chars
    partial: true,         // Match first N characters
    fuzzy: true,          // Similarity-based matching
    ref: true             // REF column matching (Professional mode)
  },
  
  // Matching thresholds
  thresholds: {
    partialLength: 30,     // Characters for partial matching
    fuzzyThreshold: 0.7,   // Similarity threshold (0-1)
    minKeyLength: 5        // Minimum key length for matching
  },
  
  // File handling
  fileHandling: {
    multipleImages: true,  // Support _1, _2, _3 numbering
    caseSensitive: false,  // Case-insensitive matching
    removeNumbers: false,  // Remove numbers for matching
    removeSpecialChars: true // Remove special characters
  },
  
  // Upload settings
  upload: {
    batchSize: 3,         // Images per batch
    delayBetweenBatches: 2000, // ms delay between batches
    delayBetweenImages: 1000,  // ms delay between images
    processImages: true,   // Enable image processing
    imageQuality: 0.9,    // Image compression quality
    targetSize: 1200      // Target image size (px)
  }
};

/**
 * Professional CSV parsing with enhanced error handling
 */
export const parseCSVFile = (file, mode = 'basic') => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        console.log(`📄 OPTIMIZED (${mode.toUpperCase()}): CSV file loaded, size:`, csvText.length, 'characters');
        
        // Professional CSV parsing function
        const parseCSVLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          let i = 0;
          
          while (i < line.length) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                current += '"';
                i += 2;
                continue;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
            i++;
          }
          
          result.push(current.trim());
          return result;
        };
        
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }
        
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, '').trim());
        console.log(`📋 OPTIMIZED (${mode.toUpperCase()}): Headers found:`, headers);
        
        // Column detection based on mode
        const skuIndex = headers.findIndex(h => h === 'sku');
        const imageNameIndex = headers.findIndex(h => h === 'image name');
        const refIndex = mode === 'professional' ? headers.findIndex(h => h === 'ref') : -1;
        const nameIndex = mode === 'professional' ? headers.findIndex(h => h === 'name') : -1;
        
        console.log(`🔍 OPTIMIZED (${mode.toUpperCase()}) Column Mapping:`);
        console.log(`   SKU: ${skuIndex >= 0 ? `Column ${skuIndex}` : 'NOT FOUND'}`);
        console.log(`   Image Name: ${imageNameIndex >= 0 ? `Column ${imageNameIndex}` : 'NOT FOUND'}`);
        if (mode === 'professional') {
          console.log(`   REF: ${refIndex >= 0 ? `Column ${refIndex}` : 'NOT FOUND'}`);
          console.log(`   Product Name: ${nameIndex >= 0 ? `Column ${nameIndex}` : 'NOT FOUND'}`);
        }
        
        // Validation
        if (skuIndex === -1) {
          reject(new Error('CSV must contain a "sku" column'));
          return;
        }
        
        if (imageNameIndex === -1) {
          reject(new Error('CSV must contain an "image name" column'));
          return;
        }
        
        if (mode === 'professional' && refIndex === -1) {
          reject(new Error('Professional mode requires a "ref" column'));
          return;
        }
        
        const data = [];
        let processedRows = 0;
        let skippedRows = 0;
        
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]);
            
            const requiredColumns = mode === 'professional' 
              ? Math.max(skuIndex + 1, imageNameIndex + 1, refIndex + 1)
              : Math.max(skuIndex + 1, imageNameIndex + 1);
            
            if (values.length >= requiredColumns) {
              const sku = values[skuIndex] ? values[skuIndex].replace(/"/g, '').trim() : '';
              const imageName = values[imageNameIndex] ? values[imageNameIndex].replace(/"/g, '').trim() : '';
              const ref = mode === 'professional' && refIndex >= 0 && values[refIndex] ? 
                values[refIndex].replace(/"/g, '').trim() : '';
              const productName = mode === 'professional' && nameIndex >= 0 && values[nameIndex] ? 
                values[nameIndex].replace(/"/g, '').trim() : '';
              
              if (sku && imageName) {
                const rowData = {
                  sku: sku,
                  imageName: imageName,
                  row: i + 1,
                  originalData: values
                };
                
                if (mode === 'professional') {
                  rowData.ref = ref;
                  rowData.productName = productName;
                }
                
                data.push(rowData);
                processedRows++;
                
                if (processedRows <= 5) {
                  const logData = mode === 'professional' 
                    ? `SKU="${sku}", REF="${ref}", ImageName="${imageName}"`
                    : `SKU="${sku}", ImageName="${imageName}"`;
                  console.log(`📝 OPTIMIZED Row ${i + 1}: ${logData}`);
                }
              } else {
                skippedRows++;
              }
            } else {
              skippedRows++;
            }
          } catch (rowError) {
            skippedRows++;
            console.warn(`⚠️ Error parsing row ${i + 1}:`, rowError.message);
          }
        }
        
        console.log(`✅ OPTIMIZED (${mode.toUpperCase()}) CSV Parsing Complete:`);
        console.log(`   📊 Total lines: ${lines.length}`);
        console.log(`   ✅ Processed rows: ${processedRows}`);
        console.log(`   ⚠️ Skipped rows: ${skippedRows}`);
        console.log(`   📋 Valid products: ${data.length}`);
        
        if (data.length === 0) {
          reject(new Error('No valid product data found in CSV'));
          return;
        }
        
        const result = {
          headers,
          data,
          skuColumn: headers[skuIndex],
          imageColumn: headers[imageNameIndex],
          totalRows: data.length,
          processedRows,
          skippedRows,
          mode
        };
        
        if (mode === 'professional') {
          result.refColumn = refIndex >= 0 ? headers[refIndex] : null;
          result.productNameColumn = nameIndex >= 0 ? headers[nameIndex] : null;
        }
        
        resolve(result);
      } catch (error) {
        console.error(`💥 OPTIMIZED (${mode.toUpperCase()}) CSV parsing error:`, error);
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading CSV file'));
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * Calculate string similarity (Levenshtein distance based)
 */
const calculateSimilarity = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
};

/**
 * Generate search keys for matching
 */
const generateSearchKeys = (text, settings = DEFAULT_MATCHING_SETTINGS) => {
  if (!text) return [];
  
  const keys = [];
  const textLower = settings.fileHandling.caseSensitive ? text : text.toLowerCase();
  
  // Original text
  keys.push(textLower);
  
  // Normalized (remove special characters)
  if (settings.fileHandling.removeSpecialChars) {
    keys.push(textLower.replace(/[-_\s\.]/g, ''));
  }
  
  // Remove numbers
  if (settings.fileHandling.removeNumbers) {
    keys.push(textLower.replace(/\d+/g, ''));
  }
  
  // Only letters
  keys.push(textLower.replace(/[^a-z]/g, ''));
  
  // Partial keys
  if (settings.strategies.partial) {
    const partialLength = settings.thresholds.partialLength;
    if (textLower.length > partialLength) {
      keys.push(textLower.substring(0, partialLength));
      keys.push(textLower.substring(0, partialLength - 10));
    }
  }
  
  // Remove extension
  const withoutExt = textLower.replace(/\.[^/.]+$/, '');
  if (withoutExt !== textLower) {
    keys.push(withoutExt);
  }
  
  // Filter out short keys
  return keys.filter(key => key && key.length >= settings.thresholds.minKeyLength);
};

/**
 * Advanced image matching with configurable settings
 */
export const matchImagesWithCSV = (csvData, imageFiles, settings = DEFAULT_MATCHING_SETTINGS) => {
  const matches = [];
  const unmatched = {
    csvRows: [],
    imageFiles: [...imageFiles]
  };
  
  console.log(`🔍 OPTIMIZED (${csvData.mode?.toUpperCase() || 'BASIC'}): Starting advanced matching...`);
  console.log(`📊 CSV products: ${csvData.data.length}, Image files: ${imageFiles.length}`);
  console.log(`⚙️ Settings:`, settings);
  
  // Build image file mapping
  const imageFileMap = new Map();
  const usedFiles = new Set();
  
  imageFiles.forEach((file, index) => {
    const fileName = file.name.toLowerCase();
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    
    // Extract base name and number for multiple image support
    let baseImageName = baseName;
    let imageNumber = 0;
    
    if (settings.fileHandling.multipleImages) {
      const numberMatch = baseName.match(/^(.+)_(\d+)$/);
      if (numberMatch) {
        baseImageName = numberMatch[1];
        imageNumber = parseInt(numberMatch[2]);
      }
    }
    
    // Generate search keys
    const keys = [
      ...generateSearchKeys(fileName, settings),
      ...generateSearchKeys(baseName, settings),
      ...generateSearchKeys(baseImageName, settings)
    ];
    
    // Store in map
    keys.forEach(key => {
      if (!imageFileMap.has(key)) {
        imageFileMap.set(key, []);
      }
      imageFileMap.get(key).push({
        file,
        fileName,
        baseName,
        baseImageName,
        imageNumber,
        originalIndex: index
      });
    });
    
    if (index < 5) {
      console.log(`📁 Image ${index + 1}: ${fileName} -> ${keys.length} search keys`);
    }
  });
  
  // Match CSV rows with images
  csvData.data.forEach((row, rowIndex) => {
    const { sku, imageName, ref, productName } = row;
    const matchedImages = [];
    
    console.log(`🔍 Processing CSV row ${rowIndex + 1}: SKU="${sku}"`);
    
    // Strategy 1: REF-based matching (Professional mode)
    if (csvData.mode === 'professional' && settings.strategies.ref && ref) {
      const refKeys = generateSearchKeys(ref, settings);
      refKeys.forEach(refKey => {
        const refMatches = imageFileMap.get(refKey) || [];
        refMatches.forEach(imageInfo => {
          if (!matchedImages.find(m => m.file.name === imageInfo.file.name)) {
            matchedImages.push({ ...imageInfo, matchStrategy: 'ref' });
            console.log(`     ✅ REF match: ${imageInfo.fileName} (via ${refKey})`);
          }
        });
      });
    }
    
    // Strategy 2: Image name matching
    if (matchedImages.length === 0 && settings.strategies.exact && imageName) {
      const imageKeys = generateSearchKeys(imageName, settings);
      
      // Exact matching
      imageKeys.forEach(imageKey => {
        const exactMatches = imageFileMap.get(imageKey) || [];
        exactMatches.forEach(imageInfo => {
          if (!matchedImages.find(m => m.file.name === imageInfo.file.name)) {
            matchedImages.push({ ...imageInfo, matchStrategy: 'exact' });
            console.log(`     ✅ EXACT match: ${imageInfo.fileName} (via ${imageKey})`);
          }
        });
      });
      
      // Fuzzy matching
      if (matchedImages.length === 0 && settings.strategies.fuzzy) {
        const fuzzyThreshold = settings.thresholds.fuzzyThreshold;
        
        for (const [key, images] of imageFileMap.entries()) {
          const similarity = calculateSimilarity(imageName.toLowerCase(), key);
          if (similarity >= fuzzyThreshold) {
            images.forEach(imageInfo => {
              if (!matchedImages.find(m => m.file.name === imageInfo.file.name)) {
                matchedImages.push({ ...imageInfo, matchStrategy: 'fuzzy', similarity });
                console.log(`     ✅ FUZZY match: ${imageInfo.fileName} (similarity: ${similarity.toFixed(2)})`);
              }
            });
          }
        }
      }
    }
    
    // Strategy 3: Product name matching (Professional mode fallback)
    if (matchedImages.length === 0 && csvData.mode === 'professional' && productName) {
      const productKeys = generateSearchKeys(productName, settings);
      productKeys.forEach(productKey => {
        const productMatches = imageFileMap.get(productKey) || [];
        productMatches.forEach(imageInfo => {
          if (!matchedImages.find(m => m.file.name === imageInfo.file.name)) {
            matchedImages.push({ ...imageInfo, matchStrategy: 'product' });
            console.log(`     ✅ PRODUCT match: ${imageInfo.fileName} (via ${productKey})`);
          }
        });
      });
    }
    
    // Sort and process matches
    matchedImages.sort((a, b) => a.imageNumber - b.imageNumber);
    
    if (matchedImages.length > 0) {
      console.log(`   ✅ Found ${matchedImages.length} images for SKU ${sku}`);
      
      matchedImages.forEach((imageInfo, index) => {
        if (!usedFiles.has(imageInfo.file.name)) {
          matches.push({
            sku: sku,
            imageName: imageName,
            ref: ref || '',
            productName: productName || '',
            file: imageInfo.file,
            csvRow: row.row,
            imageIndex: index,
            totalImagesForSku: matchedImages.length,
            baseImageName: imageInfo.baseImageName,
            imageNumber: imageInfo.imageNumber,
            isMainImage: imageInfo.imageNumber === 0,
            matchStrategy: imageInfo.matchStrategy,
            similarity: imageInfo.similarity || 1.0
          });
          
          usedFiles.add(imageInfo.file.name);
          
          const unmatchedIndex = unmatched.imageFiles.findIndex(f => f.name === imageInfo.file.name);
          if (unmatchedIndex !== -1) {
            unmatched.imageFiles.splice(unmatchedIndex, 1);
          }
        }
      });
    } else {
      unmatched.csvRows.push(row);
      console.log(`   ❌ NO MATCH: SKU="${sku}"`);
    }
  });
  
  // Generate comprehensive statistics
  const stats = {
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
    ).filter(count => count > 1).length,
    averageImagesPerProduct: matches.length > 0 ? 
      (matches.length / new Set(matches.map(m => m.sku)).size).toFixed(1) : 0,
    matchStrategies: {
      ref: matches.filter(m => m.matchStrategy === 'ref').length,
      exact: matches.filter(m => m.matchStrategy === 'exact').length,
      fuzzy: matches.filter(m => m.matchStrategy === 'fuzzy').length,
      product: matches.filter(m => m.matchStrategy === 'product').length
    },
    averageSimilarity: matches.length > 0 ? 
      (matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length).toFixed(3) : 0
  };
  
  console.log(`📊 OPTIMIZED (${csvData.mode?.toUpperCase() || 'BASIC'}) MATCHING COMPLETE:`);
  console.log(`   Total matches: ${stats.matched}`);
  console.log(`   Unique products: ${stats.uniqueProducts}`);
  console.log(`   Match strategies: REF=${stats.matchStrategies.ref}, EXACT=${stats.matchStrategies.exact}, FUZZY=${stats.matchStrategies.fuzzy}, PRODUCT=${stats.matchStrategies.product}`);
  console.log(`   Average similarity: ${stats.averageSimilarity}`);
  
  return {
    matches,
    unmatched,
    stats,
    settings
  };
};

/**
 * Professional image processing
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
      let { width, height } = img;
      const aspectRatio = width / height;

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

      canvas.width = maxWidth;
      canvas.height = maxHeight;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, maxWidth, maxHeight);

      const x = (maxWidth - width) / 2;
      const y = (maxHeight - height) / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
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
 * Upload single image
 */
export const uploadProductImage = async (sku, imageFile, imageData = {}) => {
  try {
    const base64Content = await fileToBase64(imageFile);

    const entry = {
      media_type: 'image',
      label: imageData.label || imageFile.name.replace(/\.[^/.]+$/, ""),
      position: imageData.position || 0,
      disabled: imageData.disabled || false,
      types: imageData.types || ['image'],
      content: {
        base64_encoded_data: base64Content,
        type: imageFile.type,
        name: imageFile.name
      },
      ...imageData
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
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to upload image for ${sku}: ${error.message}`
    };
  }
};

/**
 * Optimized bulk upload with advanced settings
 */
export const bulkUploadImages = async (matches, progressCallback, settings = DEFAULT_MATCHING_SETTINGS) => {
  const results = [];
  let completed = 0;
  
  console.log(`🚀 OPTIMIZED: Starting bulk upload of ${matches.length} images...`);
  console.log(`⚙️ Upload settings:`, settings.upload);
  
  // Group matches by SKU
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.sku]) acc[match.sku] = [];
    acc[match.sku].push(match);
    return acc;
  }, {});
  
  const skus = Object.keys(groupedMatches);
  console.log(`📦 Processing ${skus.length} products in batches of ${settings.upload.batchSize}`);
  
  // Process in batches
  for (let i = 0; i < skus.length; i += settings.upload.batchSize) {
    const batch = skus.slice(i, i + settings.upload.batchSize);
    
    const batchPromises = batch.map(async (sku) => {
      const skuMatches = groupedMatches[sku].sort((a, b) => a.imageNumber - b.imageNumber);
      const skuResults = [];
      
      console.log(`🔄 Processing SKU ${sku} with ${skuMatches.length} images`);
      
      for (let j = 0; j < skuMatches.length; j++) {
        const match = skuMatches[j];
        
        try {
          if (progressCallback) {
            progressCallback({
              current: completed + 1,
              total: matches.length,
              sku: match.sku,
              fileName: match.file.name,
              status: 'processing',
              stage: settings.upload.processImages ? 'Processing image...' : 'Uploading...'
            });
          }
          
          let processedFile = match.file;
          
          // Process image if enabled
          if (settings.upload.processImages) {
            try {
              processedFile = await processImage(match.file, {
                maxWidth: settings.upload.targetSize,
                maxHeight: settings.upload.targetSize,
                quality: settings.upload.imageQuality,
                format: 'jpeg'
              });
              
              console.log(`✅ Processed ${match.file.name}: ${(match.file.size / 1024 / 1024).toFixed(2)}MB → ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
            } catch (processError) {
              console.warn(`⚠️ Failed to process ${match.file.name}, using original:`, processError);
            }
          }
          
          // Generate final filename
          const fileExtension = processedFile.type.split('/')[1] || 'jpg';
          const finalFileName = `${match.imageName || match.baseImageName}.${fileExtension}`;
          
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
            label: match.productName || match.imageName || match.baseImageName,
            position: j,
            types: j === 0 ? ['image', 'small_image', 'thumbnail'] : ['image'],
            fileName: finalFileName
          });
          
          skuResults.push({
            ...match,
            result: uploadResult,
            status: uploadResult.success ? 'success' : 'error',
            processedFileName: finalFileName,
            originalSize: match.file.size,
            processedSize: processedFile.size,
            compressionRatio: settings.upload.processImages ? 
              (((match.file.size - processedFile.size) / match.file.size) * 100).toFixed(1) : '0'
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
          
          console.log(`${uploadResult.success ? '✅' : '❌'} Upload ${uploadResult.success ? 'successful' : 'failed'}: ${finalFileName} -> SKU ${match.sku}`);
          
          // Delay between images
          if (j < skuMatches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, settings.upload.delayBetweenImages));
          }
          
        } catch (error) {
          console.error(`💥 Error processing ${match.file.name}:`, error);
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
    
    console.log(`📦 Batch ${Math.floor(i / settings.upload.batchSize) + 1} completed`);
    
    // Delay between batches
    if (i + settings.upload.batchSize < skus.length) {
      console.log(`⏳ Waiting ${settings.upload.delayBetweenBatches}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, settings.upload.delayBetweenBatches));
    }
  }
  
  console.log('🎉 OPTIMIZED bulk upload completed!');
  return results;
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${maxSize / 1024 / 1024}MB`
    };
  }

  return { valid: true };
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
    matchStrategies: {
      ref: results.filter(r => r.matchStrategy === 'ref').length,
      exact: results.filter(r => r.matchStrategy === 'exact').length,
      fuzzy: results.filter(r => r.matchStrategy === 'fuzzy').length,
      product: results.filter(r => r.matchStrategy === 'product').length
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
  parseCSVFile,
  matchImagesWithCSV,
  bulkUploadImages,
  uploadProductImage,
  validateImageFile,
  generateProcessingStats,
  processImage,
  DEFAULT_MATCHING_SETTINGS
};