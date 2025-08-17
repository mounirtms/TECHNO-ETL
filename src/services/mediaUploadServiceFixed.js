/**
 * Media Upload Service - FIXED VERSION
 * Handles product image uploads and bulk media operations
 * FIXED: Now supports multiple images per SKU (image_1, image_2, etc.)
 * 
 * @author Techno-ETL Team
 * @version 1.1.0 - FIXED FOR MULTIPLE IMAGES PER SKU
 */

import magentoApi from './magentoApi';
import { toast } from 'react-toastify';

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

      if (width > maxWidth || height > maxHeight) {
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
      const base64 = reader.result.split(',')[1];
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
    if (imageFile.size > 3 * 1024 * 1024) {
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
      label: imageData.label || imageFile.name.replace(/\.[^/.]+$/, ""),
      position: imageData.position || 0,
      disabled: imageData.disabled || false,
      types: imageData.types || ['image'],
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
 * Upload multiple images for a product
 */
export const uploadProductImages = async (sku, imageFiles, progressCallback) => {
  const results = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    
    if (progressCallback) {
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
      types: i === 0 ? ['image', 'small_image', 'thumbnail'] : ['image']
    });
    
    results.push(result);
    
    // Small delay to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
};

/**
 * FIXED: Enhanced CSV parsing that handles the Calligraph CSV structure properly
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        console.log('📄 FIXED: CSV file loaded, size:', csvText.length, 'characters');
        
        // Professional CSV parsing function that handles quoted fields properly
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
                // Escaped quote (double quote)
                current += '"';
                i += 2;
                continue;
              } else {
                // Toggle quote state
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              // Field separator outside quotes
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
            i++;
          }
          
          // Add the last field
          result.push(current.trim());
          return result;
        };
        
        // Split into lines, handling different line endings
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }
        
        console.log(`📊 FIXED: CSV has ${lines.length} lines (including header)`);
        
        // Parse headers with proper CSV parsing
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, '').trim());
        console.log('📋 FIXED: Headers found:', headers);
        
        // Find required columns - enhanced detection
        const skuIndex = headers.findIndex(h => h === 'sku');
        const imageNameIndex = headers.findIndex(h => h === 'image name');
        
        console.log('🔍 FIXED Column Mapping:');
        console.log(`   SKU: ${skuIndex >= 0 ? `Column ${skuIndex} (${headers[skuIndex]})` : 'NOT FOUND'}`);
        console.log(`   Image Name: ${imageNameIndex >= 0 ? `Column ${imageNameIndex} (${headers[imageNameIndex]})` : 'NOT FOUND'}`);
        
        if (skuIndex === -1) {
          reject(new Error('CSV must contain a "sku" column'));
          return;
        }
        
        if (imageNameIndex === -1) {
          reject(new Error('CSV must contain an "image name" column'));
          return;
        }
        
        const data = [];
        let processedRows = 0;
        let skippedRows = 0;
        
        // Parse data rows with proper CSV handling
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]);
            
            // Ensure we have enough columns
            if (values.length >= Math.max(skuIndex + 1, imageNameIndex + 1)) {
              const sku = values[skuIndex] ? values[skuIndex].replace(/"/g, '').trim() : '';
              const imageName = values[imageNameIndex] ? values[imageNameIndex].replace(/"/g, '').trim() : '';
              
              // Only add rows with both SKU and image name
              if (sku && imageName) {
                data.push({
                  sku: sku,
                  imageName: imageName,
                  row: i + 1,
                  originalData: values
                });
                processedRows++;
                
                // Log first few entries for debugging
                if (processedRows <= 5) {
                  console.log(`📝 FIXED Row ${i + 1}: SKU="${sku}", ImageName="${imageName}"`);
                }
              } else {
                skippedRows++;
                if (skippedRows <= 3) {
                  console.log(`⚠️ Skipped row ${i + 1}: SKU="${sku}", ImageName="${imageName}" (missing data)`);
                }
              }
            } else {
              skippedRows++;
              console.log(`⚠️ Skipped row ${i + 1}: insufficient columns (${values.length} vs required ${Math.max(skuIndex + 1, imageNameIndex + 1)})`);
            }
          } catch (rowError) {
            skippedRows++;
            console.warn(`⚠️ Error parsing row ${i + 1}:`, rowError.message);
          }
        }
        
        console.log(`✅ FIXED CSV Parsing Complete:`);
        console.log(`   📊 Total lines: ${lines.length}`);
        console.log(`   ✅ Processed rows: ${processedRows}`);
        console.log(`   ⚠️ Skipped rows: ${skippedRows}`);
        console.log(`   📋 Valid products: ${data.length}`);
        
        if (data.length === 0) {
          reject(new Error('No valid product data found in CSV. Please check that SKU and image name columns contain data.'));
          return;
        }
        
        resolve({
          headers,
          data,
          skuColumn: headers[skuIndex],
          imageColumn: headers[imageNameIndex],
          totalRows: data.length,
          processedRows,
          skippedRows
        });
      } catch (error) {
        console.error('💥 FIXED CSV parsing error:', error);
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading CSV file'));
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * FIXED: Enhanced image matching that supports multiple images per SKU
 * Now handles: image_name.jpg, image_name_1.jpg, image_name_2.jpg, etc.
 */
export const matchImagesWithCSV = (csvData, imageFiles) => {
  const matches = [];
  const unmatched = {
    csvRows: [],
    imageFiles: [...imageFiles]
  };
  
  console.log('🔍 FIXED: Starting enhanced image matching...');
  console.log(`📊 CSV products: ${csvData.data.length}, Image files: ${imageFiles.length}`);
  
  // Create enhanced image file mapping that handles multiple images per base name
  const imageFileMap = new Map();
  const usedFiles = new Set();
  
  imageFiles.forEach((file, index) => {
    const fileName = file.name.toLowerCase();
    const baseName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    
    console.log(`📁 Processing image ${index + 1}: ${fileName}`);
    
    // Extract base name and number for multiple image support
    let baseImageName = baseName;
    let imageNumber = 0; // 0 for base image, 1+ for numbered images
    
    // Check if this is a numbered image (ends with _1, _2, etc.)
    const numberMatch = baseName.match(/^(.+)_(\d+)$/);
    if (numberMatch) {
      baseImageName = numberMatch[1];
      imageNumber = parseInt(numberMatch[2]);
      console.log(`   📋 Numbered image detected: base="${baseImageName}", number=${imageNumber}`);
    } else {
      console.log(`   📋 Base image detected: "${baseImageName}"`);
    }
    
    // Store with multiple key variations for flexible matching
    const keys = [
      fileName,                                    // exact filename
      baseName,                                   // filename without extension
      baseImageName,                              // base name without number
      baseName.replace(/[-_\s]/g, ''),           // normalized without separators
      baseImageName.replace(/[-_\s]/g, '')       // base normalized
    ];
    
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
    
    console.log(`   ✅ Mapped with keys: ${keys.join(', ')}`);
  });
  
  console.log('🔍 FIXED: Matching CSV rows with images...');
  
  // Match CSV rows with images - enhanced to handle multiple images per SKU
  csvData.data.forEach((row, rowIndex) => {
    const { sku, imageName } = row;
    const matchedImages = [];
    
    console.log(`🔍 Processing CSV row ${rowIndex + 1}: SKU="${sku}", ImageName="${imageName}"`);
    
    // Create variations of the image name for matching
    const imageNameLower = imageName.toLowerCase();
    const imageNameWithoutExt = imageNameLower.replace(/\.[^/.]+$/, '');
    const normalizedImageName = imageNameWithoutExt.replace(/[-_\s]/g, '');
    
    // Look for all possible matches
    const searchKeys = [
      imageName,                    // exact match
      imageNameLower,              // lowercase
      imageNameWithoutExt,         // without extension
      normalizedImageName          // normalized
    ];
    
    console.log(`   🔍 Searching with keys: ${searchKeys.join(', ')}`);
    
    // Find all matching images for this CSV row
    searchKeys.forEach(key => {
      const foundImages = imageFileMap.get(key) || [];
      foundImages.forEach(imageInfo => {
        // Avoid duplicates
        if (!matchedImages.find(m => m.file.name === imageInfo.file.name)) {
          matchedImages.push(imageInfo);
        }
      });
    });
    
    // Sort matched images by image number for consistent ordering
    matchedImages.sort((a, b) => a.imageNumber - b.imageNumber);
    
    if (matchedImages.length > 0) {
      console.log(`   ✅ Found ${matchedImages.length} images: ${matchedImages.map(m => m.fileName).join(', ')}`);
      
      // Create matches for each found image
      matchedImages.forEach((imageInfo, index) => {
        if (!usedFiles.has(imageInfo.file.name)) {
          matches.push({
            sku: sku,
            imageName: imageName,
            file: imageInfo.file,
            csvRow: row.row,
            imageIndex: index,
            totalImagesForSku: matchedImages.length,
            baseImageName: imageInfo.baseImageName,
            imageNumber: imageInfo.imageNumber,
            isMainImage: imageInfo.imageNumber === 0 // First image (no number) is main
          });
          
          usedFiles.add(imageInfo.file.name);
          
          // Remove from unmatched
          const unmatchedIndex = unmatched.imageFiles.findIndex(f => f.name === imageInfo.file.name);
          if (unmatchedIndex !== -1) {
            unmatched.imageFiles.splice(unmatchedIndex, 1);
          }
          
          console.log(`     ✅ MATCHED: ${imageInfo.fileName} -> SKU ${sku} (${index + 1}/${matchedImages.length})`);
        }
      });
    } else {
      unmatched.csvRows.push(row);
      console.log(`   ❌ NO MATCH: SKU="${sku}", ImageName="${imageName}"`);
    }
  });
  
  // Generate enhanced statistics
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
      (matches.length / new Set(matches.map(m => m.sku)).size).toFixed(1) : 0
  };
  
  console.log('📊 FIXED MATCHING COMPLETE:');
  console.log(`   Total matches: ${stats.matched}`);
  console.log(`   Unique products: ${stats.uniqueProducts}`);
  console.log(`   Multiple images products: ${stats.multipleImagesProducts}`);
  console.log(`   Average images per product: ${stats.averageImagesPerProduct}`);
  console.log(`   Unmatched CSV rows: ${stats.unmatchedCSV}`);
  console.log(`   Unmatched images: ${stats.unmatchedImages}`);
  
  return {
    matches,
    unmatched,
    stats
  };
};

