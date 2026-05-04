import { typeOrmDataSource } from 'src/config/typeorm.datasource';
import { runSeeders } from 'src/database/seeds/seeders';

async function bootstrap(): Promise<void> {
  console.log('Starting database seed…');

  await typeOrmDataSource.initialize();
  console.log('Database connection established!');

  await runSeeders([]);

  await typeOrmDataSource.destroy();
  console.log('DB Connection closed.');
}

bootstrap()
  .then(() => {
    console.log('Seed completed!');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed failed!', error);

    if (typeOrmDataSource.isInitialized) {
      await typeOrmDataSource.destroy();
      console.log('Database closed after error.');
    }
    process.exit(1);
  });
