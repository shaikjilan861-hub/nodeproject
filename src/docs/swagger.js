const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node API Documentation",
      version: "1.0.0",
      description: "Backend API documentation using Swagger",
    },
    servers: [
      {
        url: "http://localhost:8000",
      },
    ],
  },
  apis: ["./src/routes/user.js"], // path to route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
