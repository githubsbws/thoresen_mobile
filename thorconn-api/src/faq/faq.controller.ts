import { Controller, Get, Query } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('faq')
export class FaqController {
  constructor(
    private readonly faqService: FaqService,
  ) {}

  @Get()
  async getFaq(
    @Query('langId') langId?: string,
  ) {
    const languageId =
      langId ? Number(langId) : 1;

    return this.faqService.getFaq(languageId);
  }
}