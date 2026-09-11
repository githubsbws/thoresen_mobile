import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { CourseService } from '../course/course.service';

@Controller('course-category')
export class CourseCategoryController {
  constructor(
    private readonly courseService: CourseService,
  ) {}

  @Get(':id')
  async index(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('langId') langId?: string,
  ) {
    const categoryId = Number(id);
    const parsedUserId = Number(userId);
    const parsedLangId = langId
      ? Number(langId)
      : 1;

    if (
      Number.isNaN(categoryId) ||
      categoryId <= 0
    ) {
      throw new BadRequestException(
        'categoryId is required',
      );
    }

    if (
      Number.isNaN(parsedUserId) ||
      parsedUserId <= 0
    ) {
      throw new BadRequestException(
        'userId is required',
      );
    }

    if (
      Number.isNaN(parsedLangId) ||
      parsedLangId <= 0
    ) {
      throw new BadRequestException(
        'langId must be a valid number',
      );
    }

    return this.courseService.getCoursesByCategory(
      categoryId,
      parsedUserId,
      parsedLangId,
    );
  }
}