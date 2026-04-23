export interface AssembledPrompt {
    positivePrompt: string;
    negativePrompts: string[];
}
export declare class PromptService {
    assemble(subject: string, assetTierId: string, virtualSetId: string, textureFidelity: number): Promise<AssembledPrompt>;
}
