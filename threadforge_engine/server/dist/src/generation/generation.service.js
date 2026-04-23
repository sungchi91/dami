"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationService = void 0;
const common_1 = require("@nestjs/common");
const genai_1 = require("@google/genai");
let GenerationService = class GenerationService {
    onModuleInit() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            throw new Error('GEMINI_API_KEY is not set');
        this.ai = new genai_1.GoogleGenAI({ apiKey });
    }
    async generateImage(assembled, productImageBase64, productImageMimeType) {
        const negativeClause = assembled.negativePrompts.length > 0
            ? `\n\nDo NOT include: ${assembled.negativePrompts.slice(0, 35).join(', ')}.`
            : '';
        const fullPrompt = assembled.positivePrompt + negativeClause;
        const parts = [{ text: fullPrompt }];
        if (productImageBase64) {
            parts.push({
                inlineData: { data: productImageBase64, mimeType: productImageMimeType || 'image/jpeg' },
            });
            parts[0] = {
                text: fullPrompt + '\n\nThe attached image shows the actual product to feature. Incorporate it faithfully into the scene.',
            };
        }
        const response = await this.ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: [{ role: 'user', parts }],
            config: { responseModalities: ['IMAGE', 'TEXT'] },
        });
        return this.extractImage(response);
    }
    async adjustImage(imageBase64, mimeType, adjustment) {
        const response = await this.ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `You are editing an existing photograph. Apply ONLY this adjustment to the image — preserve everything else exactly as it is:\n\n"${adjustment}"\n\nReturn the edited photograph.`,
                        },
                        {
                            inlineData: { data: imageBase64, mimeType: mimeType || 'image/png' },
                        },
                    ],
                },
            ],
            config: { responseModalities: ['IMAGE', 'TEXT'] },
        });
        return this.extractImage(response);
    }
    extractImage(response) {
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.data) {
                return {
                    imageBase64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'image/png',
                };
            }
        }
        throw new Error('No image returned from Gemini API');
    }
};
exports.GenerationService = GenerationService;
exports.GenerationService = GenerationService = __decorate([
    (0, common_1.Injectable)()
], GenerationService);
//# sourceMappingURL=generation.service.js.map