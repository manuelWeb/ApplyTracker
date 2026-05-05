import { Seeder } from 'src/database/seeds/seeders/seeder.interface';
import { Logger } from '@nestjs/common';

const logger = new Logger('Seeders');

export async function runSeeders(seeders: Seeder[]): Promise<void> {
  for (const seeder of seeders) {
    logger.log(`Running seeder: ${seeder.constructor.name}`);
    await seeder.run();
    logger.log(`Seeder completed: ${seeder.constructor.name}`);
  }
}
