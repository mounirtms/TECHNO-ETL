/**
 * Simple Swagger Configuration for TECHNO-ETL API
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TECHNO-ETL API Documentation',
      version: '1.0.0',
      description: 'API documentation for TECHNO-ETL system',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://your-production-domain.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check endpoint',
          description: 'Check if the API server is running',
          responses: {
            200: {
              description: 'Server is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'healthy' },
                      timestamp: { type: 'string', example: '2025-07-28T10:00:00.000Z' },
                      uptime: { type: 'number', example: 12345 },
                      version: { type: 'string', example: '1.0.0' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/mdm/prices': {
        get: {
          summary: 'Get price data from MDM',
          description: 'Retrieve price data from MDM for dashboard display',
          tags: ['MDM - Price Management'],
          parameters: [
            {
              name: 'sku',
              in: 'query',
              description: 'Filter by SKU',
              schema: { type: 'string' }
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by category',
              schema: { type: 'string' }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items to return',
              schema: { type: 'integer', default: 100 }
            }
          ],
          responses: {
            200: {
              description: 'Price data retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 1 },
                            sku: { type: 'string', example: 'PROD-001' },
                            name: { type: 'string', example: 'Sample Product' },
                            currentPrice: { type: 'number', example: 29.99 },
                            newPrice: { type: 'number', example: 32.99 },
                            currency: { type: 'string', example: 'USD' },
                            status: { type: 'string', example: 'pending' },
                            source: { type: 'string', example: 'MDM' }
                          }
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'number', example: 150 },
                          limit: { type: 'number', example: 100 },
                          offset: { type: 'number', example: 0 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/mdm/prices/sync-to-magento': {
        post: {
          summary: 'Sync prices to Magento',
          description: 'Sync processed price data from dashboard to Magento',
          tags: ['MDM - Price Management'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          sku: { type: 'string', example: 'PROD-001' },
                          currentPrice: { type: 'number', example: 29.99 },
                          newPrice: { type: 'number', example: 32.99 }
                        }
                      }
                    },
                    force: { type: 'boolean', example: false }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Prices synced to Magento successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Prices synced to Magento successfully' },
                      data: {
                        type: 'object',
                        properties: {
                          synced: { type: 'number', example: 147 },
                          failed: { type: 'number', example: 3 },
                          total: { type: 'number', example: 150 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/mdm/inventory/stocks': {
        get: {
          summary: 'Get stock data from MDM',
          description: 'Retrieve stock data from MDM for dashboard and grid display',
          tags: ['MDM - Inventory Management'],
          parameters: [
            {
              name: 'sourceCode',
              in: 'query',
              description: 'Filter by source code',
              schema: { type: 'string', example: 'main' }
            },
            {
              name: 'sku',
              in: 'query',
              description: 'Filter by SKU',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Stock data retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            sku: { type: 'string', example: 'PROD-001' },
                            sourceCode: { type: 'string', example: 'main' },
                            sourceName: { type: 'string', example: 'Main Warehouse' },
                            quantity: { type: 'number', example: 150 },
                            availableQuantity: { type: 'number', example: 125 },
                            status: { type: 'string', example: 'in_stock' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/mdm/inventory/sync-stocks': {
        post: {
          summary: 'Sync stocks for specific source',
          description: 'Sync stocks for a specific source code (MDM Grid operation)',
          tags: ['MDM - Inventory Management'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['sourceCode'],
                  properties: {
                    sourceCode: { type: 'string', example: 'main' },
                    products: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          sku: { type: 'string', example: 'PROD-001' },
                          quantity: { type: 'number', example: 100 }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Stocks synced successfully for source',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Stocks synced successfully for source: main' },
                      data: {
                        type: 'object',
                        properties: {
                          sourceCode: { type: 'string', example: 'main' },
                          synced: { type: 'number', example: 45 },
                          failed: { type: 'number', example: 1 },
                          total: { type: 'number', example: 46 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/mdm/inventory/sync-all-stocks': {
        post: {
          summary: 'Dashboard bulk stock sync',
          description: 'Comprehensive stock sync from all sources (Dashboard operation)',
          tags: ['MDM - Inventory Management'],
          responses: {
            200: {
              description: 'All stock sources synchronized successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'All stock sources synchronized successfully' },
                      data: {
                        type: 'object',
                        properties: {
                          syncedSources: { type: 'array', items: { type: 'string' }, example: ['main', 'pos', 'warehouse'] },
                          totalProducts: { type: 'number', example: 1247 },
                          syncedProducts: { type: 'number', example: 1198 },
                          failedProducts: { type: 'number', example: 49 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/mdm/inventory/sync-all-stocks-sources': {
        post: {
          summary: 'Sync all stock sources',
          description: 'Execute comprehensive stock synchronization from all sources (MDM, Warehouse, POS, E-commerce)',
          tags: ['MDM'],
          responses: {
            200: {
              description: 'All stock sources synchronized successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'All stock sources synchronized successfully' },
                      data: {
                        type: 'object',
                        properties: {
                          syncedSources: { type: 'array', items: { type: 'string' }, example: ['MDM', 'Warehouse', 'POS', 'E-commerce'] },
                          totalProducts: { type: 'number', example: 1247 },
                          syncedProducts: { type: 'number', example: 1198 },
                          failedProducts: { type: 'number', example: 49 },
                          duration: { type: 'string', example: '2.1s' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/mdm/sources': {
        get: {
          summary: 'Get data sources',
          description: 'Retrieve all available data sources for synchronization',
          tags: ['MDM'],
          responses: {
            200: {
              description: 'Data sources retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'mdm' },
                            name: { type: 'string', example: 'Master Data Management' },
                            type: { type: 'string', example: 'database' },
                            status: { type: 'string', example: 'active' },
                            lastSync: { type: 'string', example: '2025-07-28T10:00:00.000Z' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/task/features': {
        get: {
          summary: 'Get task features',
          description: 'Retrieve all task features with voting data',
          tags: ['Tasks'],
          responses: {
            200: {
              description: 'Task features retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 1 },
                            title: { type: 'string', example: 'Dark Mode Support' },
                            description: { type: 'string', example: 'Add dark mode theme support' },
                            category: { type: 'string', example: 'Feature Request' },
                            priority: { type: 'string', example: 'High' },
                            votes: { type: 'number', example: 25 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/task/categories': {
        get: {
          summary: 'Get task categories',
          description: 'Retrieve all available task categories',
          tags: ['Tasks'],
          responses: {
            200: {
              description: 'Task categories retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 1 },
                            name: { type: 'string', example: 'Feature Request' },
                            description: { type: 'string', example: 'New feature requests' },
                            color: { type: 'string', example: '#2196F3' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/task/stats': {
        get: {
          summary: 'Get task statistics',
          description: 'Retrieve task management statistics',
          tags: ['Tasks'],
          responses: {
            200: {
              description: 'Task statistics retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          totalFeatures: { type: 'number', example: 45 },
                          totalVotes: { type: 'number', example: 234 },
                          activeFeatures: { type: 'number', example: 12 },
                          completedFeatures: { type: 'number', example: 8 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/magento/products': {
        get: {
          summary: 'Get Magento products',
          description: 'Proxy endpoint to retrieve products from Magento API with search criteria',
          tags: ['Magento'],
          parameters: [
            {
              name: 'searchCriteria[pageSize]',
              in: 'query',
              description: 'Number of products per page',
              schema: { type: 'integer', example: 200 }
            },
            {
              name: 'searchCriteria[currentPage]',
              in: 'query',
              description: 'Current page number',
              schema: { type: 'integer', example: 1 }
            },
            {
              name: 'searchCriteria[sortOrders][0][field]',
              in: 'query',
              description: 'Sort field',
              schema: { type: 'string', example: 'created_at' }
            },
            {
              name: 'searchCriteria[sortOrders][0][direction]',
              in: 'query',
              description: 'Sort direction',
              schema: { type: 'string', enum: ['ASC', 'DESC'], example: 'DESC' }
            }
          ],
          responses: {
            200: {
              description: 'Products retrieved successfully from Magento',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 1 },
                            sku: { type: 'string', example: 'PROD-001' },
                            name: { type: 'string', example: 'Sample Product' },
                            price: { type: 'number', example: 29.99 },
                            status: { type: 'number', example: 1 },
                            created_at: { type: 'string', example: '2025-07-28 10:00:00' }
                          }
                        }
                      },
                      search_criteria: { type: 'object' },
                      total_count: { type: 'number', example: 1247 }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Magento API endpoint not found or proxy error'
            }
          }
        }
      },
      '/api/magento/categories': {
        get: {
          summary: 'Get Magento categories',
          description: 'Proxy endpoint to retrieve categories from Magento API',
          tags: ['Magento'],
          responses: {
            200: {
              description: 'Categories retrieved successfully from Magento'
            }
          }
        }
      },
      '/api/magento/orders': {
        get: {
          summary: 'Get Magento orders',
          description: 'Proxy endpoint to retrieve orders from Magento API',
          tags: ['Magento'],
          responses: {
            200: {
              description: 'Orders retrieved successfully from Magento'
            }
          }
        }
      }
    }
  },
  apis: [], // No file scanning needed for this simple setup
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
