import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { AssembledPrompt } from '../prompt/prompt.service';

export interface ImageResult {
  imageBase64: string;
  mimeType: string;
}

@Injectable()
export class GenerationService {
  private ai: GoogleGenAI;

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateImage(
    assembled: AssembledPrompt,
    productImageBase64?: string,
    productImageMimeType?: string,
  ): Promise<ImageResult> {
    const negativeClause =
      assembled.negativePrompts.length > 0
        ? `\n\nDo NOT include: ${assembled.negativePrompts.slice(0, 35).join(', ')}.`
        : '';

    const fullPrompt = assembled.positivePrompt + negativeClause;

    const parts: any[] = [{ text: fullPrompt }];
    if (productImageBase64) {
      parts.push({
        inlineData: { data: productImageBase64, mimeType: productImageMimeType || 'image/jpeg' },
      });
      parts[0] = {
        text: fullPrompt + '\n\nThe attached image shows the actual product to feature. Incorporate it faithfully into the scene.',
      };
    }

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [{ role: 'user', parts }],
      config: { responseModalities: ['IMAGE', 'TEXT'] },
    });

    return this.extractImage(response);
  }

  async adjustImage(
    imageBase64: string,
    mimeType: string,
    adjustment: string,
  ): Promise<ImageResult> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are editing an existing photograph. Apply ONLY this adjustment to the image — preserve everything else exactly as it is:\n\n"${adjustment}"\n\nReturn the edited photograph.`,
            },
            {
              inlineData: { data: imageBase64, mimeType: mimeType || 'image/png' },
            },
          ],
        },
      ],
      config: { responseModalities: ['IMAGE', 'TEXT'] },
    });

    return this.extractImage(response);
  }

  private extractImage(response: any): ImageResult {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        };
      }
    }
    throw new Error('No image returned from Gemini API');
  }
}
