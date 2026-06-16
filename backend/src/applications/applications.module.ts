import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { User } from '@/users/entities/user.entity';
import { Company } from '@/companies/entities/company.entity';
import { Contract } from '@/contracts/entities/contract.entity';
import { Status } from '@/statuses/entities/status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User, Company, Contract, Status]),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
