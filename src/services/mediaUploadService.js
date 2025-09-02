/**
 * Consolidated Media Upload Service
 * Unified service with advanced matching capabilities, configurable settings, and intelligent CSV detection
 * Automatically uses all available matching strategies based on CSV structure
 * 
 * @author Techno-ETL Team
 * @version 3.0.0
 */

import { toast } from 'react-toastify';

/**
 * Enhanced matching settings configuration with strategy weights and advanced thresholds
 */
export const DEFAULT_MATCHING_SETTINGS = {
  strategies: {
    exact: true,           // Exact filename matching
    normalized: true,      // Remove dashes, spaces, special chars
    partial: true,         // Match first N characters
    fuzzy: true,          // Similarity-based matching
    ref: true             // REF column matching (auto-enabled when REF column detected)
  },
  
  // Strategy weights for confidence calculation (higher = more trusted)
  strategyWeights: {
    exact: 1.0,           // Highest confidence for exact matches
    normalized: 0.95,     // Very high confidence for normalized matches
    partial: 0.85,        // Good confidence for partial matches
    fuzzy: 0.8,           // Lower confidence for fuzzy matches
    ref: 0.9              // High confidence for REF column matches
  },
  
  thresholds: {
    partialLength: 30,     // Characters for partial matching
    fuzzyThreshold: 0.7,   // Base similarity threshold (0-1)
    strictFuzzyThreshold: 0.85, // Strict threshold for high-confidence fuzzy matches
    minKeyLength: 3,       // Minimum key length for matching (reduced for better coverage)
    maxEditDistance: 3,    // Maximum edit distance for fuzzy matching
    numberedPatternBonus: 0.1, // Confidence bonus for numbered pattern matches
    specialCharPenalty: 0.05,   // Confidence penalty for special character mismatches
    edgeCaseThreshold: 0.6,     // Lower threshold for edge cases with special chars
    unicodeNormalizationBonus: 0.05, // Bonus for unicode normalization matches
    lengthDifferenceThreshold: 0.3,   // Max length difference ratio for fuzzy matching
    commonPrefixBonus: 0.1,     // Bonus for matching common prefixes
    commonSuffixBonus: 0.05     // Bonus for matching common suffixes
  },
  
  fileHandling: {
    multipleImages: true,  // Support _1, _2, _3 numbering
    caseSensitive: false,  // Case-insensitive matching
    removeNumbers: false,  // Remove numbers for matching
    removeSpecialChars: true, // Remove special characters
    numberedPatterns: [
      '_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9', '_10',
      '-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10',
      '(1)', '(2)', '(3)', '(4)', '(5)', '(6)', '(7)', '(8)', '(9)', '(10)',
      ' 1', ' 2', ' 3', ' 4', ' 5', ' 6', ' 7', ' 8', ' 9', ' 10',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
    ], // Extended numbered patterns
    specialCharHandling: 'normalize', // 'normalize', 'preserve', or 'remove'
    unicodeNormalization: true,       // Enable unicode normalization
    accentInsensitive: true,          // Ignore accents and diacritics
    hyphenHandling: 'normalize',      // How to handle hyphens and dashes
    underscoreHandling: 'normalize'   // How to handle underscores
  },
  
  // Performance optimization settings
  performance: {
    maxCandidates: 50,     // Maximum candidates to evaluate per SKU
    enableCaching: true,   // Cache normalized strings
    batchSize: 100        // Process images in batches
  }
};

/**
 * Consolidated Media Upload Service Class
 * Provides complete functionality for media upload operations with advanced matching
 */
