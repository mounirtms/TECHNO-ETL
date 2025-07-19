<?php
/**
 * Magento REST API Client
 *
 * This class provides a comprehensive interface for interacting with Magento's REST API
 * including authentication, error handling, rate limiting, and logging.
 *
 * @author Magento Migration Tool
 * @version 1.0
 */

class MagentoApiClient
{
    private $baseUrl;
    private $adminToken;
    private $timeout;
    private $maxRetries;
    private $retryDelay;
    private $logFile;
    private $rateLimitDelay;

    /**
     * Constructor
     *
     * @param string $baseUrl Magento base URL (e.g., https://example.com)
     * @param string $adminToken Admin access token
     * @param int $timeout Request timeout in seconds
     * @param int $maxRetries Maximum number of retries for failed requests
     * @param int $retryDelay Delay between retries in seconds
     * @param int $rateLimitDelay Delay between requests to avoid rate limiting
     */
    public function __construct(
        $baseUrl,
        $adminToken,
        $timeout = 30,
        $maxRetries = 3,
        $retryDelay = 2,
        $rateLimitDelay = 1
    ) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->adminToken = $adminToken;
        $this->timeout = $timeout;
        $this->maxRetries = $maxRetries;
        $this->retryDelay = $retryDelay;
        $this->rateLimitDelay = $rateLimitDelay;
        $this->logFile = __DIR__ . '/../../logs/api-client-' . date('Y-m-d') . '.log';

