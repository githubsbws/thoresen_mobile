import { Controller, Get, Param } from '@nestjs/common';

import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
  ) {}

  /**
   * GET /v1/news
   *
   * ดึงรายการข่าวทั้งหมด
   *
   * ใช้สำหรับ:
   * - NewsScreen
   * - หน้าแสดงรายการข่าว
   */
  @Get()
  async findAll() {
    const data = await this.newsService.findAll();

    return {
      success: true,
      data,
    };
  }

  /**
   * GET /v1/news/:id
   *
   * ดึงรายละเอียดข่าว 1 รายการตาม ID
   *
   * ใช้สำหรับ:
   * - NewsDetailScreen
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.newsService.findOne(id);

    return {
      success: true,
      data,
    };
  }
}