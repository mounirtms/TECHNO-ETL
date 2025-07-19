<?php
/**
 * Product Data Processor
 *
 * This class processes CSV product data and transforms it into Magento-compatible format
 * for the French office supplies store migration.
 *
 * @author Magento Migration Tool
 * @version 1.0
 */

class ProductDataProcessor
{
    private $config;
    private $categoryMapping = [];
    private $attributeMapping = [];
    private $logFile;
    private $processedProducts = [];
    private $errors = [];

    public function __construct($config)
    {
        $this->config = $config;
        $this->logFile = __DIR__ . '/../../logs/data-processing-' . date('Y-m-d-H-i-s') . '.log';
        $this->loadMappings();
    }

    /**
     * Load category and attribute mappings
     */
    private function loadMappings()
    {
        // Load category mapping if exists
        $categoryMappingFile = __DIR__ . '/../../data/categories/category-mapping.json';
        if (file_exists($categoryMappingFile)) {
            $categoryData = json_decode(file_get_contents($categoryMappingFile), true);
            if (isset($categoryData['categories'])) {
                $this->categoryMapping = $categoryData['categories'];
            }
        }

        // Load attribute mapping if exists
        $attributeMappingFile = __DIR__ . '/../../data/processed/attribute-mapping.json';
        if (file_exists($attributeMappingFile)) {
            $attributeData = json_decode(file_get_contents($attributeMappingFile), true);
            if (isset($attributeData['attributes'])) {
                $this->attributeMapping = $attributeData['attributes'];
            }
        }

        $this->log("Mappings loaded - Categories: " . count($this->categoryMapping) . ", Attributes: " . count($this->attributeMapping));
    }

    /**
     * Process CSV file and convert to Magento product format
     *
     * @param string $csvFile Path to CSV file
     * @return array Processed products
     */
    public function processCsvFile($csvFile)
    {
        $this->log("Starting CSV processing: $csvFile");

        if (!file_exists($csvFile)) {
            throw new Exception("CSV file not found: $csvFile");
        }

        $handle = fopen($csvFile, 'r');
        if (!$handle) {
            throw new Exception("Cannot open CSV file: $csvFile");
        }

        // Read header row
        $headers = fgetcsv($handle);
        if (!$headers) {
            throw new Exception("Cannot read CSV headers from: $csvFile");
        }

        $this->log("CSV headers: " . implode(', ', $headers));

        $rowNumber = 1;
        $processedCount = 0;
        $errorCount = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            try {
                // Combine headers with row data
                $rowData = array_combine($headers, $row);

                if ($rowData === false) {
                    throw new Exception("Header/row count mismatch at row $rowNumber");
                }

                // Process the product
                $product = $this->processProductRow($rowData, $rowNumber);

                if ($product) {
                    $this->processedProducts[] = $product;
                    $processedCount++;

                    if ($processedCount % 50 == 0) {
                        $this->log("Processed $processedCount products...");
                    }
                }

            } catch (Exception $e) {
                $errorCount++;
                $error = "Row $rowNumber: " . $e->getMessage();
                $this->errors[] = $error;
                $this->log("ERROR - $error");

                // Stop if too many errors
                if ($errorCount > $this->config['error_handling']['max_errors_per_batch']) {
                    $this->log("Too many errors ($errorCount), stopping processing");
                    break;
                }
            }
        }

        fclose($handle);

        $this->log("CSV processing completed - Processed: $processedCount, Errors: $errorCount");

