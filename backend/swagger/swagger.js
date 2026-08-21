const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth System API",
      version: "1.0.0",
      description: "Full JWT Auth + User Management API",
    },

    servers: [
      {
        url: "http://localhost:3000",
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
            id: {
              type: "string",
              example: "6a48af5338fe61bee1bf3c05",
            },
            name: {
              type: "string",
              example: "Ali",
            },
            email: {
              type: "string",
              example: "ali@gmail.com",
            },
            role: {
              type: "string",
              example: "user",
            },
            avatar: {
              type: "string",
              example: "",
            },
          },
        },

        Token: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxx",
            },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyyyyyyyy",
            },
          },
        },

        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Something went wrong",
            },
          },
        },
      },
    },
  },

  SuccessResponse: {
  type: "object",
  properties: {
    success: {
      type: "boolean",
      example: true,
    },
    message: {
      type: "string",
      example: "Success",
    },
    data: {
      type: "object",
    },
  },
},

ErrorResponse: {
  type: "object",
  properties: {
    success: {
      type: "boolean",
      example: false,
    },
    message: {
      type: "string",
      example: "Something went wrong",
    },
  },
},

  
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);