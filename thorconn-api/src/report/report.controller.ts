// src/report/report.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller(['report', 'v1/report'])
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Get()
    async getReport(@Query('userId') userId?: string) {
        if (!userId) {
            return this.reportService.getOverviewReport({});
        }

        const parsedUserId = Number(userId);

        if (Number.isNaN(parsedUserId) || parsedUserId <= 0) {
            throw new BadRequestException('userId must be a valid number');
        }

        return this.reportService.getUserReport(parsedUserId);
    }

    @Get('search')
    async searchReport(
        @Query('employeeType') employeeType?: string,
        @Query('department') department?: string,
        @Query('position') position?: string,
        @Query('level') level?: string,
        @Query('status') status?: string,
        @Query('fromYear') fromYear?: string,
        @Query('toYear') toYear?: string,
    ) {
        return this.reportService.getOverviewReport({
            employeeType,
            department,
            position,
            level,
            status,
            fromYear,
            toYear,
        });
    }

    @Get('training')
    async getTrainingReport(@Query() query: any) {
        return this.reportService.getTrainingReport(query);
    }

    @Get('test')
    async getTestReport(@Query() query: any) {
        return this.reportService.getTestReport(query);
    }

    @Get('evaluation')
    async getEvaluationReport(@Query() query: any) {
        return this.reportService.getEvaluationReport(query);
    }
}


