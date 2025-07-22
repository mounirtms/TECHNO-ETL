<?php
/**
 * Magento Product Migration Script
 *
 * This script migrates products from CSV data to Magento using the REST API
 * for the French office supplies store.
 *
 * @author Magento Migration Tool
 * @version 1.0
 */

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../api/MagentoApiClient.php';
require_once __DIR__ . '/../data-processing/ProductDataProcessor.php';

class ProductMigrator
{
    private $apiClient;
    private $dataProcessor;
    private $config;
    private $logFile;
    private $migrationResults = [];

    public function __construct($apiClient, $config)
    {
        $this->apiClient = $apiClient;
        $this->config = $config;
        $this->dataProcessor = new ProductDataProcessor($config);
        $this->logFile = __DIR__ . '/../../logs/product-migration-' . date('Y-m-d-H-i-s') . '.log';
    }

    /**
     * Run the complete product migration
     *
     * @param string $csvFile Path to CSV file
     * @return array Migration results
     */
    public function migrateProducts($csvFile)
    {
        $this->log("Starting product migration from: $csvFile");

        try {
            // Step 1: Process CSV data
            $this->log("Step 1: Processing CSV data...");
            $processedData = $this->dataProcessor->processCsvFile($csvFile);

            if ($processedData['error_count'] > 0) {
                $this->log("Warning: " . $processedData['error_count'] . " errors during data processing");
            }

            $products = $processedData['products'];
            $this->log("Processed " . count($products) . " products for migration");

            // Step 2: Validate products
            $this->log("Step 2: Validating products...");
            $validProducts = $this->validateProducts($products);
            $this->log("Validated " . count($validProducts) . " products");

            // Step 3: Migrate products in batches
            $this->log("Step 3: Migrating products to Magento...");
            $migrationResults = $this->migrateProductsBatch($validProducts);

            // Step 4: Generate migration report
            $this->log("Step 4: Generating migration report...");
            $report = $this->generateMigrationReport($migrationResults, $processedData);

            $this->log("Product migration completed successfully");

            return $report;

        } catch (Exception $e) {
            $this->log("ERROR: Product migration failed - " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Validate products before migration
     *
     * @param array $products Products to validate
     * @return array Valid products
     */
    private function validateProducts($products)
    {
        $validProducts = [];
        $validationErrors = [];

        foreach ($products as $product) {
            $errors = $this->validateProduct($product);

            if (empty($errors)) {
                $validProducts[] = $product;
            } else {
                $validationErrors[] = [
                    'sku' => $product['sku'],
                    'errors' => $errors
                ];
                $this->log("Validation failed for " . $product['sku'] . ": " . implode(', ', $errors));
            }
        }

        if (!empty($validationErrors)) {
            $this->saveValidationErrors($validationErrors);
        }

        return $validProducts;
    }

    /**
     * Validate individual product
     *
     * @param array $product Product data
     * @return array Validation errors
     */
    private function validateProduct($product)
    {
        $errors = [];

        // Required fields validation
        if (empty($product['sku'])) {
            $errors[] = 'SKU is required';
        }

        if (empty($product['name'])) {
            $errors[] = 'Name is required';
        }

        if (!isset($product['price']) || $product['price'] < 0) {
            $errors[] = 'Valid price is required';
        }

        // SKU format validation
        if (!empty($product['sku']) && !preg_match('/^[a-zA-Z0-9_-]+$/', $product['sku'])) {
            $errors[] = 'SKU contains invalid characters';
        }

        // Category validation
        if (empty($product['category_ids'])) {
            $errors[] = 'At least one category is required';
        }

        // Attribute set validation
        if (empty($product['attribute_set_id'])) {
            $errors[] = 'Attribute set ID is required';
        }

        return $errors;
    }

    /**
     * Migrate products in batches
     *
     * @param array $products Products to migrate
     * @return array Migration results
     */
    private function migrateProductsBatch($products)
    {
        $batchSize = $this->config['migration']['batch_size'];
        $batches = array_chunk($products, $batchSize);
        $totalBatches = count($batches);
        $allResults = [];

        $this->log("Migrating " . count($products) . " products in $totalBatches batches of $batchSize");

        foreach ($batches as $batchIndex => $batch) {
            $batchNumber = $batchIndex + 1;
            $this->log("Processing batch $batchNumber/$totalBatches");

            try {
                $batchResults = $this->processBatch($batch, $batchNumber);
                $allResults = array_merge($allResults, $batchResults);

                // Progress reporting
                if ($this->config['performance']['enable_progress_reporting']) {
                    $processed = count($allResults);
                    $total = count($products);
                    $percentage = round(($processed / $total) * 100, 2);
                    $this->log("Progress: $processed/$total ($percentage%)");
                }

                // Delay between batches to avoid overwhelming the server
                if ($batchNumber < $totalBatches) {
                    sleep($this->config['migration']['rate_limit_delay']);
                }

            } catch (Exception $e) {
                $this->log("Batch $batchNumber failed: " . $e->getMessage());

                if (!$this->config['error_handling']['continue_on_error']) {
                    throw $e;
                }
            }
        }

        return $allResults;
    }

    /**
     * Process a single batch of products
     *
     * @param array $batch Batch of products
     * @param int $batchNumber Batch number
     * @return array Batch results
     */
    private function processBatch($batch, $batchNumber)
    {
        $batchResults = [];

        foreach ($batch as $product) {
            try {
                $result = $this->migrateProduct($product);
                $batchResults[] = $result;

                if ($result['success']) {
                    $this->log("✓ Product migrated: " . $product['sku']);
                } else {
                    $this->log("✗ Product migration failed: " . $product['sku'] . " - " . $result['error']);
                }

            } catch (Exception $e) {
                $batchResults[] = [
                    'success' => false,
                    'sku' => $product['sku'],
                    'error' => $e->getMessage(),
                    'batch' => $batchNumber
                ];

                $this->log("✗ Product migration exception: " . $product['sku'] . " - " . $e->getMessage());
            }
        }

        return $batchResults;
    }

    /**
     * Migrate individual product
     *
     * @param array $product Product data
     * @return array Migration result
     */
    private function migrateProduct($product)
    {
        try {
            // Check if product already exists
            if ($this->config['validation']['skip_existing_products']) {
                try {
                    $existingProduct = $this->apiClient->getProductBySku($product['sku']);
                    if ($existingProduct) {
                        return [
                            'success' => true,
                            'sku' => $product['sku'],
                            'action' => 'skipped',
                            'message' => 'Product already exists'
                        ];
                    }
                } catch (Exception $e) {
                    // Product doesn't exist, continue with creation
                }
            }

            // Create or update product
            if ($this->config['validation']['update_existing_products']) {
                try {
                    $existingProduct = $this->apiClient->getProductBySku($product['sku']);
                    if ($existingProduct) {
                        // Update existing product
                        $response = $this->apiClient->updateProductBySku($product['sku'], $product);
                        return [
                            'success' => true,
                            'sku' => $product['sku'],
                            'action' => 'updated',
                            'id' => $response['id'] ?? null,
                            'response' => $response
                        ];
                    }
                } catch (Exception $e) {
                    // Product doesn't exist, continue with creation
                }
            }

            // Create new product
            $response = $this->apiClient->post('/rest/V1/products', ['product' => $product]);

            return [
                'success' => true,
                'sku' => $product['sku'],
                'action' => 'created',
                'id' => $response['id'] ?? null,
                'response' => $response
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'sku' => $product['sku'],
                'action' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate migration report
     *
     * @param array $migrationResults Migration results
     * @param array $processedData Processed data
     * @return array Migration report
     */
    private function generateMigrationReport($migrationResults, $processedData)
    {
        $successful = array_filter($migrationResults, function($result) {
            return $result['success'];
        });

        $failed = array_filter($migrationResults, function($result) {
            return !$result['success'];
        });

        $created = array_filter($successful, function($result) {
            return $result['action'] === 'created';
        });

        $updated = array_filter($successful, function($result) {
            return $result['action'] === 'updated';
        });

        $skipped = array_filter($successful, function($result) {
            return $result['action'] === 'skipped';
        });

        $report = [
            'migration_summary' => [
                'total_processed' => count($migrationResults),
                'successful' => count($successful),
                'failed' => count($failed),
                'created' => count($created),
                'updated' => count($updated),
                'skipped' => count($skipped),
                'success_rate' => count($migrationResults) > 0 ? round((count($successful) / count($migrationResults)) * 100, 2) : 0
            ],
            'data_processing_summary' => [
                'csv_processed_count' => $processedData['processed_count'],
                'csv_error_count' => $processedData['error_count'],
                'csv_errors' => $processedData['errors']
            ],
            'migration_details' => $migrationResults,
            'failed_products' => array_values($failed),
            'created_at' => date('Y-m-d H:i:s'),
            'log_file' => $this->logFile
        ];

        // Save report to file
        $reportFile = __DIR__ . '/../../data/processed/migration-report-' . date('Y-m-d-H-i-s') . '.json';
        file_put_contents($reportFile, json_encode($report, JSON_PRETTY_PRINT));

        $this->log("Migration report saved to: $reportFile");

        return $report;
    }

    /**
     * Save validation errors to file
     *
     * @param array $validationErrors Validation errors
     */
    private function saveValidationErrors($validationErrors)
    {
        $errorFile = __DIR__ . '/../../data/processed/validation-errors-' . date('Y-m-d-H-i-s') . '.json';
        file_put_contents($errorFile, json_encode($validationErrors, JSON_PRETTY_PRINT));
        $this->log("Validation errors saved to: $errorFile");
    }

    /**
     * Log messages
     *
     * @param string $message Log message
     */
    private function log($message)
    {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message" . PHP_EOL;

        // Ensure log directory exists
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        // Write to log file
        file_put_contents($this->logFile, $logMessage, FILE_APPEND | LOCK_EX);

        // Output to console
        echo $logMessage;
    }
}

// Main execution
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    try {
        // Load configuration
        $configFile = __DIR__ . '/../../config/store-config.json';
        if (!file_exists($configFile)) {
            throw new Exception("Configuration file not found. Please copy and configure store-config.example.json");
        }

        $config = json_decode(file_get_contents($configFile), true);

        // Set PHP configuration
        ini_set('memory_limit', $config['performance']['memory_limit']);
        set_time_limit($config['performance']['execution_time_limit']);

        // Initialize API client
        $apiClient = new MagentoApiClient(
            $config['magento']['base_url'],
            $config['magento']['admin_token'],
            $config['migration']['timeout'],
            $config['migration']['max_retries'],
            $config['migration']['retry_delay'],
            $config['migration']['rate_limit_delay']
        );

        // Test API connection
        if (!$apiClient->testConnection()) {
            throw new Exception("Cannot connect to Magento API. Please check your configuration.");
        }

        // Determine CSV file to process
        $csvFile = $argv[1] ?? __DIR__ . '/../../' . $config['data_sources']['products_csv'];

        if (!file_exists($csvFile)) {
            throw new Exception("CSV file not found: $csvFile");
        }

        // Run migration
        $migrator = new ProductMigrator($apiClient, $config);
        $report = $migrator->migrateProducts($csvFile);

        // Display summary
        echo "\n=== PRODUCT MIGRATION SUMMARY ===\n";
        echo "Total processed: " . $report['migration_summary']['total_processed'] . "\n";
        echo "Successful: " . $report['migration_summary']['successful'] . "\n";
        echo "Failed: " . $report['migration_summary']['failed'] . "\n";
        echo "Created: " . $report['migration_summary']['created'] . "\n";
        echo "Updated: " . $report['migration_summary']['updated'] . "\n";
        echo "Skipped: " . $report['migration_summary']['skipped'] . "\n";
        echo "Success rate: " . $report['migration_summary']['success_rate'] . "%\n";
        echo "=================================\n";

        if ($report['migration_summary']['failed'] > 0) {
            echo "\nFailed products:\n";
            foreach ($report['failed_products'] as $failed) {
                echo "- " . $failed['sku'] . ": " . $failed['error'] . "\n";
            }
        }

    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
        exit(1);
    }
}