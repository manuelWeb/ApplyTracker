import { typeOrmDataSource } from 'src/config/typeorm.datasource';
import { runSeeders } from 'src/database/seeds/seeders';

import { Status } from '@/statuses/entities/status.entity';
import { StatusSeeder } from '@/database/seeds/seeders/status.seeder';

import { User } from '@/users/entities/user.entity';
import { UserSeeder } from '@/database/seeds/seeders/user.seeder';

import { Company } from '@/companies/entities/company.entity';
import { CompanySeeder } from '@/database/seeds/seeders/company.seeder';

import { Contract } from '@/contracts/entities/contract.entity';
import { ContractSeeder } from '@/database/seeds/seeders/contract.seeder';

import { Application } from '@/applications/entities/application.entity';
import { ApplicationSeeder } from '@/database/seeds/seeders/application.seeder';

async function bootstrap(): Promise<void> {
  console.log('Starting database seed…');

  await typeOrmDataSource.initialize();
  console.log('Database connection established!');

  const repositories = createRepositories();

  await runSeeders([
    new StatusSeeder(repositories.statusRepository),
    new UserSeeder(repositories.userRepository),
    new CompanySeeder(repositories.companyRepository),
    new ContractSeeder(repositories.contractRepository),
    new ApplicationSeeder(
      repositories.applicationRepository,
      repositories.userRepository,
      repositories.companyRepository,
      repositories.contractRepository,
      repositories.statusRepository,
    ),
  ]);

  await typeOrmDataSource.destroy();
  console.log('DB Connection closed.');
}

function createRepositories() {
  return {
    statusRepository: typeOrmDataSource.getRepository(Status),
    userRepository: typeOrmDataSource.getRepository(User),
    companyRepository: typeOrmDataSource.getRepository(Company),
    contractRepository: typeOrmDataSource.getRepository(Contract),
    applicationRepository: typeOrmDataSource.getRepository(Application),
  };
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
