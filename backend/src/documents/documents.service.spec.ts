import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  let service: DocumentsService;
  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = new DocumentsService(repo as any);
  });

  describe('findAllByUserId', () => {
    it('should call repository.find with user.userId', async () => {
      await service.findAllByUserId(1);
      expect(repo.find).toHaveBeenCalledWith({
        where: { user: { userId: 1 } },
      });
    });
  });

  describe('findOneByUserId', () => {
    it('should call repository.find with user.userId', async () => {
      await service.findOneByUserId(10, 1);
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: {
          documentId: 10,
          user: {
            userId: 1,
          },
        },
        relations: {
          tags: true,
          applications: true,
        },
      });
    });
  });
});
