/**
 * imageProcessor.js
 *
 * This file runs in a separate worker process.
 * It handles CPU-intensive image processing tasks without blocking the main event loop.
 * We can add libraries like 'sharp' here for high-performance image manipulation.
 */

/**
 * A placeholder for a CPU-intensive image resizing function.
 * In a real application, this would use a library like 'sharp'.
 * @param {Buffer} imageBuffer - The buffer of the image to resize.
 * @returns {Promise<Buffer>} - The buffer of the resized image.
 */
export async function resizeImage(imageBuffer) {
  console.log(`Worker ${process.env.JEST_WORKER_ID}: Resizing image...`);
  // Simulate a heavy task
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
  return Buffer.from('resized-image-data');
}