const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const sourceFolder = '../../renamed_images'; // Source folder with renamed images
const outputFolder = '../../resized_images'; // Output folder for 1200x1200 images
const targetSize = 1200; // Target size (1200x1200)

// Create output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
  console.log(`Created output folder: ${outputFolder}`);
}

// Function to resize a single image while preserving all content
async function resizeImage(inputPath, outputPath, filename) {
  try {
    // Get original image metadata
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    console.log(`   📐 Original size: ${originalWidth}x${originalHeight}`);

    // Calculate the scaling factor to fit within target size while preserving aspect ratio
    const scaleWidth = targetSize / originalWidth;
    const scaleHeight = targetSize / originalHeight;
    const scale = Math.min(scaleWidth, scaleHeight); // Use the smaller scale to ensure it fits

    const newWidth = Math.round(originalWidth * scale);
    const newHeight = Math.round(originalHeight * scale);

    console.log(`   🎯 Scaled size: ${newWidth}x${newHeight} (scale: ${scale.toFixed(3)})`);

    // Create a white background canvas of target size
    const canvas = sharp({
      create: {
        width: targetSize,
        height: targetSize,
        channels: 3,
        background: { r: 255, g: 255, b: 255 } // White background
      }
    });

    // Resize the original image while preserving aspect ratio
    const resizedImage = sharp(inputPath)
      .resize(newWidth, newHeight, {
        fit: 'inside', // Preserve aspect ratio, no cropping
        withoutEnlargement: false // Allow enlargement if needed
      });

    // Calculate position to center the image on the canvas
    const left = Math.round((targetSize - newWidth) / 2);
    const top = Math.round((targetSize - newHeight) / 2);

    console.log(`   📍 Position: left=${left}, top=${top}`);

    // Composite the resized image onto the white canvas
    await canvas
      .composite([{
        input: await resizedImage.toBuffer(),
        left: left,
        top: top
      }])
      .jpeg({ quality: 90 }) // Convert to JPEG with 90% quality
      .toFile(outputPath);

    console.log(`✅ Resized: ${filename} (preserved all content)`);
    return true;
  } catch (error) {
    console.error(`❌ Error resizing ${filename}:`, error.message);
    return false;
  }
}

// Main function to process all images
async function resizeAllImages(forceResize = false) {
  try {
    // Read all files in the source folder
    const files = fs.readdirSync(sourceFolder);
    
    // Filter for image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log('No image files found in the source folder.');
      return;
    }

    console.log(`Found ${imageFiles.length} image files to resize...`);
    console.log(`Target size: ${targetSize}x${targetSize} pixels`);
    console.log('Starting resize process...\n');

    let successCount = 0;
    let errorCount = 0;

    // Process each image
    for (let i = 0; i < imageFiles.length; i++) {
      const filename = imageFiles[i];
      const inputPath = path.join(sourceFolder, filename);
      
      // Change extension to .jpg for output
      const nameWithoutExt = path.parse(filename).name;
      const outputFilename = `${nameWithoutExt}.jpg`;
      const outputPath = path.join(outputFolder, outputFilename);

      // Skip if file already exists and not forcing resize
      if (!forceResize && fs.existsSync(outputPath)) {
        console.log(`[${i + 1}/${imageFiles.length}] ⏭️  Skipped (already exists): ${filename}`);
        successCount++;
        continue;
      }

      console.log(`[${i + 1}/${imageFiles.length}] Processing: ${filename}`);

      const success = await resizeImage(inputPath, outputPath, filename);
      
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('RESIZE PROCESS COMPLETED');
    console.log('='.repeat(50));
    console.log(`✅ Successfully resized: ${successCount} images`);
    console.log(`❌ Failed to resize: ${errorCount} images`);
    console.log(`📁 Output folder: ${outputFolder}`);
    console.log(`📐 Target size: ${targetSize}x${targetSize} pixels`);
    
    if (successCount > 0) {
      console.log('\n🎉 All resized images are saved as JPEG files with 90% quality.');
      console.log('📋 Resize method: Preserved all original content with white background padding');
      console.log('🔍 No image data was cropped or lost during resizing');
    }

  } catch (error) {
    console.error('Error reading source folder:', error);
  }
}

// Run the script
const forceResize = process.argv.includes('--force') || process.argv.includes('-f');

console.log('🖼️  Image Resize Script');
console.log('='.repeat(30));
console.log(`Source folder: ${sourceFolder}`);
console.log(`Output folder: ${outputFolder}`);
console.log(`Target size: ${targetSize}x${targetSize} pixels`);
console.log(`Force resize: ${forceResize ? 'YES' : 'NO'}\n`);

resizeAllImages(forceResize);
