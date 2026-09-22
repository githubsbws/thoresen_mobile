import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseCategoryController } from './course-category.controller';
import { CourseService } from './course.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
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
