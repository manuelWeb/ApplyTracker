import { Repository } from 'typeorm';
import { Company } from '@/companies/entities/company.entity';
import { Seeder } from '@/database/seeds/seeders/seeder.interface';

export const seedCompanies = [
  { name: 'Example Company', website: 'https://www.example.com' },
] as const;

export class CompanySeeder implements Seeder {
  constructor(private readonly companyRepository: Repository<Company>) {}

  async run(): Promise<void> {
    for (const { name, website } of seedCompanies) {
      const existingCompany = await this.companyRepository.findOne({
        where: { name },
      });

      if (existingCompany) {
        console.log(`Company already exists: ${name}`);
        continue;
      }

      const company = this.companyRepository.create({
        name,
        website,
      });

      await this.companyRepository.save(company);

      console.log(`Company created: ${name}`);
    }
  }
}
