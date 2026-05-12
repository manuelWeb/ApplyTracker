import { Test, TestingModule } from '@nestjs/testing';
import { StatusesController } from './statuses.controller';
import { StatusesService } from './statuses.service';

describe('StatusesController', () => {
  let controller: StatusesController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusesController],
      providers: [
        {
          provide: StatusesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<StatusesController>(StatusesController);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call statuses from service', async () => {
      const result = [{ id: 1 }, { id: 2 }];
      service.findAll.mockResolvedValue(result);

      await expect(controller.findAll()).resolves.toEqual(result);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should call status from service with param id', async () => {
      // MOCK
      const result = { id: 4 };
      // configure mock (findOne must return service)
      service.findOne.mockResolvedValue(result);
      // CALL
      const resp = await controller.findOne(4);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(4);
    });
  });
});
