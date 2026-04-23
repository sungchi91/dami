import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ImagePart } from '../filesystem/filesystem.service';

export interface DNAResult {
  brandDNA: string;
  guardrails: string;
}

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;

  initialize(apiKey: string): void {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeAndGenerateDNA(
    answers: Record<string, string>,
    imageParts: ImagePart[],
  ): Promise<DNAResult> {
    const answersText = Object.entries(answers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const systemPrompt = `You are an elite Creative Director with 20 years of experience in fashion, lifestyle, and product photography. You have been hired to define the complete visual identity for a personalized embroidery brand.

You will receive:
1. Brand questionnaire answers from the business owner
2. Moodboard reference images they have curated

Your task is to analyze all inputs and produce TWO artifacts with EXACT formatting:

---BRAND_DNA_START---
# [Brand Name] — Visual DNA

## Core Identity
[2-3 sentence brand essence statement]

## Lighting & Atmosphere
- [Specific lighting rule 1]
- [Specific lighting rule 2]
- [Specific lighting rule 3]

## Color Grading & Film Aesthetic
- [Film stock / color grade rule]
- [Saturation and tone rules]
- [Shadow and highlight treatment]

## Camera & Composition
- [Focal length preference]
- [Shooting angle rules]
- [Depth of field rules]
- [Framing guidelines]

## Texture & Surface Details
- [Fabric texture rendering rules]
- [Background surface rules]
- [Material authenticity rules]

## Human Element
- [Model direction rules]
- [Skin treatment rules]
- [Wardrobe styling rules]

## Brand Atmosphere Keywords
[10-15 comma-separated keywords for consistent mood injection]
---BRAND_DNA_END---

---GUARDRAILS_START---
{
  "negative_prompts": [
    "3D render",
    "CGI",
    "plastic skin",
    "overly smooth skin",
    "airbrushed",
    "floating threads",
    "unnatural fabric drape",
    "neon colors",
    "oversaturated",
    "HDR effect",
    "lens flare overuse",
    "stock photo feel",
    "generic background",
    "corporate headshot",
    "harsh shadows",
    "blown out highlights",
    "motion blur",
    "chromatic aberration",
    "digital artifacts",
    "watermark",
    "text overlay",
    "logo visible",
    "busy background",
    "cluttered scene"
  ]
}
---GUARDRAILS_END---

Add any brand-specific negative prompts based on the questionnaire answers. Output ONLY the two artifacts with their delimiters. No commentary.`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt}\n\n## QUESTIONNAIRE ANSWERS:\n${answersText}\n\n## MOODBOARD IMAGES (${imageParts.length} reference images attached):`,
          },
          ...imageParts,
        ],
      },
    ];

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents,
    });

    const responseText = result.text;
    return this.parseDNAResponse(responseText);
  }

  async refineBrandDNA(
    currentDNA: string,
    currentGuardrails: string,
    feedback: string,
  ): Promise<DNAResult> {
    const prompt = `You are a Creative Director refining a brand's visual identity based on test render feedback.

Current Brand DNA:
${currentDNA}

Current Guardrails:
${currentGuardrails}

User feedback on the test renders:
"${feedback}"

Update the Brand DNA and Guardrails to address this feedback. Output the complete updated versions using the EXACT same format:

---BRAND_DNA_START---
[updated brand_dna.md content]
---BRAND_DNA_END---

---GUARDRAILS_START---
[updated guardrails.json content]
---GUARDRAILS_END---`;

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return this.parseDNAResponse(result.text);
  }

  async generateTestImages(
    moodboardImages: ImagePart[],
    guardrailsJson: string,
    brandDNA: string,
  ): Promise<Buffer[]> {
    let negativeTerms: string[] = [];
    try {
      const parsed = JSON.parse(guardrailsJson);
      negativeTerms = parsed.negative_prompts || [];
    } catch {
      negativeTerms = [];
    }
    const negativeString = negativeTerms.slice(0, 30).join(', ');
    const avoidClause = negativeString ? `\n\nDo NOT include: ${negativeString}.` : '';

    const referenceClause = moodboardImages.length > 0
      ? 'Study the attached reference images carefully. Match their exact lighting, color palette, mood, and compositional style.'
      : '';

    const styleContext = `${referenceClause}\n\nBrand visual rules to follow strictly:\n${brandDNA}`;

    const testSubjects = [
      'A candid lifestyle photograph at a Sonoma winery outdoor table. The scene is the subject: dappled afternoon light, two large-bowled wine glasses half-full of sauvignon blanc, artisan bread on a white plate, a small pot of pink flowers on aged stone tile or grass. A cream canvas tote bag with navy straps is casually draped over an empty chair slightly behind — out of focus, incidental, just part of someone\'s afternoon. The bag is not the hero. Shoot as if you stumbled upon this table, not as if you staged it.',
      'A candid lifestyle photograph. The focus is a person mid-stride on a gravel path or garden grass. They are carrying a cream canvas tote with navy straps loosely on one arm — the bag is natural and forgotten, not posed. Loose pink tulips or scabiosa stems are visible spilling from the top. Shot from a slight distance so the full scene reads: person, path, garden light. The bag is secondary. Not a product shot.',
      'A quiet close-up still life on a white marble counter beside a window: a large sculptural clear glass vase filled with tall loose stems of pink scabiosa. Soft morning light. A folded linen napkin to the side. Garden greenery softly visible through the glass behind. Pure scene — no product.',
    ];

    const buffers: Buffer[] = [];

    for (const subject of testSubjects) {
      const buffer = await this.generateSingleImage(styleContext, subject, moodboardImages, avoidClause);
      if (buffer) buffers.push(buffer);
    }

    return buffers;
  }

  private async generateSingleImage(
    styleContext: string,
    subject: string,
    moodboardImages: ImagePart[],
    avoidClause: string,
  ): Promise<Buffer | null> {
    try {
      const textPrompt = `${styleContext}\n\nGenerate a photorealistic photograph of the following:\n${subject}${avoidClause}`;

      const parts: any[] = [{ text: textPrompt }, ...moodboardImages];

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: [{ role: 'user', parts }],
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) return Buffer.from(part.inlineData.data, 'base64');
      }
    } catch (err) {
      console.error(`  Warning: failed to generate test image — ${(err as Error).message}`);
    }
    return null;
  }

  private parseDNAResponse(responseText: string): DNAResult {
    const dnaMatch = responseText.match(
      /---BRAND_DNA_START---([\s\S]*?)---BRAND_DNA_END---/,
    );
    const guardrailsMatch = responseText.match(
      /---GUARDRAILS_START---([\s\S]*?)---GUARDRAILS_END---/,
    );

    if (!dnaMatch || !guardrailsMatch) {
      const mdMatch = responseText.match(/(#[\s\S]+?)(?=\{|\n---)/);
      const jsonMatch = responseText.match(/(\{[\s\S]*"negative_prompts"[\s\S]*\})/);
      return {
        brandDNA: mdMatch ? mdMatch[1].trim() : responseText,
        guardrails: jsonMatch ? jsonMatch[1].trim() : '{"negative_prompts":[]}',
      };
    }

    return {
      brandDNA: dnaMatch[1].trim(),
      guardrails: guardrailsMatch[1].trim(),
    };
  }
}
