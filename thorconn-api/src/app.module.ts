import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { AboutModule } from './about/about.module';
import { FaqModule } from './faq/faq.module';
import { CourseModule } from './course/course.module';
import { ReportModule } from './report/report.module';
import { ConditionsModule } from './conditions/conditions.module';
import { ComplaintModule } from './complaint/complaint.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HomeModule,
    PrismaModule,
    AuthModule,
    AboutModule,
    FaqModule,
    CourseModule,
    ReportModule,
    ConditionsModule,
    ComplaintModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}