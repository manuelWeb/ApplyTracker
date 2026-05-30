import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { NotFoundException } from '@nestjs/common';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;

  const service = {
    findAllFromUser: jest.fn(),
    findOneFromUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);

    jest.clearAllMocks();
  });

  describe('findAllFromUser', () => {
    it('should return applications from service', async () => {
      const userId = 42;
      const result = [{ id: 1 }, { id: 2 }];

      service.findAllFromUser.mockResolvedValue(result);

      await expect(controller.findAllFromUser(userId)).resolves.toEqual(result);

      expect(service.findAllFromUser).toHaveBeenCalledWith(42);
      expect(service.findAllFromUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneFromUser', () => {
    it('should return application from service', async () => {
      const userId = 42;
      const result = { id: 1 };

      service.findOneFromUser.mockResolvedValue(result);

      await expect(controller.findOneFromUser(userId, 1)).resolves.toEqual(
        result,
      );
      expect(service.findOneFromUser).toHaveBeenCalledTimes(1);
      expect(service.findOneFromUser).toHaveBeenCalledWith(userId, 1);
    });

    it('should return 404 on application or user id not found', async () => {
      const userId = 24;
      const applicationId = 876;
      const error = new NotFoundException(
        `No application #${applicationId} for userId #${userId}`,
      );
      service.findOneFromUser.mockRejectedValue(error);

      await expect(
        controller.findOneFromUser(userId, applicationId),
      ).rejects.toThrow(NotFoundException);
      expect(service.findOneFromUser).toHaveBeenCalledTimes(1);
      expect(service.findOneFromUser).toHaveBeenCalledWith(
        userId,
        applicationId,
      );
    });
  });
});
