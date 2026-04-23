import { AssembledPrompt } from '../prompt/prompt.service';
export interface ImageResult {
    imageBase64: string;
    mimeType: string;
}
export declare class GenerationService {
    private ai;
    onModuleInit(): void;
    generateImage(assembled: AssembledPrompt, productImageBase64?: string, productImageMimeType?: string): Promise<ImageResult>;
    adjustImage(imageBase64: string, mimeType: string, adjustment: string): Promise<ImageResult>;
    private extractImage;
}
