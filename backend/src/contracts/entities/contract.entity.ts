import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn({
    name: 'contract_id',
  })
  contractId!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name!: string;
}
