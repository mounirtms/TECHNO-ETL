/**
 * Basic Media Upload Service
 * Handles image upload, validation, and basic processing for products
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { toast } from 'react-toastify';

/**
 * Media Upload Service Class
 * Provides basic functionality for media upload operations
 */
class MediaUploadService {
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