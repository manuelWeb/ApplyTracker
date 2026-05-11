import { EmailTemplatesService } from './email-templates.service';

describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService;

  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new EmailTemplatesService(repo as any);
  });

  describe('findAllByUserId', () => {
    it('should call repository.find with userId', async () => {
      await service.findAllByUserId(1);
      expect(repo.find).toHaveBeenCalledWith({
        where: {
          user: { userId: 1 },
        },
      });
    });
  });

  describe('findOneByUserId', () => {
    it('should call repository.findOneOrFail with user.userId and tags relation', async () => {
      await service.findOneByUserId(1, 1);
      expect(repo.findOneOrFail).toHaveBeenLastCalledWith({
        where: {
          emailTemplateId: 1,
          user: { userId: 1 },
        },
        relations: {
          tags: true,
        },
      });
    });
  });
});
