/**
 * Swagger API Documentation Configuration
 * Comprehensive API documentation for TECHNO-ETL
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TECHNO-ETL API Documentation',
      version: '1.0.0',
      description: `
        Comprehensive API documentation for TECHNO-ETL system.
        
        ## Features
        - **Product Management**: Complete CRUD operations for products
        - **Price Synchronization**: Real-time price sync with Magento
        - **Stock Management**: Inventory tracking and synchronization
        - **Voting System**: Feature request and voting functionality
        - **Dashboard Analytics**: Business intelligence and reporting
        - **MDM Integration**: Master Data Management operations
        
        ## Authentication
        Most endpoints require authentication. Include the JWT token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## Rate Limiting
        API requests are limited to 1000 requests per hour per IP address.
        
        ## Error Handling
        All endpoints return standardized error responses with appropriate HTTP status codes.
      `,
      contact: {
        name: 'TECHNO-ETL Support',
        email: 'support@techno-etl.com',
        url: 'https://techno-etl.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.techno-etl.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['sku', 'name', 'price'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique product identifier',
              example: 1
            },
            sku: {
              type: 'string',
              description: 'Stock Keeping Unit',
              example: 'PROD-001'
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Sample Product'
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'A high-quality sample product'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Product price',
              example: 29.99
            },
            stock: {
              type: 'integer',
              description: 'Available stock quantity',
              example: 100
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Electronics'
            },
            brand: {
              type: 'string',
              description: 'Product brand',
              example: 'TechBrand'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'discontinued'],
              description: 'Product status',
              example: 'active'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        VotingFeature: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique feature identifier',
              example: 1
            },
            title: {
              type: 'string',
              description: 'Feature title',
              example: 'Dark Mode Support'
            },
            description: {
              type: 'string',
              description: 'Feature description',
              example: 'Add dark mode theme support to the application'
            },
            category_id: {
              type: 'integer',
              description: 'Category identifier',
              example: 1
            },
            priority: {
              type: 'string',
              enum: ['Low', 'Medium', 'High', 'Critical'],
              description: 'Feature priority',
              example: 'High'
            },
            status: {
              type: 'string',
              enum: ['Proposed', 'In Review', 'Approved', 'In Development', 'Testing', 'Completed', 'Rejected'],
              description: 'Feature status',
              example: 'Proposed'
            },
            vote_count: {
              type: 'integer',
              description: 'Total number of votes',
              example: 25
            },
            created_by: {
              type: 'string',
              description: 'User who created the feature',
              example: 'user123'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Operation success status',
              example: true
            },
            message: {
              type: 'string',
              description: 'Response message',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            error: {
              type: 'string',
              description: 'Error message (if any)',
              example: null
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1
                },
                pageSize: {
                  type: 'integer',
                  example: 25
                },
                total: {
                  type: 'integer',
                  example: 100
                },
                totalPages: {
                  type: 'integer',
                  example: 4
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            },
            error: {
              type: 'string',
              example: 'Detailed error message'
            },
            code: {
              type: 'integer',
              example: 400
            }
          }
        }
      },
      responses: {
        Success: {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              }
            }
          }
        },
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Unauthorized access',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Products',
        description: 'Product management operations'
      },
      {
        name: 'Voting',
        description: 'Feature voting system'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard and analytics'
      },
      {
        name: 'Sync',
        description: 'Data synchronization operations'
      },
      {
        name: 'MDM',
        description: 'Master Data Management'
      },
      {
        name: 'Magento',
        description: 'Magento integration'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './swagger/paths/*.yaml'
  ]
};

const specs = swaggerJsdoc(options);

export {
  specs,
  swaggerUi,
  options
};
