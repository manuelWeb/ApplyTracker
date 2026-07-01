import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  UpdateResult,
  DeleteResult,
  DeepPartial,
  QueryFailedError,
  Like,
} from 'typeorm';
import { normalizeCompanyName } from './utils/normalize-company-name';
import { Company } from './entities/company.entity';
import { POSTGRES_ERROR_CODES } from '@/database/postgres-error-codes';
import { PostgresQueryFailedError } from '@/database/types/postgres-error.type';

describe('CompaniesService', () => {
  let service: CompaniesService;
  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new CompaniesService(repo as any);
  });

  describe('searchByName', () => {
    it('should search companies by normalized name', async () => {
      // Arrange
      const search = ' OPEN    AI   ';
      const companies: DeepPartial<Company>[] = [
        {
          companyId: 1,
          name: 'Open AI',
          normalizedName: 'open ai',
          website: 'https://openai.com',
          isVerified: false,
        },
      ];
      repo.find.mockResolvedValue(companies);
      // Act
      const action = service.searchByName(search);
      // Assert
      await expect(action).resolves.toEqual(companies);
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({
        where: {
          normalizedName: Like('%open ai%'),
        },
        take: 10,
        order: { name: 'ASC' },
      });
    });
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

  describe('create', () => {
    it('should create a company', async () => {
      // Arrange
      const currentUserId = 5432;
      const dto: CreateCompanyDto = {
        name: 'Company name',
        website: 'https://company-website.com',
      };
      const createdCompany: DeepPartial<Company> = {
        name: dto.name,
        normalizedName: normalizeCompanyName(dto.name),
        website: dto.website,
        createdByUser: { userId: currentUserId },
      };
      const savedCompany: DeepPartial<Company> = {
        companyId: 1,
        ...createdCompany,
        isVerified: false,
      };
      repo.create.mockReturnValue(createdCompany);
      repo.save.mockResolvedValue(savedCompany);
      // Act
      const result = await service.create(dto, currentUserId);
      // Assert
      expect(repo.create).toHaveBeenCalledWith({
        name: dto.name,
        normalizedName: normalizeCompanyName(dto.name),
        createdByUser: { userId: currentUserId },
        website: dto.website,
      });
      expect(repo.save).toHaveBeenCalledWith(createdCompany);
      expect(result).toEqual(savedCompany);
    });
    it('should throw ConflictException when company exists', async () => {
      // Arrange
      const dto: CreateCompanyDto = {
        name: "Company name I'm throwing a conflict",
      };
      const currentUserId = 5432;
      const createdCompany: DeepPartial<Company> = {
        name: dto.name,
        normalizedName: normalizeCompanyName(dto.name),
        website: dto.website,
        createdByUser: { userId: currentUserId },
      };
      const error = new QueryFailedError(
        '',
        [],
        new Error(`Company "${dto.name}" already exists`),
      ) as PostgresQueryFailedError;
      error.code = POSTGRES_ERROR_CODES.UNIQUE_VIOLATION;
      repo.create.mockReturnValue(createdCompany);
      repo.save.mockRejectedValue(error);
      // Act
      const action = service.create(dto, currentUserId);
      // Assert
      await expect(action).rejects.toThrow(ConflictException);
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        name: dto.name,
        normalizedName: normalizeCompanyName(dto.name),
        website: dto.website,
        createdByUser: { userId: currentUserId },
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(createdCompany);
    });
    it('should rethrow unexpected errors', async () => {
      // Arrange
      const dto: CreateCompanyDto = {
        name: "Company name I'm throwing a conflict",
      };
      const currentUserId = 5432;
      const createdCompany: DeepPartial<Company> = {
        name: dto.name,
        normalizedName: normalizeCompanyName(dto.name),
        website: dto.website,
        createdByUser: { userId: currentUserId },
      };
      const unexpectedError = new Error(
        'Generic error outside of ConflictException',
      );
      repo.create.mockReturnValue(createdCompany);
      repo.save.mockRejectedValue(unexpectedError);
      // Act
      const action = service.create(dto, currentUserId);
      // Assert
      await expect(action).rejects.toBe(unexpectedError);
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        name: dto.name,
        normalizedName: normalizeCompanyName(dto.name),
        website: dto.website,
        createdByUser: { userId: currentUserId },
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(createdCompany);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      // Arrange
      const companyId = 5432;
      const dto: UpdateCompanyDto = { name: 'New company name' };
      const updateResult: UpdateResult = {
        raw: [],
        affected: 1,
        generatedMaps: [],
      };
      repo.update.mockResolvedValue(updateResult);
      // Act
      const result = await service.update({ companyId, dto });
      // Assert
      expect(repo.update).toHaveBeenCalledTimes(1);
      expect(repo.update).toHaveBeenCalledWith({ companyId }, { ...dto });
      expect(result).toBeUndefined();
    });
    it('should throw NotFoundException when company does not exist', async () => {
      // Arrange
      const companyId = 4321;
      const dto: UpdateCompanyDto = { name: 'CompanyName not updated' };
      const updateResult: UpdateResult = {
        generatedMaps: [],
        raw: [],
        affected: 0,
      };
      repo.update.mockResolvedValue(updateResult);
      // Act
      const action = service.update({ companyId, dto });
      // Assert
      await expect(action).rejects.toThrow(NotFoundException);
      expect(repo.update).toHaveBeenCalledTimes(1);
      expect(repo.update).toHaveBeenCalledWith({ companyId }, { ...dto });
    });
  });
  describe('delete', () => {
    it('should delete an existing company', async () => {
      // Arrange
      const companyId = 765;
      const deleteResult: DeleteResult = { raw: [], affected: 1 };
      repo.delete.mockResolvedValue(deleteResult);
      // Act
      const action = await service.delete(companyId);
      // Assert
      expect(repo.delete).toHaveBeenCalledTimes(1);
      expect(repo.delete).toHaveBeenCalledWith({ companyId });
      expect(action).toBeUndefined();
    });
    it('should throw NotFoundException when company does not exist', async () => {
      // Arrange
      const companyId = 123;
      const deleteResult: DeleteResult = { raw: [], affected: 0 };
      repo.delete.mockResolvedValue(deleteResult);
      // Act
      const action = service.delete(companyId);
      // Assert
      await expect(action).rejects.toThrow(NotFoundException);
      expect(repo.delete).toHaveBeenCalledTimes(1);
      expect(repo.delete).toHaveBeenCalledWith({ companyId });
    });
  });
});
