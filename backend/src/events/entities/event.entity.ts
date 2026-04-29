import { Application } from 'src/applications/entities/application.entity';
import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn({
    name: 'event_id',
  })
  eventId!: number;

  @Column({
    name: 'event_type',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  eventType!: string;

  @CreateDateColumn({
    name: 'occurred_at',
    type: 'timestamp',
    nullable: false,
  })
  occurredAt!: Date;

  @ManyToOne(() => Application, { nullable: false })
  @JoinColumn({ name: 'application_id' })
  application!: Application;
}
