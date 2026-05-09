import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;

  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommentsService(repo as any);
  });

  describe('findAll', () => {
    it('should call repository.findAll without options', async () => {
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should call repository.findOne with commentId and its event relation', async () => {
      await service.findOne(1);
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { commentId: 1 },
      });
    });
  });
});
