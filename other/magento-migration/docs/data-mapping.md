# Data Mapping Documentation

## Overview

This document provides comprehensive mapping information for migrating data from the French office supplies store CSV format to Magento 2. It includes field mappings, data transformations, and validation rules.

## Source Data Analysis

### CSV Structure Analysis

Based on the analysis of `export_catalog_product.csv` and `sample.csv`, the source data contains:

- **Total Products**: ~50+ products
- **Product Types**: Simple and configurable products
- **Categories**: 5-level hierarchy with French names
- **Brands**: CASIO, PILOT, ARK, CALLIGRAPHE, and others
- **Languages**: French product names and descriptions
- **Custom Attributes**: Brand, technical reference, color, dimensions, etc.

### Source CSV Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `sku` | String | Product SKU | "CASIO-FX-82MS-2" |
| `name` | String | Product name (French) | "Calculatrice scientifique CASIO FX-82MS-2" |
| `description` | Text | Product description | "Calculatrice scientifique avec 240 fonctions" |
| `short_description` | Text | Short description | "Calculatrice scientifique" |
| `price` | Decimal | Product price | "15.99" |
| `weight` | Decimal | Product weight | "0.5" |
| `qty` | Integer | Stock quantity | "100" |
| `categories` | String | Category path | "Default Category/Tous les produits/SCOLAIRE/CALCULATRICES/CALCULATRICES SCIENTIFIQUES" |
| `image` | String | Image filename | "casio-fx-82ms.jpg" |
| `additional_attributes` | String | Key-value pairs | "mgs_brand=CASIO,techno_ref=FX82MS2,color=noir" |
| `type_id` | String | Product type | "simple" or "configurable" |
| `attribute_set_id` | Integer | Attribute set ID | "4" |
| `status` | Integer | Product status | "1" (enabled) |
| `visibility` | Integer | Product visibility | "4" (catalog, search) |

## Magento Field Mapping

### Core Product Fields

| Source Field | Magento Field | Transformation | Notes |
|--------------|---------------|----------------|-------|
| `sku` | `sku` | Direct mapping | Validated for uniqueness |
| `name` | `name` | Direct mapping | HTML tags stripped |
| `description` | `description` | Clean HTML | Encoding converted to UTF-8 |
| `short_description` | `short_description` | Clean HTML | Encoding converted to UTF-8 |
| `price` | `price` | Parse decimal | French format (comma) to decimal |
| `weight` | `weight` | Parse decimal | Units removed, decimal conversion |
| `type_id` | `type_id` | Logic-based | Determined by product data |
| `attribute_set_id` | `attribute_set_id` | Category-based | Based on product category |
| `status` | `status` | Default/mapping | Default: 1 (enabled) |
| `visibility` | `visibility` | Default/mapping | Default: 4 (catalog, search) |

### Stock Information

| Source Field | Magento Field | Transformation | Notes |
|--------------|---------------|----------------|-------|
| `qty` | `extension_attributes.stock_item.qty` | Parse integer | Default: 100 |
| N/A | `extension_attributes.stock_item.is_in_stock` | Default | Default: true |
| N/A | `extension_attributes.stock_item.manage_stock` | Default | Default: true |

### Category Mapping

Categories are mapped from the hierarchical path in the `categories` field:

```
Source: "Default Category/Tous les produits/SCOLAIRE/CALCULATRICES/CALCULATRICES SCIENTIFIQUES"
Target: Array of category IDs [2, 15, 23, 45, 67]
```

#### Category Hierarchy Mapping

| Source Category Path | Magento Category ID | URL Key |
|---------------------|-------------------|---------|
| Default Category | 1 | default-category |
| Tous les produits | 2 | tous-les-produits |
| SCOLAIRE | 3 | scolaire |
| SCOLAIRE/CALCULATRICES | 4 | scolaire-calculatrices |
| SCOLAIRE/CALCULATRICES/CALCULATRICES SCIENTIFIQUES | 5 | calculatrices-scientifiques |
| SCOLAIRE/ECRITURE & CORRECTION | 6 | scolaire-ecriture-correction |
| BUREAUTIQUE | 7 | bureautique |
| LOISIRS CREATIFS | 8 | loisirs-creatifs |
| BEAUX ARTS | 9 | beaux-arts |
| BRICOLAGE | 10 | bricolage |

