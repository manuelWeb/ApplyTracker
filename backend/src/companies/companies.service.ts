import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '@/companies/entities/company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { normalizeCompanyName } from './utils/normalize-company-name';

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

  create(dto: CreateCompanyDto, currentUserId: number): Promise<Company> {
    const newCompany = this.companiesRepository.create({
      name: dto.name,
      normalizedName: normalizeCompanyName(dto.name),
      website: dto.website,
      createdByUser: { userId: currentUserId },
    });
    return this.companiesRepository.save(newCompany);
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
