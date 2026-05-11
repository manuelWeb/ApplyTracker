import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findOne(userId: number): Promise<User> {
    return this.usersRepository.findOneOrFail({
      where: {
        userId,
      },
    });
  }

  findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneOrFail({
      where: {
        email,
      },
    });
  }
}
