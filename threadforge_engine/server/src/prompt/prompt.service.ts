import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';

const CONFIG_DIR = path.resolve(__dirname, '../../config');

const TEXTURE_FIDELITY_KEYWORDS =
  'macro lens, visible fabric weave, photorealistic thread tension, extreme close-up textile detail, individual thread rendering, fabric surface micro-texture';

export interface AssembledPrompt {
  positivePrompt: string;
  negativePrompts: string[];
}

@Injectable()
export class PromptService {
  async assemble(
    subject: string,
    assetTierId: string,
    virtualSetId: string,
    textureFidelity: number,
  ): Promise<AssembledPrompt> {
    const [brandDNA, guardrailsRaw, assetTypes, virtualSets] =
      await Promise.all([
        fs.readFile(path.join(CONFIG_DIR, 'brand_dna.md'), 'utf-8'),
        fs.readFile(path.join(CONFIG_DIR, 'guardrails.json'), 'utf-8'),
        fs.readJson(path.join(CONFIG_DIR, 'asset_types.json')),
        fs.readJson(path.join(CONFIG_DIR, 'virtual_sets.json')),
      ]);

    const guardrails = JSON.parse(guardrailsRaw);
    const assetType = assetTypes.find((t: any) => t.id === assetTierId);
    const virtualSet = virtualSets.find((v: any) => v.id === virtualSetId);

    const parts: string[] = [];

    parts.push('=== BRAND VISUAL DNA ===');
    parts.push(brandDNA.trim());

    if (assetType) {
      parts.push('\n=== ASSET TYPE RULES ===');
      parts.push(assetType.templateRules);
    }

    if (virtualSet) {
      parts.push('\n=== SCENE / VIRTUAL SET ===');
      parts.push(virtualSet.description);
    }

    if (textureFidelity > 0 && assetTierId === 'functional') {
      const weight = textureFidelity / 100;
      const emphasis = weight > 0.6 ? 'extreme emphasis on' : 'emphasis on';
      parts.push(`\n=== TEXTURE FIDELITY (${textureFidelity}%) ===`);
      parts.push(`${emphasis} ${TEXTURE_FIDELITY_KEYWORDS}`);
    }

    parts.push('\n=== SUBJECT ===');
    parts.push(subject);

    parts.push(
      '\nGenerate a photorealistic photograph matching all brand rules above.',
    );

    return {
      positivePrompt: parts.join('\n'),
      negativePrompts: guardrails.negative_prompts || [],
    };
  }
}
