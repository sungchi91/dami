import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { brandQuestions } from './questionnaire';
import { GeminiService } from '../gemini/gemini.service';
import { FilesystemService } from '../filesystem/filesystem.service';

@Injectable()
export class BootstrapCommand {
  constructor(
    private readonly gemini: GeminiService,
    private readonly fs: FilesystemService,
  ) {}

  async runRendersOnly(): Promise<void> {
    this.printBanner();
    await this.initializeGemini();

    const brandDNA = await this.fs.readBrandDNA();
    const guardrails = await this.fs.readGuardrails();

    if (!brandDNA.trim()) {
      console.error(chalk.red('✗ config/brand_dna.md is empty. Run `npm run bootstrap` first.'));
      process.exit(1);
    }

    const moodboardImages = await this.fs.readMoodboardImages();
    console.log(chalk.green(`✓ Loaded brand_dna.md, guardrails.json, and ${moodboardImages.length} moodboard image(s)\n`));
    await this.runTestRenderLoop(brandDNA, guardrails, moodboardImages);
  }

  async run(): Promise<void> {
    this.printBanner();
    await this.initializeGemini();

    // Step 2: Brand questionnaire
    console.log(chalk.cyan('━━━ BRAND QUESTIONNAIRE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    const answers = await inquirer.prompt(brandQuestions as any);

    // Step 3: Read moodboard images
    const moodboardCount = await this.fs.getMoodboardCount();
    if (moodboardCount === 0) {
      console.log(
        chalk.yellow(
          '\n⚠ No images found in config/references/moodboard/. Proceeding with text-only analysis.\n',
        ),
      );
    } else {
      console.log(
        chalk.green(`\n✓ Found ${moodboardCount} moodboard image(s). Loading...\n`),
      );
    }

    console.log(chalk.cyan('━━━ CREATIVE DIRECTOR ANALYSIS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    console.log(chalk.gray('  Sending moodboard + questionnaire to Gemini...'));
    console.log(chalk.gray('  This may take 30–60 seconds.\n'));

    const imageParts = await this.fs.readMoodboardImages();

    // Step 4: Analyze and generate DNA
    let { brandDNA, guardrails } = await this.gemini.analyzeAndGenerateDNA(
      answers,
      imageParts,
    );

    // Step 5: Write files
    await this.fs.writeBrandDNA(brandDNA);
    await this.fs.writeGuardrails(guardrails);

    console.log(chalk.green('✓ brand_dna.md generated'));
    console.log(chalk.green('✓ guardrails.json generated\n'));
    console.log(chalk.cyan('━━━ YOUR BRAND DNA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    console.log(chalk.white(brandDNA));
    console.log();

    // Step 6: Test render loop
    await this.runTestRenderLoop(brandDNA, guardrails, imageParts);
  }

  private async initializeGemini(): Promise<void> {
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey) {
      this.gemini.initialize(envKey);
      console.log(chalk.green('✓ Gemini API initialized from .env\n'));
      return;
    }
    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your Gemini API key:',
        validate: (input: string) => input.trim().length > 10 || 'Please enter a valid API key.',
      },
    ]);
    this.gemini.initialize(apiKey.trim());
    console.log(chalk.green('\n✓ Gemini API initialized\n'));
  }

  private async runTestRenderLoop(
    brandDNA: string,
    guardrails: string,
    moodboardImages: import('../filesystem/filesystem.service').ImagePart[],
  ): Promise<void> {
    const rendersDir = this.fs.getTestRendersDir();

    while (true) {
      console.log(chalk.cyan('\n━━━ TEST RENDER GENERATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
      console.log(chalk.gray('  Generating 3 test images from your moodboard references...\n'));

      const imageBuffers = await this.gemini.generateTestImages(moodboardImages, guardrails, brandDNA);

      if (imageBuffers.length === 0) {
        console.log(
          chalk.yellow(
            '⚠ Image generation returned no images. This may be a model availability issue.\n' +
            '  Your Brand DNA and Guardrails have been saved. You can proceed manually.\n',
          ),
        );
      } else {
        const savedPaths = await this.fs.saveTestRenders(imageBuffers);
        console.log(chalk.green(`✓ ${savedPaths.length} test render(s) saved to:\n`));
        savedPaths.forEach((p) => console.log(chalk.white(`  → ${p}`)));
        console.log();
        console.log(
          chalk.yellow(`  Open the folder to review: ${rendersDir}\n`),
        );
      }

      // Step 7: Feedback prompt
      const { feedback } = await inquirer.prompt([
        {
          type: 'input',
          name: 'feedback',
          message: chalk.bold(
            'Review the test renders. Type feedback to refine, or type "Approve" to finalize:',
          ),
        },
      ]);

      if (feedback.trim().toLowerCase() === 'approve') {
        this.printApprovalSummary();
        break;
      }

      // Refine DNA based on feedback
      console.log(chalk.cyan('\n━━━ REFINING BRAND DNA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
      console.log(chalk.gray(`  Applying feedback: "${feedback}"\n`));

      const refined = await this.gemini.refineBrandDNA(brandDNA, guardrails, feedback);
      brandDNA = refined.brandDNA;
      guardrails = refined.guardrails;

      await this.fs.writeBrandDNA(brandDNA);
      await this.fs.writeGuardrails(guardrails);

      console.log(chalk.green('✓ Brand DNA updated based on your feedback\n'));
      console.log(chalk.white(brandDNA));
    }
  }

  private printBanner(): void {
    console.log();
    console.log(chalk.bold.white('╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.white('║          ') + chalk.bold.cyan('THREADFORGE') + chalk.bold.white(' — Visual Production Engine        ║'));
    console.log(chalk.bold.white('║                  ') + chalk.gray('Brand DNA Bootstrap') + chalk.bold.white('                     ║'));
    console.log(chalk.bold.white('╚════════════════════════════════════════════════════════════╝'));
    console.log();
    console.log(chalk.gray("  This skill will analyze your moodboard and questionnaire answers"));
    console.log(chalk.gray("  to generate your brand's Visual DNA and Anti-AI Guardrails.\n"));
  }

  private printApprovalSummary(): void {
    console.log();
    console.log(chalk.bold.green('╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.green('║                  ✓ BRAND DNA APPROVED                      ║'));
    console.log(chalk.bold.green('╚════════════════════════════════════════════════════════════╝'));
    console.log();
    console.log(chalk.white('  Your ThreadForge engine is configured. Files written:'));
    console.log(chalk.cyan('  → server/config/brand_dna.md'));
    console.log(chalk.cyan('  → server/config/guardrails.json'));
    console.log();
    console.log(chalk.gray('  These files will be injected into every image generation request.'));
    console.log(chalk.gray('  Start the server with: npm run start:dev'));
    console.log();
  }
}
