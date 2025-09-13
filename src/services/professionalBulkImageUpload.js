/**
 * Professional Bulk Image Upload Service
 * Handles image matching using REF column, renaming, and processing multiple images per product
 * 
 * This service implements the professional bulk image upload workflow:
 * 1. Parse CSV with REF column detection
 * 2. Match images to products using REF values in filenames
 * 3. Rename images according to Image Name column with proper numbering
 * 4. Prepare images for resizing and upload
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

class ProfessionalBulkImageUploadService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
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
   * Parse CSV file and detect professional mode
   * @param {File} file - CSV file to parse
   * @returns {Promise<Object>} Parsed CSV data
   */
  async parseCSVFile(file) {
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

          // Parse CSV properly handling quoted fields
          const headers = this.parseCSVLine(lines[0]);
          const data = lines.slice(1).map((line, index) => {
            const values = this.parseCSVLine(line);
            const row = { _index: index };
            
            headers.forEach((header, headerIndex) => {
              row[header] = values[headerIndex] || '';
            });
            
            return row;
          }).filter(row => Object.values(row).some(val => val !== ''));

          // Detect mode based on headers
          const hasRefColumn = headers.some(h => h.toLowerCase() === 'ref');

          const result = {
            headers,
            data,
            totalRows: data.length,
            hasRefColumn,
            skuColumn: this.findColumn(headers, ['sku', 'reference', 'ref']),
            imageColumn: this.findColumn(headers, ['image', 'image name', 'filename', 'file']),
            nameColumn: this.findColumn(headers, ['name', 'title', 'product_name']),
            refColumn: this.findColumn(headers, ['ref'])
          };

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
   * Parse a single CSV line handling quoted fields
   * @param {string} line - CSV line to parse
   * @returns {Array<string>} Parsed values
   */
  parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
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
      const foundIndex = lowerHeaders.indexOf(name.toLowerCase());
      if (foundIndex !== -1) {
        return headers[foundIndex];
      }
    }
    
    return null;
  }

  /**
   * Match images with CSV data using REF column matching
   * @param {Object} csvData - Parsed CSV data
   * @param {Array<File>} imageFiles - Image files to match
   * @returns {Object} Matching results
   */
  matchImagesWithCSV(csvData, imageFiles) {
    const matches = [];
    const unmatched = {
      csvRows: [],
      imageFiles: []
    };
    
    // Track which images have been matched to avoid duplicates
    const matchedImages = new Set();
    
    // Process each CSV row
    csvData.data.forEach((row) => {
      const sku = row[csvData.skuColumn];
      const ref = row[csvData.refColumn];
      const imageName = row[csvData.imageColumn];
      
      if (!sku || !ref || !imageName) {
        unmatched.csvRows.push(row);
        return;
      }
      
      // Find all images that match this product's REF value
      const productImages = imageFiles.filter(file => {
        // Skip if already matched
        if (matchedImages.has(file.name)) {
          return false;
        }
        
        // Check if filename contains the REF value
        return file.name.includes(ref);
      });
      
      // Sort images to ensure consistent ordering
      productImages.sort((a, b) => a.name.localeCompare(b.name));
      
      // Create matches for each image
      productImages.forEach((file, index) => {
        // For the first image, use the base image name
        // For additional images, append _1, _2, etc.
        const finalImageName = index === 0 
          ? `${imageName}.${this.getFileExtension(file.name)}`
          : `${imageName}_${index}.${this.getFileExtension(file.name)}`;
        
        matches.push({
          sku,
          ref,
          originalFileName: file.name,
          finalImageName,
          file,
          imageIndex: index,
          isMainImage: index === 0
        });
        
        // Mark this image as matched
        matchedImages.add(file.name);
      });
      
      // If no images matched, add to unmatched
      if (productImages.length === 0) {
        unmatched.csvRows.push(row);
      }
    });
    
    // Find unmatched images
    imageFiles.forEach(file => {
      if (!matchedImages.has(file.name)) {
        unmatched.imageFiles.push(file);
      }
    });
    
    return {
      matches,
      unmatched,
      stats: {
        totalCSVRows: csvData.data.length,
        totalImages: imageFiles.length,
        matched: matches.length,
        unmatchedCSV: unmatched.csvRows.length,
        unmatchedImages: unmatched.imageFiles.length,
        uniqueProducts: new Set(matches.map(m => m.sku)).size
      }
    };
  }

  /**
   * Get file extension from filename
   * @param {string} filename - Filename to extract extension from
   * @returns {string} File extension
   */
  getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
  }

  /**
   * Process images (rename, prepare for resizing)
   * @param {Array} matches - Matched images
   * @returns {Array} Processed matches with renamed files
   */
  processImages(matches) {
    // In a real implementation, this would:
    // 1. Rename files according to finalImageName
    // 2. Prepare for resizing
    // 3. Return processed files
    return matches.map(match => ({
      ...match,
      processed: true
    }));
  }
}

// Export singleton instance
const professionalBulkImageUploadService = new ProfessionalBulkImageUploadService();
export default professionalBulkImageUploadService;