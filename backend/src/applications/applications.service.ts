import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '@/applications/entities/application.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
  ) {}

  findAll(): Promise<Application[]> {
    return this.applicationsRepository.find({
      relations: {
        user: true,
        company: true,
        contract: true,
        status: true,
      },
    });
  }

  findOne(applicationId: number): Promise<Application> {
    return this.applicationsRepository.findOneOrFail({
      where: { applicationId },
      relations: {
        user: true,
        company: true,
        contract: true,
        status: true,
      },
    });
  }
}
