const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration
const csvFile = '../csvFiles/calligraph.csv';
const sourceImagesFolder = '../images'; // Change to your source images folder
const destinationFolder = '../../renamed_images'; // New folder for renamed images

// Create destination folder if it doesn't exist
if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

// Map to store ref -> image name mapping
const refToImageNameMap = new Map();

// Read CSV and build mapping
fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', (row) => {
    const ref = row.ref;
    const imageName = row['image name'];

    if (ref && imageName) {
      refToImageNameMap.set(ref, imageName);
    }
  })
  .on('end', () => {
    console.log(`Loaded ${refToImageNameMap.size} ref-to-image mappings`);
    renameImages();
  })
  .on('error', (err) => {
    console.error('Error reading CSV:', err);
  });

function renameImages() {
  // Read all files in source folder
  fs.readdir(sourceImagesFolder, (err, files) => {
    if (err) {
      console.error('Error reading source folder:', err);

      return;
    }

    let renamedCount = 0;
    let notFoundCount = 0;

    files.forEach(file => {
      // Extract ref from filename (assuming format: ref_string.extension)
      const refMatch = file.match(/^([^_]+)_/);

      if (refMatch) {
        const ref = refMatch[1];
        const extension = path.extname(file);

        if (refToImageNameMap.has(ref)) {
          const newImageName = refToImageNameMap.get(ref);
          const newFileName = `${newImageName}${extension}`;

          const sourcePath = path.join(sourceImagesFolder, file);
          const destPath = path.join(destinationFolder, newFileName);

          // Copy file with new name
          fs.copyFile(sourcePath, destPath, (err) => {
            if (err) {
              console.error(`Error copying ${file}:`, err);
            } else {
              console.log(`Renamed: ${file} -> ${newFileName}`);
              renamedCount++;
            }
          });
        } else {
          console.log(`No mapping found for ref: ${ref} (file: ${file})`);
          notFoundCount++;
        }
      } else {
        console.log(`File doesn't match expected format: ${file}`);
      }
    });

    setTimeout(() => {
      console.log('\nRenaming complete!');
      console.log(`Files renamed: ${renamedCount}`);
      console.log(`Files not found in CSV: ${notFoundCount}`);
    }, 1000);
  });
}
