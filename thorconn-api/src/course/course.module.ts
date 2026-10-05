import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseCategoryController } from './course-category.controller';
import { CourseService } from './course.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

/**
 * [FIX] เพิ่ม `AuthModule` เข้า imports (ไฟล์เดิมมีแค่ PrismaModule)
 *
 * เหตุผล: CourseController / CourseCategoryController ใช้ @UseGuards(JwtAuthGuard) ซึ่ง guard
 * ตัวนั้น inject JwtService เข้ามา ถ้า CourseModule ไม่เห็น JwtModule ผ่าน DI เลย แอปจะ error
 * ตอน bootstrap ทันที (Nest can't resolve dependencies of JwtAuthGuard...)
 * การ import AuthModule เข้ามา (ซึ่ง export JwtModule ออกมาแล้ว — ดู auth.module.ts) คือวิธีแก้
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule, // [ADD]
  ],
  controllers: [
    CourseController,
    CourseCategoryController,
  ],
  providers: [
    CourseService,
  ],
})
export class CourseModule {}
