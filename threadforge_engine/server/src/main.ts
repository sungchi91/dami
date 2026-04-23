import 'reflect-metadata';
import * as path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(require('express').json({ limit: '20mb' }));
  app.enableCors({ origin: 'http://localhost:5173' });
  app.useStaticAssets(path.resolve(__dirname, '../../outputs'), {
    prefix: '/static/outputs',
  });
  await app.listen(3001);
  console.log('ThreadForge server running on http://localhost:3001');
}

bootstrap();
