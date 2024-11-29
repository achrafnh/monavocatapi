import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { apiLimiter } from './middleware/rateLimiter.js';
import { router as authRoutes } from './routes/authRoutes.js';
import { errorHandler } from './middleware/error.js';
import { logger } from './config/logger.js';
import { testConnection } from './config/database.js';
import swaggerDocument from './swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Initialize database
testConnection().catch((error: Error) => {
  logger.error('Failed to connect to database:', error);
  process.exit(1);
});

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../client')));

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/v1', authRoutes);

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
