import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '@/applications/entities/application.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
  ) {}

  findAllFromUser(userId: number): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { user: { userId } },
      relations: {
        user: true,
        company: true,
        contract: true,
        status: true,
      },
    });
  }

  async findOneFromUser(
    userId: number,
    applicationId: number,
  ): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { user: { userId }, applicationId },
      relations: {
        user: true,
        company: true,
        contract: true,
        status: true,
      },
    });
    if (!application) {
      throw new NotFoundException(
        `No application #${applicationId} for userId #${userId}`,
      );
    }
    return application;
  }
}
