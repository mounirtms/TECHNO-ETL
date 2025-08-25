// src/hooks/useVersion.js
import { useState, useEffect } from 'react';

export function useVersion() {
  const [version, setVersion] = useState(null);

  useEffect(() => {
    // In development, we can import directly
    if (import.meta.env.DEV) {
      import('../assets/version.json')
        .then(data => setVersion(data))
        .catch(() => {
          // Fallback to fetch if import fails
          fetch('/version.json')
            .then(res => res.json())
            .then(data => setVersion(data));
        });
    } else {
      // In production, always use fetch
      fetch('/version.json')
        .then(res => res.json())
        .then(data => setVersion(data));
    }
  }, []);

  return version;
}