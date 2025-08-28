/**
 * Optimized Media Upload Service
 * Enhanced with advanced matching, configurable settings, and professional features
 * Automatically detects and handles both Basic and Professional modes
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { toast } from 'react-toastify';
import mediaUploadService from './mediaUploadService';

/**
 * Default matching settings configuration
 */
export const DEFAULT_MATCHING_SETTINGS = {
  strategies: {
    exact: true,           // Exact filename matching
    normalized: true,      // Remove dashes, spaces, special chars
    partial: true,         // Match first N characters
    fuzzy: true,          // Similarity-based matching
    ref: true             // REF column matching (Professional mode)
  },
  
  thresholds: {
    partialLength: 30,     // Characters for partial matching
    fuzzyThreshold: 0.7,   // Similarity threshold (0-1)
    minKeyLength: 5        // Minimum key length for matching
  },
  
  fileHandling: {
    multipleImages: true,  // Support _1, _2, _3 numbering
    caseSensitive: false,  // Case-insensitive matching
    removeNumbers: false,  // Remove numbers for matching
    removeSpecialChars: true // Remove special characters
  }
};

/**
 * Optimized Media Upload Service Class
 * Extends basic functionality with advanced matching and CSV processing
 */
class OptimizedMediaUploadService extends mediaUploadService.constructor {
  constructor() {
    super();
    this.defaultSettings = DEFAULT_MATCHING_SETTINGS;
  }

