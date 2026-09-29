import { Module } from '@nestjs/common';

import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  /**
   * PrismaModule
   *
   * ทำให้ NewsService สามารถใช้ PrismaService
   * เพื่อเชื่อมต่อ Database ได้
   */
  imports: [PrismaModule],

  controllers: [
    NewsController,
  ],

  providers: [
    NewsService,
  ],

  exports: [
    NewsService,
  ],
})
export class NewsModule {}