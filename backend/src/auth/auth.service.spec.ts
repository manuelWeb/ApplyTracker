import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
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

  describe('login', () => {
    it('should find user, validate password and return safe user', async () => {
      const email = 'user@user.io';
      const password = 'plain-password';
      const userId = 8;
      const hashedPassword = 'i-m-hashed';

      const dto = {
        email,
        password,
      };
      const currentUserPayload = {
        userId,
        email,
        passwordHash: hashedPassword,
      };
      const safeUser = {
        userId,
        email,
      };
      // MOCK
      usersService.findByEmail.mockResolvedValue(currentUserPayload);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      // CALL
      const resp = await service.login(dto);
      // CHECK
      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        currentUserPayload.passwordHash,
      );
      expect(resp).toEqual(safeUser);
    });
  });
});
