import { Request } from 'express';

export type JwtPayload = {
  sub: number;
  email: string;
};

export type AuthenticatedUser = {
  userId: number;
  email: string;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
