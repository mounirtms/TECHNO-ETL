#!/usr/bin/env node

/**
 * Worker Pool Testing Script
 * Tests image processing workers functionality
 */

import workerPool from './src/services/workerPool.js';
import { logger } from './src/utils/logger.js';

console.log('⚙️ Testing TECHNO-ETL Worker Pool');
console.log('=================================');

async function testWorkers() {
    try {
        // Create test image buffers
        const testImage1 = Buffer.from('test-image-data-1'.repeat(100));
        const testImage2 = Buffer.from('test-image-data-2'.repeat(150));
        const testImage3 = Buffer.from('test-image-data-3'.repeat(200));

        console.log('\n📸 Test 1: Single image resize');
        const resized = await workerPool.resizeImage(testImage1, {
            width: 800,
            height: 600,
            quality: 85
        });
        console.log('✅ Image resized:', resized.length, 'bytes');

        console.log('\n📸 Test 2: Batch image processing');
        const batchResults = await workerPool.batchResizeImages([
            testImage1,
            testImage2,
            testImage3
        ], {
            width: 1200,
            height: 1200,
            quality: 90
        });
        console.log('✅ Batch processed:', batchResults.length, 'images');

        console.log('\n🌐 Test 3: Web optimization');
        const webOptimized = await workerPool.optimizeForWeb(testImage2, {
            maxWidth: 800,
            quality: 75
        });
        console.log('✅ Web optimized:', webOptimized.length, 'bytes');

        console.log('\n🖼️ Test 4: Thumbnail generation');
        const thumbnail = await workerPool.generateThumbnail(testImage3, {
            size: 150,
            quality: 80
        });
        console.log('✅ Thumbnail generated:', thumbnail.length, 'bytes');

        console.log('\n🔄 Test 5: Format conversion');
        const converted = await workerPool.convertFormat(testImage1, {
            format: 'webp',
            quality: 85
        });
        console.log('✅ Format converted:', converted.length, 'bytes');

        console.log('\n⚡ Test 6: Concurrent processing');
        const startTime = Date.now();
        
        const concurrentTasks = [
            workerPool.resizeImage(testImage1, { width: 400, height: 400 }),
            workerPool.optimizeForWeb(testImage2, { maxWidth: 600 }),
            workerPool.generateThumbnail(testImage3, { size: 100 }),
            workerPool.convertFormat(testImage1, { format: 'png' })
        ];

        const concurrentResults = await Promise.all(concurrentTasks);
        const endTime = Date.now();

        console.log('✅ Concurrent processing completed');
        console.log(`   Duration: ${endTime - startTime}ms`);
        console.log(`   Results: ${concurrentResults.length} tasks completed`);

        console.log('\n📊 Test 7: Performance stress test');
        const stressStartTime = Date.now();
        const stressTasks = [];

        for (let i = 0; i < 10; i++) {
            stressTasks.push(
                workerPool.resizeImage(testImage1, { width: 200 + i * 50, height: 200 + i * 50 })
            );
        }

        const stressResults = await Promise.all(stressTasks);
        const stressEndTime = Date.now();

        console.log('✅ Stress test completed');
        console.log(`   Tasks: ${stressTasks.length}`);
        console.log(`   Duration: ${stressEndTime - stressStartTime}ms`);
        console.log(`   Average: ${((stressEndTime - stressStartTime) / stressTasks.length).toFixed(2)}ms per task`);

        console.log('\n🎉 All worker tests completed successfully!');

    } catch (error) {
        console.error('❌ Worker test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run tests
testWorkers().then(() => {
    console.log('\n✅ Worker testing completed');
    
    // Cleanup worker pool
    if (workerPool && typeof workerPool.end === 'function') {
        workerPool.end().then(() => {
            console.log('🔄 Worker pool shut down');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}).catch((error) => {
    console.error('❌ Worker testing failed:', error);
    process.exit(1);
});
