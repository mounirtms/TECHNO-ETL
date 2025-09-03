/**
 * React Context Polyfill
 * Ensures createContext is available
 */

// Polyfill for React.createContext if missing
if (typeof window !== 'undefined' && window.React && !window.React.createContext) {
  console.warn('Polyfilling React.createContext');

  window.React.createContext = function(defaultValue) {
    const context = {
      Provider: function({ children, value }) {
        return children;
      },
      Consumer: function({ children }) {
        return children(defaultValue);
      },
      _currentValue: defaultValue,
      _defaultValue: defaultValue,
    };

    return context;
  };
}

export {};
