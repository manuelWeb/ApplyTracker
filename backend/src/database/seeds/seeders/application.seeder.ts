import { Repository } from 'typeorm';
import { Application } from '@/applications/entities/application.entity';
import { Seeder } from '@/database/seeds/seeders/seeder.interface';
import { Company } from '@/companies/entities/company.entity';
import { seedCompanies } from '@/database/seeds/seeders/company.seeder';
import { User } from '@/users/entities/user.entity';
import { seedUsers } from '@/database/seeds/seeders/user.seeder';
import { Status } from '@/statuses/entities/status.entity';
import { seedStatuses } from '@/database/seeds/seeders/status.seeder';
import { Contract } from '@/contracts/entities/contract.entity';
import { seedContracts } from '@/database/seeds/seeders/contract.seeder';

export const seedApplications = [
  {
    jobTitle: 'Software Engineer',
    jobDomain: 'Engineering',
    location: 'Lille, Hauts-de-France',
    projectGoal: 'Build a job application tracker',
    jobDescription:
      'Looking for a skilled software engineer to develop a job application tracking system. The ideal candidate will have experience with TypeScript, NestJS, and TypeORM.',
    jobUrl: 'https://www.example.com/job/software-engineer',
    score: 90,
    userEmail: seedUsers[0].email,
    companyName: seedCompanies[0].name,
    contractName: seedContracts[0].name,
    statusName: seedStatuses[0].name,
  },
] as const;

export class ApplicationSeeder implements Seeder {
  constructor(
    private readonly applicationRepository: Repository<Application>,
    private readonly userRepository: Repository<User>,
    private readonly companyRepository: Repository<Company>,
    private readonly contractRepository: Repository<Contract>,
    private readonly statusRepository: Repository<Status>,
  ) {}

  async run(): Promise<void> {
    for (const appData of seedApplications) {
      /**
       * ApplicationSeeder
       *
       * Notes:
       * - Relations (user, company, contract, status) are resolved via business keys
       *   (email, name, etc.) instead of hardcoding foreign keys.
       * - This ensures idempotence and avoids coupling to DB-generated IDs.
       */
      const user = await this.userRepository.findOneOrFail({
        where: { email: appData.userEmail },
      });
      const company = await this.companyRepository.findOneOrFail({
        where: { name: appData.companyName },
      });
      const contract = await this.contractRepository.findOneOrFail({
        where: { name: appData.contractName },
      });
      const status = await this.statusRepository.findOneOrFail({
        where: { name: appData.statusName },
      });

      const existingApplication = await this.applicationRepository.findOne({
        where: {
          jobTitle: appData.jobTitle,
          user: { email: appData.userEmail },
          company: { name: appData.companyName },
        },
      });
      if (existingApplication) {
        console.log(
          `Application already exists: ${appData.jobTitle} for user ${appData.userEmail}`,
        );
        continue;
      }

      // ! Only map Application entity fields here.
      // Do NOT spread appData because it contains helper fields
      // like userEmail, companyName, etc. used only for lookup.
      const application = this.applicationRepository.create({
        jobTitle: appData.jobTitle,
        jobDomain: appData.jobDomain,
        location: appData.location,
        projectGoal: appData.projectGoal,
        jobDescription: appData.jobDescription,
        jobUrl: appData.jobUrl,
        score: appData.score,
        user,
        company,
        contract,
        status,
      });

      await this.applicationRepository.save(application);

      console.log(
        `Application created: ${appData.jobTitle} at ${appData.companyName}`,
      );
    }
  }
}
