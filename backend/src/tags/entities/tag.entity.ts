import { Application } from 'src/applications/entities/application.entity';
import { Document } from 'src/documents/entities/document.entity';
import { EmailTemplate } from 'src/email-templates/entities/email-template.entity';
import { PrimaryGeneratedColumn, Entity, Column, ManyToMany } from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn({
    name: 'tag_id',
  })
  tagId!: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  name!: string;

  @ManyToMany(() => Application, (application) => application.tags)
  applications!: Application[];

  @ManyToMany(() => EmailTemplate, (emailTemplate) => emailTemplate.tags)
  emailTemplates!: EmailTemplate[];

  @ManyToMany(() => Document, (document) => document.tags)
  documents!: Document[];
}
