import { pool } from '../../config/database.js';
import { logger } from '../../config/logger.js';

export async function up() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lawyer_profiles (
        id CHAR(36) PRIMARY KEY,
        lawyer_id CHAR(36) NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        years_of_experience INT NOT NULL,
        hourly_rate DECIMAL(10,2) NOT NULL,
        rating DECIMAL(3,2) DEFAULT 0,
        location_lat DECIMAL(10,8),
        location_lon DECIMAL(11,8),
        address TEXT,
        languages JSON,
        availability BOOLEAN DEFAULT true,
        description TEXT,
        education JSON,
        certifications JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
        INDEX idx_specialization (specialization),
        INDEX idx_rating (rating),
        INDEX idx_experience (years_of_experience),
        SPATIAL INDEX idx_location (location_lat, location_lon)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('Lawyer profiles table created successfully');
  } catch (error) {
    logger.error('Error creating lawyer profiles table:', error);
    throw error;
  }
}

export async function down() {
  try {
    await pool.query('DROP TABLE IF EXISTS lawyer_profiles');
    logger.info('Lawyer profiles table dropped successfully');
  } catch (error) {
    logger.error('Error dropping lawyer profiles table:', error);
    throw error;
  }
}
