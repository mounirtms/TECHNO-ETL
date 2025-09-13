import React, { createContext, useContext, useState, useEffect } from 'react';
import Fuse from 'fuse.js';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }

  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchIndex, setSearchIndex] = useState(null);

  // Documentation content for search indexing
  const documentationContent = [
    {
      id: 'system-overview',
      title: 'System Overview',
      path: '/docs/system-overview',
      category: 'Overview',
      description: 'Complete system overview with performance metrics and business value',
      content: 'TECHNO-ETL enterprise data management platform MDM Magento synchronization real-time analytics performance metrics business value architecture components scalability security',
      keywords: ['system', 'overview', 'enterprise', 'data', 'management', 'platform', 'MDM', 'Magento', 'synchronization', 'analytics', 'performance', 'business', 'architecture', 'scalability', 'security'],
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      path: '/docs/getting-started',
      category: 'Setup',
      description: 'Step-by-step setup guide to get TECHNO-ETL running in your environment',
      content: 'getting started setup installation prerequisites Node.js SQL Server Redis Firebase environment configuration development production deployment',
      keywords: ['getting', 'started', 'setup', 'installation', 'prerequisites', 'Node.js', 'SQL', 'Server', 'Redis', 'Firebase', 'environment', 'configuration', 'development', 'production', 'deployment'],
    },
    {
      id: 'features-showcase',
      title: 'Features Showcase',
      path: '/docs/features-showcase',
      category: 'Features',
      description: 'Comprehensive overview of all features and capabilities',
      content: 'features showcase capabilities data management user experience enterprise security performance integration real-time dashboards grid system API documentation',
      keywords: ['features', 'showcase', 'capabilities', 'data', 'management', 'user', 'experience', 'enterprise', 'security', 'performance', 'integration', 'real-time', 'dashboards', 'grid', 'API'],
    },
    {
      id: 'project-overview',
      title: 'Project Overview',
      path: '/docs/project-overview',
      category: 'Overview',
      description: 'Comprehensive overview of TECHNO-ETL system architecture and features',
      content: 'project overview TECHNO-ETL system architecture features technology stack React Node.js Material-UI database integration Magento MDM synchronization',
      keywords: ['project', 'overview', 'TECHNO-ETL', 'system', 'architecture', 'features', 'technology', 'stack', 'React', 'Node.js', 'Material-UI', 'database', 'integration', 'Magento', 'MDM'],
    },
    {
      id: 'technical-architecture',
      title: 'Technical Architecture',
      path: '/docs/technical-architecture',
      category: 'Architecture',
      description: 'Detailed system architecture, components, and design patterns',
      content: 'technical architecture system design components patterns frontend backend database integration layer security scalability microservices API REST',
      keywords: ['technical', 'architecture', 'system', 'design', 'components', 'patterns', 'frontend', 'backend', 'database', 'integration', 'security', 'scalability', 'microservices', 'API', 'REST'],
    },
    {
      id: 'etl-process',
      title: 'ETL Process Documentation',
      path: '/docs/etl-process',
      category: 'Process',
      description: 'Comprehensive ETL implementation with examples',
      content: 'ETL process extract transform load data pipeline synchronization batch real-time processing validation error handling recovery automation',
      keywords: ['ETL', 'process', 'extract', 'transform', 'load', 'data', 'pipeline', 'synchronization', 'batch', 'real-time', 'processing', 'validation', 'error', 'handling', 'recovery', 'automation'],
    },
    {
      id: 'grid-system',
      title: 'Grid System Documentation',
      path: '/docs/grid-system',
      category: 'Components',
      description: 'Professional data grid system with advanced features',
      content: 'grid system data table virtualization filtering sorting pagination export import performance optimization column management row selection',
      keywords: ['grid', 'system', 'data', 'table', 'virtualization', 'filtering', 'sorting', 'pagination', 'export', 'import', 'performance', 'optimization', 'column', 'management', 'row', 'selection'],
    },
    {
      id: 'api-documentation',
      title: 'API Documentation',
      path: '/docs/api-documentation',
      category: 'API',
      description: 'Complete REST API reference with examples and endpoints',
      content: 'API documentation REST endpoints authentication authorization rate limiting error handling request response JSON HTTP methods GET POST PUT DELETE',
      keywords: ['API', 'documentation', 'REST', 'endpoints', 'authentication', 'authorization', 'rate', 'limiting', 'error', 'handling', 'request', 'response', 'JSON', 'HTTP', 'methods'],
    },
    {
      id: 'dashboard-system',
      title: 'Dashboard System',
      path: '/docs/dashboard-system',
      category: 'UI',
      description: 'Real-time analytics and monitoring dashboard documentation',
      content: 'dashboard system analytics monitoring real-time widgets KPI metrics charts graphs visualization performance health status alerts notifications',
      keywords: ['dashboard', 'system', 'analytics', 'monitoring', 'real-time', 'widgets', 'KPI', 'metrics', 'charts', 'graphs', 'visualization', 'performance', 'health', 'status', 'alerts'],
    },
    {
      id: 'product-management',
      title: 'Product Management',
      path: '/docs/product-management',
      category: 'Business',
      description: 'Product lifecycle management and synchronization guide',
      content: 'product management lifecycle inventory pricing categories brands attributes SKU synchronization Magento MDM workflow automation business rules',
      keywords: ['product', 'management', 'lifecycle', 'inventory', 'pricing', 'categories', 'brands', 'attributes', 'SKU', 'synchronization', 'Magento', 'MDM', 'workflow', 'automation', 'business'],
    },
    {
      id: 'configuration-setup',
      title: 'Configuration & Setup',
      path: '/docs/configuration-setup',
      category: 'Setup',
      description: 'Complete environment setup and configuration guide',
      content: 'configuration setup environment variables database connection Redis Firebase Magento API tokens security SSL certificates production staging development',
      keywords: ['configuration', 'setup', 'environment', 'variables', 'database', 'connection', 'Redis', 'Firebase', 'Magento', 'API', 'tokens', 'security', 'SSL', 'certificates', 'production'],
    },
    {
      id: 'deployment-guide',
      title: 'Deployment Guide',
      path: '/docs/deployment-guide',
      category: 'DevOps',
      description: 'Production deployment instructions with security',
      content: 'deployment guide production server setup Docker containers load balancing Nginx PM2 monitoring health checks backup security SSL certificates',
      keywords: ['deployment', 'guide', 'production', 'server', 'setup', 'Docker', 'containers', 'load', 'balancing', 'Nginx', 'PM2', 'monitoring', 'health', 'backup', 'security'],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      path: '/docs/troubleshooting',
      category: 'Support',
      description: 'Common issues, solutions, and debugging techniques',
      content: 'troubleshooting debugging issues solutions problems errors database connection API authentication performance memory logs monitoring diagnostics',
      keywords: ['troubleshooting', 'debugging', 'issues', 'solutions', 'problems', 'errors', 'database', 'connection', 'API', 'authentication', 'performance', 'memory', 'logs', 'monitoring'],
    },
    {
      id: 'magento-integration',
      title: 'Magento Integration',
      path: '/magento-integration',
      category: 'Integration',
      description: 'Adobe Commerce integration with API documentation',
      content: 'Magento integration Adobe Commerce REST API authentication products inventory orders customers synchronization e-commerce platform',
      keywords: ['Magento', 'integration', 'Adobe', 'Commerce', 'REST', 'API', 'authentication', 'products', 'inventory', 'orders', 'customers', 'synchronization', 'e-commerce'],
    },
    {
      id: 'etl-integration',
      title: 'ETL Integration',
      path: '/etl-integration',
      category: 'Integration',
      description: 'ETL process integration and data flow',
      content: 'ETL integration data flow extract transform load pipeline batch processing real-time synchronization data quality validation error handling',
      keywords: ['ETL', 'integration', 'data', 'flow', 'extract', 'transform', 'load', 'pipeline', 'batch', 'processing', 'real-time', 'synchronization', 'quality', 'validation'],
    },
    {
      id: 'jde-integration',
      title: 'JDE Integration',
      path: '/jde-integration',
      category: 'Integration',
      description: 'JD Edwards integration guide',
      content: 'JDE integration JD Edwards enterprise resource planning ERP system data synchronization business processes workflow automation',
      keywords: ['JDE', 'integration', 'JD', 'Edwards', 'enterprise', 'resource', 'planning', 'ERP', 'system', 'data', 'synchronization', 'business', 'processes', 'workflow'],
    },
    {
      id: 'cegid-integration',
      title: 'CEGID Integration',
      path: '/cegid-integration',
      category: 'Integration',
      description: 'CEGID system integration guide',
      content: 'CEGID integration system business management software data synchronization enterprise solution workflow automation processes',
      keywords: ['CEGID', 'integration', 'system', 'business', 'management', 'software', 'data', 'synchronization', 'enterprise', 'solution', 'workflow', 'automation'],
    },
  ];

  // Initialize Fuse.js search index
  useEffect(() => {
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'content', weight: 0.2 },
        { name: 'keywords', weight: 0.2 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      findAllMatches: true,
    };

    const fuse = new Fuse(documentationContent, fuseOptions);

    setSearchIndex(fuse);
  }, []);

  // Perform search
  useEffect(() => {
    if (!searchQuery.trim() || !searchIndex) {
      setSearchResults([]);
      setIsSearching(false);

      return;
    }

    setIsSearching(true);

    // Debounce search
    const timeoutId = setTimeout(() => {
      const results = searchIndex.search(searchQuery);

      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchIndex]);

  // Search functions
  const performSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const getHighlightedText = (text, matches) => {
    if (!matches || matches.length === 0) return text;

    let highlightedText = text;
    const sortedMatches = matches.sort((a, b) => b.indices[0][0] - a.indices[0][0]);

    sortedMatches.forEach(match => {
      match.indices.forEach(([start, end]) => {
        const before = highlightedText.substring(0, start);
        const highlighted = highlightedText.substring(start, end + 1);
        const after = highlightedText.substring(end + 1);

        highlightedText = `${before}<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 2px; font-weight: 600;">${highlighted}</mark>${after}`;
      });
    });

    return highlightedText;
  };

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
    getHighlightedText,
    documentationContent,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
