import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CourseService } from './course.service';
import { PositiveIntPipe } from './positive-int.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

// [FIX] ใส่ guard แล้ว (เดิม TODO(AUTH)) ใช้ JwtAuthGuard ตัวจริงของโปรเจกต์ — รายละเอียด/
// คำเตือนเต็มๆ อยู่ใน course.controller.ts (ตัวนี้ทำงานเหมือนกันทุกอย่าง)
@UseGuards(JwtAuthGuard)
@Controller('course-category')
export class CourseCategoryController {
  constructor(private readonly courseService: CourseService) {}

  // GET /course-category/:id?langId=1  (userId มาจาก token แล้ว)
  @Get(':id')
  index(
    @Param('id', PositiveIntPipe) categoryId: number,
    @CurrentUser() userId: number,
    @Query('langId', new DefaultValuePipe(1), PositiveIntPipe) langId: number,
  ) {
    return this.courseService.getCoursesByCategory(
      categoryId,
      userId,
      langId,
    );
  }
}