/**
 * FIXED: Enhanced bulk upload that handles multiple images per SKU properly
 */
export const bulkUploadImages = async (matches, progressCallback) => {
  const results = [];
  let completed = 0;
  
  console.log(`🚀 FIXED: Starting bulk upload of ${matches.length} images...`);
  
  // Group matches by SKU for proper handling of multiple images per product
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.sku]) acc[match.sku] = [];
    acc[match.sku].push(match);
    return acc;
  }, {});
  
  const skus = Object.keys(groupedMatches);
  console.log(`📦 Processing ${skus.length} products with multiple images...`);
  
  for (const sku of skus) {
    const skuMatches = groupedMatches[sku].sort((a, b) => a.imageNumber - b.imageNumber);
    
    console.log(`🔄 Processing SKU ${sku} with ${skuMatches.length} images`);
    
    for (let i = 0; i < skuMatches.length; i++) {
      const match = skuMatches[i];
      
      try {
        if (progressCallback) {
          progressCallback({
            current: completed + 1,
            total: matches.length,
            sku: match.sku,
            fileName: match.file.name,
            status: 'uploading'
          });
        }
        
        // Determine image types based on position
        const imageTypes = i === 0 ? ['image', 'small_image', 'thumbnail'] : ['image'];
        
        const result = await uploadProductImage(match.sku, match.file, {
          label: match.imageName.replace(/\.[^/.]+$/, ""),
          position: i,
          types: imageTypes
        });
        
        results.push({
          ...match,
          result,
          status: result.success ? 'success' : 'error'
        });
        
        completed++;
        
        if (progressCallback) {
          progressCallback({
            current: completed,
            total: matches.length,
            sku: match.sku,
            fileName: match.file.name,
            status: result.success ? 'success' : 'error',
            message: result.message
          });
        }
        
        console.log(`${result.success ? '✅' : '❌'} Upload ${result.success ? 'successful' : 'failed'}: ${match.file.name} -> SKU ${match.sku} (${i + 1}/${skuMatches.length})`);
        
        // Delay between uploads to prevent server overload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`💥 Error uploading ${match.file.name}:`, error);
        results.push({
          ...match,
          result: {
            success: false,
            error: error.message
          },
          status: 'error'
        });
        
        completed++;
      }
    }
    
    // Longer delay between different SKUs
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🎉 FIXED bulk upload completed!');
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

  if (file.size > maxSize) {
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