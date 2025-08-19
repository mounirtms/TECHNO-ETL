
/**
 * Optimized Component Loader
 * Dynamically imports components with proper error handling
 */

// Cache for loaded components
const componentCache = new Map();

/**
 * Load component with caching and error handling
 * @param {string} componentPath - Path to the component
 * @param {string} componentName - Name of the component for error messages
 * @returns {Promise<React.Component>} - Loaded component
 */
export const loadComponent = async (componentPath, componentName) => {
  // Return cached component if available
  if (componentCache.has(componentPath)) {
    return componentCache.get(componentPath);
  }

  try {
    // Dynamically import the component
    const module = await import(componentPath);
    const Component = module.default || module[componentName];
    
    if (!Component) {
      throw new Error(`Component ${componentName} not found in ${componentPath}`);
    }
    
    // Cache the component
    componentCache.set(componentPath, Component);
    return Component;
  } catch (error) {
    console.error(`Failed to load component ${componentName}: `, error);
    // Return a fallback component
    const FallbackComponent = () => (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <h3>Component Load Error</h3>
        <p>Failed to load {componentName}</p>
      </div>
    );
    return FallbackComponent;
  }
};

/**
 * Preload critical components
 * @param {Array} components - Array of component descriptors
 */
export const preloadComponents = async (components) => {
  const promises = components.map(({ path, name }) => loadComponent(path, name));
  try {
    await Promise.all(promises);
    console.log('✅ Preloaded critical components');
  } catch (error) {
    console.warn('⚠️  Some components failed to preload:', error);
  }
};

export default { loadComponent, preloadComponents };
