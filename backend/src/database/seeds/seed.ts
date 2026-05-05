import { typeOrmDataSource } from 'src/config/typeorm.datasource';
import { runSeeders } from 'src/database/seeds/seeders';

import { Status } from '@/statuses/entities/status.entity';
import { StatusSeeder } from '@/database/seeds/seeders/status.seeder';

import { User } from '@/users/entities/user.entity';
import { UserSeeder } from '@/database/seeds/seeders/user.seeder';

import { Company } from '@/companies/entities/company.entity';
import { CompanySeeder } from '@/database/seeds/seeders/company.seeder';
async function bootstrap(): Promise<void> {
  console.log('Starting database seed…');

  await typeOrmDataSource.initialize();
  console.log('Database connection established!');

  const statusRepository = typeOrmDataSource.getRepository(Status);
  const userRepository = typeOrmDataSource.getRepository(User);
  const companyRepository = typeOrmDataSource.getRepository(Company);
  await runSeeders([
    new StatusSeeder(statusRepository),
    new UserSeeder(userRepository),
    new CompanySeeder(companyRepository),
  ]);

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
