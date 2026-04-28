import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn({
    name: 'company_id',
  })
  companyId!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  website?: string;
}
