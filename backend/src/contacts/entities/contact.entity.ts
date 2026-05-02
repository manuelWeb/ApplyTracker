import { Company } from 'src/companies/entities/company.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn({ name: 'contact_id' })
  contactId!: number;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  firstName!: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  lastName!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  role?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company!: Company;
}
