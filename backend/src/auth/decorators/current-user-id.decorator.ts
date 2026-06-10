import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

type AuthenticatedUser = {
  userId: number;
  email: string;
};

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();

    if (!request.user) {
      throw new UnauthorizedException('User not found in request');
    }
    return request.user.userId;
  },
);
