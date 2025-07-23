#!/usr/bin/env node

/**
 * Cache Testing Script
 * Tests both Redis and in-memory caching functionality
 */

import dotenv from 'dotenv';
dotenv.config();

import { 
  getFromCache, 
  setInCache, 
  deleteFromCache, 
  clearCache, 
  getCacheStats,
  clearCacheNamespace 
} from './src/services/cacheService.js';

console.log('🧪 Testing TECHNO-ETL Cache Service');
console.log('===================================');

async function testCacheOperations() {
  try {
    console.log('\n📊 Initial cache stats:');
    console.log(await getCacheStats());

    // Test 1: Basic set/get operations
    console.log('\n🔧 Test 1: Basic set/get operations');
    
    await setInCache('test:user:1', { id: 1, name: 'John Doe', email: 'john@example.com' });
    console.log('✅ Set user data');
    
    const userData = await getFromCache('test:user:1');
    console.log('📖 Retrieved user data:', userData);
    
    // Test 2: TTL functionality
    console.log('\n⏰ Test 2: TTL functionality');
    
    await setInCache('test:temp', { message: 'This will expire' }, 3000); // 3 seconds
    console.log('✅ Set temporary data with 3s TTL');
    
    const tempData1 = await getFromCache('test:temp');
    console.log('📖 Retrieved temp data (should exist):', tempData1);
    
    console.log('⏳ Waiting 4 seconds for TTL expiration...');
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const tempData2 = await getFromCache('test:temp');
    console.log('📖 Retrieved temp data (should be null):', tempData2);
    
    // Test 3: Multiple data types
    console.log('\n📦 Test 3: Multiple data types');
    
    await setInCache('test:string', 'Hello World');
    await setInCache('test:number', 42);
    await setInCache('test:boolean', true);
    await setInCache('test:array', [1, 2, 3, 4, 5]);
    await setInCache('test:object', { 
      nested: { 
        data: 'complex object',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('✅ Set various data types');
    
    console.log('📖 String:', await getFromCache('test:string'));
    console.log('📖 Number:', await getFromCache('test:number'));
    console.log('📖 Boolean:', await getFromCache('test:boolean'));
    console.log('📖 Array:', await getFromCache('test:array'));
    console.log('📖 Object:', await getFromCache('test:object'));
    
    // Test 4: Delete operations
    console.log('\n🗑️ Test 4: Delete operations');
    
    await deleteFromCache('test:string');
    console.log('✅ Deleted string data');
    
    const deletedData = await getFromCache('test:string');
    console.log('📖 Retrieved deleted data (should be null):', deletedData);
    
    // Test 5: Namespace clearing
    console.log('\n🧹 Test 5: Namespace clearing');
    
    await setInCache('namespace1:item1', 'data1');
    await setInCache('namespace1:item2', 'data2');
    await setInCache('namespace2:item1', 'data3');
    
    console.log('✅ Set data in different namespaces');
    
    await clearCacheNamespace('namespace1');
    console.log('✅ Cleared namespace1');
    
    console.log('📖 namespace1:item1 (should be null):', await getFromCache('namespace1:item1'));
    console.log('📖 namespace2:item1 (should exist):', await getFromCache('namespace2:item1'));
    
    // Test 6: Performance test
    console.log('\n⚡ Test 6: Performance test');
    
    const startTime = Date.now();
    const operations = 100;
    
    for (let i = 0; i < operations; i++) {
      await setInCache(`perf:test:${i}`, { id: i, data: `test data ${i}` });
    }
    
    for (let i = 0; i < operations; i++) {
      await getFromCache(`perf:test:${i}`);
    }
    
    const endTime = Date.now();
    console.log(`✅ Completed ${operations * 2} operations in ${endTime - startTime}ms`);
    
    // Final stats
    console.log('\n📊 Final cache stats:');
    const finalStats = await getCacheStats();
    console.log(finalStats);
    
    console.log('\n🎉 All cache tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Cache test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run tests
testCacheOperations().then(() => {
  console.log('\n✅ Cache testing completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Cache testing failed:', error);
  process.exit(1);
});
