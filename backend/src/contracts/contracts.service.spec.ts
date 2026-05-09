import { ContractsService } from '@/contracts/contracts.service';

describe('ContractsService', () => {
  let service: ContractsService;

  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContractsService(repo as any);
  });

  describe('findAll', () => {
    it('should call repository.find without options ', async () => {
      await service.findAll();

      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call repository.findOneOrFail with contractId', async () => {
      await service.findOne(1);

      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { contractId: 1 },
      });
    });
  });
});
