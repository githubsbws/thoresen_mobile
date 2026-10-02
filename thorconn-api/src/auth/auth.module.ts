import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';

/**
 * [FIX] เพิ่ม `exports: [JwtModule]` บรรทัดเดียว (ไฟล์เดิมของคุณไม่มีบรรทัดนี้)
 *
 * เหตุผล: JwtAuthGuard (ของจริง) inject JwtService เข้ามาใช้ ทุก module ที่อยากใช้ guard ตัวนี้
 * (เช่น CourseModule) ต้องมองเห็น JwtService ผ่าน DI ด้วย การ export JwtModule ออกจาก AuthModule
 * แล้วให้ module อื่น `imports: [AuthModule]` คือวิธีมาตรฐานของ NestJS ในการแชร์ provider ข้าม
 * module โดยไม่ต้อง register JwtModule.registerAsync(...) ซ้ำที่อื่นอีกรอบ (ซึ่งจะต้องคัดลอก
 * config เดิมไปซ้ำ เสี่ยงหลุด sync กันทีหลัง)
 *
 * ไม่มีผลกับพฤติกรรมเดิมของ AuthModule เอง (/auth/login, /auth/me ยังทำงานเหมือนเดิมทุกอย่าง)
 */
@Module({
  imports: [
    ConfigModule,

    PrismaModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule], // [ADD]
})
export class AuthModule {}
