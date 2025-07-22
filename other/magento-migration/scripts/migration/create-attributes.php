<?php
/**
 * Magento Product Attributes Creation Script
 *
 * This script creates all custom product attributes and attribute sets
 * for the French office supplies store using Magento's REST API.
 *
 * @author Magento Migration Tool
 * @version 1.0
 */

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../api/MagentoApiClient.php';

class AttributeManager
{
    private $apiClient;
    private $attributesConfig;
    private $attributeSetsConfig;
    private $createdAttributes = [];
    private $createdAttributeSets = [];
    private $logFile;

    public function __construct($apiClient)
    {
        $this->apiClient = $apiClient;
        $this->logFile = __DIR__ . '/../../logs/attribute-creation-' . date('Y-m-d-H-i-s') . '.log';
        $this->loadConfigurations();
    }

    /**
     * Load attribute and attribute set configurations
     */
    private function loadConfigurations()
    {
        // Load attributes configuration
        $attributesFile = __DIR__ . '/../../config/attributes.json';
        if (!file_exists($attributesFile)) {
            throw new Exception("Attributes configuration file not found: $attributesFile");
        }

        $attributesContent = file_get_contents($attributesFile);
        $attributesData = json_decode($attributesContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON in attributes file: " . json_last_error_msg());
        }

        $this->attributesConfig = $attributesData['product_attributes'];

        // Load attribute sets configuration
        $attributeSetsFile = __DIR__ . '/../../config/attribute-sets.json';
        if (!file_exists($attributeSetsFile)) {
            throw new Exception("Attribute sets configuration file not found: $attributeSetsFile");
        }

        $attributeSetsContent = file_get_contents($attributeSetsFile);
        $attributeSetsData = json_decode($attributeSetsContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON in attribute sets file: " . json_last_error_msg());
        }

        $this->attributeSetsConfig = $attributeSetsData['attribute_sets'];

        $this->log("Configuration files loaded successfully");
    }

