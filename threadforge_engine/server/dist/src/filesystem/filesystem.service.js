"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesystemService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const CONFIG_DIR = path.resolve(__dirname, '../../config');
const OUTPUTS_DIR = path.resolve(__dirname, '../../outputs');
const MOODBOARD_DIR = path.join(CONFIG_DIR, 'references/moodboard');
const TEST_RENDERS_DIR = path.join(CONFIG_DIR, 'test_renders');
const BRAND_DNA_PATH = path.join(CONFIG_DIR, 'brand_dna.md');
const GUARDRAILS_PATH = path.join(CONFIG_DIR, 'guardrails.json');
const HISTORY_PATH = path.join(OUTPUTS_DIR, 'history.json');
let FilesystemService = class FilesystemService {
    async readMoodboardImages() {
        await fs.ensureDir(MOODBOARD_DIR);
        const files = await fs.readdir(MOODBOARD_DIR);
        const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
        const parts = [];
        for (const file of imageFiles) {
            const filePath = path.join(MOODBOARD_DIR, file);
            const data = await fs.readFile(filePath);
            const ext = path.extname(file).toLowerCase().replace('.', '');
            const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
            parts.push({ inlineData: { data: data.toString('base64'), mimeType } });
        }
        return parts;
    }
    async writeBrandDNA(content) {
        await fs.ensureDir(CONFIG_DIR);
        await fs.writeFile(BRAND_DNA_PATH, content, 'utf-8');
    }
    async readBrandDNA() {
        return fs.readFile(BRAND_DNA_PATH, 'utf-8');
    }
    async writeGuardrails(content) {
        await fs.ensureDir(CONFIG_DIR);
        await fs.writeFile(GUARDRAILS_PATH, content, 'utf-8');
    }
    async readGuardrails() {
        try {
            return await fs.readFile(GUARDRAILS_PATH, 'utf-8');
        }
        catch {
            return '[]';
        }
    }
    async saveTestRenders(imageBuffers) {
        await fs.ensureDir(TEST_RENDERS_DIR);
        const existing = await fs.readdir(TEST_RENDERS_DIR);
        for (const f of existing) {
            await fs.remove(path.join(TEST_RENDERS_DIR, f));
        }
        const savedPaths = [];
        for (let i = 0; i < imageBuffers.length; i++) {
            const outPath = path.join(TEST_RENDERS_DIR, `render_${i + 1}.png`);
            await fs.writeFile(outPath, imageBuffers[i]);
            savedPaths.push(outPath);
        }
        return savedPaths;
    }
    getTestRendersDir() {
        return TEST_RENDERS_DIR;
    }
    getMoodboardCount() {
        return fs
            .readdir(MOODBOARD_DIR)
            .then((files) => files.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f)).length)
            .catch(() => 0);
    }
    async saveOutput(params) {
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
        const entry = {
            id: (0, crypto_1.randomUUID)(),
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
    async appendHistory(entry) {
        await fs.ensureDir(OUTPUTS_DIR);
        let history = [];
        try {
            history = await fs.readJson(HISTORY_PATH);
        }
        catch {
            history = [];
        }
        history.unshift(entry);
        await fs.writeJson(HISTORY_PATH, history, { spaces: 2 });
    }
    async readHistory() {
        try {
            return await fs.readJson(HISTORY_PATH);
        }
        catch {
            return [];
        }
    }
    async getConfig() {
        const [assetTypes, virtualSets] = await Promise.all([
            fs.readJson(path.join(CONFIG_DIR, 'asset_types.json')),
            fs.readJson(path.join(CONFIG_DIR, 'virtual_sets.json')),
        ]);
        return { assetTypes, virtualSets };
    }
};
exports.FilesystemService = FilesystemService;
exports.FilesystemService = FilesystemService = __decorate([
    (0, common_1.Injectable)()
], FilesystemService);
//# sourceMappingURL=filesystem.service.js.map