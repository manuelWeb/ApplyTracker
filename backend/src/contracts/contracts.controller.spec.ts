import { Test, TestingModule } from '@nestjs/testing';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

describe('ContractsController', () => {
  let controller: ContractsController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [
        {
          provide: ContractsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ContractsController>(ContractsController);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return contracts from service', async () => {
      const result = [{ id: 1 }, { id: 2 }];

      service.findAll.mockResolvedValue(result);

      await expect(controller.findAll()).resolves.toEqual(result);

      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return contract from service', async () => {
      const result = { id: 1 };
      service.findOne.mockResolvedValue(result);

      await expect(controller.findOne(1)).resolves.toEqual(result);
      // const response = await controller.findOne(1); expect(response).toEqual(result);

      expect(service.findOne).toHaveBeenCalledTimes(1); // test le contrat entre controller et service
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});
