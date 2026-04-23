export interface ImagePart {
    inlineData: {
        data: string;
        mimeType: string;
    };
}
export interface HistoryEntry {
    id: string;
    timestamp: string;
    assetTier: string;
    virtualSet: string;
    subject: string;
    textureFidelity: number;
    promptUsed: string;
    filePath: string;
}
export interface SaveOutputParams {
    imageBase64: string;
    mimeType: string;
    assetTier: string;
    subject: string;
    virtualSet: string;
    textureFidelity: number;
    promptUsed: string;
}
export declare class FilesystemService {
    readMoodboardImages(): Promise<ImagePart[]>;
    writeBrandDNA(content: string): Promise<void>;
    readBrandDNA(): Promise<string>;
    writeGuardrails(content: string): Promise<void>;
    readGuardrails(): Promise<string>;
    saveTestRenders(imageBuffers: Buffer[]): Promise<string[]>;
    getTestRendersDir(): string;
    getMoodboardCount(): Promise<number>;
    saveOutput(params: SaveOutputParams): Promise<HistoryEntry>;
    appendHistory(entry: HistoryEntry): Promise<void>;
    readHistory(): Promise<HistoryEntry[]>;
    getConfig(): Promise<{
        assetTypes: any;
        virtualSets: any;
    }>;
}
