import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;

  const service = {
    findAllByUserId: jest.fn(),
    findOneByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    jest.clearAllMocks();
  });

  describe('findAllByUserId', () => {
    it('should call findAllByUserId from service with param userId', async () => {
      // MOCK
      const userId = 4;
      const result = { userId };
      service.findAllByUserId.mockResolvedValue(result);
      // CALL
      const resp = await controller.findAllByUserId(userId);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findAllByUserId).toHaveBeenCalledTimes(1);
      expect(service.findAllByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOneByUserId', () => {
    it('should call findOneByUserId from service with params documentId and userId', async () => {
      // MOCK
      const documentId = 2;
      const userId = 9;
      const result = { documentId, userId };
      service.findOneByUserId.mockResolvedValue(result);
      // CALL
      const resp = await controller.findOneByUserId(documentId, userId);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findOneByUserId).toHaveBeenCalledTimes(1);
      expect(service.findOneByUserId).toHaveBeenCalledWith(documentId, userId);
    });
  });
});
