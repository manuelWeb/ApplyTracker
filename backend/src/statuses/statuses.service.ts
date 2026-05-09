import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from '@/statuses/entities/status.entity';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Status)
    private readonly statusesRepository: Repository<Status>,
  ) {}

  findAll(): Promise<Status[]> {
    return this.statusesRepository.find({
      order: {
        displayOrder: 'ASC',
      },
    });
  }

  findOne(statusId: number): Promise<Status> {
    return this.statusesRepository.findOneOrFail({
      where: { statusId },
    });
  }
}
