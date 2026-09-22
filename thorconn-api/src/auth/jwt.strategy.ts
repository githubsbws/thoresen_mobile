import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    username: string;
    email: string;
  }) {
    const user = await this.prisma.tbl_users.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('ไม่พบผู้ใช้งาน');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('บัญชีถูกปิดใช้งาน');
    }

    return user;
  }
}