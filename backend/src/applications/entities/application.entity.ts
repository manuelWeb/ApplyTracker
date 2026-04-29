import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from 'src/companies/entities/company.entity';
import { Contract } from 'src/contracts/entities/contract.entity';
import { Status } from 'src/statuses/entities/status.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn({
    name: 'application_id',
  })
  applicationId!: number;

  @Column({
    name: 'job_title',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  jobTitle!: string;

  @Column({
    name: 'job_domain',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  jobDomain?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  location?: string;

  @Column({
    name: 'project_goal',
    type: 'text',
    nullable: true,
  })
  projectGoal?: string;

  @Column({
    name: 'job_description',
    type: 'text',
    nullable: true,
  })
  jobDescription?: string;

  @Column({
    name: 'job_url',
    type: 'text',
    nullable: true,
  })
  jobUrl?: string;

  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  score!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @ManyToOne(() => Contract, { nullable: false })
  @JoinColumn({ name: 'contract_id' })
  contract!: Contract;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'status_id' })
  status!: Status;
}
