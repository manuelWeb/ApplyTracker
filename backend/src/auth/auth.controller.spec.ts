import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should call authService.register with dto and then return a safe user (avoid password)', async () => {
      const dto = {
        email: 'usertoreg@jest.com',
        password: 'password',
      };
      const safeUser = {
        userId: 1,
        email: dto.email,
      };
      // MOCK
      authService.register.mockResolvedValue(safeUser);

      // CALL
      const result = await controller.register(dto);

      // CHECK
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(safeUser);
    });
  });
});
