# Calligraph Bulk Upload Testing Guide

## 📋 Overview

This guide provides comprehensive testing instructions for the Calligraph-specific bulk media upload functionality, which is designed to handle the exact CSV structure and image naming patterns used in the Calligraph product catalog.

## 🎯 Key Features to Test

### 1. **REF Column Matching**
- Primary matching strategy using the `ref` column from CSV
- Handles references like `7203C`, `203C`, `2282C`, etc.
- Matches with image files named `7203C.jpg`, `7203C_1.jpg`, `7203C_2.jpg`

### 2. **Multiple Images per SKU**
- Supports multiple images per product
- Automatic numbering: `_1`, `_2`, `_3`, etc.
- Proper final naming using the `image name` column

### 3. **Professional Image Processing**
- Resize to 1200x1200px with aspect ratio preservation
- White background padding
- 90% JPEG quality compression
- Batch processing with progress tracking

## 🧪 Test Scenarios

### **Scenario 1: Basic REF Matching**

#### Test Data Setup:
```
CSV Row: SKU=1140659601, REF=7203C, image name=cahier-brochure-remborde-calligraphe-rigide-192p-17x22cm-70g-seyes
Image Files: 7203C.jpg
```

#### Expected Result:
- ✅ Image matched via REF column
- ✅ Final name: `cahier-brochure-remborde-calligraphe-rigide-192p-17x22cm-70g-seyes.jpg`
- ✅ Match strategy: `ref`

#### Test Steps:
1. Open Calligraph Bulk Upload Dialog
2. Upload the Calligraph CSV file
3. Upload image file `7203C.jpg`
4. Click "Match with REF Column"
5. Verify match appears in results table
6. Check match strategy shows "ref"

---

### **Scenario 2: Multiple Images per REF**

#### Test Data Setup:
```
CSV Row: SKU=1140659601, REF=7203C, image name=cahier-brochure-remborde-calligraphe-rigide-192p-17x22cm-70g-seyes
Image Files: 7203C_1.jpg, 7203C_2.jpg, 7203C_3.jpg
```

#### Expected Result:
- ✅ 3 images matched to same SKU
- ✅ Final names: 
  - `cahier-brochure-remborde-calligraphe-rigide-192p-17x22cm-70g-seyes_1.jpg`
  - `cahier-brochure-remborde-calligraphe-rigide-192p-17x22cm-70g-seyes_2.jpg`
  - `cahier-brochure-remborde-calligraphe-rigide-192p-17x22cm-70g-seyes_3.jpg`
- ✅ All show match strategy: `ref`

#### Test Steps:
1. Upload CSV and multiple image files
2. Verify all 3 images are matched
3. Check final naming includes proper numbering
4. Verify statistics show "Multi-Image" products count

---

### **Scenario 3: Mixed Naming Patterns**

#### Test Data Setup:
```
Image Files: 
- 7203C.jpg (no number)
- 203C_1.jpg (with number)
- 2282C-image.jpg (with dash)
- 2272C_photo_1.jpg (complex pattern)
```

#### Expected Result:
- ✅ All patterns recognized and matched
- ✅ Proper reference extraction
- ✅ Correct numbering assignment

#### Test Steps:
1. Upload mixed pattern image files
2. Verify reference extraction in console logs
3. Check matching results for accuracy

---

### **Scenario 4: Fallback Matching Strategies**

#### Test Data Setup:
```
CSV Row: SKU=1140659781, REF=203C, image name=cahier-brochure-souple-calligraphe-192p-17x22-cm-70g-seyes
Image Files: 
- no_203C_match.jpg (no REF match)
- cahier-brochure-souple.jpg (image name match)
```

#### Expected Result:
- ✅ First image: no match (unmatched)
- ✅ Second image: matched via image name
- ✅ Match strategy: `imageName`

#### Test Steps:
1. Test with images that don't match REF
2. Verify fallback to image name matching
3. Check match strategy indicators

---

### **Scenario 5: Complete Upload Process**

#### Test Data Setup:
```
Multiple CSV rows with various REF patterns
Multiple image files with different naming patterns
```

#### Expected Result:
- ✅ All processing steps complete successfully
- ✅ Images resized to 1200x1200px
- ✅ Proper compression applied
- ✅ Upload to Magento successful
- ✅ Detailed results CSV generated

#### Test Steps:
1. Complete full upload process
2. Monitor progress indicators
3. Verify final statistics
4. Download and review results CSV
5. Check Magento for uploaded images

## 🔧 Testing Configuration

### **Recommended Settings:**
```javascript
{
  processImages: true,
  imageQuality: 90,
  targetSize: 1200,
  batchSize: 3,
  delayBetweenBatches: 2000
}
```

