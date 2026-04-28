import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

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
}
