import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce API',
      version: '1.0.0',
      description: 'Comprehensive API for an ecommerce platform including user authentication, product management, shopping cart, orders, payments, and admin features.',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'https://api.ecommerce.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          },
          required: ['error']
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          },
          required: ['id', 'name', 'email', 'role']
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Product ID'
            },
            name: {
              type: 'string',
              description: 'Product name'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Product price'
            },
            stock: {
              type: 'integer',
              description: 'Available stock quantity'
            },
            categoryId: {
              type: 'integer',
              description: 'Category ID'
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
                description: 'Image URL'
              },
              description: 'Product images'
            },
            weight: {
              type: 'number',
              format: 'float',
              description: 'Product weight in kg'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Product creation timestamp'
            }
          },
          required: ['id', 'name', 'price', 'stock', 'categoryId']
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Category ID'
            },
            name: {
              type: 'string',
              description: 'Category name'
            },
            description: {
              type: 'string',
              description: 'Category description'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Category creation timestamp'
            }
          },
          required: ['id', 'name']
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Order ID'
            },
            userId: {
              type: 'integer',
              description: 'User ID who placed the order'
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: 'Order status'
            },
            totalAmount: {
              type: 'number',
              format: 'float',
              description: 'Total order amount'
            },
            shippingAddress: {
              type: 'string',
              description: 'Shipping address'
            },
            shippingCity: {
              type: 'string',
              description: 'Shipping city'
            },
            shippingPostalCode: {
              type: 'string',
              description: 'Shipping postal code'
            },
            shippingCountry: {
              type: 'string',
              description: 'Shipping country'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation timestamp'
            }
          },
          required: ['id', 'userId', 'status', 'totalAmount']
        },
        CartItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Cart item ID'
            },
            productId: {
              type: 'integer',
              description: 'Product ID'
            },
            quantity: {
              type: 'integer',
              description: 'Quantity of the product'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Price per unit at time of adding'
            }
          },
          required: ['id', 'productId', 'quantity', 'price']
        },
        Review: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Review ID'
            },
            productId: {
              type: 'integer',
              description: 'Product ID being reviewed'
            },
            userId: {
              type: 'integer',
              description: 'User ID who wrote the review'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating from 1 to 5'
            },
            comment: {
              type: 'string',
              description: 'Review comment'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Review creation timestamp'
            }
          },
          required: ['id', 'productId', 'userId', 'rating']
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

const specs = swaggerJSDoc(options);

export default specs;