# Magento Admin Dashboard

A modern React-based admin dashboard template for Magento with RTL support and dark mode.

## Features

- 🌓 Dark Mode Support
- 🌐 RTL Support
- 📱 Responsive Design
- 📊 Data Grid with Filtering
- 👤 User Profile
- 🎨 Material-UI Components

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Magento API:
   - Open `src/components/ProductsGrid.jsx`
   - Replace the placeholder API endpoint with your Magento API endpoint
   - Add your authentication token

3. Start the development server:
```bash
npm run dev
```

## Project Structure

- `src/App.jsx` - Main application component with theme and RTL support
- `src/components/Layout.jsx` - Dashboard layout with sidebar and header
- `src/components/ProductsGrid.jsx` - Data grid component for products

## Customization

- Theme colors can be modified in `App.jsx`
- Menu items can be modified in `Layout.jsx`
- Grid columns can be customized in `ProductsGrid.jsx`

## Dependencies

- React 18
- Material-UI 5
- MUI X-Data-Grid
- Emotion (for styling)
- Stylis (for RTL support)
