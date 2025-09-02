const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration
const csvFile = '../csvFiles/calligraph_updated.csv';
const sourceImagesFolder = '../newimages';
const destinationFolder = '../../renamed_images';

/**
 * Improved image renaming function with better pattern matching
 * @param {boolean} forceUpdate - If true, will reprocess already renamed images
 */
async function renameImagesImproved(forceUpdate = false) {
  console.log('🖼️  Improved Image Rename Script');
  console.log('='.repeat(50));
  console.log(`CSV file: ${csvFile}`);
  console.log(`Source folder: ${sourceImagesFolder}`);
  console.log(`Destination folder: ${destinationFolder}`);
  console.log(`Force update: ${forceUpdate ? 'YES' : 'NO'}`);
  console.log('');

  // Create destination folder if it doesn't exist
  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder, { recursive: true });
    console.log(`✅ Created destination folder: ${destinationFolder}`);
  }

  // Read all files in source folder first
  let sourceFiles;
  try {
    sourceFiles = fs.readdirSync(sourceImagesFolder);
    console.log(`📁 Found ${sourceFiles.length} files in source folder`);
  } catch (error) {
    console.error('❌ Error reading source folder:', error.message);
    return;
  }

  // Filter for image files only
  const imageFiles = sourceFiles.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
  });

  console.log(`🖼️  Found ${imageFiles.length} image files in source folder`);
  console.log('');

  // Map to store CSV data
  const csvData = [];
  
  return new Promise((resolve, reject) => {
    // Read CSV file
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        if (row.ref && row['image name']) {
          csvData.push({
            ref: row.ref.trim(),
            imageName: row['image name'].trim(),
            productName: row.name || 'Unknown Product'
          });
        }
      })
      .on('end', async () => {
        console.log(`📊 Loaded ${csvData.length} products from CSV`);
        console.log('');
        console.log('🔍 Starting improved pattern matching...');
        console.log('');

        let renamedCount = 0;
        let skippedCount = 0;
        let notFoundCount = 0;
        let errorCount = 0;

        // Process each CSV entry
        for (const csvEntry of csvData) {
          const { ref, imageName, productName } = csvEntry;

          // Find matching source files and sort them for deterministic order
          const matchingFiles = findMatchingFiles(imageFiles, ref, imageName).sort();
          
          if (matchingFiles.length === 0) {
            console.log(`❌ No match found for ref: ${ref} (${productName})`);
            notFoundCount++;
            continue;
          }

          // Process each matching file, potentially creating multiple renamed images for one product ref
          for (const [index, sourceFile] of matchingFiles.entries()) {
            const sourcePath = path.join(sourceImagesFolder, sourceFile);

            // First image gets the base name, subsequent images get a suffix like _1, _2, etc.
            const newBaseName = index === 0 ? imageName : `${imageName}_${index}`;
            const destFileName = `${newBaseName}.jpg`;
            const destPath = path.join(destinationFolder, destFileName);

            if (!forceUpdate && fs.existsSync(destPath)) {
              console.log(`⏭️  Skipped (already exists): ${destFileName}`);
              skippedCount++;
              continue;
            }

            try {
              // Copy file with new name
              fs.copyFileSync(sourcePath, destPath);
              console.log(`✅ Renamed: ${sourceFile} → ${destFileName}`);
              renamedCount++;
            } catch (error) {
              console.error(`❌ Error copying ${sourceFile}:`, error.message);
              errorCount++;
            }
          }
        }

        // Summary
        console.log('');
        console.log('='.repeat(50));
        console.log('📊 RENAMING SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Files successfully renamed: ${renamedCount}`);
        console.log(`⏭️  Files skipped (already exist): ${skippedCount}`);
        console.log(`❌ Files not found: ${notFoundCount}`);
        console.log(`💥 Errors encountered: ${errorCount}`);
        console.log(`📁 Total CSV entries processed: ${csvData.length}`);
        console.log('');
        
        if (renamedCount > 0) {
          console.log('🎉 Renaming completed successfully!');
          console.log(`📂 Check the ${destinationFolder} folder for renamed images.`);
        }

        resolve({
          renamed: renamedCount,
          skipped: skippedCount,
          notFound: notFoundCount,
          errors: errorCount,
          total: csvData.length
        });
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV file:', error);
        reject(error);
      });
  });
}

/**
 * Find matching image files using multiple pattern matching strategies
 * @param {string[]} imageFiles - Array of image filenames
 * @param {string} ref - Product reference code
 * @param {string} imageName - Expected image name from CSV
 * @returns {string[]} - Array of matching filenames
 */
function findMatchingFiles(imageFiles, ref, imageName) {
  const matches = new Set();
  
  // Strategy 1: Exact match with imageName
  const exactMatch = imageFiles.find(file => {
    const nameWithoutExt = path.parse(file).name.toLowerCase();
    return nameWithoutExt === imageName.toLowerCase();
  });
  if (exactMatch) matches.add(exactMatch);

  // Strategy 2: Files that start with the ref code
  const refMatches = imageFiles.filter(file => {
    const nameWithoutExt = path.parse(file).name;
    return nameWithoutExt.toLowerCase().startsWith(ref.toLowerCase());
  });
  refMatches.forEach(match => matches.add(match));

  // Strategy 3: Files that contain the ref code
  const containsRefMatches = imageFiles.filter(file => {
    const nameWithoutExt = path.parse(file).name.toLowerCase();
    return nameWithoutExt.includes(ref.toLowerCase());
  });
  containsRefMatches.forEach(match => matches.add(match));

  // Strategy 4: Fuzzy matching - files that contain parts of the imageName
  const imageNameParts = imageName.toLowerCase().split('-').filter(part => part.length > 2);
  if (imageNameParts.length > 0) {
    const fuzzyMatches = imageFiles.filter(file => {
      const nameWithoutExt = path.parse(file).name.toLowerCase();
      return imageNameParts.some(part => nameWithoutExt.includes(part));
    });
    fuzzyMatches.forEach(match => matches.add(match));
  }

  return Array.from(matches);
}

// Export the function for use as a module
module.exports = { renameImagesImproved };

// If run directly, execute with default parameters
if (require.main === module) {
  const forceUpdate = process.argv.includes('--force') || process.argv.includes('-f');
  
  console.log('Starting improved image renaming...');
  if (forceUpdate) {
    console.log('⚠️  Force update mode enabled - will overwrite existing files');
  }
  console.log('');

  renameImagesImproved(forceUpdate)
    .then((results) => {
      console.log('');
      console.log('✅ Script completed successfully!');
      console.log(`📊 Results: ${results.renamed} renamed, ${results.skipped} skipped, ${results.notFound} not found, ${results.errors} errors`);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}
