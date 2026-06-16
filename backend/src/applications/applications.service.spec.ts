import { ApplicationsService } from '@/applications/applications.service';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { User } from '@/users/entities/user.entity';
import { Company } from '@/companies/entities/company.entity';
import { Contract } from '@/contracts/entities/contract.entity';
import { Status } from '@/statuses/entities/status.entity';
import { CreateApplicationDto } from './dto/create-application.dto';

type ApplicationRepositoryMock = Pick<
  Repository<Application>,
  'find' | 'findOne' | 'create' | 'save'
>;
type RelationRepositoryMock<T extends object> = Pick<Repository<T>, 'findOne'>;

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const applicationsRepository: jest.Mocked<ApplicationRepositoryMock> = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const usersRepository: jest.Mocked<RelationRepositoryMock<User>> = {
    findOne: jest.fn(),
  };
  const companiesRepository: jest.Mocked<RelationRepositoryMock<Company>> = {
    findOne: jest.fn(),
  };
  const contractsRepository: jest.Mocked<RelationRepositoryMock<Contract>> = {
    findOne: jest.fn(),
  };
  const statusesRepository: jest.Mocked<RelationRepositoryMock<Status>> = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    // We use reset instead of clear to reset the repository mocked resolved values as well
    jest.resetAllMocks();

    service = new ApplicationsService(
      applicationsRepository as unknown as Repository<Application>,
      usersRepository as unknown as Repository<User>,
      companiesRepository as unknown as Repository<Company>,
      contractsRepository as unknown as Repository<Contract>,
      statusesRepository as unknown as Repository<Status>,
    );
  });

  describe('findAllFromUser', () => {
    it('should find all applications with relations', async () => {
      const userId = 42;
      applicationsRepository.find.mockResolvedValue([]);

      await expect(service.findAllFromUser(userId)).resolves.toEqual([]);
      expect(applicationsRepository.find).toHaveBeenCalledWith({
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

      applicationsRepository.findOne.mockResolvedValue({
        applicationId,
      } as Application);

      await expect(
        service.findOneFromUser(userId, applicationId),
      ).resolves.toEqual(expect.objectContaining({ applicationId }));

      expect(applicationsRepository.findOne).toHaveBeenCalledWith({
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

      applicationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneFromUser(userId, applicationId),
      ).rejects.toThrow(NotFoundException);

      expect(applicationsRepository.findOne).toHaveBeenCalledWith({
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

  describe('create', () => {
    it('should load required relation when creating application', async () => {
      // Arrange
      const currentUserId = 72;
      const dto: CreateApplicationDto = {
        jobTitle: 'Application jobTitle spec',
        companyId: 10,
        contractId: 20,
        statusId: 30,
      };
      const application = { applicationId: 1 } as Application;
      const user = { userId: currentUserId } as User;
      const company = { companyId: dto.companyId } as Company;
      const contract = { contractId: dto.contractId } as Contract;
      const status = { statusId: dto.statusId } as Status;

      applicationsRepository.create.mockReturnValue(application);
      applicationsRepository.save.mockResolvedValue(application);
      usersRepository.findOne.mockResolvedValue(user);
      companiesRepository.findOne.mockResolvedValue(company);
      contractsRepository.findOne.mockResolvedValue(contract);
      statusesRepository.findOne.mockResolvedValue(status);

      // Act
      await service.create(dto, currentUserId);

      // Assert
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { userId: currentUserId },
      });
      expect(companiesRepository.findOne).toHaveBeenCalledWith({
        where: { companyId: dto.companyId },
      });
      expect(contractsRepository.findOne).toHaveBeenCalledWith({
        where: { contractId: dto.contractId },
      });
      expect(statusesRepository.findOne).toHaveBeenCalledWith({
        where: { statusId: dto.statusId },
      });
    });
    it('should create application with dto fields and loaded relations', async () => {
      // Arrange
      const currentUserId = 72;
      const dto: CreateApplicationDto = {
        jobTitle:
          'Application jobTitle spec create with dto fields and loaded relations',
        jobDomain: 'Backend',
        location: 'Remote',
        projectGoal: 'Build APIs',
        jobDescription: 'NestJS role',
        jobUrl: 'https://example.com/job',
        score: 80,
        companyId: 10,
        contractId: 20,
        statusId: 30,
      };
      const user = { userId: currentUserId } as User;
      const company = { companyId: dto.companyId } as Company;
      const contract = { contractId: dto.contractId } as Contract;
      const status = { statusId: dto.statusId } as Status;

      const createdApplication = {
        jobTitle: dto.jobTitle,
        user,
        company,
        contract,
        status,
      } as Application;
      const savedApplication = {
        ...createdApplication,
        applicationId: 123,
      };

      usersRepository.findOne.mockResolvedValue(user);
      companiesRepository.findOne.mockResolvedValue(company);
      contractsRepository.findOne.mockResolvedValue(contract);
      statusesRepository.findOne.mockResolvedValue(status);

      applicationsRepository.create.mockReturnValue(createdApplication);
      applicationsRepository.save.mockResolvedValue(savedApplication);

      // Act
      await service.create(dto, currentUserId);

      // Assert
      expect(applicationsRepository.create).toHaveBeenCalledWith({
        jobTitle: dto.jobTitle,
        jobDomain: dto.jobDomain,
        location: dto.location,
        projectGoal: dto.projectGoal,
        jobDescription: dto.jobDescription,
        jobUrl: dto.jobUrl,
        score: dto.score,
        user,
        status,
        company,
        contract,
      });
    });
    it('should save and return created application', async () => {
      // Arrange
      const currentUserId = 72;
      const dto: CreateApplicationDto = {
        jobTitle: 'Backend Developer',
        companyId: 10,
        contractId: 20,
        statusId: 30,
      };
      const user = { userId: currentUserId } as User;
      const company = { companyId: dto.companyId } as Company;
      const contract = { contractId: dto.contractId } as Contract;
      const status = { statusId: dto.statusId } as Status;
      const createdApplication = {
        jobTitle: dto.jobTitle,
        user,
        company,
        contract,
        status,
      } as Application;
      const savedApplication = {
        ...createdApplication,
        applicationId: 124,
      };
      usersRepository.findOne.mockResolvedValue(user);
      companiesRepository.findOne.mockResolvedValue(company);
      contractsRepository.findOne.mockResolvedValue(contract);
      statusesRepository.findOne.mockResolvedValue(status);

      applicationsRepository.create.mockReturnValue(createdApplication);
      applicationsRepository.save.mockResolvedValue(savedApplication);
      // Act
      const result = await service.create(dto, currentUserId);
      // Assert
      expect(applicationsRepository.save).toHaveBeenCalledWith(
        createdApplication,
      );
      expect(result).toBe(savedApplication);
    });
    it('should throw NotFoundException when user is not found', async () => {
      // Arrange
      const currentUserId = 72;
      const dto: CreateApplicationDto = {
        jobTitle: 'Job title on NotFound userId',
        companyId: 10,
        contractId: 20,
        statusId: 30,
      };
      usersRepository.findOne.mockResolvedValue(null);
      // Act
      const action = service.create(dto, currentUserId);
      // Assert
      await expect(action).rejects.toThrow(NotFoundException);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { userId: currentUserId },
      });
      expect(applicationsRepository.create).not.toHaveBeenCalled();
      expect(applicationsRepository.save).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException when company is not found', async () => {
      // Arrange
      const currentUserId = 72;
      const dto: CreateApplicationDto = {
        jobTitle: 'Job title on NotFound companyId',
        companyId: 10,
        contractId: 20,
        statusId: 30,
      };
      usersRepository.findOne.mockResolvedValue({
        userId: currentUserId,
        email: 'user@user.fr',
        passwordHash: 'password',
      });
      companiesRepository.findOne.mockResolvedValue(null);
      // Act
      const action = service.create(dto, currentUserId);
      // Assert
      await expect(action).rejects.toThrow(NotFoundException);
      expect(companiesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(companiesRepository.findOne).toHaveBeenCalledWith({
        where: { companyId: dto.companyId },
      });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { userId: currentUserId },
      });
      expect(applicationsRepository.create).not.toHaveBeenCalled();
      expect(applicationsRepository.save).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException when contract is not found', async () => {
      // Arrange
      const currentUserId = 72;
      const dto: CreateApplicationDto = {
        jobTitle: 'Job title on NotFound contractId',
        companyId: 10,
        contractId: 20,
        statusId: 30,
      };
      usersRepository.findOne.mockResolvedValue({
        userId: currentUserId,
        email: 'user@user.fr',
        passwordHash: 'password',
      });
      companiesRepository.findOne.mockResolvedValue({
        companyId: dto.companyId,
        name: '   Bolo company name  ',
        normalizedName: 'bolo company name',
        isVerified: false,
      });
      contractsRepository.findOne.mockResolvedValue(null);
      // Act
      const action = service.create(dto, currentUserId);
      // Assert
      await expect(action).rejects.toThrow(NotFoundException);
      expect(contractsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(contractsRepository.findOne).toHaveBeenCalledWith({
        where: { contractId: dto.contractId },
      });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { userId: currentUserId },
      });
      expect(applicationsRepository.create).not.toHaveBeenCalled();
      expect(applicationsRepository.save).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException when status is not found', async () => {
      // Arrange
      const currentUserId = 72;
      const dto: CreateApplicationDto = {
        jobTitle: 'Job title on NotFound statusId',
        companyId: 10,
        contractId: 20,
        statusId: 30,
      };
      usersRepository.findOne.mockResolvedValue({
        userId: currentUserId,
        email: 'user@user.fr',
        passwordHash: 'password',
      });
      companiesRepository.findOne.mockResolvedValue({
        companyId: dto.companyId,
        name: '   Bolo company name  ',
        normalizedName: 'bolo company name',
        isVerified: false,
      });
      contractsRepository.findOne.mockResolvedValue({
        contractId: dto.contractId,
        name: 'CDI',
      });
      statusesRepository.findOne.mockResolvedValue(null);
      // Act
      const action = service.create(dto, currentUserId);
      // Assert
      await expect(action).rejects.toThrow(NotFoundException);
      expect(statusesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(statusesRepository.findOne).toHaveBeenCalledWith({
        where: { statusId: dto.statusId },
      });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { userId: currentUserId },
      });
      expect(applicationsRepository.create).not.toHaveBeenCalled();
      expect(applicationsRepository.save).not.toHaveBeenCalled();
    });
  });
});
