import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
  ) {}

  @Get()
  async getHome(
    @Query('langId') langId?: string,
  ) {
    return this.homeService.getHome(
      undefined,
      langId ? Number(langId) : 1,
    );
  }
}