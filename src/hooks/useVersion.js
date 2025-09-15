/**
 * useVersion Hook
 * Provides version information with fallback
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */
import { useState, useEffect } from 'react';

export function useVersion() {
  const [version, setVersion] = useState({
    fullVersion: '2.0.0',
    major: 2,
    minor: 0,
    patch: 0,
    build: 'optimized',
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    // Try to load version from various sources
    const loadVersion = async () => {
      try {
        // Try package.json first
        const response = await fetch('/package.json');
        if (response.ok) {
          const packageData = await response.json();
          setVersion({
            fullVersion: packageData.version || '2.0.0',
            major: parseInt(packageData.version?.split('.')[0]) || 2,
            minor: parseInt(packageData.version?.split('.')[1]) || 0,
            patch: parseInt(packageData.version?.split('.')[2]) || 0,
            build: 'production',
            timestamp: new Date().toISOString()
          });
          return;
        }
      } catch (error) {
        console.warn('Could not load version from package.json:', error);
      }

      try {
        // Try version.json as fallback
        const response = await fetch('/version.json');
        if (response.ok) {
          const versionData = await response.json();
          setVersion(versionData);
          return;
        }
      } catch (error) {
        console.warn('Could not load version.json:', error);
      }

      // Use default version if all else fails
      console.log('Using default version information');
    };

    loadVersion();
  }, []);

  return version;
}

export default useVersion;