class MediaUploadService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    this.defaultSettings = DEFAULT_MATCHING_SETTINGS;
    
    // Performance optimization: string normalization cache
    this.normalizationCache = new Map();
    this.similarityCache = new Map();
  }

  /**
   * Validate image file
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validateImageFile(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Supported: JPG, PNG, GIF, WebP' 
      };
    }

    if (file.size > this.maxFileSize) {
      return { 
        valid: false, 
        error: `File too large. Maximum size: ${(this.maxFileSize / 1024 / 1024).toFixed(0)}MB` 
      };
    }

    return { valid: true };
  }

  /**
   * Upload product images
   * @param {string} sku - Product SKU
   * @param {File[]} files - Array of files to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array>} Upload results
   */
  async uploadProductImages(sku, files, onProgress) {
    if (!sku || !files || files.length === 0) {
      throw new Error('SKU and files are required');
    }

    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Validate file first
        const validation = this.validateImageFile(file);
        if (!validation.valid) {
          results.push({
            success: false,
            file: file,
            error: validation.error
          });
          continue;
        }

        // Update progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            sku,
            fileName: file.name,
            status: 'uploading'
          });
        }

        // Simulate upload process (replace with actual API call)
        await this.simulateUpload(file);

        results.push({
          success: true,
          file: file,
          message: `Successfully uploaded ${file.name}`,
          url: URL.createObjectURL(file) // Temporary URL for preview
        });

      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        results.push({
          success: false,
          file: file,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Simulate upload delay
   * @param {File} file - File being uploaded
   * @returns {Promise}
   */
  async simulateUpload(file) {
    // Simulate network delay based on file size
    const delay = Math.min(1000 + (file.size / 1024 / 1024) * 500, 3000);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Parse CSV file with unified advanced detection and comprehensive error handling
   * @param {File} file - CSV file to parse
   * @param {string} mode - Processing mode (auto for unified advanced detection)
   * @returns {Promise<Object>} Parsed CSV data
   */
  async parseCSVFile(file, mode = 'auto') {
    if (!file) {
      throw new Error('No CSV file provided');
    }

    // Enhanced validation before parsing
    if (file.size === 0) {
      throw new Error('CSV file is empty or corrupted');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error(`CSV file too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 5MB`);
    }

    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
      throw new Error(`Invalid file type: ${file.type}. Please upload a CSV file`);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          
          if (!text || text.trim().length === 0) {
            throw new Error('CSV file contains no readable content');
          }

          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            throw new Error('CSV file contains no data rows');
          }

          if (lines.length === 1) {
            throw new Error('CSV file contains only headers, no data rows found');
          }

          // Enhanced header parsing with better error handling
          let headers;
          try {
            headers = this.parseCSVLine(lines[0]);
            
            if (headers.length === 0) {
              throw new Error('No column headers found in CSV');
            }

            if (headers.some(h => h.length === 0)) {
              throw new Error('CSV contains empty column headers');
            }

            // Check for duplicate headers
            const duplicateHeaders = headers.filter((header, index) => 
              headers.indexOf(header) !== index
            );
            if (duplicateHeaders.length > 0) {
              console.warn(`Duplicate headers found: ${duplicateHeaders.join(', ')}`);
            }

          } catch (headerError) {
            throw new Error(`Failed to parse CSV headers: ${headerError.message}`);
          }

          // Enhanced data parsing with validation
          const data = [];
          const invalidRows = [];
          
          for (let i = 1; i < lines.length; i++) {
            try {
              const line = lines[i];
              const values = this.parseCSVLine(line);
              
              // Skip completely empty rows
              if (values.every(v => v === '')) {
                continue;
              }

              // Validate row structure
              if (values.length !== headers.length) {
                invalidRows.push({
                  rowNumber: i + 1,
                  expected: headers.length,
                  actual: values.length,
                  content: line.substring(0, 100) + (line.length > 100 ? '...' : '')
                });
                continue;
              }

              const row = { _index: i - 1 };
              headers.forEach((header, headerIndex) => {
                row[header] = values[headerIndex] || '';
              });
              
              data.push(row);
            } catch (rowError) {
              invalidRows.push({
                rowNumber: i + 1,
                error: rowError.message,
                content: lines[i].substring(0, 100) + (lines[i].length > 100 ? '...' : '')
              });
            }
          }

          // Report invalid rows as warnings but continue processing
          if (invalidRows.length > 0) {
            console.warn(`${invalidRows.length} invalid rows found and skipped:`, invalidRows.slice(0, 5));
          }

          if (data.length === 0) {
            throw new Error('No valid data rows found in CSV file');
          }

          // Unified advanced detection - no mode switching
          const result = {
            headers,
            data,
            totalRows: data.length,
            invalidRows: invalidRows.length,
            skuColumn: this.findColumn(headers, ['sku', 'reference', 'ref', 'product_id', 'id']),
            imageColumn: this.findColumn(headers, ['image', 'filename', 'file', 'image_name', 'photo']),
            nameColumn: this.findColumn(headers, ['name', 'title', 'product_name', 'description']),
            refColumn: this.findColumn(headers, ['ref']) // Always detect REF column
          };

          // Enhanced column validation
          if (!result.skuColumn) {
            const availableColumns = headers.join(', ');
            throw new Error(
              `No SKU/Reference column found. Available columns: ${availableColumns}. ` +
              `Expected one of: SKU, Reference, REF, Product_ID, ID`
            );
          }

          // Validate SKU column data
          const skuColumnIndex = headers.indexOf(result.skuColumn);
          const emptySKUs = data.filter(row => !row[result.skuColumn] || row[result.skuColumn].trim() === '').length;
          
          if (emptySKUs === data.length) {
            throw new Error(`All rows have empty ${result.skuColumn} values`);
          }

          if (emptySKUs > 0) {
            console.warn(`${emptySKUs} rows have empty ${result.skuColumn} values and will be skipped`);
          }

          // Add metadata for validation
          result.metadata = {
            fileSize: file.size,
            fileName: file.name,
            parsedAt: new Date().toISOString(),
            emptySKUs,
            invalidRows: invalidRows.length,
            duplicateHeaders: headers.filter((h, i) => headers.indexOf(h) !== i).length
          };

          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read CSV file. The file may be corrupted or inaccessible'));
      
      // Add timeout for large files
      const timeout = setTimeout(() => {
        reader.abort();
        reject(new Error('CSV file reading timed out. The file may be too large or corrupted'));
      }, 30000); // 30 second timeout

      reader.onloadend = () => clearTimeout(timeout);
      
      try {
        reader.readAsText(file);
      } catch (readError) {
        clearTimeout(timeout);
        reject(new Error(`Failed to start reading CSV file: ${readError.message}`));
      }
    });
  }

  /**
   * Parse a single CSV line handling quoted fields properly
   * @param {string} line - CSV line to parse
   * @returns {Array<string>} Parsed values
   */
  parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = i + 1 < line.length ? line[i + 1] : '';
      
      if (char === '"' && !insideQuotes && currentValue === '') {
        // Starting a quoted field
        insideQuotes = true;
      } else if (char === '"' && insideQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else if (char === '"' && insideQuotes) {
        // Ending a quoted field
        insideQuotes = false;
      } else if (char === ',' && !insideQuotes) {
        // End of field
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        // Regular character
        currentValue += char;
      }
      
      i++;
    }
    
    // Add the last value
    values.push(currentValue.trim());
    return values;
  }

  /**
   * Find column by possible names
   * @param {Array<string>} headers - Available headers
   * @param {Array<string>} possibleNames - Possible column names
   * @returns {string|null} Found column name
   */
  findColumn(headers, possibleNames) {
    const lowerHeaders = headers.map(h => h.toLowerCase());
    
    for (const name of possibleNames) {
      const found = lowerHeaders.find(h => {
        // For REF column, match exact 'ref' but not 'reference'
        if (name === 'ref') {
          return h === 'ref' || h.startsWith('ref_') || h.endsWith('_ref');
        }
        return h.includes(name.toLowerCase());
      });
      if (found) {
        return headers[lowerHeaders.indexOf(found)];
      }
    }
    
    // Only fallback to first column for SKU/main columns, not for optional ones like REF
    if (possibleNames.includes('sku') || possibleNames.includes('reference')) {
      return headers[0] || null;
    }
    
    return null;
  }

  /**
   * Advanced image matching with CSV data and comprehensive error handling
   * @param {Object} csvData - Parsed CSV data
   * @param {Array<File>} imageFiles - Array of image files
   * @param {Object} settings - Matching settings
   * @returns {Object} Matching results
   */
  matchImagesWithCSV(csvData, imageFiles, settings = this.defaultSettings) {
    // Input validation with detailed error messages
    if (!csvData) {
      throw new Error('CSV data is required for matching');
    }

    if (!csvData.data || !Array.isArray(csvData.data)) {
      throw new Error('Invalid CSV data structure: missing or invalid data array');
    }

    if (csvData.data.length === 0) {
      throw new Error('CSV data contains no rows to process');
    }

    if (!csvData.skuColumn) {
      throw new Error('CSV data missing SKU column information');
    }

    if (!imageFiles || !Array.isArray(imageFiles)) {
      throw new Error('Image files array is required for matching');
    }

    if (imageFiles.length === 0) {
      throw new Error('No image files provided for matching');
    }

    // Validate image files
    const invalidImages = imageFiles.filter(file => !file || !file.name);
    if (invalidImages.length > 0) {
      throw new Error(`${invalidImages.length} invalid image files detected`);
    }

    try {
      const matches = [];
      const stats = {
        matched: 0,
        uniqueProducts: 0,
        unmatchedCSV: 0,
        unmatchedImages: 0,
        multipleImagesProducts: 0,
        averageSimilarity: 0,
        matchStrategies: {
          exact: 0,
          normalized: 0,
          partial: 0,
          fuzzy: 0,
          ref: 0
        }
      };

      const unmatchedCSVRows = [];
      const processedImages = new Set();
      const processingErrors = [];

      // Process each CSV row with error handling
      csvData.data.forEach((row, rowIndex) => {
        try {
          const sku = row[csvData.skuColumn];
          
          // Skip rows with empty SKUs but log them
          if (!sku || sku.trim() === '') {
            processingErrors.push({
              type: 'EMPTY_SKU',
              rowIndex: rowIndex + 1,
              message: 'Row has empty SKU value'
            });
            return;
          }

          const matchingImages = this.findMatchingImages(
            sku, 
            row, 
            imageFiles, 
            settings,
            processedImages,
            csvData
          );

          if (matchingImages.length > 0) {
            matchingImages.forEach((match) => {
              // Validate match structure
              if (!match.file || !match.strategy || match.confidence === undefined) {
                processingErrors.push({
                  type: 'INVALID_MATCH',
                  sku,
                  message: 'Match object missing required properties'
                });
                return;
              }

              matches.push({
                sku,
                file: match.file,
                productName: row[csvData.nameColumn] || row.name || '',
                imageIndex: match.imageIndex || 0,
                totalImagesForSku: match.totalImagesForSku || 1,
                isMainImage: match.isMainImage || false,
                matchStrategy: match.strategy,
                similarity: match.confidence,
                confidence: match.confidence || 1.0
              });
              
              stats.matchStrategies[match.strategy] = (stats.matchStrategies[match.strategy] || 0) + 1;
              processedImages.add(match.file.name);
            });

            stats.matched += matchingImages.length;
            stats.uniqueProducts++;
            
            // Track products with multiple images
            if (matchingImages.length > 1) {
              stats.multipleImagesProducts++;
            }
          } else {
            stats.unmatchedCSV++;
            unmatchedCSVRows.push({
              sku,
              productName: row[csvData.nameColumn] || row.name || '',
              imageName: row[csvData.imageColumn] || 'Not specified',
              rowIndex: rowIndex + 1
            });
          }
        } catch (rowError) {
          processingErrors.push({
            type: 'ROW_PROCESSING_ERROR',
            rowIndex: rowIndex + 1,
            sku: row[csvData.skuColumn] || 'Unknown',
            message: rowError.message
          });
        }
      });

      // Calculate unmatched images
      const unmatchedImageFiles = imageFiles.filter(
        file => !processedImages.has(file.name)
      );
      stats.unmatchedImages = unmatchedImageFiles.length;

      // Calculate average similarity with error handling
      if (matches.length > 0) {
        try {
          const validSimilarities = matches
            .map(match => match.similarity)
            .filter(sim => typeof sim === 'number' && !isNaN(sim));
          
          if (validSimilarities.length > 0) {
            const totalSimilarity = validSimilarities.reduce((sum, sim) => sum + sim, 0);
            stats.averageSimilarity = Math.round((totalSimilarity / validSimilarities.length) * 100) / 100;
          }
        } catch (similarityError) {
          console.warn('Error calculating average similarity:', similarityError);
          stats.averageSimilarity = 0;
        }
      }

      // Log processing errors as warnings
      if (processingErrors.length > 0) {
        console.warn(`${processingErrors.length} processing errors occurred:`, processingErrors.slice(0, 10));
      }

      const result = {
        matches,
        stats,
        unmatched: {
          csvRows: unmatchedCSVRows,
          imageFiles: unmatchedImageFiles
        },
        processingErrors,
        metadata: {
          processedAt: new Date().toISOString(),
          totalCSVRows: csvData.data.length,
          totalImageFiles: imageFiles.length,
          processingErrorCount: processingErrors.length,
          matchingSettings: settings
        }
      };

      // Validate final results
      if (matches.length === 0 && unmatchedCSVRows.length === csvData.data.length) {
        console.warn('No matches found. This might indicate a naming convention mismatch.');
      }

      return result;

    } catch (error) {
      // Enhanced error context
      throw new Error(`Matching process failed: ${error.message}. CSV rows: ${csvData.data.length}, Images: ${imageFiles.length}`);
    }
  }  /*
*
   * Find matching images for a product - FIXED to find ALL matches instead of just one
   * @param {string} sku - Product SKU
   * @param {Object} row - CSV row data
   * @param {Array<File>} imageFiles - Available image files
   * @param {Object} settings - Matching settings
   * @param {Set} processedImages - Already processed images
   * @param {Object} csvData - CSV metadata including column names
   * @returns {Array} Matching images with metadata
   */
  findMatchingImages(sku, row, imageFiles, settings, processedImages, csvData) {
    const matches = [];
    const normalizedSku = this.normalizeString(sku);

    // Process ALL image files to find ALL matches - REMOVED break statement
    for (const file of imageFiles) {
      if (processedImages.has(file.name)) continue;

      const fileName = file.name.toLowerCase();
      const baseName = fileName.split('.')[0];
      
      // Remove numbered suffixes for better matching (_1, _2, _3, etc.)
      const baseNameWithoutNumbers = baseName.replace(/_\d+$/, '');
      
      let match = null;

      // Strategy 1: Exact match (including numbered variants)
      if (settings.strategies.exact) {
        if (fileName.includes(sku.toLowerCase()) || 
            sku.toLowerCase().includes(baseName) ||
            sku.toLowerCase().includes(baseNameWithoutNumbers)) {
          match = { file, strategy: 'exact', confidence: 1.0 };
        }
      }

      // Strategy 2: Normalized match (including numbered variants)
      if (!match && settings.strategies.normalized) {
        const normalizedFileName = this.normalizeString(baseName);
        const normalizedFileNameWithoutNumbers = this.normalizeString(baseNameWithoutNumbers);
        
        if (normalizedFileName.includes(normalizedSku) || 
            normalizedSku.includes(normalizedFileName) ||
            normalizedFileNameWithoutNumbers.includes(normalizedSku) ||
            normalizedSku.includes(normalizedFileNameWithoutNumbers)) {
          match = { file, strategy: 'normalized', confidence: 0.9 };
        }
      }

      // Strategy 3: Partial match (including numbered variants)
      if (!match && settings.strategies.partial) {
        const partialLength = Math.min(
          settings.thresholds.partialLength, 
          Math.min(normalizedSku.length, Math.max(baseName.length, baseNameWithoutNumbers.length))
        );
        
        if (partialLength >= settings.thresholds.minKeyLength) {
          const skuPartial = normalizedSku.substring(0, partialLength);
          const filePartial = this.normalizeString(baseName).substring(0, partialLength);
          const filePartialWithoutNumbers = this.normalizeString(baseNameWithoutNumbers).substring(0, partialLength);
          
          if (skuPartial === filePartial || skuPartial === filePartialWithoutNumbers) {
            match = { file, strategy: 'partial', confidence: 0.8 };
          }
        }
      }

      // Strategy 4: Fuzzy match (including numbered variants)
      if (!match && settings.strategies.fuzzy) {
        const similarity1 = this.calculateSimilarity(normalizedSku, this.normalizeString(baseName));
        const similarity2 = this.calculateSimilarity(normalizedSku, this.normalizeString(baseNameWithoutNumbers));
        const maxSimilarity = Math.max(similarity1, similarity2);
        
        if (maxSimilarity >= settings.thresholds.fuzzyThreshold) {
          match = { file, strategy: 'fuzzy', confidence: maxSimilarity };
        }
      }

      // Strategy 5: REF column match (auto-enabled when REF column exists)
      if (!match && settings.strategies.ref && csvData.refColumn && row[csvData.refColumn]) {
        const refValue = row[csvData.refColumn];
        const normalizedRef = this.normalizeString(refValue);
        const refSimilarity1 = this.calculateSimilarity(normalizedRef, this.normalizeString(baseName));
        const refSimilarity2 = this.calculateSimilarity(normalizedRef, this.normalizeString(baseNameWithoutNumbers));
        const maxRefSimilarity = Math.max(refSimilarity1, refSimilarity2);
        
        if (maxRefSimilarity >= settings.thresholds.fuzzyThreshold) {
          match = { file, strategy: 'ref', confidence: maxRefSimilarity };
        }
      }

      // Add match if found - CRITICAL FIX: Continue to find ALL matches, no break statement
      if (match) {
        matches.push(match);
        // REMOVED: break; - This was the core bug causing only one match to be found
      }
    }

    // Sort matches by confidence (highest first) and add metadata
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Add image indexing for multiple images per SKU
    matches.forEach((match, index) => {
      match.imageIndex = index;
      match.totalImagesForSku = matches.length;
      match.isMainImage = index === 0; // First (highest confidence) is main image
    });

    return matches;
  }

  /**
   * Enhanced normalize string for matching with edge case handling
   * @param {string} str - String to normalize
   * @param {Object} options - Normalization options
   * @returns {string} Normalized string
   */
  normalizeString(str, options = {}) {
    if (!str) return '';
    
    // Check cache first for performance
    const cacheKey = `${str}_${JSON.stringify(options)}`;
    if (this.normalizationCache.has(cacheKey)) {
      return this.normalizationCache.get(cacheKey);
    }
    
    let normalized = str;
    
    // Unicode normalization for accents and special characters
    if (options.unicodeNormalization !== false) {
      normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    // Convert to lowercase
    normalized = normalized.toLowerCase();
    
    // Handle special character patterns
    if (options.specialCharHandling !== 'preserve') {
      // Replace common special character combinations
      normalized = normalized
        .replace(/&amp;/g, 'and')
        .replace(/&/g, 'and')
        .replace(/\+/g, 'plus')
        .replace(/%/g, 'percent')
        .replace(/@/g, 'at')
        .replace(/\$/g, 'dollar')
        .replace(/€/g, 'euro')
        .replace(/£/g, 'pound');
    }
    
    // Handle hyphens and dashes
    if (options.hyphenHandling === 'normalize') {
      normalized = normalized.replace(/[-–—]/g, '');
    } else if (options.hyphenHandling === 'space') {
      normalized = normalized.replace(/[-–—]/g, ' ');
    }
    
    // Handle underscores
    if (options.underscoreHandling === 'normalize') {
      normalized = normalized.replace(/_/g, '');
    } else if (options.underscoreHandling === 'space') {
      normalized = normalized.replace(/_/g, ' ');
    }
    
    // Remove or normalize spaces
    normalized = normalized.replace(/\s+/g, '');
    
    // Remove remaining special characters but preserve alphanumeric
    if (options.specialCharHandling === 'normalize') {
      normalized = normalized.replace(/[^a-z0-9]/g, '');
    }
    
    // Cache the result
    this.normalizationCache.set(cacheKey, normalized);
    
    return normalized;
  }

  /**
   * Extract numbered pattern from filename
   * @param {string} filename - Original filename
   * @returns {Object} Pattern info with base name and number
   */
  extractNumberedPattern(filename) {
    const baseName = filename.split('.')[0];
    const patterns = this.defaultSettings.fileHandling.numberedPatterns;
    
    for (const pattern of patterns) {
      if (baseName.endsWith(pattern)) {
        const baseWithoutNumber = baseName.slice(0, -pattern.length);
        const number = pattern.replace(/[^0-9]/g, '');
        return {
          baseName: baseWithoutNumber,
          number: parseInt(number) || 1,
          pattern: pattern,
          hasNumberedPattern: true
        };
      }
    }
    
    return {
      baseName: baseName,
      number: 0,
      pattern: '',
      hasNumberedPattern: false
    };
  }

  /**
   * Enhanced similarity calculation with multiple algorithms and edge case handling
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @param {Object} options - Calculation options
   * @returns {number} Enhanced similarity ratio (0-1)
   */
  calculateSimilarity(str1, str2, options = {}) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    // Check cache first for performance
    const cacheKey = `${str1}_${str2}_${JSON.stringify(options)}`;
    if (this.similarityCache.has(cacheKey)) {
      return this.similarityCache.get(cacheKey);
    }

    const len1 = str1.length;
    const len2 = str2.length;
    
    // Handle edge cases
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    // Check length difference threshold
    const lengthDiff = Math.abs(len1 - len2) / Math.max(len1, len2);
    if (lengthDiff > this.defaultSettings.thresholds.lengthDifferenceThreshold) {
      // Still calculate but apply penalty
      const penalty = lengthDiff * 0.3;
      const baseSimilarity = this.levenshteinSimilarity(str1, str2);
      const result = Math.max(0, baseSimilarity - penalty);
      this.similarityCache.set(cacheKey, result);
      return result;
    }

    // Calculate base Levenshtein similarity
    let similarity = this.levenshteinSimilarity(str1, str2);
    
    // Apply bonuses for common patterns
    similarity += this.calculatePatternBonuses(str1, str2);
    
    // Apply Jaro-Winkler similarity for better short string matching
    const jaroWinkler = this.jaroWinklerSimilarity(str1, str2);
    
    // Combine similarities with weights
    const combinedSimilarity = (similarity * 0.7) + (jaroWinkler * 0.3);
    
    // Ensure result is between 0 and 1
    const result = Math.min(1, Math.max(0, combinedSimilarity));
    
    // Cache the result
    this.similarityCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Calculate Levenshtein distance similarity
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity ratio (0-1)
   */
  levenshteinSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    // Create matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  /**
   * Calculate Jaro-Winkler similarity for better short string matching
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Jaro-Winkler similarity (0-1)
   */
  jaroWinklerSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0 || len2 === 0) return 0;
    
    const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
    if (matchWindow < 0) return 0;
    
    const str1Matches = new Array(len1).fill(false);
    const str2Matches = new Array(len2).fill(false);
    
    let matches = 0;
    let transpositions = 0;
    
    // Find matches
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, len2);
      
      for (let j = start; j < end; j++) {
        if (str2Matches[j] || str1[i] !== str2[j]) continue;
        str1Matches[i] = true;
        str2Matches[j] = true;
        matches++;
        break;
      }
    }
    
    if (matches === 0) return 0;
    
    // Find transpositions
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!str1Matches[i]) continue;
      while (!str2Matches[k]) k++;
      if (str1[i] !== str2[k]) transpositions++;
      k++;
    }
    
    const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
    
    // Calculate common prefix length (up to 4 characters)
    let prefix = 0;
    for (let i = 0; i < Math.min(len1, len2, 4); i++) {
      if (str1[i] === str2[i]) prefix++;
      else break;
    }
    
    return jaro + (0.1 * prefix * (1 - jaro));
  }

  /**
   * Calculate pattern-based bonuses for similarity
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Bonus value (0-0.3)
   */
  calculatePatternBonuses(str1, str2) {
    let bonus = 0;
    
    // Common prefix bonus
    let prefixLength = 0;
    const minLen = Math.min(str1.length, str2.length);
    for (let i = 0; i < minLen; i++) {
      if (str1[i] === str2[i]) prefixLength++;
      else break;
    }
    if (prefixLength > 0) {
      bonus += this.defaultSettings.thresholds.commonPrefixBonus * (prefixLength / minLen);
    }
    
    // Common suffix bonus
    let suffixLength = 0;
    for (let i = 1; i <= minLen; i++) {
      if (str1[str1.length - i] === str2[str2.length - i]) suffixLength++;
      else break;
    }
    if (suffixLength > 0) {
      bonus += this.defaultSettings.thresholds.commonSuffixBonus * (suffixLength / minLen);
    }
    
    // Substring containment bonus
    if (str1.includes(str2) || str2.includes(str1)) {
      bonus += 0.1;
    }
    
    return Math.min(0.3, bonus); // Cap bonus at 0.3
  }

  /**
   * Bulk upload images for matched products
   * @param {Array} matches - Array of matched images
   * @param {Function} onProgress - Progress callback
   * @param {Object} settings - Upload settings
   * @returns {Promise<Array>} Upload results
   */
  async bulkUploadImages(matches, onProgress, settings = this.defaultSettings) {
    const results = [];
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      
      try {
        // Update progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: matches.length,
            sku: match.sku,
            fileName: match.file.name,
            status: 'uploading',
            stage: `Uploading ${match.imageIndex + 1}/${match.totalImagesForSku} for ${match.sku}`
          });
        }

        // Use the consolidated upload method
        const uploadResult = await this.uploadProductImages(
          match.sku, 
          [match.file], 
          null
        );

        if (uploadResult[0]?.success) {
          results.push({
            sku: match.sku,
            file: match.file,
            status: 'success',
            message: `Successfully uploaded ${match.file.name}`,
            imageIndex: match.imageIndex,
            isMainImage: match.isMainImage,
            strategy: match.matchStrategy,
            confidence: match.similarity
          });
        } else {
          results.push({
            sku: match.sku,
            file: match.file,
            status: 'error',
            error: uploadResult[0]?.error || 'Upload failed',
            imageIndex: match.imageIndex,
            strategy: match.matchStrategy
          });
        }

      } catch (error) {
        console.error(`Bulk upload failed for ${match.file.name}:`, error);
        results.push({
          sku: match.sku,
          file: match.file,
          status: 'error',
          error: error.message,
          imageIndex: match.imageIndex,
          strategy: match.matchStrategy
        });
      }
    }

    return results;
  }

  /**
   * Get supported file types
   * @returns {Array<string>} Supported MIME types
   */
  getSupportedTypes() {
    return [...this.allowedTypes];
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
const mediaUploadService = new MediaUploadService();
export default mediaUploadService;