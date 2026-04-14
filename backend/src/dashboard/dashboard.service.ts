import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../applications/application.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async getStats(userId: string) {
    const applications = await this.applicationRepository.find({ where: { userId } });

    const total = applications.length;
    const byStatus = {
      [ApplicationStatus.WISHLIST]: 0,
      [ApplicationStatus.APPLIED]: 0,
      [ApplicationStatus.INTERVIEW]: 0,
      [ApplicationStatus.OFFER]: 0,
      [ApplicationStatus.REJECTED]: 0,
    };

    for (const app of applications) {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    }

    return { total, byStatus };
  }
}
