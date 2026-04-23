import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { randomUUID } from 'crypto';

const CONFIG_DIR = path.resolve(__dirname, '../../config');
const OUTPUTS_DIR = path.resolve(__dirname, '../../outputs');
const MOODBOARD_DIR = path.join(CONFIG_DIR, 'references/moodboard');
const TEST_RENDERS_DIR = path.join(CONFIG_DIR, 'test_renders');
const BRAND_DNA_PATH = path.join(CONFIG_DIR, 'brand_dna.md');
const GUARDRAILS_PATH = path.join(CONFIG_DIR, 'guardrails.json');
const HISTORY_PATH = path.join(OUTPUTS_DIR, 'history.json');

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

@Injectable()
export class FilesystemService {
  // ── Moodboard ──────────────────────────────────────────────────────────────

  async readMoodboardImages(): Promise<ImagePart[]> {
    await fs.ensureDir(MOODBOARD_DIR);
    const files = await fs.readdir(MOODBOARD_DIR);
    const imageFiles = files.filter((f) =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(f),
    );
    const parts: ImagePart[] = [];
    for (const file of imageFiles) {
      const filePath = path.join(MOODBOARD_DIR, file);
      const data = await fs.readFile(filePath);
      const ext = path.extname(file).toLowerCase().replace('.', '');
      const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      parts.push({ inlineData: { data: data.toString('base64'), mimeType } });
    }
    return parts;
  }

  // ── Brand DNA & Guardrails ─────────────────────────────────────────────────

  async writeBrandDNA(content: string): Promise<void> {
    await fs.ensureDir(CONFIG_DIR);
    await fs.writeFile(BRAND_DNA_PATH, content, 'utf-8');
  }

  async readBrandDNA(): Promise<string> {
    return fs.readFile(BRAND_DNA_PATH, 'utf-8');
  }

  async writeGuardrails(content: string): Promise<void> {
    await fs.ensureDir(CONFIG_DIR);
    await fs.writeFile(GUARDRAILS_PATH, content, 'utf-8');
  }

  async readGuardrails(): Promise<string> {
    try {
      return await fs.readFile(GUARDRAILS_PATH, 'utf-8');
    } catch {
      return '[]';
    }
  }

  // ── Test Renders ───────────────────────────────────────────────────────────

  async saveTestRenders(imageBuffers: Buffer[]): Promise<string[]> {
    await fs.ensureDir(TEST_RENDERS_DIR);
    const existing = await fs.readdir(TEST_RENDERS_DIR);
    for (const f of existing) {
      await fs.remove(path.join(TEST_RENDERS_DIR, f));
    }
    const savedPaths: string[] = [];
    for (let i = 0; i < imageBuffers.length; i++) {
      const outPath = path.join(TEST_RENDERS_DIR, `render_${i + 1}.png`);
      await fs.writeFile(outPath, imageBuffers[i]);
      savedPaths.push(outPath);
    }
    return savedPaths;
  }

  getTestRendersDir(): string {
    return TEST_RENDERS_DIR;
  }

  getMoodboardCount(): Promise<number> {
    return fs
      .readdir(MOODBOARD_DIR)
      .then(
        (files) =>
          files.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f)).length,
      )
      .catch(() => 0);
  }

  // ── Outputs & History ──────────────────────────────────────────────────────

  async saveOutput(params: SaveOutputParams): Promise<HistoryEntry> {
    const { imageBase64, mimeType, assetTier, subject, virtualSet, textureFidelity, promptUsed } = params;

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const tierFolder = (assetTier || 'general').toLowerCase();
    const dir = path.join(OUTPUTS_DIR, yearMonth, tierFolder);
    await fs.ensureDir(dir);

    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const filename = `image-${Date.now()}.${ext}`;
    const fullPath = path.join(dir, filename);
    const relativePath = path.relative(OUTPUTS_DIR, fullPath);

    const buffer = Buffer.from(imageBase64, 'base64');
    await fs.writeFile(fullPath, buffer);

    const entry: HistoryEntry = {
      id: randomUUID(),
      timestamp: now.toISOString(),
      assetTier: assetTier || '',
      virtualSet: virtualSet || '',
      subject: subject || '',
      textureFidelity: textureFidelity ?? 0,
      promptUsed: promptUsed || '',
      filePath: relativePath,
    };

    await this.appendHistory(entry);
    return entry;
  }

  async appendHistory(entry: HistoryEntry): Promise<void> {
    await fs.ensureDir(OUTPUTS_DIR);
    let history: HistoryEntry[] = [];
    try {
      history = await fs.readJson(HISTORY_PATH);
    } catch {
      history = [];
    }
    history.unshift(entry);
    await fs.writeJson(HISTORY_PATH, history, { spaces: 2 });
  }

  async readHistory(): Promise<HistoryEntry[]> {
    try {
      return await fs.readJson(HISTORY_PATH);
    } catch {
      return [];
    }
  }

  // ── Config for frontend dropdowns ─────────────────────────────────────────

  async getConfig() {
    const [assetTypes, virtualSets] = await Promise.all([
      fs.readJson(path.join(CONFIG_DIR, 'asset_types.json')),
      fs.readJson(path.join(CONFIG_DIR, 'virtual_sets.json')),
    ]);
    return { assetTypes, virtualSets };
  }
}
