/**
 * Simple Media Upload Service - EXACT MATCHING FIX
 * Handles the exact mismatch between CSV image names and actual file names
 * 
 * @author Techno-ETL Team
 * @version 1.2.0 - SIMPLE EXACT MATCHING
 */

import magentoApi from './magentoApi';
import { toast } from 'react-toastify';

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
 * Upload single image for a product
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
 * SIMPLE CSV parsing that handles the Calligraph CSV structure
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        console.log('📄 SIMPLE: CSV file loaded, size:', csvText.length, 'characters');
        
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
        console.log('📋 SIMPLE: Headers found:', headers);
        
        const skuIndex = headers.findIndex(h => h === 'sku');
        const imageNameIndex = headers.findIndex(h => h === 'image name');
        
        console.log('🔍 SIMPLE Column Mapping:');
        console.log(`   SKU: ${skuIndex >= 0 ? `Column ${skuIndex}` : 'NOT FOUND'}`);
        console.log(`   Image Name: ${imageNameIndex >= 0 ? `Column ${imageNameIndex}` : 'NOT FOUND'}`);
        
        if (skuIndex === -1) {
          reject(new Error('CSV must contain a "sku" column'));
          return;
        }
        
        if (imageNameIndex === -1) {
          reject(new Error('CSV must contain an "image name" column'));
          return;
        }
        
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]);
            
            if (values.length >= Math.max(skuIndex + 1, imageNameIndex + 1)) {
              const sku = values[skuIndex] ? values[skuIndex].replace(/"/g, '').trim() : '';
              const imageName = values[imageNameIndex] ? values[imageNameIndex].replace(/"/g, '').trim() : '';
              
              if (sku && imageName) {
                data.push({
                  sku: sku,
                  imageName: imageName,
                  row: i + 1
                });
                
                if (data.length <= 5) {
                  console.log(`📝 SIMPLE Row ${i + 1}: SKU="${sku}", ImageName="${imageName}"`);
                }
              }
            }
          } catch (rowError) {
            console.warn(`⚠️ Error parsing row ${i + 1}:`, rowError.message);
          }
        }
        
        console.log(`✅ SIMPLE CSV Parsing Complete: ${data.length} products`);
        
        resolve({
          headers,
          data,
          skuColumn: headers[skuIndex],
          imageColumn: headers[imageNameIndex],
          totalRows: data.length
        });
      } catch (error) {
        console.error('💥 SIMPLE CSV parsing error:', error);
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading CSV file'));
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * SIMPLE but SMART image matching that handles the exact mismatch issue
 */
export const matchImagesWithCSV = (csvData, imageFiles) => {
  const matches = [];
  const unmatched = {
    csvRows: [],
    imageFiles: [...imageFiles]
  };
  
  console.log('🔍 SIMPLE: Starting smart image matching...');
  console.log(`📊 CSV products: ${csvData.data.length}, Image files: ${imageFiles.length}`);
  
  // Create smart image file mapping
  const imageFileMap = new Map();
  const usedFiles = new Set();
  
  imageFiles.forEach((file, index) => {
    const fileName = file.name.toLowerCase();
    const baseName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    
    console.log(`📁 Processing image ${index + 1}: ${fileName}`);
    
    // Extract base name and number for multiple image support
    let baseImageName = baseName;
    let imageNumber = 0;
    
    const numberMatch = baseName.match(/^(.+)_(\d+)$/);
    if (numberMatch) {
      baseImageName = numberMatch[1];
      imageNumber = parseInt(numberMatch[2]);
    }
    
    // Create multiple search keys for flexible matching
    const keys = [
      fileName,                                    // exact filename
      baseName,                                   // filename without extension
      baseImageName,                              // base name without number
      baseName.replace(/[-_\s]/g, ''),           // normalized
      baseImageName.replace(/[-_\s]/g, ''),      // base normalized
      // Additional fuzzy keys
      baseName.replace(/\d+/g, ''),              // remove all numbers
      baseName.replace(/[^a-z]/g, ''),           // only letters
      baseImageName.replace(/[^a-z]/g, '')       // base only letters
    ];
    
    keys.forEach(key => {
      if (key && key.length > 3) { // Only meaningful keys
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
      }
    });
    
    console.log(`   ✅ Mapped with ${keys.length} keys`);
  });
  
  console.log('🔍 SIMPLE: Matching CSV rows with images...');
  
  // Smart matching algorithm
  csvData.data.forEach((row, rowIndex) => {
    const { sku, imageName } = row;
    const matchedImages = [];
    
    console.log(`🔍 Processing CSV row ${rowIndex + 1}: SKU="${sku}", ImageName="${imageName}"`);
    
    // Create search variations for the CSV image name
    const imageNameLower = imageName.toLowerCase();
    const searchKeys = [
      imageName,                                  // exact
      imageNameLower,                            // lowercase
      imageNameLower.replace(/[-_\s]/g, ''),     // normalized
      imageNameLower.replace(/\d+/g, ''),        // no numbers
      imageNameLower.replace(/[^a-z]/g, ''),     // only letters
      // Partial matching
      imageNameLower.substring(0, 20),           // first 20 chars
      imageNameLower.substring(0, 30),           // first 30 chars
      imageNameLower.substring(0, 40)            // first 40 chars
    ];
    
    console.log(`   🔍 Searching with ${searchKeys.length} variations`);
    
    // Find matches using exact and fuzzy matching
    searchKeys.forEach(searchKey => {
      if (searchKey && searchKey.length > 5) {
        // Exact match
        const exactMatches = imageFileMap.get(searchKey) || [];
        exactMatches.forEach(imageInfo => {
          if (!matchedImages.find(m => m.file.name === imageInfo.file.name)) {
            matchedImages.push(imageInfo);
            console.log(`     ✅ EXACT match: ${imageInfo.fileName}`);
          }
        });
        
        // Fuzzy match - find images that contain this search key
        if (matchedImages.length === 0) {
          for (const [key, images] of imageFileMap.entries()) {
            if (key.includes(searchKey) || searchKey.includes(key)) {
              images.forEach(imageInfo => {
                if (!matchedImages.find(m => m.file.name === imageInfo.file.name)) {
                  matchedImages.push(imageInfo);
                  console.log(`     ✅ FUZZY match: ${imageInfo.fileName} (via ${key})`);
                }
              });
            }
          }
        }
      }
    });
    
    // Sort matched images by image number
    matchedImages.sort((a, b) => a.imageNumber - b.imageNumber);
    
    if (matchedImages.length > 0) {
      console.log(`   ✅ Found ${matchedImages.length} images for SKU ${sku}`);
      
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
            isMainImage: imageInfo.imageNumber === 0
          });
          
          usedFiles.add(imageInfo.file.name);
          
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
  
  console.log('📊 SIMPLE MATCHING COMPLETE:');
  console.log(`   Total matches: ${stats.matched}`);
  console.log(`   Unique products: ${stats.uniqueProducts}`);
  console.log(`   Multiple images products: ${stats.multipleImagesProducts}`);
  console.log(`   Unmatched CSV rows: ${stats.unmatchedCSV}`);
  console.log(`   Unmatched images: ${stats.unmatchedImages}`);
  
  return {
    matches,
    unmatched,
    stats
  };
};

/**
 * SIMPLE bulk upload
 */
export const bulkUploadImages = async (matches, progressCallback) => {
  const results = [];
  let completed = 0;
  
  console.log(`🚀 SIMPLE: Starting bulk upload of ${matches.length} images...`);
  
  // Group by SKU
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.sku]) acc[match.sku] = [];
    acc[match.sku].push(match);
    return acc;
  }, {});
  
  const skus = Object.keys(groupedMatches);
  console.log(`📦 Processing ${skus.length} products...`);
  
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
        
        console.log(`${result.success ? '✅' : '❌'} Upload ${result.success ? 'successful' : 'failed'}: ${match.file.name} -> SKU ${match.sku}`);
        
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
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🎉 SIMPLE bulk upload completed!');
  return results;
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  const maxSize = 8 * 1024 * 1024; // 8MB
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

export default {
  uploadProductImage,
  parseCSVFile,
  matchImagesWithCSV,
  bulkUploadImages,
  validateImageFile
};