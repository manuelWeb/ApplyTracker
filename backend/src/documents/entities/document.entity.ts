import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn({ name: 'document_id' })
  documentId!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name!: string;

  @Column({
    name: 'document_type',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  documentType!: string;

  @Column({
    name: 'file_path',
    type: 'text',
    nullable: false,
  })
  filePath!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
