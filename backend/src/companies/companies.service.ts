import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  findAll(userId: string): Promise<Company[]> {
    return this.companyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id, userId },
    });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  create(dto: CreateCompanyDto, userId: string): Promise<Company> {
    const company = this.companyRepository.create({ ...dto, userId });
    return this.companyRepository.save(company);
  }

  async update(id: string, dto: UpdateCompanyDto, userId: string): Promise<Company> {
    const company = await this.findOne(id, userId);
    Object.assign(company, dto);
    return this.companyRepository.save(company);
  }

  async remove(id: string, userId: string): Promise<void> {
    const company = await this.findOne(id, userId);
    await this.companyRepository.remove(company);
  }
}
