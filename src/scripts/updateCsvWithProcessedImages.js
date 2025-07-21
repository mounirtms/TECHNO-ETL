const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify');

// Configuration
const csvInputFile = '../csvFiles/calligraph.csv';
const csvOutputFile = '../csvFiles/calligraph_updated.csv';
const resizedImagesFolder = '../../resized_images';

// Function to get processed images dynamically from resized_images folder
function getProcessedImages() {
  try {
    const resizedImagesFolder = '../../resized_images';
    const files = fs.readdirSync(resizedImagesFolder);

    // Filter for image files and remove extensions
    const processedImages = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
      })
      .map(file => path.parse(file).name); // Remove extension

    console.log(`📁 Found ${processedImages.length} processed images in resized_images folder`);
    return processedImages;
  } catch (error) {
    console.error('❌ Error reading resized_images folder:', error.message);
    return [];
  }
}

// Get processed images dynamically
const processedImages = getProcessedImages();
// Create a Set for faster lookup
const processedImagesSet = new Set(processedImages);

async function updateCsvWithProcessedImages() {
  const results = [];
  let headerProcessed = false;

  console.log('📄 CSV Update Script - Adding Image Processing Status');
  console.log('='.repeat(60));
  console.log(`Input file: ${csvInputFile}`);
  console.log(`Output file: ${csvOutputFile}`);
  console.log(`Processed images: ${processedImages.length}`);
  console.log('');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvInputFile)
      .pipe(csv())
      .on('data', (row) => {
        // Add the new column header on first row
        if (!headerProcessed) {
          // Add new column to the row object
          row['image_processed'] = '';
          headerProcessed = true;
        }

        // Check if this product's image was processed
        const imageName = row['image name'];
        if (imageName && processedImagesSet.has(imageName)) {
          row['image_processed'] = '✓';
          console.log(`✅ Marked as processed: ${imageName}`);
        } else {
          row['image_processed'] = '';
        }

        results.push(row);
      })
      .on('end', () => {
        // Write the updated CSV
        const output = fs.createWriteStream(csvOutputFile);
        
        stringify(results, {
          header: true,
          columns: Object.keys(results[0])
        })
        .pipe(output)
        .on('finish', () => {
          console.log('');
          console.log('='.repeat(60));
          console.log('✅ CSV UPDATE COMPLETED');
          console.log('='.repeat(60));
          console.log(`📁 Updated file saved as: ${csvOutputFile}`);
          console.log(`📊 Total products: ${results.length}`);
          
          // Count processed images
          const processedCount = results.filter(row => row['image_processed'] === '✓').length;
          console.log(`✅ Products with processed images: ${processedCount}`);
          console.log(`❌ Products without processed images: ${results.length - processedCount}`);
          console.log('');
          console.log('🎉 The CSV now includes an "image_processed" column with ✓ marks for processed images!');
          
          resolve();
        })
        .on('error', reject);
      })
      .on('error', reject);
  });
}

// Run the script
updateCsvWithProcessedImages()
  .then(() => {
    console.log('Script completed successfully!');
  })
  .catch((error) => {
    console.error('Error updating CSV:', error);
  });
