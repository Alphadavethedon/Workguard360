import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WorkGuard360 API',
      version: '1.0.0',
      description: 'Enterprise Workplace Security & Compliance Platform API',
      contact: {
        name: 'WorkGuard360 Team',
        email: 'support@workguard360.com',
      },
    },
    servers: [
      {
        url: env.NODE_ENV === 'development' 
          ? `http://localhost:${env.PORT}/api`
          : 'https://workguard360.onrender.com/api',
        description: env.NODE_ENV === 'development' ? 'Development server' : 'Production server',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/docs/*.yml'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };