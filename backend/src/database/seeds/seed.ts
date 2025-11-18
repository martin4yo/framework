import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedInitialAdmin } from './initial-admin.seed';

// Load environment variables
config();

// Import your TypeORM configuration
import { ConfigService } from '@nestjs/config';

async function runSeeds() {
  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'axioma_core',
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    console.log('Starting seeds...');
    await seedInitialAdmin(dataSource);
    console.log('Seeds completed successfully');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

runSeeds();
