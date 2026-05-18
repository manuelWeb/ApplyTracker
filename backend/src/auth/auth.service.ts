import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { Injectable, ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.usersService.create(email, passwordHash);
      return { userId: user.userId, email: user.email };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError && driverError.code === '23505') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }
}
