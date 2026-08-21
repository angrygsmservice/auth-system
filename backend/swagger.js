const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Auth System API",
      version: "1.0.0",
      description: "JWT Authentication API Documentation",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],

    components: {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },

  schemas: {
    User: {
      type: "object",
      properties: {
        _id: {
          type: "string",
          example: "68657c2d7dbe6c9a12345678"
        },
        name: {
          type: "string",
          example: "Ali Valiyev"
        },
        email: {
          type: "string",
          example: "ali@gmail.com"
        },
        role: {
          type: "string",
          example: "user"
        },
        avatar: {
          type: "string",
          example: "/uploads/avatar.jpg"
        },
        isVerified: {
          type: "boolean",
          example: true
        },
        createdAt: {
          type: "string",
          format: "date-time"
        }
      }
    }
  }
},
    

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;