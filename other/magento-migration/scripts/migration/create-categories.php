<?php
/**
 * Magento Category Creation Script
 *
 * This script creates the complete category hierarchy for the French office supplies store
 * using Magento's REST API.
 *
 * @author Magento Migration Tool
 * @version 1.0
 */

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../api/MagentoApiClient.php';

class CategoryCreator
{
    private $apiClient;
    private $categoryHierarchy;
    private $createdCategories = [];
    private $logFile;

    public function __construct($apiClient)
    {
        $this->apiClient = $apiClient;
        $this->logFile = __DIR__ . '/../../logs/category-creation-' . date('Y-m-d-H-i-s') . '.log';
        $this->loadCategoryHierarchy();
    }

    /**
     * Load category hierarchy from JSON file
     */
    private function loadCategoryHierarchy()
    {
        $hierarchyFile = __DIR__ . '/../../data/categories/category-hierarchy.json';
        if (!file_exists($hierarchyFile)) {
            throw new Exception("Category hierarchy file not found: $hierarchyFile");
        }

        $content = file_get_contents($hierarchyFile);
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON in category hierarchy file: " . json_last_error_msg());
        }

        $this->categoryHierarchy = $data['category_hierarchy'];
        $this->log("Category hierarchy loaded successfully");
    }

    /**
     * Create all categories from the hierarchy
     */
    public function createAllCategories()
    {
        $this->log("Starting category creation process");

        try {
            $rootCategory = $this->categoryHierarchy['root_category'];
            $this->createCategoryRecursive($rootCategory, null, 1);

            $this->log("Category creation completed successfully");
            $this->log("Total categories created: " . count($this->createdCategories));

            return $this->createdCategories;

        } catch (Exception $e) {
            $this->log("ERROR: Category creation failed - " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Recursively create categories
     */
    private function createCategoryRecursive($categoryData, $parentId = null, $level = 1)
    {
        $categoryPayload = [
            'category' => [
                'name' => $categoryData['name'],
                'is_active' => $categoryData['is_active'],
                'include_in_menu' => $categoryData['include_in_menu'],
                'custom_attributes' => [
                    [
                        'attribute_code' => 'url_key',
                        'value' => $categoryData['url_key']
                    ]
                ]
            ]
        ];

        // Add description if provided
        if (isset($categoryData['description'])) {
            $categoryPayload['category']['custom_attributes'][] = [
                'attribute_code' => 'description',
                'value' => $categoryData['description']
            ];
        }

        // Set parent category if provided
        if ($parentId !== null) {
            $categoryPayload['category']['parent_id'] = $parentId;
        }

        try {
            $this->log("Creating category: " . $categoryData['name'] . " (Level: $level)");

            // Create category via API
            $response = $this->apiClient->post('/rest/V1/categories', $categoryPayload);

            if (isset($response['id'])) {
                $categoryId = $response['id'];
                $this->createdCategories[$categoryData['url_key']] = [
                    'id' => $categoryId,
                    'name' => $categoryData['name'],
                    'url_key' => $categoryData['url_key'],
                    'parent_id' => $parentId,
                    'level' => $level
                ];

                $this->log("✓ Category created successfully: ID $categoryId - " . $categoryData['name']);

                // Create child categories if they exist
                if (isset($categoryData['children']) && is_array($categoryData['children'])) {
                    foreach ($categoryData['children'] as $childKey => $childData) {
                        $this->createCategoryRecursive($childData, $categoryId, $level + 1);
                    }
                }

            } else {
                throw new Exception("Category creation failed - no ID returned");
            }

        } catch (Exception $e) {
            $this->log("✗ Failed to create category: " . $categoryData['name'] . " - " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get created categories mapping
     */
    public function getCreatedCategories()
    {
        return $this->createdCategories;
    }

    /**
     * Save category mapping to file
     */
    public function saveCategoryMapping()
    {
        $mappingFile = __DIR__ . '/../../data/categories/category-mapping.json';
        $mappingData = [
            'created_at' => date('Y-m-d H:i:s'),
            'total_categories' => count($this->createdCategories),
            'categories' => $this->createdCategories
        ];

        file_put_contents($mappingFile, json_encode($mappingData, JSON_PRETTY_PRINT));
        $this->log("Category mapping saved to: $mappingFile");
    }

    /**
     * Log messages to file and console
     */
    private function log($message)
    {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message" . PHP_EOL;

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

        // Initialize API client
        $apiClient = new MagentoApiClient(
            $config['magento']['base_url'],
            $config['magento']['admin_token']
        );

        // Create categories
        $categoryCreator = new CategoryCreator($apiClient);
        $createdCategories = $categoryCreator->createAllCategories();

        // Save mapping
        $categoryCreator->saveCategoryMapping();

        echo "\n=== CATEGORY CREATION SUMMARY ===\n";
        echo "Total categories created: " . count($createdCategories) . "\n";
        echo "Log file: " . $categoryCreator->logFile . "\n";
        echo "Mapping file: data/categories/category-mapping.json\n";
        echo "=================================\n";

    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
        exit(1);
    }
}