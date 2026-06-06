import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    this.logger.debug(`canActivate hit — method ${req.method} url ${req.url}`);
    return super.canActivate(context); // delegates to passport
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: { message: string | undefined } | undefined,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    void context;
    void status;

    this.logger.debug(
      `handleRequest — user: ${JSON.stringify(user)}, info: ${info?.message}`,
    );

    if (err instanceof Error) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException(info?.message);
    }

    return user;
  }
}
