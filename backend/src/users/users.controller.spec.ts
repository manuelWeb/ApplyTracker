import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const service = {
    findOne: jest.fn(),
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should call findOne from service with param userId', async () => {
      // MOCK
      const userId = 6;
      const result = { userId };
      service.findOne.mockResolvedValue(result);
      // CALL
      const resp = await controller.findOne(userId);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('findByEmail', () => {
    it('should call findByEmail from service with param email', async () => {
      // MOCK
      const email = 'admin@apply.com';
      const result = { email };
      service.findByEmail.mockResolvedValue(result);
      // CALL
      const resp = await controller.findByEmail(email);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findByEmail).toHaveBeenCalledTimes(1);
      expect(service.findByEmail).toHaveBeenCalledWith(email);
    });
  });
});
