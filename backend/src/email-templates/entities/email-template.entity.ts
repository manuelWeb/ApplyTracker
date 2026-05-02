import { Tag } from 'src/tags/entities/tag.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn({
    name: 'email_template_id',
  })
  emailTemplateId!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  subject!: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  body!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToMany(() => Tag, (tag) => tag.emailTemplates)
  @JoinTable({
    name: 'email_template_tag',
    joinColumn: {
      name: 'email_template_id',
      referencedColumnName: 'emailTemplateId',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'tagId',
    },
  })
  tags!: Tag[];
}