    /**
     * Create all attributes and attribute sets
     */
    public function createAllAttributes()
    {
        $this->log("Starting attribute creation process");

        try {
            // First create all attributes
            $this->createAttributes();

            // Then create attribute sets
            $this->createAttributeSets();

            $this->log("Attribute creation completed successfully");
            $this->log("Total attributes created: " . count($this->createdAttributes));
            $this->log("Total attribute sets created: " . count($this->createdAttributeSets));

            return [
                'attributes' => $this->createdAttributes,
                'attribute_sets' => $this->createdAttributeSets
            ];

        } catch (Exception $e) {
            $this->log("ERROR: Attribute creation failed - " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create product attributes
     */
    private function createAttributes()
    {
        $this->log("Creating product attributes...");

        foreach ($this->attributesConfig['attributes'] as $attributeCode => $attributeData) {
            try {
                $this->log("Creating attribute: " . $attributeCode);

                $attributePayload = [
                    'attribute' => [
                        'attribute_code' => $attributeData['attribute_code'],
                        'frontend_input' => $attributeData['frontend_input'],
                        'frontend_labels' => [
                            [
                                'store_id' => 0,
                                'label' => $attributeData['frontend_label']
                            ]
                        ],
                        'backend_type' => $attributeData['backend_type'],
                        'is_required' => $attributeData['is_required'],
                        'is_user_defined' => $attributeData['is_user_defined'],
                        'is_unique' => $attributeData['is_unique'],
                        'scope' => $attributeData['is_global'] ? 'global' : 'store',
                        'is_visible' => $attributeData['is_visible'],
                        'is_searchable' => $attributeData['is_searchable'],
                        'is_filterable' => $attributeData['is_filterable'],
                        'is_comparable' => $attributeData['is_comparable'],
                        'is_visible_on_front' => $attributeData['is_visible_on_front'],
                        'is_html_allowed_on_front' => $attributeData['is_html_allowed_on_front'],
                        'is_used_for_price_rules' => $attributeData['is_used_for_price_rules'],
                        'is_filterable_in_search' => $attributeData['is_filterable_in_search'],
                        'used_in_product_listing' => $attributeData['used_in_product_listing'],
                        'used_for_sort_by' => $attributeData['used_for_sort_by'],
                        'frontend_class' => $attributeData['frontend_class'],
                        'is_visible_in_advanced_search' => $attributeData['is_visible_in_advanced_search'],
                        'position' => $attributeData['position'],
                        'apply_to' => $attributeData['apply_to']
                    ]
                ];

                // Add options for select attributes
                if (isset($attributeData['options']) && $attributeData['frontend_input'] === 'select') {
                    $options = [];
                    foreach ($attributeData['options'] as $option) {
                        $options[] = [
                            'label' => $option['label'],
                            'value' => $option['value'],
                            'sort_order' => $option['sort_order']
                        ];
                    }
                    $attributePayload['attribute']['options'] = $options;
                }

                // Create attribute via API
                $response = $this->apiClient->post('/rest/V1/products/attributes', $attributePayload);

                if (isset($response['attribute_id'])) {
                    $this->createdAttributes[$attributeCode] = [
                        'attribute_id' => $response['attribute_id'],
                        'attribute_code' => $attributeCode,
                        'frontend_label' => $attributeData['frontend_label'],
                        'frontend_input' => $attributeData['frontend_input']
                    ];

                    $this->log("✓ Attribute created successfully: " . $attributeCode);
                } else {
                    throw new Exception("Attribute creation failed - no attribute_id returned");
                }

            } catch (Exception $e) {
                $this->log("✗ Failed to create attribute: " . $attributeCode . " - " . $e->getMessage());
                // Continue with other attributes instead of stopping
                continue;
            }
        }
    }

    /**
     * Create attribute sets
     */
    private function createAttributeSets()
    {
        $this->log("Creating attribute sets...");

        foreach ($this->attributeSetsConfig['sets'] as $setKey => $setData) {
            try {
                $this->log("Creating attribute set: " . $setData['attribute_set_name']);

                // First create the attribute set
                $attributeSetPayload = [
                    'attributeSet' => [
                        'attribute_set_name' => $setData['attribute_set_name'],
                        'sort_order' => $setData['sort_order']
                    ],
                    'skeletonId' => 4 // Default attribute set ID
                ];

                $response = $this->apiClient->post('/rest/V1/products/attribute-sets', $attributeSetPayload);

                if (isset($response['attribute_set_id'])) {
                    $attributeSetId = $response['attribute_set_id'];

                    $this->createdAttributeSets[$setKey] = [
                        'attribute_set_id' => $attributeSetId,
                        'attribute_set_name' => $setData['attribute_set_name'],
                        'sort_order' => $setData['sort_order']
                    ];

                    $this->log("✓ Attribute set created successfully: " . $setData['attribute_set_name']);

                    // Create attribute groups and assign attributes
                    if (isset($setData['groups'])) {
                        $this->createAttributeGroups($attributeSetId, $setData['groups']);
                    }

                } else {
                    throw new Exception("Attribute set creation failed - no attribute_set_id returned");
                }

            } catch (Exception $e) {
                $this->log("✗ Failed to create attribute set: " . $setData['attribute_set_name'] . " - " . $e->getMessage());
                continue;
            }
        }
    }

    /**
     * Create attribute groups and assign attributes
     */
    private function createAttributeGroups($attributeSetId, $groups)
    {
        foreach ($groups as $groupKey => $groupData) {
            try {
                $this->log("Creating attribute group: " . $groupData['attribute_group_name']);

                // Create attribute group
                $groupPayload = [
                    'group' => [
                        'attribute_group_name' => $groupData['attribute_group_name'],
                        'attribute_set_id' => $attributeSetId,
                        'sort_order' => $groupData['sort_order']
                    ]
                ];

                $groupResponse = $this->apiClient->post('/rest/V1/products/attribute-sets/groups', $groupPayload);

                if (isset($groupResponse['attribute_group_id'])) {
                    $groupId = $groupResponse['attribute_group_id'];
                    $this->log("✓ Attribute group created: " . $groupData['attribute_group_name']);

                    // Assign attributes to the group
                    if (isset($groupData['attributes'])) {
                        $this->assignAttributesToGroup($attributeSetId, $groupId, $groupData['attributes']);
                    }

                } else {
                    $this->log("✗ Failed to create attribute group: " . $groupData['attribute_group_name']);
                }

            } catch (Exception $e) {
                $this->log("✗ Failed to create attribute group: " . $groupData['attribute_group_name'] . " - " . $e->getMessage());
                continue;
            }
        }
    }

    /**
     * Assign attributes to attribute group
     */
    private function assignAttributesToGroup($attributeSetId, $groupId, $attributes)
    {
        foreach ($attributes as $attributeCode) {
            try {
                // Get attribute ID
                $attributeInfo = $this->apiClient->get("/rest/V1/products/attributes/$attributeCode");

                if (isset($attributeInfo['attribute_id'])) {
                    $attributeId = $attributeInfo['attribute_id'];

                    // Assign attribute to set and group
                    $assignPayload = [
                        'attributeSetId' => $attributeSetId,
                        'attributeGroupId' => $groupId,
                        'attributeCode' => $attributeCode,
                        'sortOrder' => 0
                    ];

                    $this->apiClient->post('/rest/V1/products/attribute-sets/attributes', $assignPayload);
                    $this->log("✓ Assigned attribute $attributeCode to group");

                } else {
                    $this->log("✗ Could not find attribute: $attributeCode");
                }

            } catch (Exception $e) {
                $this->log("✗ Failed to assign attribute $attributeCode: " . $e->getMessage());
                continue;
            }
        }
    }

    /**
     * Save attribute mapping to file
     */
    public function saveAttributeMapping()
    {
        $mappingFile = __DIR__ . '/../../data/processed/attribute-mapping.json';
        $mappingData = [
            'created_at' => date('Y-m-d H:i:s'),
            'total_attributes' => count($this->createdAttributes),
            'total_attribute_sets' => count($this->createdAttributeSets),
            'attributes' => $this->createdAttributes,
            'attribute_sets' => $this->createdAttributeSets
        ];

        file_put_contents($mappingFile, json_encode($mappingData, JSON_PRETTY_PRINT));
        $this->log("Attribute mapping saved to: $mappingFile");
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

        // Create attributes and attribute sets
        $attributeManager = new AttributeManager($apiClient);
        $result = $attributeManager->createAllAttributes();

        // Save mapping
        $attributeManager->saveAttributeMapping();

        echo "\n=== ATTRIBUTE CREATION SUMMARY ===\n";
        echo "Total attributes created: " . count($result['attributes']) . "\n";
        echo "Total attribute sets created: " . count($result['attribute_sets']) . "\n";
        echo "Log file: " . $attributeManager->logFile . "\n";
        echo "Mapping file: data/processed/attribute-mapping.json\n";
        echo "==================================\n";

    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
        exit(1);
    }
}