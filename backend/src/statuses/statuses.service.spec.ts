import { StatusesService } from '@/statuses/statuses.service';

describe('StatusesService', () => {
  let service: StatusesService;

  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StatusesService(repo as any);
  });

  describe('findAll', () => {
    it('should call repository.find with order by displayOrder ASC', async () => {
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({
        order: {
          displayOrder: 'ASC',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should call repository.findOneOrFail with statusId', async () => {
      await service.findOne(1);

      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { statusId: 1 },
      });
    });
  });
});
