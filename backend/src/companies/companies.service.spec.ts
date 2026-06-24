import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateResult, DeleteResult, DeepPartial } from 'typeorm';
import { normalizeCompanyName } from './utils/normalize-company-name';
import { Company } from './entities/company.entity';

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
