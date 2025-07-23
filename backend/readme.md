# Techno-ETL Backend

This document provides a comprehensive guide to the architecture, deployment, and maintenance of the Techno-ETL Node.js backend.

## 🚀 Overview

The backend is a high-performance, scalable Node.js application built with Express.js. It is designed to handle a high volume of concurrent requests, manage long-running data synchronization tasks, and provide a robust API for the frontend.

**Key Features:**
- **Clustered Production Environment:** Uses PM2 to leverage all available CPU cores, ensuring high availability and zero-downtime reloads.
- **Centralized Redis Caching:** A shared Redis cache improves performance and ensures data consistency across all application instances.
- **Worker Threads:** Offloads CPU-intensive tasks (like image processing) to a separate worker pool to keep the main API responsive.
- **Scheduled Cron Jobs:** A reliable, PM2-managed cron system handles daily data synchronization tasks automatically.

## 📦 Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables by copying the example file:
    ```bash
    cp .env.example .env
    ```
4.  Fill in the required values in the `.env` file (database credentials, Redis URL, etc.).

## 🏃‍♂️ Running the Application

### Development

For development with hot-reloading, use the following command from the **root** project directory:
```bash
npm run start:backend:dev
```

This will start the server using `nodemon`.

### Production

The application is managed by **PM2** in production.

1.  **Build the Backend:**
    The frontend build process (`npm run build` from root) should also build the backend and place the output in `backend/dist`.

2.  **Start the Application:**
    To start the API cluster and the cron worker, use our custom startup script:
    ```bash
    node backend/start-server.js production
    ```
    Alternatively, you can use the `package.json` script from the root directory:
    ```bash
    npm run server:production
    ```

### PM2 Management Commands

Once started, you can manage the application using the PM2 CLI:

- **List Processes:**
  ```bash
  pm2 list
  ```
- **View Logs:**
  ```bash
  pm2 logs techno-etl-api
  pm2 logs techno-etl-cron
  ```
- **Monitor CPU/Memory:**
  ```bash
  pm2 monit
  ```
- **Zero-Downtime Reload (for the API):**
  ```bash
  pm2 reload techno-etl-api
  ```
- **Stop All Processes:**
  ```bash
  pm2 stop all
  ```

## 🏛️ Architecture

### Caching Strategy

We use a centralized Redis cache to share data between all clustered processes.

- **Service:** `src/services/cacheService.js` provides simple `get`, `set`, and `delete` functions.
- **Route Caching:** `src/middleware/cacheMiddleware.js` provides middleware to automatically cache responses from `GET` requests.
- **Cache Invalidation:** The `clearCacheMiddleware` should be applied to `POST`, `PUT`, and `DELETE` routes that modify data. It intelligently clears related caches using prefixes.

**Example: Caching a route and invalidating it**
```javascript
// In your routes file
import { cacheMiddleware, clearCacheMiddleware } from './middleware/cacheMiddleware.js';

// Cache GET requests to this endpoint for 10 minutes
router.get('/products', cacheMiddleware('10m'), getProductsController);

// When a product is updated, clear the product caches
router.put('/products/:id', clearCacheMiddleware, updateProductController);
```

### Worker Threads for Heavy Tasks

For CPU-intensive operations that would block the main event loop (e.g., resizing a large batch of images), we use a worker pool.

- **Pool Manager:** `src/services/workerPool.js` manages a pool of worker processes.
- **Worker Logic:** `src/workers/imageProcessor.js` contains the actual function to be run in a separate process.

**Example: Using the worker pool**
```javascript
import workerPool from '../services/workerPool';

async function processImageUpload(imageBuffer) {
  // Offload the heavy task without blocking the API
  const resizedImage = await workerPool.resizeImage(imageBuffer);
  // ...save the resized image
}
```

### Scheduled Jobs (Cron)

Daily synchronization tasks are handled by a dedicated PM2 process defined in `ecosystem.config.js`.

- **Schedule:** Runs every day at 2:00 AM (see `cron_restart` in the config).
- **Runner:** `src/cron-runner.js` is the entry point for the job.
- **Logic:** The actual sync operations are located in `src/services/syncService.js`.

To modify the schedule, edit the `cron_restart` value in `backend/ecosystem.config.js`.