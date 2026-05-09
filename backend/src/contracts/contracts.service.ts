import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from '@/contracts/entities/contract.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
  ) {}

  findAll(): Promise<Contract[]> {
    return this.contractsRepository.find();
  }

  findOne(contractId: number): Promise<Contract> {
    return this.contractsRepository.findOneOrFail({
      where: { contractId },
    });
  }
}
