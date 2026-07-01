import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '@/applications/entities/application.entity';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from '@/users/entities/user.entity';
import { Company } from '@/companies/entities/company.entity';
import { Contract } from '@/contracts/entities/contract.entity';
import { Status } from '@/statuses/entities/status.entity';

type DeleteApplicationParams = {
  userId: number;
  applicationId: number;
};

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
    @InjectRepository(Status)
    private readonly statusesRepository: Repository<Status>,
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

  async create(
    dto: CreateApplicationDto,
    currentUserId: number,
  ): Promise<Application> {
    const user = await this.usersRepository.findOne({
      where: { userId: currentUserId },
    });
    if (!user) {
      throw new NotFoundException(`No user #${currentUserId}`);
    }
    const company = await this.companiesRepository.findOne({
      where: { companyId: dto.companyId },
    });
    if (!company) {
      throw new NotFoundException(`No company #${dto.companyId}`);
    }
    const contract = await this.contractsRepository.findOne({
      where: { contractId: dto.contractId },
    });
    if (!contract) {
      throw new NotFoundException(`No contract #${dto.contractId}`);
    }
    const status = await this.statusesRepository.findOne({
      where: { statusId: dto.statusId },
    });
    if (!status) {
      throw new NotFoundException(`No status #${dto.statusId}`);
    }

    const newApplication = this.applicationsRepository.create({
      jobTitle: dto.jobTitle,
      jobDomain: dto.jobDomain,
      location: dto.location,
      projectGoal: dto.projectGoal,
      jobDescription: dto.jobDescription,
      jobUrl: dto.jobUrl,
      score: dto.score,
      user,
      company,
      contract,
      status,
    });

    return await this.applicationsRepository.save(newApplication);
  }

  async delete({
    userId,
    applicationId,
  }: DeleteApplicationParams): Promise<void> {
    const result = await this.applicationsRepository.delete({
      applicationId,
      user: { userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `No application #${applicationId} for userId #${userId}`,
      );
    }
  }
}
