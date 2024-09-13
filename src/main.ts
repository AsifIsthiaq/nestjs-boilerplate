import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {logger: false});
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  const port = configService.get<number>('PORT') || 3333;
  await app.listen(port);
  logger.info(`Application running on port ${port}`);
}
bootstrap();
