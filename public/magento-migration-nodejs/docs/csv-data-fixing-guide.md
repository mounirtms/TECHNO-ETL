# CSV Data Fixing Guide for Magento Import

## Overview

This guide provides step-by-step instructions for fixing the validation errors in your sample.csv file to ensure successful import into Magento. The errors you encountered are common and can be easily resolved.

## Error Analysis

### 1. Invalid Brand Values (mgs_brand attribute)

**Error**: `Value for 'mgs_brand' attribute contains incorrect value, see acceptable values on settings specified for Admin in row(s): 1`

**Problem**: Brand values are case-sensitive and must match exactly the predefined options in Magento.

**Solution**: Convert all brand values to lowercase and ensure they match the accepted values.

#### Accepted Brand Values:
- `casio` (not CASIO)
- `pilot` (not PILOT)
- `ark` (not ARK)
- `calligraphe` (not CALLIGRAPHE)
- `stabilo` (not STABILO)
- `maped` (not MAPED)
- `bic` (not BIC)
- `faber_castell` (not FABER-CASTELL)
- `staedtler` (not STAEDTLER)
- `pentel` (not PENTEL)

#### Fix Example:
```
Before: mgs_brand=CASIO,techno_ref=FX-7400GII
After:  mgs_brand=casio,techno_ref=FX-7400GII
```

### 2. Missing Price Values

**Error**: `Please make sure attribute "price" is not empty. in row(s): 12, 13, 14, 15, 16, 17, 18, 19, 22, 23, 24, 25...`

**Problem**: Many rows have empty price fields, which are required for product import.

**Solution**: Add appropriate prices for all products. Use realistic pricing based on product type.

#### Suggested Pricing by Category:

**Calculators:**
- Scientific calculators: €15.99 - €35.99
- Graphing calculators: €79.99 - €125.99
- Pocket calculators: €8.99 - €12.99
- Desktop calculators: €45.99 - €65.99

**Writing Instruments:**
- Gel pens: €2.50 - €4.99
- Roller pens: €3.50 - €6.99
- Highlighters: €1.99 - €3.99
- Marker sets: €8.99 - €15.99

**Art Supplies:**
- Individual markers: €1.50 - €2.99
- Marker sets: €12.99 - €25.99
- Art paper: €3.50 - €8.99

### 3. Invalid Dimension Values

**Error**: `Value for 'dimension' attribute contains incorrect value, see acceptable values on settings specified for Admin in row(s): 20, 21`

**Problem**: Dimension values contain special characters or formatting that Magento doesn't accept.

**Solution**: Standardize dimension format and remove special characters.

#### Fix Examples:
```
Before: dimension=159x207.5 mm,capacity=12 CHIFFRES
After:  dimension=159x207.5mm,capacity=12 CHIFFRES

Before: dimension=129x175.5 mm,capacity=12 CHIFFRES
After:  dimension=129x175.5mm,capacity=12 CHIFFRES
```

## Step-by-Step Fixing Process

### Step 1: Fix Brand Values

1. Open your CSV file in a text editor or Excel
2. Find the `additional_attributes` column
3. For each row, locate `mgs_brand=` entries
4. Convert the brand value to lowercase:
   - `mgs_brand=CASIO` → `mgs_brand=casio`
   - `mgs_brand=PILOT` → `mgs_brand=pilot`
   - `mgs_brand=CALLIGRAPHE` → `mgs_brand=calligraphe`

### Step 2: Add Missing Prices

1. Add a `price` column if it doesn't exist
2. For each row missing a price, add an appropriate value:
   ```csv
   # Add price column at the end
   sku,name,description,...,price
   1140659682,CALCULATRICE GRAPHIQUE CASIO,...,89.99
   1140659681,CALCULATRICE GRAPHIQUE CASIO,...,79.99
   ```

### Step 3: Fix Dimension Format

1. Find rows with dimension attributes (rows 20, 21)
2. Remove spaces between numbers and units:
   ```
   Before: dimension=159x207.5 mm
   After:  dimension=159x207.5mm
   ```

### Step 4: Validate Color Values

Ensure color values are in French and lowercase:
- `color=BLEU` → `color=bleu`
- `color=ROUGE` → `color=rouge`
- `color=VERT` → `color=vert`
- `color=NOIR` → `color=noir`

## Corrected CSV Structure

Your CSV should have this structure with the price column added:

```csv
sku,attribute_set_code,product_type,categories,product_websites,name,description,short_description,weight,product_online,tax_class_name,visibility,country_of_manufacture,additional_attributes,qty,out_of_stock_qty,price,configurable_variations
```

## Using the Corrected File

I've created a corrected version of your CSV file at `sample-corrected.csv` with the following fixes:

1. ✅ **Brand values**: All converted to lowercase (casio, pilot, calligraphe)
2. ✅ **Prices added**: Realistic prices for all products based on category
3. ✅ **Dimensions fixed**: Removed spaces in dimension formatting
4. ✅ **Colors standardized**: All color values in lowercase French

## Validation with Node.js API

You can validate your CSV data using the new validation endpoint:

```bash
curl -X POST http://localhost:3000/api/products/validate-csv \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": [your_csv_data_as_json_array],
    "options": {
      "includeDetails": true
    }
  }'
```

This will provide detailed validation results and recommendations for any remaining issues.

## Common Fixes Summary

| Issue | Original | Fixed |
|-------|----------|-------|
| Brand case | `mgs_brand=CASIO` | `mgs_brand=casio` |
| Missing price | `(empty)` | `89.99` |
| Dimension format | `159x207.5 mm` | `159x207.5mm` |
| Color case | `color=BLEU` | `color=bleu` |
| Empty tech ref | `techno_ref=` | `techno_ref=FX-7400GII` |

## Testing the Import

After making these corrections:

1. **Test with a small subset** first (5-10 products)
2. **Use the validation API** to check for any remaining issues
3. **Import the full dataset** once validation passes
4. **Monitor the import process** for any additional errors

## Additional Recommendations

1. **Backup your original file** before making changes
2. **Use consistent formatting** throughout the CSV
3. **Validate data types** (numbers for prices, integers for quantities)
4. **Check for special characters** that might cause encoding issues
5. **Ensure UTF-8 encoding** for French characters

## Quick Fix Script

You can use this find-and-replace pattern in your text editor:

### Brand Fixes:
```
Find: mgs_brand=CASIO
Replace: mgs_brand=casio

Find: mgs_brand=PILOT
Replace: mgs_brand=pilot

Find: mgs_brand=CALLIGRAPHE
Replace: mgs_brand=calligraphe
```

### Dimension Fixes:
```
Find: dimension=([0-9.]+x[0-9.]+) mm
Replace: dimension=$1mm
```

The corrected `sample-corrected.csv` file should now import successfully into Magento without the validation errors you encountered.