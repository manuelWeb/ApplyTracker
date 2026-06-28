import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Company } from './entities/company.entity';
import { normalizeCompanyName } from './utils/normalize-company-name';

describe('CompaniesController', () => {
  let controller: CompaniesController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call companies from service', async () => {
      // MOCK
      const result = [{ id: 3 }, { id: 6 }];
      service.findAll.mockResolvedValue(result);
      // CALL
      const resp = await controller.findAll();
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should call company from service', async () => {
      // MOCK
      const id = 7;
      const result = { id };
      service.findOne.mockResolvedValue(result);
      // CALL
      const resp = await controller.findOne(id);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('create', () => {
    it('should create a company from service', async () => {
      // Arrange
      const dto: CreateCompanyDto = {
        name: 'Jest Company',
        website: 'https://jest.com',
      };
      const currentUserId = 5432;
      const createdCompany: Company = {
        companyId: 1,
        name: dto.name,
        normalizedName: normalizeCompanyName(dto.name),
        website: dto.website,
        createdByUser: {
          userId: currentUserId,
          email: 'test@test.fr',
          passwordHash: 'password',
        },
        isVerified: false,
      };
      service.create.mockResolvedValue(createdCompany);
      // Act
      const resp = await controller.create(dto, currentUserId);
      // Assert
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto, currentUserId);
      expect(resp).toEqual({
        companyId: 1,
        name: dto.name,
        normalizedName: normalizeCompanyName(dto.name),
        website: dto.website,
        isVerified: false,
      });
      expect(resp).not.toHaveProperty('createdByUser');
      expect(JSON.stringify(resp)).not.toContain('passwordHash');
    });
  });
});
