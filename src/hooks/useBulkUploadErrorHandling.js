import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import bulkUploadValidationService from '../services/bulkUploadValidationService';

/**
 * Custom hook for comprehensive bulk upload error handling
 * Provides validation, error recovery, and user feedback mechanisms
 */
const useBulkUploadErrorHandling = () => {
  const [validationResults, setValidationResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const retryCountRef = useRef(0);
  const maxRetries = 3;

  /**
   * Validate CSV file with comprehensive error handling
   */
  const validateCSV = useCallback(async (file, content = null) => {
    setIsValidating(true);

    try {
      const result = await bulkUploadValidationService.validateCSVFile(file, content);

      setValidationResults(prev => ({
        ...prev,
        csvValidation: result,
      }));

      if (!result.valid) {
        setHasValidationErrors(true);
        const errorMessages = result.errors.map(e => e.message).join(', ');

        toast.error(`CSV validation failed: ${errorMessages}`);
      } else if (result.warnings.length > 0) {
        toast.warning(`CSV validation completed with ${result.warnings.length} warnings`);
      } else {
        toast.success('CSV validation passed successfully');
      }

      return result;
    } catch (error) {
      const errorResult = {
        valid: false,
        errors: [{
          type: 'VALIDATION_EXCEPTION',
          message: `CSV validation failed: ${error.message}`,
          suggestion: 'Check that the file is a valid CSV and try again',
        }],
        warnings: [],
        suggestions: [],
      };

      setValidationResults(prev => ({
        ...prev,
        csvValidation: errorResult,
      }));

      setHasValidationErrors(true);
      toast.error(`CSV validation error: ${error.message}`);

      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Validate image files with comprehensive error handling
   */
  const validateImages = useCallback(async (files) => {
    setIsValidating(true);

    try {
      const result = bulkUploadValidationService.validateImageFiles(files);

      setValidationResults(prev => ({
        ...prev,
        imageValidation: result,
      }));

      const hasErrors = result.invalid.length > 0;
      const hasWarnings = result.warnings.length > 0;

      if (hasErrors) {
        setHasValidationErrors(true);
        toast.error(`${result.invalid.length} image files failed validation`);
      } else if (hasWarnings) {
        toast.warning(`Image validation completed with ${result.warnings.length} warnings`);
      } else {
        toast.success(`All ${result.valid.length} images validated successfully`);
      }

      return result;
    } catch (error) {
      const errorResult = {
        valid: [],
        invalid: files.map(file => ({
          file,
          valid: false,
          errors: [{
            type: 'VALIDATION_EXCEPTION',
            message: `Image validation failed: ${error.message}`,
          }],
        })),
        warnings: [],
        suggestions: [],
        metadata: {},
      };

      setValidationResults(prev => ({
        ...prev,
        imageValidation: errorResult,
      }));

      setHasValidationErrors(true);
      toast.error(`Image validation error: ${error.message}`);

      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Validate matching results with error handling
   */
  const validateMatching = useCallback(async (matchingResults, csvData, imageFiles) => {
    setIsValidating(true);

    try {
      const result = bulkUploadValidationService.validateMatchingResults(
        matchingResults,
        csvData,
        imageFiles,
      );

      setValidationResults(prev => ({
        ...prev,
        matchingValidation: result,
      }));

      if (!result.valid) {
        setHasValidationErrors(true);
        const errorMessages = result.errors.map(e => e.message).join(', ');

        toast.error(`Matching validation failed: ${errorMessages}`);
      } else if (result.warnings.length > 0) {
        toast.warning(`Matching validation completed with ${result.warnings.length} warnings`);
      } else {
        toast.success('Matching validation passed successfully');
      }

      return result;
    } catch (error) {
      const errorResult = {
        valid: false,
        errors: [{
          type: 'VALIDATION_EXCEPTION',
          message: `Matching validation failed: ${error.message}`,
          suggestion: 'Review matching results and try again',
        }],
        warnings: [],
        suggestions: [],
      };

      setValidationResults(prev => ({
        ...prev,
        matchingValidation: errorResult,
      }));

      setHasValidationErrors(true);
      toast.error(`Matching validation error: ${error.message}`);

      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Handle matching errors with fallback mechanism
   */
  const handleMatchingError = useCallback(async (error, csvData, imageFiles) => {
    console.error('Matching error occurred:', error);

    // Add error to tracking
    setErrors(prev => [...prev, {
      type: 'MATCHING_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      retryCount: retryCountRef.current,
    }]);

    // Attempt fallback matching if retries available
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;

      toast.warning(`Matching failed, attempting fallback method (${retryCountRef.current}/${maxRetries})`);

      try {
        const fallbackResults = bulkUploadValidationService.createMatchingFallback(
          csvData,
          imageFiles,
          error,
        );

        toast.info(`Fallback matching found ${fallbackResults.matches.length} matches`);

        return fallbackResults;
      } catch (fallbackError) {
        console.error('Fallback matching also failed:', fallbackError);
        toast.error('Both primary and fallback matching failed');
        throw fallbackError;
      }
    } else {
      toast.error('Maximum retry attempts reached. Please check your data and try again.');
      throw error;
    }
  }, []);

  /**
   * Handle upload errors with retry mechanism
   */
  const handleUploadError = useCallback(async (error, retryFunction) => {
    console.error('Upload error occurred:', error);

    setErrors(prev => [...prev, {
      type: 'UPLOAD_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      retryCount: retryCountRef.current,
    }]);

    // Determine if error is retryable
    const retryableErrors = [
      'network',
      'timeout',
      'connection',
      'temporary',
      'rate limit',
    ];

    const isRetryable = retryableErrors.some(keyword =>
      error.message.toLowerCase().includes(keyword),
    );

    if (isRetryable && retryCountRef.current < maxRetries) {
      retryCountRef.current++;

      const delay = Math.pow(2, retryCountRef.current) * 1000; // Exponential backoff

      toast.warning(`Upload failed, retrying in ${delay/1000}s (${retryCountRef.current}/${maxRetries})`);

      setTimeout(async () => {
        try {
          await retryFunction();
          retryCountRef.current = 0; // Reset on success
        } catch (retryError) {
          await handleUploadError(retryError, retryFunction);
        }
      }, delay);
    } else {
      toast.error(isRetryable
        ? 'Maximum retry attempts reached. Please try again later.'
        : 'Upload failed with non-retryable error. Please check your data.',
      );
      throw error;
    }
  }, []);

  /**
   * Clear all validation results and errors
   */
  const clearValidation = useCallback(() => {
    setValidationResults(null);
    setErrors([]);
    setHasValidationErrors(false);
    retryCountRef.current = 0;
  }, []);

  /**
   * Generate error report for download
   */
  const generateErrorReport = useCallback(() => {
    if (!validationResults && errors.length === 0) {
      return null;
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: errors.length,
        hasValidationErrors,
        retryCount: retryCountRef.current,
      },
      validationResults,
      errors,
      recommendations: [],
    };

    // Add recommendations based on error patterns
    if (validationResults?.csvValidation?.errors?.length > 0) {
      report.recommendations.push(
        'Review CSV file format and ensure proper column headers',
        'Check for special characters or encoding issues in CSV',
      );
    }

    if (validationResults?.imageValidation?.invalid?.length > 0) {
      report.recommendations.push(
        'Verify image file formats are supported (JPG, PNG, GIF, WebP)',
        'Check image file sizes are under 10MB',
      );
    }

    if (validationResults?.matchingValidation?.errors?.length > 0) {
      report.recommendations.push(
        'Review SKU naming conventions in CSV and image filenames',
        'Consider adjusting fuzzy matching threshold settings',
      );
    }

    return report;
  }, [validationResults, errors, hasValidationErrors]);

  /**
   * Download error report as JSON file
   */
  const downloadErrorReport = useCallback(() => {
    const report = generateErrorReport();

    if (!report) {
      toast.warning('No error report available');

      return;
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `bulk-upload-error-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Error report downloaded');
  }, [generateErrorReport]);

  /**
   * Get user-friendly error summary
   */
  const getErrorSummary = useCallback(() => {
    if (!validationResults && errors.length === 0) {
      return null;
    }

    const totalErrors = [
      validationResults?.csvValidation?.errors?.length || 0,
      validationResults?.imageValidation?.invalid?.length || 0,
      validationResults?.matchingValidation?.errors?.length || 0,
      errors.length,
    ].reduce((sum, count) => sum + count, 0);

    const totalWarnings = [
      validationResults?.csvValidation?.warnings?.length || 0,
      validationResults?.imageValidation?.warnings?.length || 0,
      validationResults?.matchingValidation?.warnings?.length || 0,
    ].reduce((sum, count) => sum + count, 0);

    return {
      totalErrors,
      totalWarnings,
      canProceed: totalErrors === 0,
      hasIssues: totalErrors > 0 || totalWarnings > 0,
    };
  }, [validationResults, errors]);

  return {
    // State
    validationResults,
    errors,
    isValidating,
    hasValidationErrors,

    // Validation functions
    validateCSV,
    validateImages,
    validateMatching,

    // Error handling functions
    handleMatchingError,
    handleUploadError,

    // Utility functions
    clearValidation,
    generateErrorReport,
    downloadErrorReport,
    getErrorSummary,
  };
};

export default useBulkUploadErrorHandling;
