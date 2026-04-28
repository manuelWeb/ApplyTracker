import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn({
    name: 'status_id',
  })
  statusId!: number;

  @Column({
    name: 'display_order',
    type: 'int',
    unique: true,
    nullable: false,
  })
  displayOrder!: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  name!: string;
}
