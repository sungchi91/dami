import { PromptService } from '../prompt/prompt.service';
import { GenerationService } from './generation.service';
import { FilesystemService } from '../filesystem/filesystem.service';
export declare class GenerationController {
    private readonly prompt;
    private readonly generation;
    private readonly filesystem;
    constructor(prompt: PromptService, generation: GenerationService, filesystem: FilesystemService);
    getConfig(): Promise<{
        assetTypes: any;
        virtualSets: any;
    }>;
    getHistory(): Promise<import("../filesystem/filesystem.service").HistoryEntry[]>;
    generate(body: {
        subject: string;
        assetTier: string;
        virtualSet: string;
        textureFidelity: number;
        productImageBase64?: string;
        productImageMimeType?: string;
    }): Promise<{
        imageBase64: string;
        mimeType: string;
        promptUsed: string;
    }>;
    adjust(body: {
        imageBase64: string;
        mimeType: string;
        adjustment: string;
    }): Promise<{
        imageBase64: string;
        mimeType: string;
    }>;
    approve(body: {
        imageBase64: string;
        mimeType: string;
        subject: string;
        assetTier: string;
        virtualSet: string;
        textureFidelity: number;
        promptUsed: string;
    }): Promise<import("../filesystem/filesystem.service").HistoryEntry>;
}
