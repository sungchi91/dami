import { GeminiService } from '../gemini/gemini.service';
import { FilesystemService } from '../filesystem/filesystem.service';
export declare class BootstrapCommand {
    private readonly gemini;
    private readonly fs;
    constructor(gemini: GeminiService, fs: FilesystemService);
    runRendersOnly(): Promise<void>;
    run(): Promise<void>;
    private initializeGemini;
    private runTestRenderLoop;
    private printBanner;
    private printApprovalSummary;
}