        return [
            'products' => $this->processedProducts,
            'processed_count' => $processedCount,
            'error_count' => $errorCount,
            'errors' => $this->errors
        ];
    }

    /**
     * Process individual product row
     *
     * @param array $rowData Row data from CSV
     * @param int $rowNumber Row number for error reporting
     * @return array|null Processed product data
     */
    private function processProductRow($rowData, $rowNumber)
    {
        // Skip empty rows
        if (empty($rowData['sku']) || trim($rowData['sku']) === '') {
            return null;
        }

        $sku = trim($rowData['sku']);
        $this->log("Processing product: $sku");

        // Basic product data
        $product = [
            'sku' => $sku,
            'name' => $this->cleanText($rowData['name'] ?? $sku),
            'attribute_set_id' => $this->getAttributeSetId($rowData),
            'price' => $this->parsePrice($rowData['price'] ?? '0'),
            'status' => $this->config['products']['default_status'],
            'visibility' => $this->config['products']['default_visibility'],
            'type_id' => $this->determineProductType($rowData),
            'weight' => $this->parseWeight($rowData['weight'] ?? $this->config['products']['default_weight']),
            'tax_class_id' => $this->config['products']['default_tax_class_id']
        ];

        // Add descriptions
        if (!empty($rowData['description'])) {
            $product['description'] = $this->cleanText($rowData['description']);
        }

        if (!empty($rowData['short_description'])) {
            $product['short_description'] = $this->cleanText($rowData['short_description']);
        }

        // Process categories
        $product['category_ids'] = $this->processCategoryIds($rowData);

        // Process custom attributes
        $product['custom_attributes'] = $this->processCustomAttributes($rowData);

        // Process stock data
        $product['extension_attributes'] = [
            'stock_item' => [
                'qty' => $this->parseQty($rowData['qty'] ?? $this->config['products']['default_qty']),
                'is_in_stock' => $this->config['products']['default_is_in_stock'],
                'manage_stock' => $this->config['products']['default_manage_stock'],
                'stock_status_changed_auto' => 0
            ]
        ];

        // Process images if available
        if (!empty($rowData['image'])) {
            $product['media_gallery_entries'] = $this->processImages($rowData);
        }

        return $product;
    }

    /**
     * Process custom attributes from additional_attributes field
     *
     * @param array $rowData Row data
     * @return array Custom attributes
     */
    private function processCustomAttributes($rowData)
    {
        $customAttributes = [];

        // Process additional_attributes field (format: key=value,key2=value2)
        if (!empty($rowData['additional_attributes'])) {
            $additionalAttrs = $this->parseAdditionalAttributes($rowData['additional_attributes']);

            foreach ($additionalAttrs as $attrCode => $attrValue) {
                if (!empty($attrValue)) {
                    $customAttributes[] = [
                        'attribute_code' => $attrCode,
                        'value' => $attrValue
                    ];
                }
            }
        }

        // Add other custom attributes directly from columns
        $directAttributes = ['mgs_brand', 'techno_ref', 'color', 'dimension', 'capacity', 'diameter'];

        foreach ($directAttributes as $attrCode) {
            if (!empty($rowData[$attrCode])) {
                $customAttributes[] = [
                    'attribute_code' => $attrCode,
                    'value' => trim($rowData[$attrCode])
                ];
            }
        }

        return $customAttributes;
    }

    /**
     * Parse additional_attributes field
     *
     * @param string $additionalAttributes String in format "key=value,key2=value2"
     * @return array Parsed attributes
     */
    private function parseAdditionalAttributes($additionalAttributes)
    {
        $attributes = [];
        $pairs = explode(',', $additionalAttributes);

        foreach ($pairs as $pair) {
            $parts = explode('=', $pair, 2);
            if (count($parts) === 2) {
                $key = trim($parts[0]);
                $value = trim($parts[1]);
                $attributes[$key] = $value;
            }
        }

        return $attributes;
    }

    /**
     * Process category IDs from categories field
     *
     * @param array $rowData Row data
     * @return array Category IDs
     */
    private function processCategoryIds($rowData)
    {
        $categoryIds = [];

        if (!empty($rowData['categories'])) {
            $categoryPaths = explode(',', $rowData['categories']);

            foreach ($categoryPaths as $categoryPath) {
                $categoryPath = trim($categoryPath);
                $categoryId = $this->findCategoryIdByPath($categoryPath);

                if ($categoryId) {
                    $categoryIds[] = $categoryId;
                }
            }
        }

        // Add default category if no categories found
        if (empty($categoryIds)) {
            $categoryIds[] = 2; // Default category ID
        }

        return array_unique($categoryIds);
    }

    /**
     * Find category ID by path
     *
     * @param string $categoryPath Category path
     * @return int|null Category ID
     */
    private function findCategoryIdByPath($categoryPath)
    {
        // Remove "Default Category/" prefix if present
        $categoryPath = preg_replace('/^Default Category\//', '', $categoryPath);

        // Look for exact matches in category mapping
        foreach ($this->categoryMapping as $urlKey => $categoryData) {
            if (isset($categoryData['name']) && $categoryData['name'] === $categoryPath) {
                return $categoryData['id'];
            }
        }

        // Look for partial matches
        $pathParts = explode('/', $categoryPath);
        $lastPart = end($pathParts);

        foreach ($this->categoryMapping as $urlKey => $categoryData) {
            if (isset($categoryData['name']) && stripos($categoryData['name'], $lastPart) !== false) {
                return $categoryData['id'];
            }
        }

        return null;
    }

    /**
     * Determine product type based on data
     *
     * @param array $rowData Row data
     * @return string Product type
     */
    private function determineProductType($rowData)
    {
        // Check if product has configurable options
        if (!empty($rowData['configurable_variations']) ||
            (!empty($rowData['color']) && strpos($rowData['color'], ',') !== false)) {
            return 'configurable';
        }

        return 'simple';
    }

    /**
     * Get attribute set ID based on product data
     *
     * @param array $rowData Row data
     * @return int Attribute set ID
     */
    private function getAttributeSetId($rowData)
    {
        // Determine attribute set based on categories or product type
        $categories = $rowData['categories'] ?? '';

        if (stripos($categories, 'CALCULATRICES') !== false) {
            return $this->findAttributeSetId('Calculators');
        } elseif (stripos($categories, 'ECRITURE') !== false || stripos($categories, 'STYLOS') !== false) {
            return $this->findAttributeSetId('Writing Instruments');
        } elseif (stripos($categories, 'COLORIAGE') !== false || stripos($categories, 'BEAUX ARTS') !== false) {
            return $this->findAttributeSetId('Art Supplies');
        } elseif (stripos($categories, 'ELECTRONIQUE') !== false) {
            return $this->findAttributeSetId('Electronic Equipment');
        }

        // Default to general office supplies
        return $this->findAttributeSetId('Office Supplies General');
    }

    /**
     * Find attribute set ID by name
     *
     * @param string $attributeSetName Attribute set name
     * @return int Attribute set ID (default: 4)
     */
    private function findAttributeSetId($attributeSetName)
    {
        // This would typically query the API or use cached data
        // For now, return default attribute set ID
        return 4;
    }

    /**
     * Process product images
     *
     * @param array $rowData Row data
     * @return array Media gallery entries
     */
    private function processImages($rowData)
    {
        $mediaGallery = [];

        if (!empty($rowData['image'])) {
            $images = explode(',', $rowData['image']);
            $position = 0;

            foreach ($images as $image) {
                $image = trim($image);
                if (!empty($image)) {
                    $mediaGallery[] = [
                        'media_type' => 'image',
                        'label' => $rowData['name'] ?? '',
                        'position' => $position,
                        'disabled' => false,
                        'types' => $position === 0 ? ['image', 'small_image', 'thumbnail'] : [],
                        'file' => $image
                    ];
                    $position++;
                }
            }
        }

        return $mediaGallery;
    }

    /**
     * Clean text for Magento
     *
     * @param string $text Text to clean
     * @return string Cleaned text
     */
    private function cleanText($text)
    {
        // Remove HTML tags
        $text = strip_tags($text);

        // Convert encoding if needed
        if (!mb_check_encoding($text, 'UTF-8')) {
            $text = mb_convert_encoding($text, 'UTF-8', 'auto');
        }

        // Trim whitespace
        $text = trim($text);

        return $text;
    }

    /**
     * Parse price value
     *
     * @param string $price Price string
     * @return float Parsed price
     */
    private function parsePrice($price)
    {
        // Remove currency symbols and spaces
        $price = preg_replace('/[^\d.,]/', '', $price);

        // Handle French decimal format (comma as decimal separator)
        if (strpos($price, ',') !== false && strpos($price, '.') === false) {
            $price = str_replace(',', '.', $price);
        }

        return (float) $price;
    }

    /**
     * Parse weight value
     *
     * @param string $weight Weight string
     * @return float Parsed weight
     */
    private function parseWeight($weight)
    {
        // Remove units and spaces
        $weight = preg_replace('/[^\d.,]/', '', $weight);

        // Handle French decimal format
        if (strpos($weight, ',') !== false && strpos($weight, '.') === false) {
            $weight = str_replace(',', '.', $weight);
        }

        return (float) $weight;
    }

    /**
     * Parse quantity value
     *
     * @param string $qty Quantity string
     * @return int Parsed quantity
     */
    private function parseQty($qty)
    {
        return (int) preg_replace('/[^\d]/', '', $qty);
    }

    /**
     * Get processed products
     *
     * @return array Processed products
     */
    public function getProcessedProducts()
    {
        return $this->processedProducts;
    }

    /**
     * Get processing errors
     *
     * @return array Processing errors
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * Save processed data to file
     *
     * @param string $filename Output filename
     */
    public function saveProcessedData($filename)
    {
        $data = [
            'processed_at' => date('Y-m-d H:i:s'),
            'total_products' => count($this->processedProducts),
            'total_errors' => count($this->errors),
            'products' => $this->processedProducts,
            'errors' => $this->errors
        ];

        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
        $this->log("Processed data saved to: $filename");
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

        // Output to console if running from command line
        if (php_sapi_name() === 'cli') {
            echo $logMessage;
        }
    }
}