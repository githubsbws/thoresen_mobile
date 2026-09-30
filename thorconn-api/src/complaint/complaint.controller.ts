import {
  Controller,
  Get,
  Post,
  Body,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ComplaintService, CreateComplaintDto } from './complaint.service';

@Controller('complaint')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Get('ships')
  async getShips() {
    return this.complaintService.getShips();
  }

  @Get('captcha')
  async getCaptcha() {
    return this.complaintService.getCaptcha();
  }

  @Post()
  async submitComplaint(
    @Body() body: CreateComplaintDto,
    @Req() req: Request,
  ) {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress;

    return this.complaintService.createComplaint(body, clientIp);
  }
}