### Custom Attributes Mapping

#### Brand Attribute (mgs_brand)

| Source Value | Magento Option | Option ID |
|--------------|----------------|-----------|
| CASIO | casio | 1 |
| PILOT | pilot | 2 |
| ARK | ark | 3 |
| CALLIGRAPHE | calligraphe | 4 |
| STABILO | stabilo | 5 |
| MAPED | maped | 6 |
| BIC | bic | 7 |
| FABER-CASTELL | faber_castell | 8 |
| STAEDTLER | staedtler | 9 |
| PENTEL | pentel | 10 |

#### Color Attribute (color)

| Source Value | Magento Option | Option ID |
|--------------|----------------|-----------|
| noir | noir | 1 |
| bleu | bleu | 2 |
| rouge | rouge | 3 |
| vert | vert | 4 |
| jaune | jaune | 5 |
| orange | orange | 6 |
| violet | violet | 7 |
| rose | rose | 8 |
| marron | marron | 9 |
| gris | gris | 10 |
| blanc | blanc | 11 |
| transparent | transparent | 12 |
| multicolore | multicolore | 13 |
| assortis | assortis | 14 |

#### Diameter Attribute (diameter)

| Source Value | Magento Option | Option ID |
|--------------|----------------|-----------|
| 0.3mm | 0_3mm | 1 |
| 0.4mm | 0_4mm | 2 |
| 0.5mm | 0_5mm | 3 |
| 0.7mm | 0_7mm | 4 |
| 1.0mm | 1_0mm | 5 |
| 1.2mm | 1_2mm | 6 |
| 1.4mm | 1_4mm | 7 |
| 1.6mm | 1_6mm | 8 |
| 2.0mm | 2_0mm | 9 |
| 2.5mm | 2_5mm | 10 |
| 3.0mm | 3_0mm | 11 |

#### Text Attributes

| Attribute Code | Source | Transformation | Example |
|----------------|--------|----------------|---------|
| `techno_ref` | additional_attributes | Direct mapping | "FX82MS2" |
| `dimension` | additional_attributes | Direct mapping | "15.5 x 8.0 x 1.5 cm" |
| `capacity` | additional_attributes | Direct mapping | "240 fonctions" |

## Data Transformation Rules

### Text Processing

1. **HTML Cleaning**
   ```php
   $cleanText = strip_tags($sourceText);
   ```

2. **Encoding Conversion**
   ```php
   if (!mb_check_encoding($text, 'UTF-8')) {
       $text = mb_convert_encoding($text, 'UTF-8', 'auto');
   }
   ```

3. **Whitespace Normalization**
   ```php
   $text = trim($text);
   $text = preg_replace('/\s+/', ' ', $text);
   ```

### Numeric Processing

1. **Price Conversion**
   ```php
   // Handle French decimal format (comma as decimal separator)
   $price = str_replace(',', '.', $price);
   $price = preg_replace('/[^\d.]/', '', $price);
   $price = (float) $price;
   ```

2. **Weight Conversion**
   ```php
   // Remove units (kg, g, etc.)
   $weight = preg_replace('/[^\d.,]/', '', $weight);
   $weight = str_replace(',', '.', $weight);
   $weight = (float) $weight;
   ```

3. **Quantity Processing**
   ```php
   $qty = (int) preg_replace('/[^\d]/', '', $qty);
   ```

### Category Processing

1. **Path Parsing**
   ```php
   $categoryPath = "Default Category/Tous les produits/SCOLAIRE/CALCULATRICES";
   $pathParts = explode('/', $categoryPath);
   // Remove "Default Category" prefix
   array_shift($pathParts);
   ```

2. **Category ID Resolution**
   ```php
   foreach ($pathParts as $categoryName) {
       $categoryId = findCategoryIdByName($categoryName);
       $categoryIds[] = $categoryId;
   }
   ```

### Additional Attributes Processing

1. **Parse Key-Value Pairs**
   ```php
   $additionalAttrs = "mgs_brand=CASIO,techno_ref=FX82MS2,color=noir";
   $pairs = explode(',', $additionalAttrs);
   foreach ($pairs as $pair) {
       list($key, $value) = explode('=', $pair, 2);
       $attributes[trim($key)] = trim($value);
   }
   ```

## Attribute Set Assignment

