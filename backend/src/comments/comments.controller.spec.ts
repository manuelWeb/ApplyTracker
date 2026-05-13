import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call comments from service', async () => {
      // MOCK
      const result = [{ id: 1 }, { id: 6 }];
      service.findAll.mockResolvedValue(result);
      // CALL
      const resp = await controller.findAll();
      // CHECK
      expect(resp).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should call comment from service with Param id', async () => {
      // MOCK
      const id = 6;
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
