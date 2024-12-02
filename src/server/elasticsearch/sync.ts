import { pool } from '../config/database.js';
import { esClient } from './client.js';
import { logger } from '../config/logger.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const syncLawyers = async () => {
  try {
    // Get all active lawyers from database
    const [lawyers] = await pool.execute(`
      SELECT l.*, 
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM lawyers l
      LEFT JOIN reviews r ON l.id = r.lawyer_id
      WHERE l.status = 'active'
      GROUP BY l.id
    `);

    // Bulk index lawyers
    const operations = (lawyers as any[]).flatMap(lawyer => [
      { index: { _index: 'lawyers', _id: lawyer.id } },
      {
        id: lawyer.id,
        fullName: lawyer.full_name,
        specialization: lawyer.specialization,
        yearsOfExperience: lawyer.years_of_experience,
        officeAddress: lawyer.office_address,
        languagesSpoken: lawyer.languages_spoken,
        hourlyRate: lawyer.hourly_rate,
        rating: lawyer.average_rating
      }
    ]);

    if (operations.length > 0) {
      const result = await esClient.bulk({ operations });
      logger.info(`Indexed ${result.items.length / 2} lawyers`);
    }
  } catch (error) {
    logger.error('Failed to sync lawyers with Elasticsearch:', error);
    throw error;
  }
};

// Run sync if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncLawyers()
    .then(() => process.exit(0))
    .catch(error => {
      logger.error('Sync failed:', error);
      process.exit(1);
    });
}

export { syncLawyers };
