import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    if (!username || !password) {
      throw new UnauthorizedException(
        'กรุณากรอก username และ password',
      );
    }

    const user = await this.prisma.tbl_users.findFirst({
      where: {
        OR: [
          {
            username: username,
          },
          {
            email: username,
          },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      );
    }

    /**
     * ระบบเดิมมี password เป็น VARCHAR(128)
     * และข้อมูลตัวอย่างเป็น MD5 32 ตัวอักษร
     *
     *
     * แต่ hash นี้ที่ให้มาดูเหมือนสั้นกว่า MD5 ปกติ
     * จึงควรตรวจสอบ algorithm ของระบบเดิมอีกครั้ง
     */

    const hashedPassword = createHash('md5')
      .update(password)
      .digest('hex');

    if (hashedPassword !== user.password) {
      throw new UnauthorizedException(
        'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      );
    }

    if (user.status !== 1) {
      throw new UnauthorizedException(
        'บัญชีนี้ไม่ได้เปิดใช้งาน',
      );
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: String(user.id),
        name: user.username ?? '',
        role: user.group ?? '',
        vessel: '',
        email: user.email ?? '',
      },
    };
    
  }
  async getCurrentUser(user: any) {
    const dbUser = await this.prisma.tbl_users.findUnique({
        where: {
        id: Number(user.sub),
        },
    });

    if (!dbUser) {
        throw new UnauthorizedException(
        'ไม่พบข้อมูลผู้ใช้งาน',
        );
    }

    if (dbUser.status !== 1) {
        throw new UnauthorizedException(
        'บัญชีนี้ไม่ได้เปิดใช้งาน',
        );
    }

    return {
        id: String(dbUser.id),
        name: dbUser.username ?? '',
        role: dbUser.group ?? '',
        vessel: '',
        email: dbUser.email ?? '',
    };
    }
}