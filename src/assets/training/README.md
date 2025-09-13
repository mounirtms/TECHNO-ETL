# Professional Bulk Image Upload Training

This document explains how the professional bulk image upload feature works in the Techno-ETL system.

## Overview

The professional bulk image upload feature allows users to:
1. Match product images using a reference (ref) column in a CSV file
2. Rename images according to product names specified in the CSV image name column
3. Handle multiple images per product with automatic numbering
4. Resize images to standard dimensions
5. Upload processed images to the server

## CSV Format

The CSV file must contain at least these columns:
- `sku` - Product SKU identifier
- `ref` - Reference code used for image matching
- `Image Name` - Target name for the product images

Example:
```csv
sku,product_name,Image Name,ref
1140663714,"CRAYONS DE COULEUR CLASSIC PASTEL BOITE X10",crayons-de-couleur-classic-pastel-boite-x10,111211
1140663711,"CRAYONS DE COULEUR CLASSIC BOITE DE 60 PCS",crayons-de-couleur-classic-boite-de-60-pcs,111260
```

## Image Matching Process

1. **Professional Mode Detection**: The system detects the presence of a `ref` column and automatically enables professional mode.

2. **Image Matching**: For each product in the CSV:
   - The system looks for image files whose filenames contain the `ref` value
   - Example: Product with ref=111211 matches files `111211_0_PM99.webp` and `111211_alt.jpg`

3. **Multiple Image Handling**: When a product has multiple matching images:
   - First image gets the base name: `crayons-de-couleur-classic-pastel-boite-x10.webp`
   - Additional images get numbered suffixes: `crayons-de-couleur-classic-pastel-boite-x10_1.jpg`

## Image Processing Pipeline

1. **Validation**: Check file formats (JPG, PNG, WebP) and sizes (max 10MB)

2. **Renaming**: Rename files according to the `Image Name` column with proper numbering

3. **Resizing**: Resize images to standard dimensions (1200x1200) with white background

4. **Optimization**: Optimize images for web delivery

5. **Upload**: Upload processed images to the server

## Example Workflow

Given this CSV data:
```csv
sku,name,Image Name,ref
1140663714,"Crayons Pastel X10",crayons-pastel-x10,111211
```

And these image files:
- `111211_0_PM99.webp`
- `111211_alt.jpg`

The system will:
1. Match both images to the product (since they contain "111211")
2. Rename them to:
   - `crayons-pastel-x10.webp`
   - `crayons-pastel-x10_1.jpg`
3. Resize both to 1200x1200
4. Upload the processed images

## Technical Implementation

The feature is implemented in:
- `src/services/professionalBulkImageUpload.js` - Core matching and renaming logic
- `backend/src/services/imageProcessor.js` - Image resizing and optimization
- `src/components/dialogs/ProfessionalBulkUploadDialog.jsx` - User interface

The system uses the Sharp library for high-performance image processing.