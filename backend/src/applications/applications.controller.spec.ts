import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
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

  describe('findAll', () => {
    it('should return applications from service', async () => {
      const result = [{ id: 1 }, { id: 2 }];

      service.findAll.mockResolvedValue(result);

      await expect(controller.findAll()).resolves.toEqual(result);

      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return application from service', async () => {
      const result = { id: 1 };

      service.findOne.mockResolvedValue(result);

      await expect(controller.findOne(1)).resolves.toEqual(result);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});
