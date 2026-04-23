import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PromptService } from '../prompt/prompt.service';
import { GenerationService } from './generation.service';
import { FilesystemService } from '../filesystem/filesystem.service';

@Controller('api')
export class GenerationController {
  constructor(
    private readonly prompt: PromptService,
    private readonly generation: GenerationService,
    private readonly filesystem: FilesystemService,
  ) {}

  @Get('config')
  async getConfig() {
    return this.filesystem.getConfig();
  }

  @Get('history')
  async getHistory() {
    return this.filesystem.readHistory();
  }

  @Post('generate')
  async generate(
    @Body()
    body: {
      subject: string;
      assetTier: string;
      virtualSet: string;
      textureFidelity: number;
      productImageBase64?: string;
      productImageMimeType?: string;
    },
  ) {
    const { subject, assetTier, virtualSet, textureFidelity, productImageBase64, productImageMimeType } = body;
    if (!subject?.trim()) {
      throw new HttpException('Subject is required', HttpStatus.BAD_REQUEST);
    }

    const assembled = await this.prompt.assemble(
      subject,
      assetTier,
      virtualSet,
      textureFidelity ?? 0,
    );

    const result = await this.generation.generateImage(assembled, productImageBase64, productImageMimeType);
    return {
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
      promptUsed: assembled.positivePrompt,
    };
  }

  @Post('adjust')
  async adjust(
    @Body()
    body: {
      imageBase64: string;
      mimeType: string;
      adjustment: string;
    },
  ) {
    const { imageBase64, mimeType, adjustment } = body;
    if (!imageBase64 || !adjustment?.trim()) {
      throw new HttpException(
        'imageBase64 and adjustment are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.generation.adjustImage(
      imageBase64,
      mimeType,
      adjustment,
    );
    return {
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
    };
  }

  @Post('approve')
  async approve(
    @Body()
    body: {
      imageBase64: string;
      mimeType: string;
      subject: string;
      assetTier: string;
      virtualSet: string;
      textureFidelity: number;
      promptUsed: string;
    },
  ) {
    const { imageBase64, mimeType, subject, assetTier, virtualSet, textureFidelity, promptUsed } = body;
    if (!imageBase64) {
      throw new HttpException('imageBase64 is required', HttpStatus.BAD_REQUEST);
    }

    const saved = await this.filesystem.saveOutput({
      imageBase64,
      mimeType: mimeType || 'image/png',
      assetTier,
      subject,
      virtualSet,
      textureFidelity,
      promptUsed,
    });

    return saved;
  }
}
