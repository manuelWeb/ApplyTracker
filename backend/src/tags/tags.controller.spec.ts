import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

describe('TagsController', () => {
  let controller: TagsController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call tags from service', async () => {
      const result = [{ id: 3 }, { id: 4 }];

      service.findAll.mockResolvedValue(result);
      const resp = await controller.findAll();
      expect(resp).toEqual(result);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should call tag from service with param id', async () => {
      // MOCK
      const id = 9;
      const result = { id };
      service.findOne.mockResolvedValue(result);
      // CALL
      const resp = await controller.findOne(result.id);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });
});