  /**
   * Parse CSV file with mode detection
   * @param {File} file - CSV file to parse
   * @param {string} mode - Processing mode (basic/professional)
   * @returns {Promise<Object>} Parsed CSV data
   */
  async parseCSVFile(file, mode = 'basic') {
    if (!file) {
      throw new Error('No CSV file provided');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            throw new Error('CSV file is empty');
          }

          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            const row = { _index: index };
            
            headers.forEach((header, headerIndex) => {
              row[header] = values[headerIndex] || '';
            });
            
            return row;
          }).filter(row => Object.values(row).some(val => val !== ''));

          // Auto-detect mode based on headers
          const detectedMode = this.detectCSVMode(headers);
          const finalMode = mode === 'auto' ? detectedMode : mode;

          const result = {
            headers,
            data,
            totalRows: data.length,
            mode: finalMode,
            skuColumn: this.findColumn(headers, ['sku', 'reference', 'ref']),
            imageColumn: this.findColumn(headers, ['image', 'filename', 'file']),
            nameColumn: this.findColumn(headers, ['name', 'title', 'product_name'])
          };

          // Validate required columns
          if (!result.skuColumn) {
            throw new Error('No SKU/Reference column found in CSV');
          }

          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  }

  /**
   * Detect CSV processing mode based on headers
   * @param {Array<string>} headers - CSV headers
   * @returns {string} Detected mode
   */
  detectCSVMode(headers) {
    const lowerHeaders = headers.map(h => h.toLowerCase());
    
    if (lowerHeaders.some(h => h.includes('ref') && !h.includes('reference'))) {
      return 'professional';
    }
    
    return 'basic';
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
      const found = lowerHeaders.find(h => h.includes(name.toLowerCase()));
      if (found) {
        return headers[lowerHeaders.indexOf(found)];
      }
    }
    
    return headers[0] || null; // Fallback to first column
  }

  /**
   * Advanced image matching with CSV data
   * @param {Object} csvData - Parsed CSV data
   * @param {Array<File>} imageFiles - Array of image files
   * @param {Object} settings - Matching settings
   * @returns {Object} Matching results
   */
  matchImagesWithCSV(csvData, imageFiles, settings = this.defaultSettings) {
    const matches = [];
    const stats = {
      matched: 0,
      uniqueProducts: 0,
      unmatchedCSV: 0,
      unmatchedImages: 0,
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

    // Process each CSV row
    csvData.data.forEach(row => {
      const sku = row[csvData.skuColumn];
      if (!sku) return;

      const matchingImages = this.findMatchingImages(
        sku, 
        row, 
        imageFiles, 
        settings,
        processedImages
      );

      if (matchingImages.length > 0) {
        matchingImages.forEach((match, index) => {
          matches.push({
            sku,
            file: match.file,
            productName: row[csvData.nameColumn] || row.name || '',
            imageIndex: index,
            totalImages: matchingImages.length,
            strategy: match.strategy,
            confidence: match.confidence || 1.0
          });
          
          stats.matchStrategies[match.strategy]++;
          processedImages.add(match.file.name);
        });

        stats.matched += matchingImages.length;
        stats.uniqueProducts++;
      } else {
        stats.unmatchedCSV++;
        unmatchedCSVRows.push({
          sku,
          productName: row[csvData.nameColumn] || row.name || '',
          imageName: row[csvData.imageColumn] || 'Not specified'
        });
      }
    });

    // Calculate unmatched images
    const unmatchedImageFiles = imageFiles.filter(
      file => !processedImages.has(file.name)
    );
    stats.unmatchedImages = unmatchedImageFiles.length;

    return {
      matches,
      stats,
      unmatched: {
        csvRows: unmatchedCSVRows,
        imageFiles: unmatchedImageFiles
      }
    };
  }

  /**
   * Find matching images for a product
   * @param {string} sku - Product SKU
   * @param {Object} row - CSV row data
   * @param {Array<File>} imageFiles - Available image files
   * @param {Object} settings - Matching settings
   * @param {Set} processedImages - Already processed images
   * @returns {Array} Matching images with metadata
   */
  findMatchingImages(sku, row, imageFiles, settings, processedImages) {
    const matches = [];
    const normalizedSku = this.normalizeString(sku);

    for (const file of imageFiles) {
      if (processedImages.has(file.name)) continue;

      const fileName = file.name.toLowerCase();
      const baseName = fileName.split('.')[0];
      
      let match = null;

      // Strategy 1: Exact match
      if (settings.strategies.exact) {
        if (fileName.includes(sku.toLowerCase()) || 
            sku.toLowerCase().includes(baseName)) {
          match = { file, strategy: 'exact', confidence: 1.0 };
        }
      }

      // Strategy 2: Normalized match
      if (!match && settings.strategies.normalized) {
        const normalizedFileName = this.normalizeString(baseName);
        if (normalizedFileName.includes(normalizedSku) || 
            normalizedSku.includes(normalizedFileName)) {
          match = { file, strategy: 'normalized', confidence: 0.9 };
        }
      }

      // Strategy 3: Partial match
      if (!match && settings.strategies.partial) {
        const partialLength = Math.min(
          settings.thresholds.partialLength, 
          Math.min(normalizedSku.length, baseName.length)
        );
        
        if (partialLength >= settings.thresholds.minKeyLength) {
          const skuPartial = normalizedSku.substring(0, partialLength);
          const filePartial = this.normalizeString(baseName).substring(0, partialLength);
          
          if (skuPartial === filePartial) {
            match = { file, strategy: 'partial', confidence: 0.8 };
          }
        }
      }

      // Strategy 4: Fuzzy match
      if (!match && settings.strategies.fuzzy) {
        const similarity = this.calculateSimilarity(normalizedSku, this.normalizeString(baseName));
        if (similarity >= settings.thresholds.fuzzyThreshold) {
          match = { file, strategy: 'fuzzy', confidence: similarity };
        }
      }

      if (match) {
        matches.push(match);
        
        // Support multiple images per product
        if (!settings.fileHandling.multipleImages) {
          break;
        }
      }
    }

    return matches;
  }

  /**
   * Normalize string for matching
   * @param {string} str - String to normalize
   * @returns {string} Normalized string
   */
  normalizeString(str) {
    if (!str) return '';
    
    return str
      .toLowerCase()
      .replace(/[-_\s]/g, '') // Remove dashes, underscores, spaces
      .replace(/[^a-z0-9]/g, ''); // Remove special characters
  }

  /**
   * Calculate string similarity using Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity ratio (0-1)
   */
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

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
}

// Export singleton instance
const optimizedMediaUploadService = new OptimizedMediaUploadService();
export default optimizedMediaUploadService;