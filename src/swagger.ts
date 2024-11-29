const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'MonAvocat API',
    version: '1.0.0',
    description: 'API documentation for MonAvocat platform'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/users/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'fullName'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  password: {
                    type: 'string',
                    minLength: 8
                  },
                  fullName: {
                    type: 'string'
                  },
                  phoneNumber: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User created successfully'
          },
          400: {
            description: 'Invalid input'
          }
        }
      }
    },
    '/users/signin': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  password: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful'
          },
          401: {
            description: 'Invalid credentials'
          }
        }
      }
    }
  }
};

export default swaggerDocument;