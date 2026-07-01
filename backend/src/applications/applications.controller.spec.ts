import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { NotFoundException } from '@nestjs/common';
import { ApplicationResponseDto } from './dto/application.response.dto';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;

  const service = {
    findAllFromUser: jest.fn(),
    findOneFromUser: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);

    jest.clearAllMocks();
  });

  describe('findAllFromUser', () => {
    it('should return applications from service', async () => {
      const userId = 42;
      const result = [{ id: 1 }, { id: 2 }];

      service.findAllFromUser.mockResolvedValue(result);

      await expect(controller.findAllFromUser(userId)).resolves.toEqual(result);

      expect(service.findAllFromUser).toHaveBeenCalledWith(42);
      expect(service.findAllFromUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneFromUser', () => {
    it('should return application from service', async () => {
      const userId = 42;
      const result = { id: 1 };

      service.findOneFromUser.mockResolvedValue(result);

      await expect(controller.findOneFromUser(userId, 1)).resolves.toEqual(
        result,
      );
      expect(service.findOneFromUser).toHaveBeenCalledTimes(1);
      expect(service.findOneFromUser).toHaveBeenCalledWith(userId, 1);
    });

    it('should return 404 on application or user id not found', async () => {
      const userId = 24;
      const applicationId = 876;
      const error = new NotFoundException(
        `No application #${applicationId} for userId #${userId}`,
      );
      service.findOneFromUser.mockRejectedValue(error);

      await expect(
        controller.findOneFromUser(userId, applicationId),
      ).rejects.toThrow(NotFoundException);
      expect(service.findOneFromUser).toHaveBeenCalledTimes(1);
      expect(service.findOneFromUser).toHaveBeenCalledWith(
        userId,
        applicationId,
      );
    });
  });

  describe('create', () => {
    it('should create and return application', async () => {
      // Arrange
      const userId = 42;
      const dto: CreateApplicationDto = {
        jobTitle: 'Application expected jobTitle from CreateApplicationDto',
        companyId: 10,
        contractId: 20,
        statusId: 30,
      };
      const application: Application = {
        applicationId: 5432,
        jobTitle: dto.jobTitle,
        jobDescription: undefined,
        jobUrl: undefined,
        jobDomain: undefined,
        projectGoal: undefined,
        location: undefined,
        score: 0,
        user: {
          userId,
          email: 'user@test.com',
          passwordHash: 'should-not-leak',
        },
        company: {
          companyId: dto.companyId,
          name: 'ACME',
          website: undefined,
        },
        contract: {
          contractId: dto.contractId,
          name: 'CDI',
        },
        status: {
          statusId: dto.statusId,
          displayOrder: 1,
          name: 'draft',
        },
        tags: [],
        documents: [],
      };
      const expectedResponse: ApplicationResponseDto = {
        applicationId: application.applicationId,
        jobTitle: application.jobTitle,
        jobDescription: null,
        jobDomain: null,
        jobUrl: null,
        projectGoal: null,
        location: null,
        score: application.score,
        contract: {
          contractId: application.contract.contractId,
          name: application.contract.name,
        },
        company: {
          companyId: application.company.companyId,
          name: application.company.name,
          website: null,
        },
        status: {
          statusId: application.status.statusId,
          displayOrder: application.status.displayOrder,
          name: application.status.name,
        },
      };
      service.create.mockResolvedValue(application);
      // Act
      const response = await controller.create(dto, userId);
      // Assert
      expect(service.create).toHaveBeenCalledWith(dto, userId);
      expect(response).toEqual(expectedResponse);
      expect(response).not.toHaveProperty('user');
    });
  });

  describe('delete', () => {
    it('should delete an application', async () => {
      // Arrange
      const currentUserId = 43;
      const applicationId = 23;
      service.delete.mockResolvedValue(undefined);
      // Act
      const action = await controller.delete(applicationId, currentUserId);
      // Assert
      expect(action).toBeUndefined();
      expect(service.delete).toHaveBeenCalledTimes(1);
      expect(service.delete).toHaveBeenCalledWith({
        applicationId,
        userId: currentUserId,
      });
    });
    it('should throw a NotFoundException', async () => {
      // Arrange
      const currentUserId = 8;
      const applicationId = 3;
      const error = new NotFoundException();
      service.delete.mockRejectedValue(error);
      // Act
      const action = controller.delete(applicationId, currentUserId);
      // Assert
      await expect(action).rejects.toThrow(NotFoundException);
      expect(service.delete).toHaveBeenCalledTimes(1);
      expect(service.delete).toHaveBeenCalledWith({
        applicationId,
        userId: currentUserId,
      });
    });
  });
});
