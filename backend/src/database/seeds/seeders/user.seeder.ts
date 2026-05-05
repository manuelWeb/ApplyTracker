import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Seeder } from '@/database/seeds/seeders/seeder.interface';
import * as bcrypt from 'bcrypt';

export const seedUsers = [
  { email: 'admin@example.com', password: 'Password123!' },
] as const;

export class UserSeeder implements Seeder {
  constructor(private readonly userRepository: Repository<User>) {}

  async run(): Promise<void> {
    for (const { email, password } of seedUsers) {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        console.log(`User already exists: ${email}`);
        continue;
      }

      // TODO: replace with PasswordService once authentication layer is introduced
      const passwordHash = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        email,
        passwordHash,
      });

      await this.userRepository.save(user);

      console.log(`User created: ${email}`);
    }
  }
}
