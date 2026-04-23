"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const genai_1 = require("@google/genai");
async function main() {
    const apiKey = process.argv[2] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Usage: npm run list-models -- YOUR_API_KEY');
        process.exit(1);
    }
    const ai = new genai_1.GoogleGenAI({ apiKey });
    console.log('\nFetching available models...\n');
    try {
        const pager = await ai.models.list();
        const imageCapable = [];
        const all = [];
        for await (const model of pager) {
            all.push(model.name);
            const methods = model.supportedGenerationMethods || [];
            if (model.name?.toLowerCase().includes('image') ||
                model.name?.toLowerCase().includes('imagen') ||
                model.name?.toLowerCase().includes('flash-exp') ||
                methods.some((m) => m.includes('image'))) {
                imageCapable.push(`${model.name}  →  [${methods.join(', ')}]`);
            }
        }
        console.log(`Total models: ${all.length}\n`);
        if (imageCapable.length > 0) {
            console.log('── Image-capable models ─────────────────────────');
            imageCapable.forEach((m) => console.log(' ', m));
        }
        else {
            console.log('No image-specific models found. All models:');
            all.forEach((m) => console.log(' ', m));
        }
    }
    catch (err) {
        console.error('Error:', err.message);
    }
}
main();
//# sourceMappingURL=list-models.js.map