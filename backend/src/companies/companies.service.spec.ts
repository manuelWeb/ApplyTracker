import { CompaniesService } from './companies.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new CompaniesService(repo as any);
  });

  describe('findAll', () => {
    it('should call repository.find without options', async () => {
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should call repository.findOneOrFail with companyId', async () => {
      await service.findOne(1);
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { companyId: 1 },
      });
    });
  });
});
