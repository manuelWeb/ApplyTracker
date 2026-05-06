import { ApplicationsService } from '@/applications/applications.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const applicationRepository = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ApplicationsService(applicationRepository as any);
  });

  describe('findAll', () => {
    it('should find all applications with relations', async () => {
      applicationRepository.find.mockResolvedValue([]);

      await service.findAll(); // Args become from the real method, not the mock: applicationRepository.find.mock.calls

      expect(applicationRepository.find).toHaveBeenCalledWith({
        relations: {
          user: true,
          company: true,
          contract: true,
          status: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should find one application by id with relations', async () => {
      const applicationId = 1;

      applicationRepository.findOneOrFail.mockResolvedValue({
        applicationId,
      });

      await service.findOne(applicationId);

      expect(applicationRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { applicationId },
        relations: {
          user: true,
          company: true,
          contract: true,
          status: true,
        },
      });
    });
  });
});
