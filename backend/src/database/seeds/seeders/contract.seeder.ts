import { Repository } from 'typeorm';
import { Contract } from '@/contracts/entities/contract.entity';
import { Seeder } from '@/database/seeds/seeders/seeder.interface';

export const seedContracts = [
  {
    name: 'Example Contract CDI',
  },
] as const;

export class ContractSeeder implements Seeder {
  constructor(private readonly contractRepository: Repository<Contract>) {}

  async run(): Promise<void> {
    for (const { name } of seedContracts) {
      const existingContract = await this.contractRepository.findOne({
        where: { name },
      });

      if (existingContract) {
        console.log(`Contract already exists: ${name}`);
        continue;
      }

      const contract = this.contractRepository.create({
        name,
      });

      await this.contractRepository.save(contract);

      console.log(`Contract created: ${name}`);
    }
  }
}
