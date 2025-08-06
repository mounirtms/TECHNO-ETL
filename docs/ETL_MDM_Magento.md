# ETL MDM Magento Project Documentation

## Overview
This documentation provides an overview of the ETL process integrated with MDM systems, focusing on seamless synchronization and efficient data management.

## ETL Process
- **Extract**: Data is extracted from multiple sources, including Magento and Cegid.
- **Transform**: The data undergoes transformation to ensure quality, including normalization and validation.
- **Load**: Transformed data is loaded into the MDM system.

## MDM Grid Usage
- The MDM grid facilitates efficient product data management, ensuring consistency across channels.
- **Features**:
  - Product Lookup: Search and locate products using SKU
  - Bulk Editing: Simultaneous edits for multiple products
  - Custom Views: Personalized grid views for different user roles

## Dashboard Synchronization
- Real-time data synchronization is implemented using Firebase.
- **Components**:
  - Data Sync Manager: Oversees synchronization tasks
  - Error Handler: Captures and reports synchronization issues

## Sync Stocks
- Stock levels are updated in real-time, ensuring accurate inventory management.
- **Process**:
  - Fetch: Retrieve current stock data from RFID systems
  - Sync: Update the MDM and Magento platforms

## Technical Usage
- **Libraries**: React, @mui/material, Firebase, axios
- **Backend**: Node.js with Express.js
- **Database**: Firebase Realtime Database
- **Tools**: Vite, ESLint, Babel

For further support, contact the development team or consult the project repository.

## Authors
- **Mounir Abderrahmani**

## License
MIT License

