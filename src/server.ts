import './config/env.js';
import app from './config/app.js';
import { logger } from './config/logger.js';
import { testConnection } from './config/database.js';

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await testConnection();
    
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer().catch((error) => {
  logger.error('Unhandled server error:', error);
  process.exit(1);
});