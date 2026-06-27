import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '@/companies/entities/company.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { normalizeCompanyName } from './utils/normalize-company-name';
import { PostgresQueryFailedError } from '@/database/types/postgres-error.type';
import { POSTGRES_ERROR_CODES } from '@/database/postgres-error-codes';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companiesRepository.find();
  }

  findOne(companyId: number): Promise<Company> {
    return this.companiesRepository.findOneOrFail({
      where: { companyId },
    });
  }

  async create(dto: CreateCompanyDto, currentUserId: number): Promise<Company> {
    const newCompany = this.companiesRepository.create({
      name: dto.name,
      normalizedName: normalizeCompanyName(dto.name),
      website: dto.website,
      createdByUser: { userId: currentUserId },
    });

    try {
      return await this.companiesRepository.save(newCompany);
    } catch (err) {
      const postgresError = err as PostgresQueryFailedError;
      if (postgresError.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
        throw new ConflictException(`Company "${dto.name}" already exists`);
      }
      throw err;
    }
  }

  async update({
    companyId,
    dto,
  }: {
    companyId: number;
    dto: UpdateCompanyDto;
  }): Promise<void> {
    const result = await this.companiesRepository.update(
      { companyId },
      { ...dto },
    );

    if (result.affected === 0) {
      throw new NotFoundException(`No company #${companyId} to update`);
    }
  }

  async delete(companyId: number): Promise<void> {
    const result = await this.companiesRepository.delete({
      companyId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`No company #${companyId} to delete`);
    }
  }
}
