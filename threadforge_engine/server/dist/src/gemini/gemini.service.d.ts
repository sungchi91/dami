import { ImagePart } from '../filesystem/filesystem.service';
export interface DNAResult {
    brandDNA: string;
    guardrails: string;
}
export declare class GeminiService {
    private ai;
    initialize(apiKey: string): void;
    analyzeAndGenerateDNA(answers: Record<string, string>, imageParts: ImagePart[]): Promise<DNAResult>;
    refineBrandDNA(currentDNA: string, currentGuardrails: string, feedback: string): Promise<DNAResult>;
    generateTestImages(moodboardImages: ImagePart[], guardrailsJson: string, brandDNA: string): Promise<Buffer[]>;
    private generateSingleImage;
    private parseDNAResponse;
}
