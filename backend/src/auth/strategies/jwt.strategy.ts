import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthenticatedUser, JwtPayload } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET not provided');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const cookiesUnknown: unknown = (request as { cookies?: unknown })
            .cookies;

          if (!cookiesUnknown || typeof cookiesUnknown !== 'object')
            return null;

          const token = (cookiesUnknown as Record<string, unknown>)
            .access_token;
          this.logger.debug(
            `access_token cookie ${token ? '[present]' : '[missing]'}`,
          );

          if (typeof token !== 'string') return null;
          return token;
        },
      ]),
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    this.logger.debug(`validate — userId: ${payload.sub}`);
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
