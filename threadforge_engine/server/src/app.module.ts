import { Module } from '@nestjs/common';
import { FilesystemModule } from './filesystem/filesystem.module';
import { GeminiModule } from './gemini/gemini.module';
import { GenerationModule } from './generation/generation.module';
import { BootstrapCommand } from './cli/bootstrap.command';

@Module({
  imports: [FilesystemModule, GeminiModule, GenerationModule],
  providers: [BootstrapCommand],
})
export class AppModule {}