### **Test Image Specifications:**
- **Formats**: JPG, PNG, GIF, WebP
- **Sizes**: Various (will be resized to 1200x1200)
- **Max Size**: 10MB per file
- **Naming**: Follow Calligraph patterns (REF_number.ext)

## 📊 Expected Statistics

### **Matching Statistics:**
- Total CSV Rows: [number of products in CSV]
- Total Images: [number of image files uploaded]
- Matched: [number of successful matches]
- Unique Products: [number of distinct SKUs with matches]
- Multiple Images Products: [products with >1 image]
- Average Images per Product: [calculated ratio]

### **Match Strategy Breakdown:**
- REF: [matches via REF column] (should be highest)
- Image Name: [matches via image name column]
- Fuzzy: [matches via product name fuzzy matching]

### **Processing Statistics:**
- Successful: [number of successful uploads]
- Failed: [number of failed uploads]
- Success Rate: [percentage]
- Compression Ratio: [percentage size reduction]

## 🐛 Common Issues & Solutions

### **Issue 1: No REF Matches Found**
**Symptoms:** All images show as unmatched
**Causes:** 
- Image naming doesn't match REF patterns
- REF column not found in CSV
**Solutions:**
- Check image file naming (should contain REF code)
- Verify CSV has "ref" column
- Check console logs for reference extraction

### **Issue 2: Images Not Processing**
**Symptoms:** Upload fails during processing stage
**Causes:**
- Large image files
- Unsupported formats
- Memory issues
**Solutions:**
- Reduce image file sizes
- Use supported formats (JPG, PNG, GIF, WebP)
- Process in smaller batches

### **Issue 3: Incorrect Final Naming**
**Symptoms:** Final image names don't match expected pattern
**Causes:**
- Missing "image name" column in CSV
- Special characters in image names
**Solutions:**
- Ensure CSV has "image name" column
- Clean up special characters in CSV data

## 📝 Test Checklist

### **Pre-Upload Tests:**
- [ ] CSV file loads successfully
- [ ] All required columns detected (sku, ref, image name)
- [ ] Image files validate successfully
- [ ] No file size/format errors

### **Matching Tests:**
- [ ] REF-based matching works correctly
- [ ] Multiple images per REF handled properly
- [ ] Fallback strategies work when REF fails
- [ ] Match statistics are accurate
- [ ] Unmatched items properly identified

### **Processing Tests:**
- [ ] Image processing settings applied correctly
- [ ] Resizing to 1200x1200px works
- [ ] Aspect ratio preserved with white background
- [ ] Compression reduces file sizes appropriately
- [ ] Batch processing respects delay settings

### **Upload Tests:**
- [ ] Progress tracking works correctly
- [ ] Upload to Magento succeeds
- [ ] Error handling works for failed uploads
- [ ] Final statistics are accurate
- [ ] Results CSV downloads successfully

### **UI/UX Tests:**
- [ ] Step-by-step wizard flows smoothly
- [ ] Progress indicators update correctly
- [ ] Error messages are clear and helpful
- [ ] Settings controls work as expected
- [ ] Results display is comprehensive

## 🎯 Success Criteria

### **Functional Success:**
- ✅ 95%+ REF matching accuracy
- ✅ All supported image formats process correctly
- ✅ Multiple images per SKU handled properly
- ✅ Final naming follows expected patterns
- ✅ Upload success rate >90%

### **Performance Success:**
- ✅ Processing completes within reasonable time
- ✅ Memory usage remains stable
- ✅ UI remains responsive during processing
- ✅ Batch processing prevents server overload

### **User Experience Success:**
- ✅ Clear progress indication throughout process
- ✅ Comprehensive error messages and recovery
- ✅ Detailed results and statistics
- ✅ Easy-to-use interface with helpful guidance

## 📞 Support & Troubleshooting

### **Debug Information:**
- Check browser console for detailed logs
- Review network tab for API call failures
- Monitor memory usage during processing
- Check Magento logs for upload errors

### **Log Patterns to Look For:**
```
🔍 Processing image files for Calligraph reference matching...
📁 Mapped: 7203C_1.jpg -> REF: 7203C, #: 1
✅ Found 2 images for reference 7203C
✅ MATCHED: 7203C_1.jpg -> cahier-brochure-remborde-calligraphe-rigide-192p-17x22cm-70g-seyes_1 (SKU: 1140659601, Strategy: ref)
📊 MATCHING COMPLETE: 5 matches, 0 unmatched CSV rows, 2 unmatched images
```

### **Contact Information:**
- **Developer**: Mounir Abderrahmani
- **Email**: mounir.webdev.tms@gmail.com
- **GitHub**: [mounir1.github.io](https://mounir1.github.io)

---

*Last Updated: January 2024*
*Version: 2.1.0*