import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should hash password, create user and return safe user', async () => {
      const dto = {
        email: 'user@apply.com',
        password: 'password',
      };
      // MOCK
      const passwordHash = 'mock-hashed-password';
      // User already created and returned from mock
      const createdUser = {
        userId: 1,
        email: dto.email,
        passwordHash,
      };
      // bypass bcrypt.hash with resolved value 'mock-hashed-password'
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(passwordHash as never);
      usersService.create.mockResolvedValue(createdUser);
      // CALL
      const result = await service.register(dto);
      // CHECK
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(usersService.create).toHaveBeenCalledWith(dto.email, passwordHash);
      expect(result).toEqual({
        userId: createdUser.userId,
        email: createdUser.email,
      });
    });
  });
});
