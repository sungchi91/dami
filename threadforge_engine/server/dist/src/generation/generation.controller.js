"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationController = void 0;
const common_1 = require("@nestjs/common");
const prompt_service_1 = require("../prompt/prompt.service");
const generation_service_1 = require("./generation.service");
const filesystem_service_1 = require("../filesystem/filesystem.service");
let GenerationController = class GenerationController {
    constructor(prompt, generation, filesystem) {
        this.prompt = prompt;
        this.generation = generation;
        this.filesystem = filesystem;
    }
    async getConfig() {
        return this.filesystem.getConfig();
    }
    async getHistory() {
        return this.filesystem.readHistory();
    }
    async generate(body) {
        const { subject, assetTier, virtualSet, textureFidelity, productImageBase64, productImageMimeType } = body;
        if (!subject?.trim()) {
            throw new common_1.HttpException('Subject is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const assembled = await this.prompt.assemble(subject, assetTier, virtualSet, textureFidelity ?? 0);
        const result = await this.generation.generateImage(assembled, productImageBase64, productImageMimeType);
        return {
            imageBase64: result.imageBase64,
            mimeType: result.mimeType,
            promptUsed: assembled.positivePrompt,
        };
    }
    async adjust(body) {
        const { imageBase64, mimeType, adjustment } = body;
        if (!imageBase64 || !adjustment?.trim()) {
            throw new common_1.HttpException('imageBase64 and adjustment are required', common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.generation.adjustImage(imageBase64, mimeType, adjustment);
        return {
            imageBase64: result.imageBase64,
            mimeType: result.mimeType,
        };
    }
    async approve(body) {
        const { imageBase64, mimeType, subject, assetTier, virtualSet, textureFidelity, promptUsed } = body;
        if (!imageBase64) {
            throw new common_1.HttpException('imageBase64 is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const saved = await this.filesystem.saveOutput({
            imageBase64,
            mimeType: mimeType || 'image/png',
            assetTier,
            subject,
            virtualSet,
            textureFidelity,
            promptUsed,
        });
        return saved;
    }
};
exports.GenerationController = GenerationController;
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('adjust'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "adjust", null);
__decorate([
    (0, common_1.Post)('approve'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "approve", null);
exports.GenerationController = GenerationController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [prompt_service_1.PromptService,
        generation_service_1.GenerationService,
        filesystem_service_1.FilesystemService])
], GenerationController);
//# sourceMappingURL=generation.controller.js.map