import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({
    name: 'user_id',
  })
  // \! assertion d’affectation définitive
  userId!: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  passwordHash!: string;
}
