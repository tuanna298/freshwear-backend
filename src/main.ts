import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors({
    origin: '*', // Allow all origins
  });
  const logger = new Logger(bootstrap.name);
  const config = app.get(ConfigService);
  const PORT = config.get<number>('PORT', 3000);
  await app.listen(PORT, () => {
    logger.log(`FreshWear is running on port ${PORT}`);
  });
}

bootstrap();
