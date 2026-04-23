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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootstrapCommand = void 0;
const common_1 = require("@nestjs/common");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const questionnaire_1 = require("./questionnaire");
const gemini_service_1 = require("../gemini/gemini.service");
const filesystem_service_1 = require("../filesystem/filesystem.service");
let BootstrapCommand = class BootstrapCommand {
    constructor(gemini, fs) {
        this.gemini = gemini;
        this.fs = fs;
    }
    async runRendersOnly() {
        this.printBanner();
        await this.initializeGemini();
        const brandDNA = await this.fs.readBrandDNA();
        const guardrails = await this.fs.readGuardrails();
        if (!brandDNA.trim()) {
            console.error(chalk_1.default.red('✗ config/brand_dna.md is empty. Run `npm run bootstrap` first.'));
            process.exit(1);
        }
        const moodboardImages = await this.fs.readMoodboardImages();
        console.log(chalk_1.default.green(`✓ Loaded brand_dna.md, guardrails.json, and ${moodboardImages.length} moodboard image(s)\n`));
        await this.runTestRenderLoop(brandDNA, guardrails, moodboardImages);
    }
    async run() {
        this.printBanner();
        await this.initializeGemini();
        console.log(chalk_1.default.cyan('━━━ BRAND QUESTIONNAIRE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
        const answers = await inquirer_1.default.prompt(questionnaire_1.brandQuestions);
        const moodboardCount = await this.fs.getMoodboardCount();
        if (moodboardCount === 0) {
            console.log(chalk_1.default.yellow('\n⚠ No images found in config/references/moodboard/. Proceeding with text-only analysis.\n'));
        }
        else {
            console.log(chalk_1.default.green(`\n✓ Found ${moodboardCount} moodboard image(s). Loading...\n`));
        }
        console.log(chalk_1.default.cyan('━━━ CREATIVE DIRECTOR ANALYSIS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
        console.log(chalk_1.default.gray('  Sending moodboard + questionnaire to Gemini...'));
        console.log(chalk_1.default.gray('  This may take 30–60 seconds.\n'));
        const imageParts = await this.fs.readMoodboardImages();
        let { brandDNA, guardrails } = await this.gemini.analyzeAndGenerateDNA(answers, imageParts);
        await this.fs.writeBrandDNA(brandDNA);
        await this.fs.writeGuardrails(guardrails);
        console.log(chalk_1.default.green('✓ brand_dna.md generated'));
        console.log(chalk_1.default.green('✓ guardrails.json generated\n'));
        console.log(chalk_1.default.cyan('━━━ YOUR BRAND DNA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
        console.log(chalk_1.default.white(brandDNA));
        console.log();
        await this.runTestRenderLoop(brandDNA, guardrails, imageParts);
    }
    async initializeGemini() {
        const envKey = process.env.GEMINI_API_KEY;
        if (envKey) {
            this.gemini.initialize(envKey);
            console.log(chalk_1.default.green('✓ Gemini API initialized from .env\n'));
            return;
        }
        const { apiKey } = await inquirer_1.default.prompt([
            {
                type: 'password',
                name: 'apiKey',
                message: 'Enter your Gemini API key:',
                validate: (input) => input.trim().length > 10 || 'Please enter a valid API key.',
            },
        ]);
        this.gemini.initialize(apiKey.trim());
        console.log(chalk_1.default.green('\n✓ Gemini API initialized\n'));
    }
    async runTestRenderLoop(brandDNA, guardrails, moodboardImages) {
        const rendersDir = this.fs.getTestRendersDir();
        while (true) {
            console.log(chalk_1.default.cyan('\n━━━ TEST RENDER GENERATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
            console.log(chalk_1.default.gray('  Generating 3 test images from your moodboard references...\n'));
            const imageBuffers = await this.gemini.generateTestImages(moodboardImages, guardrails, brandDNA);
            if (imageBuffers.length === 0) {
                console.log(chalk_1.default.yellow('⚠ Image generation returned no images. This may be a model availability issue.\n' +
                    '  Your Brand DNA and Guardrails have been saved. You can proceed manually.\n'));
            }
            else {
                const savedPaths = await this.fs.saveTestRenders(imageBuffers);
                console.log(chalk_1.default.green(`✓ ${savedPaths.length} test render(s) saved to:\n`));
                savedPaths.forEach((p) => console.log(chalk_1.default.white(`  → ${p}`)));
                console.log();
                console.log(chalk_1.default.yellow(`  Open the folder to review: ${rendersDir}\n`));
            }
            const { feedback } = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'feedback',
                    message: chalk_1.default.bold('Review the test renders. Type feedback to refine, or type "Approve" to finalize:'),
                },
            ]);
            if (feedback.trim().toLowerCase() === 'approve') {
                this.printApprovalSummary();
                break;
            }
            console.log(chalk_1.default.cyan('\n━━━ REFINING BRAND DNA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
            console.log(chalk_1.default.gray(`  Applying feedback: "${feedback}"\n`));
            const refined = await this.gemini.refineBrandDNA(brandDNA, guardrails, feedback);
            brandDNA = refined.brandDNA;
            guardrails = refined.guardrails;
            await this.fs.writeBrandDNA(brandDNA);
            await this.fs.writeGuardrails(guardrails);
            console.log(chalk_1.default.green('✓ Brand DNA updated based on your feedback\n'));
            console.log(chalk_1.default.white(brandDNA));
        }
    }
    printBanner() {
        console.log();
        console.log(chalk_1.default.bold.white('╔════════════════════════════════════════════════════════════╗'));
        console.log(chalk_1.default.bold.white('║          ') + chalk_1.default.bold.cyan('THREADFORGE') + chalk_1.default.bold.white(' — Visual Production Engine        ║'));
        console.log(chalk_1.default.bold.white('║                  ') + chalk_1.default.gray('Brand DNA Bootstrap') + chalk_1.default.bold.white('                     ║'));
        console.log(chalk_1.default.bold.white('╚════════════════════════════════════════════════════════════╝'));
        console.log();
        console.log(chalk_1.default.gray("  This skill will analyze your moodboard and questionnaire answers"));
        console.log(chalk_1.default.gray("  to generate your brand's Visual DNA and Anti-AI Guardrails.\n"));
    }
    printApprovalSummary() {
        console.log();
        console.log(chalk_1.default.bold.green('╔════════════════════════════════════════════════════════════╗'));
        console.log(chalk_1.default.bold.green('║                  ✓ BRAND DNA APPROVED                      ║'));
        console.log(chalk_1.default.bold.green('╚════════════════════════════════════════════════════════════╝'));
        console.log();
        console.log(chalk_1.default.white('  Your ThreadForge engine is configured. Files written:'));
        console.log(chalk_1.default.cyan('  → server/config/brand_dna.md'));
        console.log(chalk_1.default.cyan('  → server/config/guardrails.json'));
        console.log();
        console.log(chalk_1.default.gray('  These files will be injected into every image generation request.'));
        console.log(chalk_1.default.gray('  Start the server with: npm run start:dev'));
        console.log();
    }
};
exports.BootstrapCommand = BootstrapCommand;
exports.BootstrapCommand = BootstrapCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService,
        filesystem_service_1.FilesystemService])
], BootstrapCommand);
//# sourceMappingURL=bootstrap.command.js.map