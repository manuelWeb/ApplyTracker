import { TagsService } from '@/tags/tags.service';

describe('TagsService', () => {
  let service: TagsService;

  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new TagsService(repo as any);
  });

  describe('findAll', () => {
    it('should call repository.find with relations', async () => {
      await service.findAll();
      // use CalledWith() = no options
      expect(repo.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should call repository.findOne with tagId', async () => {
      await service.findOne(1);
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { tagId: 1 },
        relations: {
          applications: true,
          emailTemplates: true,
          documents: true,
        },
      });
    });
  });
});
