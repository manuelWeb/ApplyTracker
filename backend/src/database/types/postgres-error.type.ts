import { QueryFailedError } from 'typeorm';

export type PostgresQueryFailedError = QueryFailedError & {
  code?: string;
};
