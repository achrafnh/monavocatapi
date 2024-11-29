import { readdirSync } from 'fs';
import { join } from 'path';
import logger from '../config/logger.js';
import { testConnection } from '../config/database.js';

async function migrate(direction: 'up' | 'down') {
  await testConnection();

  const migrationsDir = join(process.cwd(), 'src', 'database', 'migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.ts'))
    .sort();

  if (direction === 'down') {
    migrationFiles.reverse();
  }

  for (const file of migrationFiles) {
    const migration = await import(join(migrationsDir, file));
    
    try {
      await migration[direction]();
      logger.info(`Migration ${file} ${direction} completed successfully`);
    } catch (error) {
      logger.error(`Migration ${file} ${direction} failed:`, error);
      process.exit(1);
    }
  }
}

const direction = process.argv[2] as 'up' | 'down';
if (!direction || !['up', 'down'].includes(direction)) {
  console.error('Please specify migration direction: up or down');
  process.exit(1);
}

migrate(direction).catch(console.error);