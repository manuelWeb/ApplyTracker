import { ApplicationsService } from '@/applications/applications.service';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';

type ApplicationRepositoryMock = Pick<
  Repository<Application>,
  'find' | 'findOne'
>;

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const applicationRepository: jest.Mocked<ApplicationRepositoryMock> = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ApplicationsService(
      applicationRepository as unknown as Repository<Application>,
    );
  });

  describe('findAllFromUser', () => {
    it('should find all applications with relations', async () => {
      const userId = 42;
      applicationRepository.find.mockResolvedValue([]);

      await expect(service.findAllFromUser(userId)).resolves.toEqual([]);
      expect(applicationRepository.find).toHaveBeenCalledWith({
        where: { user: { userId } },
        relations: {
          user: true,
          company: true,
          contract: true,
          status: true,
        },
      });
    });
  });

  describe('findOneFromUser', () => {
    it('should find one application by id with relations', async () => {
      const userId = 42;
      const applicationId = 1;

      applicationRepository.findOne.mockResolvedValue({
        applicationId,
      } as Application);

      await expect(
        service.findOneFromUser(userId, applicationId),
      ).resolves.toEqual(expect.objectContaining({ applicationId }));

      expect(applicationRepository.findOne).toHaveBeenCalledWith({
        where: { applicationId, user: { userId } },
        relations: {
          user: true,
          company: true,
          contract: true,
          status: true,
        },
      });
    });

    it('should throw NotFoundException when application is not found for user', async () => {
      const userId = 24;
      const applicationId = 876;

      applicationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneFromUser(userId, applicationId),
      ).rejects.toThrow(NotFoundException);

      expect(applicationRepository.findOne).toHaveBeenCalledWith({
        where: { applicationId, user: { userId } },
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
