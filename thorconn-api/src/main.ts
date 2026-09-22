import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('v1', {
    exclude: ['report', 'report/(.*)'],
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();