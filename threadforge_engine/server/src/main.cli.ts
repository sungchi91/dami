import 'reflect-metadata';
import * as path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BootstrapCommand } from './cli/bootstrap.command';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false, // suppress NestJS boot logs for clean CLI experience
  });

  const command = app.get(BootstrapCommand);

  try {
    await command.run();
  } catch (err: any) {
    console.error('\n[ThreadForge Error]', err.message);
    if (err.status === 429) {
      console.error('  → Rate limited. Wait a moment and try again.');
    } else if (err.status === 401) {
      console.error('  → Invalid API key. Please check your Gemini API key.');
    }
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
