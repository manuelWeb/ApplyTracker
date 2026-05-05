import { Repository } from 'typeorm';
import { Status } from 'src/statuses/entities/status.entity';
import { Seeder } from 'src/database/seeds/seeders/seeder.interface';

export const seedStatuses = [
  { name: 'draft', displayOrder: 1 },
  { name: 'applied', displayOrder: 2 },
  { name: 'interview', displayOrder: 3 },
  { name: 'rejected', displayOrder: 4 },
] as const;

export class StatusSeeder implements Seeder {
  constructor(private readonly statusRepository: Repository<Status>) {}

  async run(): Promise<void> {
    for (const statusData of seedStatuses) {
      const existingStatus = await this.statusRepository.findOne({
        where: { name: statusData.name },
      });
      // Idempotency
      if (existingStatus) {
        console.log(`Status already exists: ${statusData.name}`);
        continue;
      }

      const status = this.statusRepository.create({
        name: statusData.name,
        displayOrder: statusData.displayOrder,
      });

      await this.statusRepository.save(status);
      console.log(`Status created: ${statusData.name}`);
    }
  }
}