Products are assigned to attribute sets based on their category:

### Assignment Logic

```php
function getAttributeSetId($categories) {
    if (stripos($categories, 'CALCULATRICES') !== false) {
        return 'Calculators';
    } elseif (stripos($categories, 'ECRITURE') !== false ||
              stripos($categories, 'STYLOS') !== false) {
        return 'Writing Instruments';
    } elseif (stripos($categories, 'COLORIAGE') !== false ||
              stripos($categories, 'BEAUX ARTS') !== false) {
        return 'Art Supplies';
    } elseif (stripos($categories, 'ELECTRONIQUE') !== false) {
        return 'Electronic Equipment';
    }
    return 'Office Supplies General';
}
```

### Attribute Set Mapping

| Category Pattern | Attribute Set | ID |
|------------------|---------------|----|
| CALCULATRICES | Calculators | 5 |
| ECRITURE, STYLOS | Writing Instruments | 6 |
| COLORIAGE, BEAUX ARTS | Art Supplies | 7 |
| ELECTRONIQUE | Electronic Equipment | 8 |
| Default | Office Supplies General | 4 |

## Product Type Determination

Products are classified as simple or configurable based on their data:

### Logic Rules

```php
function determineProductType($rowData) {
    // Check for configurable variations
    if (!empty($rowData['configurable_variations'])) {
        return 'configurable';
    }

    // Check for multiple color options
    if (!empty($rowData['color']) && strpos($rowData['color'], ',') !== false) {
        return 'configurable';
    }

    return 'simple';
}
```

## Image Processing

### Image Mapping

| Source Field | Magento Field | Processing |
|--------------|---------------|------------|
| `image` | `media_gallery_entries` | Array of media entries |

### Media Gallery Structure

```php
$mediaGallery = [
    [
        'media_type' => 'image',
        'label' => $productName,
        'position' => 0,
        'disabled' => false,
        'types' => ['image', 'small_image', 'thumbnail'],
        'file' => $imageFilename
    ]
];
```

## Validation Rules

### Required Fields

- `sku`: Must be unique, alphanumeric with hyphens/underscores
- `name`: Must not be empty
- `price`: Must be numeric and >= 0
- `category_ids`: Must contain at least one valid category ID

### SKU Validation

```php
function validateSku($sku) {
    return preg_match('/^[a-zA-Z0-9_-]+$/', $sku);
}
```

### Price Validation

```php
function validatePrice($price) {
    return is_numeric($price) && $price >= 0;
}
```

## Error Handling

### Common Data Issues

1. **Missing SKU**
   - Action: Skip product
   - Log: "SKU is required"

2. **Invalid Price**
   - Action: Set to 0 or skip
   - Log: "Invalid price format"

3. **Missing Category**
   - Action: Assign to default category
   - Log: "Category not found, using default"

4. **Invalid Characters**
   - Action: Clean or skip
   - Log: "Invalid characters removed"

### Data Quality Checks

1. **Duplicate SKUs**
   ```php
   $skuCounts = array_count_values($skus);
   $duplicates = array_filter($skuCounts, function($count) {
       return $count > 1;
   });
   ```

2. **Missing Required Fields**
   ```php
   $requiredFields = ['sku', 'name', 'price'];
   foreach ($requiredFields as $field) {
       if (empty($product[$field])) {
           $errors[] = "$field is required";
       }
   }
   ```

## Performance Considerations

### Batch Processing

- Process products in batches of 10-50
- Use rate limiting between API calls
- Monitor memory usage during processing

### Memory Optimization

```php
// Clear processed data from memory
unset($processedProducts);
gc_collect_cycles();
```

### API Rate Limiting

```php
// Add delay between requests
sleep($rateLimitDelay);
```

## Localization

### French Language Support

- All text fields support UTF-8 encoding
- French decimal format (comma) is converted to standard format
- French category names are preserved
- Special characters (é, è, à, etc.) are properly handled

### Currency and Formatting

- Prices are stored in EUR
- Decimal separator: comma (,) → period (.)
- Thousands separator: space ( ) → removed
- Date format: d/m/Y → Y-m-d H:i:s

This comprehensive data mapping ensures accurate and consistent migration of all product data from the source CSV format to Magento 2, maintaining data integrity and supporting the French office supplies business requirements.