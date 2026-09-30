import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ConditionsService } from './conditions.service';

@Controller('conditions')
export class ConditionsController {
  constructor(
    private readonly conditionsService: ConditionsService,
  ) {}

  @Get()
  async getConditions(
    @Query('langId') langId?: string,
  ) {
    const languageId = langId
      ? Number(langId)
      : 1;

    return this.conditionsService.getConditions(languageId);
  }
}
