import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  findAll(userId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { userId },
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id, userId },
      relations: ['company'],
    });
    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return application;
  }

  create(dto: CreateApplicationDto, userId: string): Promise<Application> {
    const application = this.applicationRepository.create({ ...dto, userId });
    return this.applicationRepository.save(application);
  }

  async update(id: string, dto: UpdateApplicationDto, userId: string): Promise<Application> {
    const application = await this.findOne(id, userId);
    Object.assign(application, dto);
    return this.applicationRepository.save(application);
  }

  async remove(id: string, userId: string): Promise<void> {
    const application = await this.findOne(id, userId);
    await this.applicationRepository.remove(application);
  }
}