        $this->log("API Client initialized for: " . $this->baseUrl);
    }

    /**
     * Make GET request
     *
     * @param string $endpoint API endpoint
     * @param array $params Query parameters
     * @return array Response data
     */
    public function get($endpoint, $params = [])
    {
        $url = $this->baseUrl . $endpoint;

        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }

        return $this->makeRequest('GET', $url);
    }

    /**
     * Make POST request
     *
     * @param string $endpoint API endpoint
     * @param array $data Request data
     * @return array Response data
     */
    public function post($endpoint, $data = [])
    {
        $url = $this->baseUrl . $endpoint;
        return $this->makeRequest('POST', $url, $data);
    }

    /**
     * Make PUT request
     *
     * @param string $endpoint API endpoint
     * @param array $data Request data
     * @return array Response data
     */
    public function put($endpoint, $data = [])
    {
        $url = $this->baseUrl . $endpoint;
        return $this->makeRequest('PUT', $url, $data);
    }

    /**
     * Make DELETE request
     *
     * @param string $endpoint API endpoint
     * @return array Response data
     */
    public function delete($endpoint)
    {
        $url = $this->baseUrl . $endpoint;
        return $this->makeRequest('DELETE', $url);
    }

    /**
     * Make HTTP request with retry logic
     *
     * @param string $method HTTP method
     * @param string $url Full URL
     * @param array $data Request data
     * @return array Response data
     * @throws Exception On request failure
     */
    private function makeRequest($method, $url, $data = null)
    {
        $attempt = 0;
        $lastException = null;

        while ($attempt < $this->maxRetries) {
            try {
                $attempt++;

                // Rate limiting
                if ($this->rateLimitDelay > 0) {
                    sleep($this->rateLimitDelay);
                }

                $this->log("$method request to: $url (Attempt: $attempt)");

                $ch = curl_init();

                // Basic cURL options
                curl_setopt_array($ch, [
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT => $this->timeout,
                    CURLOPT_CUSTOMREQUEST => $method,
                    CURLOPT_HTTPHEADER => $this->getHeaders(),
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_SSL_VERIFYHOST => false,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_MAXREDIRS => 3
                ]);

                // Add data for POST/PUT requests
                if ($data !== null && in_array($method, ['POST', 'PUT'])) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $error = curl_error($ch);
                curl_close($ch);

                if ($response === false) {
                    throw new Exception("cURL error: $error");
                }

                $this->log("Response HTTP code: $httpCode");

                // Handle different HTTP status codes
                if ($httpCode >= 200 && $httpCode < 300) {
                    // Success
                    $decodedResponse = json_decode($response, true);

                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $this->log("Warning: Invalid JSON response: " . json_last_error_msg());
                        return ['raw_response' => $response];
                    }

                    $this->log("✓ Request successful");
                    return $decodedResponse;

                } elseif ($httpCode >= 400 && $httpCode < 500) {
                    // Client error - don't retry
                    $errorResponse = json_decode($response, true);
                    $errorMessage = isset($errorResponse['message']) ? $errorResponse['message'] : "HTTP $httpCode error";
                    throw new Exception("Client error: $errorMessage (HTTP $httpCode)");

                } elseif ($httpCode >= 500) {
                    // Server error - retry
                    $errorMessage = "Server error: HTTP $httpCode";
                    $this->log("✗ $errorMessage - will retry");
                    throw new Exception($errorMessage);

                } else {
                    // Unexpected status code
                    throw new Exception("Unexpected HTTP status code: $httpCode");
                }

            } catch (Exception $e) {
                $lastException = $e;
                $this->log("✗ Request failed: " . $e->getMessage());

                // Don't retry client errors (4xx)
                if (strpos($e->getMessage(), 'Client error') === 0) {
                    throw $e;
                }

                // Wait before retry
                if ($attempt < $this->maxRetries) {
                    $this->log("Waiting {$this->retryDelay} seconds before retry...");
                    sleep($this->retryDelay);
                }
            }
        }

        // All retries failed
        throw new Exception("Request failed after {$this->maxRetries} attempts. Last error: " . $lastException->getMessage());
    }

    /**
     * Get HTTP headers for API requests
     *
     * @return array HTTP headers
     */
    private function getHeaders()
    {
        return [
            'Authorization: Bearer ' . $this->adminToken,
            'Content-Type: application/json',
            'Accept: application/json',
            'User-Agent: Magento-Migration-Tool/1.0'
        ];
    }

    /**
     * Bulk product creation with batch processing
     *
     * @param array $products Array of product data
     * @param int $batchSize Number of products per batch
     * @return array Results of batch processing
     */
    public function createProductsBatch($products, $batchSize = 10)
    {
        $results = [];
        $batches = array_chunk($products, $batchSize);
        $totalBatches = count($batches);

        $this->log("Starting bulk product creation: " . count($products) . " products in $totalBatches batches");

        foreach ($batches as $batchIndex => $batch) {
            $batchNumber = $batchIndex + 1;
            $this->log("Processing batch $batchNumber/$totalBatches (" . count($batch) . " products)");

            $batchResults = [];
            foreach ($batch as $productIndex => $productData) {
                try {
                    $response = $this->post('/rest/V1/products', ['product' => $productData]);
                    $batchResults[] = [
                        'success' => true,
                        'sku' => $productData['sku'],
                        'id' => isset($response['id']) ? $response['id'] : null,
                        'response' => $response
                    ];
                    $this->log("✓ Product created: " . $productData['sku']);

                } catch (Exception $e) {
                    $batchResults[] = [
                        'success' => false,
                        'sku' => $productData['sku'],
                        'error' => $e->getMessage()
                    ];
                    $this->log("✗ Failed to create product: " . $productData['sku'] . " - " . $e->getMessage());
                }
            }

            $results["batch_$batchNumber"] = $batchResults;

            // Small delay between batches to avoid overwhelming the server
            if ($batchNumber < $totalBatches) {
                sleep(2);
            }
        }

        return $results;
    }

    /**
     * Get product by SKU
     *
     * @param string $sku Product SKU
     * @return array Product data
     */
    public function getProductBySku($sku)
    {
        return $this->get("/rest/V1/products/" . urlencode($sku));
    }

    /**
     * Update product by SKU
     *
     * @param string $sku Product SKU
     * @param array $productData Product data to update
     * @return array Updated product data
     */
    public function updateProductBySku($sku, $productData)
    {
        return $this->put("/rest/V1/products/" . urlencode($sku), ['product' => $productData]);
    }

    /**
     * Get all categories
     *
     * @return array Categories data
     */
    public function getCategories()
    {
        return $this->get('/rest/V1/categories');
    }

    /**
     * Get category by ID
     *
     * @param int $categoryId Category ID
     * @return array Category data
     */
    public function getCategoryById($categoryId)
    {
        return $this->get("/rest/V1/categories/$categoryId");
    }

    /**
     * Get all product attributes
     *
     * @return array Attributes data
     */
    public function getProductAttributes()
    {
        return $this->get('/rest/V1/products/attributes');
    }

    /**
     * Get attribute by code
     *
     * @param string $attributeCode Attribute code
     * @return array Attribute data
     */
    public function getAttributeByCode($attributeCode)
    {
        return $this->get("/rest/V1/products/attributes/" . urlencode($attributeCode));
    }

    /**
     * Get all attribute sets
     *
     * @return array Attribute sets data
     */
    public function getAttributeSets()
    {
        return $this->get('/rest/V1/products/attribute-sets/sets/list');
    }

    /**
     * Test API connection
     *
     * @return bool True if connection is successful
     */
    public function testConnection()
    {
        try {
            $this->log("Testing API connection...");
            $response = $this->get('/rest/V1/modules');
            $this->log("✓ API connection successful");
            return true;
        } catch (Exception $e) {
            $this->log("✗ API connection failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get store configuration
     *
     * @return array Store configuration
     */
    public function getStoreConfig()
    {
        return $this->get('/rest/V1/store/storeConfigs');
    }

    /**
     * Log messages to file
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
    }

    /**
     * Get current log file path
     *
     * @return string Log file path
     */
    public function getLogFile()
    {
        return $this->logFile;
    }

    /**
     * Set rate limit delay
     *
     * @param int $delay Delay in seconds
     */
    public function setRateLimitDelay($delay)
    {
        $this->rateLimitDelay = $delay;
        $this->log("Rate limit delay set to: {$delay} seconds");
    }

    /**
     * Get API statistics
     *
     * @return array API usage statistics
     */
    public function getApiStats()
    {
        // This would typically read from log files to provide statistics
        // For now, return basic info
        return [
            'base_url' => $this->baseUrl,
            'timeout' => $this->timeout,
            'max_retries' => $this->maxRetries,
            'retry_delay' => $this->retryDelay,
            'rate_limit_delay' => $this->rateLimitDelay,
            'log_file' => $this->logFile
        ];
    }
}