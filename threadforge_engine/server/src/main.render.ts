import 'reflect-metadata';
import * as path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BootstrapCommand } from './cli/bootstrap.command';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const command = app.get(BootstrapCommand);

  try {
    await command.runRendersOnly();
  } catch (err: any) {
    console.error('\n[ThreadForge Error]', err.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
