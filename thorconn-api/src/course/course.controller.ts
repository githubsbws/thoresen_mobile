import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { CourseService } from './course.service';

@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
  ) {}

  @Get()
  async index(
    @Query('userId') userId: string,
    @Query('langId') langId?: string,
  ) {
    const parsedUserId = Number(userId);
    

    if (
      !userId ||
      Number.isNaN(parsedUserId) ||
      parsedUserId <= 0
    ) {
      throw new BadRequestException(
        'userId is required',
      );
    }

    const parsedLangId = langId
      ? Number(langId)
      : 1;

    if (
      Number.isNaN(parsedLangId) ||
      parsedLangId <= 0
    ) {
      throw new BadRequestException(
        'langId must be a valid number',
      );
    }

    return this.courseService.getCourseData(
      parsedUserId,
      parsedLangId,
    );
  }
  @Get(':id')
  async detail(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('langId') langId?: string,
  ) {
    const courseId = Number(id);
    const parsedUserId = Number(userId);
    const parsedLangId = langId ? Number(langId) : 1;

    if (Number.isNaN(courseId) || courseId <= 0) {
      throw new BadRequestException('courseId is required');
    }

    if (Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      throw new BadRequestException('userId is required');
    }

    if (Number.isNaN(parsedLangId) || parsedLangId <= 0) {
      throw new BadRequestException(
        'langId must be a valid number',
      );
    }

    return this.courseService.getCourseDetail(
      courseId,
      parsedUserId,
      parsedLangId,
    );
  }
}