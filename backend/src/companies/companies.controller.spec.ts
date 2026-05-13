import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call companies from service', async () => {
      // MOCK
      const result = [{ id: 3 }, { id: 6 }];
      service.findAll.mockResolvedValue(result);
      // CALL
      const resp = await controller.findAll();
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should call company from service', async () => {
      // MOCK
      const id = 7;
      const result = { id };
      service.findOne.mockResolvedValue(result);
      // CALL
      const resp = await controller.findOne(id);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });
});
