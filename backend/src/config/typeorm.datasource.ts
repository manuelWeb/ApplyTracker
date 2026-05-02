// Config ORM for TypeORM CLI runtime
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({
  path: '../.env',
});

export default new DataSource({
  type: 'postgres',

  host: 'localhost',
  port: Number(process.env.POSTGRES_HOST_PORT),

  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],

  synchronize: false,
});
