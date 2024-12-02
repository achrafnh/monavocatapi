import { Client } from '@elastic/elasticsearch';
import { logger } from './logger.js';

const node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

export const esClient = new Client({
  node,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || ''
  }
});

export const initializeElasticsearch = async () => {
  try {
    await esClient.ping();
    logger.info('Connected to Elasticsearch');
    return true;
  } catch (error) {
    logger.error('Elasticsearch connection failed:', error);
    return false;
  }
};
