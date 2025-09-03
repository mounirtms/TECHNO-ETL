/**
 * Bulk Upload Validation Service
 * Comprehensive validation for CSV files, images, and upload processes
 * Provides detailed error reporting with actionable suggestions
 */

class BulkUploadValidationService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedCSVTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    this.maxCSVSize = 5 * 1024 * 1024; // 5MB for CSV
    this.maxTotalImages = 1000; // Maximum number of images
    this.maxCSVRows = 10000; // Maximum CSV rows
  }

  /**
   * Validate CSV file structure and content
   * @param {File} file - CSV file to validate
   * @param {string} content - CSV content (optional, will read if not provided)
   * @returns {Promise<Object>} Validation result with detailed errors
   */
  async validateCSVFile(file, content = null) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      metadata: {},
    };

    try {
      // Basic file validation
      if (!file) {
        result.valid = false;
        result.errors.push({
          type: 'FILE_MISSING',
          message: 'No CSV file provided',
          suggestion: 'Please select a CSV file to upload',
        });

        return result;
      }

      // File type validation
      if (!this.allowedCSVTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
        result.valid = false;
        result.errors.push({
          type: 'INVALID_FILE_TYPE',
          message: `Invalid file type: ${file.type}`,
          suggestion: 'Please upload a CSV file (.csv extension)',
        });
      }

      // File size validation
      if (file.size > this.maxCSVSize) {
        result.valid = false;
        result.errors.push({
          type: 'FILE_TOO_LARGE',
          message: `CSV file too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          suggestion: `Maximum CSV file size is ${(this.maxCSVSize / 1024 / 1024).toFixed(0)}MB`,
        });
      }

      // Empty file check
      if (file.size === 0) {
        result.valid = false;
        result.errors.push({
          type: 'EMPTY_FILE',
          message: 'CSV file is empty',
          suggestion: 'Please upload a CSV file with product data',
        });

        return result;
      }

      // Read and parse content if not provided
      if (!content) {
        content = await this.readFileContent(file);
      }

      // Content validation
      const contentValidation = this.validateCSVContent(content);

      result.errors.push(...contentValidation.errors);
      result.warnings.push(...contentValidation.warnings);
      result.suggestions.push(...contentValidation.suggestions);
      result.metadata = { ...result.metadata, ...contentValidation.metadata };

      if (contentValidation.errors.length > 0) {
        result.valid = false;
      }

    } catch (error) {
      result.valid = false;
      result.errors.push({
        type: 'VALIDATION_ERROR',
        message: `CSV validation failed: ${error.message}`,
        suggestion: 'Check that the file is a valid CSV and not corrupted',
      });
    }

    return result;
  }

  /**
   * Validate CSV content structure and data
   * @param {string} content - CSV content
   * @returns {Object} Content validation result
   */
  validateCSVContent(content) {
    const result = {
      errors: [],
      warnings: [],
      suggestions: [],
      metadata: {},
    };

    try {
      const lines = content.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        result.errors.push({
          type: 'EMPTY_CONTENT',
          message: 'CSV file contains no data',
          suggestion: 'Ensure the CSV file has headers and data rows',
        });

        return result;
      }

      // Header validation
      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));

      result.metadata.headers = headers;
      result.metadata.totalLines = lines.length;
      result.metadata.dataRows = lines.length - 1;

      if (headers.length === 0) {
        result.errors.push({
          type: 'NO_HEADERS',
          message: 'CSV file has no headers',
          suggestion: 'First row should contain column headers (SKU, Image, Name, etc.)',
        });

        return result;
      }

      // Check for required columns
      const skuColumn = this.findColumn(headers, ['sku', 'reference', 'ref', 'product_id', 'id']);

      if (!skuColumn) {
        result.errors.push({
          type: 'MISSING_SKU_COLUMN',
          message: 'No SKU/Reference column found',
          suggestion: 'CSV must have a column named: SKU, Reference, REF, Product_ID, or ID',
        });
      } else {
        result.metadata.skuColumn = skuColumn;
      }

      // Optional columns detection
      const imageColumn = this.findColumn(headers, ['image', 'filename', 'file', 'image_name', 'photo']);
      const nameColumn = this.findColumn(headers, ['name', 'title', 'product_name', 'description']);
      const refColumn = this.findColumn(headers, ['ref']);

      result.metadata.imageColumn = imageColumn;
      result.metadata.nameColumn = nameColumn;
      result.metadata.refColumn = refColumn;

      // Data validation
      if (lines.length > this.maxCSVRows + 1) { // +1 for header
        result.warnings.push({
          type: 'TOO_MANY_ROWS',
          message: `CSV has ${lines.length - 1} rows, maximum recommended is ${this.maxCSVRows}`,
          suggestion: 'Consider splitting large CSV files for better performance',
        });
      }

      // Validate data rows
      const dataValidation = this.validateCSVDataRows(lines.slice(1), headers, skuColumn);

      result.errors.push(...dataValidation.errors);
      result.warnings.push(...dataValidation.warnings);
      result.suggestions.push(...dataValidation.suggestions);
      result.metadata = { ...result.metadata, ...dataValidation.metadata };

    } catch (error) {
      result.errors.push({
        type: 'CONTENT_PARSE_ERROR',
        message: `Failed to parse CSV content: ${error.message}`,
        suggestion: 'Check that the CSV uses proper comma separation and encoding',
      });
    }

    return result;
  }

  /**
   * Validate CSV data rows
   * @param {Array<string>} dataLines - Data lines from CSV
   * @param {Array<string>} headers - CSV headers
   * @param {string} skuColumn - SKU column name
   * @returns {Object} Data validation result
   */
  validateCSVDataRows(dataLines, headers, skuColumn) {
    const result = {
      errors: [],
      warnings: [],
      suggestions: [],
      metadata: {},
    };

    const skuColumnIndex = headers.indexOf(skuColumn);
    const skus = new Set();
    const duplicateSKUs = new Set();
    const emptySKUs = [];
    const invalidRows = [];

    dataLines.forEach((line, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
      const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));

      // Check row length
      if (values.length !== headers.length) {
        invalidRows.push({
          row: rowNumber,
          expected: headers.length,
          actual: values.length,
          line: line.substring(0, 100) + (line.length > 100 ? '...' : ''),
        });

        return;
      }

      // Check SKU
      const sku = values[skuColumnIndex];

      if (!sku || sku.trim() === '') {
        emptySKUs.push(rowNumber);
      } else {
        if (skus.has(sku)) {
          duplicateSKUs.add(sku);
        }
        skus.add(sku);
      }
    });

    // Report validation issues
    if (invalidRows.length > 0) {
      result.errors.push({
        type: 'INVALID_ROW_FORMAT',
        message: `${invalidRows.length} rows have incorrect number of columns`,
        suggestion: 'Check that all rows have the same number of comma-separated values as headers',
        details: invalidRows.slice(0, 5), // Show first 5 invalid rows
      });
    }

    if (emptySKUs.length > 0) {
      result.warnings.push({
        type: 'EMPTY_SKUS',
        message: `${emptySKUs.length} rows have empty SKU values`,
        suggestion: 'Rows with empty SKUs will be skipped during processing',
        details: emptySKUs.slice(0, 10), // Show first 10 row numbers
      });
    }

    if (duplicateSKUs.size > 0) {
      result.warnings.push({
        type: 'DUPLICATE_SKUS',
        message: `${duplicateSKUs.size} SKUs appear multiple times`,
        suggestion: 'Duplicate SKUs may cause unexpected matching behavior',
        details: Array.from(duplicateSKUs).slice(0, 10), // Show first 10 duplicates
      });
    }

    result.metadata.totalSKUs = skus.size;
    result.metadata.duplicateSKUs = duplicateSKUs.size;
    result.metadata.emptySKUs = emptySKUs.length;
    result.metadata.invalidRows = invalidRows.length;

    return result;
  }

  /**
   * Validate image files
   * @param {Array<File>} files - Array of image files
   * @returns {Object} Validation result
   */
  validateImageFiles(files) {
    const result = {
      valid: [],
      invalid: [],
      warnings: [],
      suggestions: [],
      metadata: {},
    };

    if (!files || files.length === 0) {
      result.suggestions.push({
        type: 'NO_FILES',
        message: 'No image files provided',
        suggestion: 'Please select image files to upload',
      });

      return result;
    }

    if (files.length > this.maxTotalImages) {
      result.warnings.push({
        type: 'TOO_MANY_FILES',
        message: `${files.length} files selected, maximum recommended is ${this.maxTotalImages}`,
        suggestion: 'Consider processing images in smaller batches for better performance',
      });
    }

    let totalSize = 0;
    const fileNames = new Set();
    const duplicateNames = [];

    files.forEach((file, index) => {
      const validation = this.validateSingleImageFile(file, index);

      if (validation.valid) {
        result.valid.push(validation);
      } else {
        result.invalid.push(validation);
      }

      totalSize += file.size;

      // Check for duplicate filenames
      if (fileNames.has(file.name)) {
        duplicateNames.push(file.name);
      }
      fileNames.add(file.name);
    });

    // Report duplicate filenames
    if (duplicateNames.length > 0) {
      result.warnings.push({
        type: 'DUPLICATE_FILENAMES',
        message: `${duplicateNames.length} files have duplicate names`,
        suggestion: 'Rename files to have unique names to avoid conflicts',
        details: duplicateNames.slice(0, 10),
      });
    }

    // Check total size
    const totalSizeGB = totalSize / (1024 * 1024 * 1024);

    if (totalSizeGB > 1) {
      result.warnings.push({
        type: 'LARGE_TOTAL_SIZE',
        message: `Total size: ${totalSizeGB.toFixed(2)}GB`,
        suggestion: 'Large uploads may take significant time and bandwidth',
      });
    }

    result.metadata = {
      totalFiles: files.length,
      validFiles: result.valid.length,
      invalidFiles: result.invalid.length,
      totalSize: totalSize,
      averageSize: files.length > 0 ? totalSize / files.length : 0,
      duplicateNames: duplicateNames.length,
    };

    return result;
  }

  /**
   * Validate single image file
   * @param {File} file - Image file to validate
   * @param {number} index - File index
   * @returns {Object} Validation result
   */
  validateSingleImageFile(file, index) {
    const result = {
      file,
      index,
      valid: true,
      errors: [],
      warnings: [],
    };

    // File existence check
    if (!file) {
      result.valid = false;
      result.errors.push({
        type: 'FILE_MISSING',
        message: 'File is missing or corrupted',
      });

      return result;
    }

    // File type validation
    if (!this.allowedImageTypes.includes(file.type)) {
      result.valid = false;
      result.errors.push({
        type: 'INVALID_FILE_TYPE',
        message: `Invalid file type: ${file.type}`,
        suggestion: 'Supported formats: JPG, PNG, GIF, WebP',
      });
    }

    // File size validation
    if (file.size > this.maxFileSize) {
      result.valid = false;
      result.errors.push({
        type: 'FILE_TOO_LARGE',
        message: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        suggestion: `Maximum file size is ${(this.maxFileSize / 1024 / 1024).toFixed(0)}MB`,
      });
    }

    // Empty file check
    if (file.size === 0) {
      result.valid = false;
      result.errors.push({
        type: 'EMPTY_FILE',
        message: 'File is empty or corrupted',
      });
    }

    // Filename validation
    const filenameValidation = this.validateFilename(file.name);

    if (!filenameValidation.valid) {
      result.warnings.push(...filenameValidation.warnings);
    }

    // Size warnings
    if (file.size < 10 * 1024) { // Less than 10KB
      result.warnings.push({
        type: 'VERY_SMALL_FILE',
        message: `File is very small: ${(file.size / 1024).toFixed(1)}KB`,
        suggestion: 'Verify this is a valid image file',
      });
    }

    if (file.size > 5 * 1024 * 1024) { // Larger than 5MB
      result.warnings.push({
        type: 'LARGE_FILE',
        message: `Large file: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        suggestion: 'Consider compressing large images for faster upload',
      });
    }

    return result;
  }

  /**
   * Validate filename for common issues
   * @param {string} filename - Filename to validate
   * @returns {Object} Validation result
   */
  validateFilename(filename) {
    const result = {
      valid: true,
      warnings: [],
    };

    // Check for special characters that might cause issues
    const problematicChars = /[<>:"/\\|?*\x00-\x1f]/;

    if (problematicChars.test(filename)) {
      result.warnings.push({
        type: 'PROBLEMATIC_CHARACTERS',
        message: 'Filename contains special characters that may cause issues',
        suggestion: 'Consider renaming files to use only letters, numbers, hyphens, and underscores',
      });
    }

    // Check for very long filenames
    if (filename.length > 255) {
      result.warnings.push({
        type: 'FILENAME_TOO_LONG',
        message: 'Filename is very long',
        suggestion: 'Consider shortening the filename',
      });
    }

    // Check for spaces (may cause issues in some systems)
    if (filename.includes(' ')) {
      result.warnings.push({
        type: 'SPACES_IN_FILENAME',
        message: 'Filename contains spaces',
        suggestion: 'Consider using underscores or hyphens instead of spaces',
      });
    }

    return result;
  }

  /**
   * Validate matching results for potential issues
   * @param {Object} matchingResults - Results from matching algorithm
   * @param {Object} csvData - Original CSV data
   * @param {Array<File>} imageFiles - Original image files
   * @returns {Object} Validation result
   */
  validateMatchingResults(matchingResults, csvData, imageFiles) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      metadata: {},
    };

    if (!matchingResults) {
      result.valid = false;
      result.errors.push({
        type: 'NO_MATCHING_RESULTS',
        message: 'No matching results provided',
        suggestion: 'Run the matching process before validation',
      });

      return result;
    }

    const { matches, stats, unmatched } = matchingResults;

    // Check match quality
    if (matches.length === 0) {
      result.valid = false;
      result.errors.push({
        type: 'NO_MATCHES_FOUND',
        message: 'No matches found between CSV and images',
        suggestion: 'Check that SKU values match image filenames, or adjust matching settings',
      });
    }

    // Low match rate warning
    const matchRate = csvData.data.length > 0 ? (stats.uniqueProducts / csvData.data.length) : 0;

    if (matchRate < 0.5 && matches.length > 0) {
      result.warnings.push({
        type: 'LOW_MATCH_RATE',
        message: `Low match rate: ${(matchRate * 100).toFixed(1)}% of products matched`,
        suggestion: 'Review SKU naming conventions or adjust fuzzy matching threshold',
      });
    }

    // High unmatched images warning
    const unmatchedImageRate = imageFiles.length > 0 ? (stats.unmatchedImages / imageFiles.length) : 0;

    if (unmatchedImageRate > 0.3 && imageFiles.length > 0) {
      result.warnings.push({
        type: 'HIGH_UNMATCHED_IMAGES',
        message: `${(unmatchedImageRate * 100).toFixed(1)}% of images unmatched`,
        suggestion: 'Check image naming conventions or add missing products to CSV',
      });
    }

    // Confidence analysis
    if (matches.length > 0) {
      const lowConfidenceMatches = matches.filter(m => m.confidence < 0.7).length;

      if (lowConfidenceMatches > matches.length * 0.2) {
        result.warnings.push({
          type: 'LOW_CONFIDENCE_MATCHES',
          message: `${lowConfidenceMatches} matches have low confidence`,
          suggestion: 'Review low-confidence matches manually before uploading',
        });
      }
    }

    result.metadata = {
      matchRate: matchRate,
      unmatchedImageRate: unmatchedImageRate,
      averageConfidence: stats.averageSimilarity || 0,
      totalMatches: matches.length,
      uniqueProducts: stats.uniqueProducts,
    };

    return result;
  }

  /**
   * Create graceful fallback for matching failures
   * @param {Object} csvData - CSV data
   * @param {Array<File>} imageFiles - Image files
   * @param {Object} originalError - Original matching error
   * @returns {Object} Fallback matching results
   */
  createMatchingFallback(csvData, imageFiles, originalError) {
    console.warn('Creating fallback matching due to error:', originalError);

    // Simple exact matching fallback
    const matches = [];
    const processedImages = new Set();

    csvData.data.forEach(row => {
      const sku = row[csvData.skuColumn];

      if (!sku) return;

      const normalizedSku = sku.toLowerCase().replace(/[^a-z0-9]/g, '');

      imageFiles.forEach(file => {
        if (processedImages.has(file.name)) return;

        const fileName = file.name.toLowerCase();
        const baseName = fileName.split('.')[0].replace(/[^a-z0-9]/g, '');

        // Simple exact match fallback
        if (baseName.includes(normalizedSku) || normalizedSku.includes(baseName)) {
          matches.push({
            sku,
            file,
            productName: row[csvData.nameColumn] || '',
            imageIndex: 0,
            totalImagesForSku: 1,
            isMainImage: true,
            matchStrategy: 'fallback-exact',
            similarity: 1.0,
            confidence: 0.8, // Lower confidence for fallback
          });
          processedImages.add(file.name);
        }
      });
    });

    return {
      matches,
      stats: {
        matched: matches.length,
        uniqueProducts: new Set(matches.map(m => m.sku)).size,
        unmatchedCSV: csvData.data.length - new Set(matches.map(m => m.sku)).size,
        unmatchedImages: imageFiles.length - processedImages.size,
        multipleImagesProducts: 0,
        averageSimilarity: 0.8,
        matchStrategies: {
          'fallback-exact': matches.length,
          exact: 0,
          normalized: 0,
          fuzzy: 0,
          ref: 0,
        },
      },
      unmatched: {
        csvRows: csvData.data.filter(row => !matches.some(m => m.sku === row[csvData.skuColumn])),
        imageFiles: imageFiles.filter(file => !processedImages.has(file.name)),
      },
      fallbackUsed: true,
      originalError: originalError.message,
    };
  }

  /**
   * Helper method to find column by possible names
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

    return null;
  }

  /**
   * Read file content as text
   * @param {File} file - File to read
   * @returns {Promise<string>} File content
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// Export singleton instance
const bulkUploadValidationService = new BulkUploadValidationService();

export default bulkUploadValidationService;
