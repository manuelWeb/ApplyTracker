import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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

          if (typeof token !== 'string') return null;
          return token;
        },
      ]),
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload): { userId: number; email: string } {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
