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
exports.PromptService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const CONFIG_DIR = path.resolve(__dirname, '../../config');
const TEXTURE_FIDELITY_KEYWORDS = 'macro lens, visible fabric weave, photorealistic thread tension, extreme close-up textile detail, individual thread rendering, fabric surface micro-texture';
let PromptService = class PromptService {
    async assemble(subject, assetTierId, virtualSetId, textureFidelity) {
        const [brandDNA, guardrailsRaw, assetTypes, virtualSets] = await Promise.all([
            fs.readFile(path.join(CONFIG_DIR, 'brand_dna.md'), 'utf-8'),
            fs.readFile(path.join(CONFIG_DIR, 'guardrails.json'), 'utf-8'),
            fs.readJson(path.join(CONFIG_DIR, 'asset_types.json')),
            fs.readJson(path.join(CONFIG_DIR, 'virtual_sets.json')),
        ]);
        const guardrails = JSON.parse(guardrailsRaw);
        const assetType = assetTypes.find((t) => t.id === assetTierId);
        const virtualSet = virtualSets.find((v) => v.id === virtualSetId);
        const parts = [];
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
        parts.push('\nGenerate a photorealistic photograph matching all brand rules above.');
        return {
            positivePrompt: parts.join('\n'),
            negativePrompts: guardrails.negative_prompts || [],
        };
    }
};
exports.PromptService = PromptService;
exports.PromptService = PromptService = __decorate([
    (0, common_1.Injectable)()
], PromptService);
//# sourceMappingURL=prompt.service.js.map