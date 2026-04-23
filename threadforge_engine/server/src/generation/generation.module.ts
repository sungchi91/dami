import { Module } from '@nestjs/common';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { PromptModule } from '../prompt/prompt.module';
import { FilesystemModule } from '../filesystem/filesystem.module';

@Module({
  imports: [PromptModule, FilesystemModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
