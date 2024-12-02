import { Client } from '@elastic/elasticsearch';
import { logger } from '../config/logger.js';

const node = process.env.ELASTICSEARCH_URL || 'http://172.173.137.254:9222';

export const esClient = new Client({
  node,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || ''
  }
});

export const initializeElasticsearch = async () => {
  try {
    // Check connection
    await esClient.ping();
    logger.info('Connected to Elasticsearch');

    // Create lawyers index if it doesn't exist
    const indexExists = await esClient.indices.exists({ index: 'lawyers' });
    
    if (!indexExists) {
      await esClient.indices.create({
        index: 'lawyers',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              fullName: { 
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              specialization: { 
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              yearsOfExperience: { type: 'integer' },
              officeAddress: { type: 'text' },
              languagesSpoken: {
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              hourlyRate: { type: 'float' },
              rating: { type: 'float' }
            }
          }
        }
      });
      logger.info('Lawyers index created');
    }
  } catch (error) {
    logger.error('Elasticsearch initialization failed:', error);
    throw error;
  }
};
