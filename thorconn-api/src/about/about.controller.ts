import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { AboutService } from './about.service';

@Controller('about')
export class AboutController {
  constructor(
    private readonly aboutService: AboutService,
  ) {}

  @Get()
  async getAbout(
    @Query('langId') langId?: string,
  ) {
    const languageId = langId
      ? Number(langId)
      : 1;

    return this.aboutService.getAbout(languageId);
  }
}