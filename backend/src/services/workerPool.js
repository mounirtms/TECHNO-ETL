/**
 * workerPool.js
 *
 * Initializes and exports a singleton worker pool for CPU-intensive tasks.
 * This prevents the overhead of spawning new processes for each request.
 */
import { Worker } from 'jest-worker';
import os from 'os';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const numWorkers = Math.max(1, os.cpus().length - 2); // Leave cores for main app and DB

console.log(`Initializing worker pool with ${numWorkers} workers.`);

const workerPool = new Worker(fileURLToPath(new URL('../workers/imageProcessor.js', import.meta.url)), {
  numWorkers,
});

export default workerPool;