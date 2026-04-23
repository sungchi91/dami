import { QuestionCollection } from 'inquirer';

export const brandQuestions: QuestionCollection = [
  {
    type: 'input',
    name: 'brandName',
    message: 'What is your brand name?',
    validate: (input: string) => input.trim().length > 0 || 'Brand name is required.',
  },
  {
    type: 'input',
    name: 'targetAudience',
    message: 'Describe your target audience (age, lifestyle, values):',
    default: 'Women 25–45, lifestyle-conscious, appreciate quality craftsmanship',
  },
  {
    type: 'input',
    name: 'brandVibe',
    message: 'Give 3 adjectives that define your brand vibe (e.g. "warm, artisanal, elevated"):',
    validate: (input: string) => input.trim().length > 0 || 'Please enter at least one adjective.',
  },
  {
    type: 'list',
    name: 'colorMood',
    message: 'What is your overall color mood?',
    choices: [
      { name: 'Warm & Golden (creams, tans, terracottas)', value: 'warm' },
      { name: 'Cool & Muted (greys, blues, sage)', value: 'cool' },
      { name: 'Neutral & Minimal (whites, beiges, ivory)', value: 'neutral' },
      { name: 'Earthy & Rich (rust, moss, walnut)', value: 'earthy' },
    ],
  },
  {
    type: 'list',
    name: 'lightingStyle',
    message: 'What lighting style best represents your brand?',
    choices: [
      { name: 'Natural window light (soft, diffused, airy)', value: 'natural window light' },
      { name: 'Golden hour (warm, directional, cinematic)', value: 'golden hour sunlight' },
      { name: 'Soft studio (even, controlled, professional)', value: 'soft studio lighting' },
      { name: 'Moody & dramatic (high contrast, deep shadows)', value: 'dramatic chiaroscuro lighting' },
    ],
  },
  {
    type: 'list',
    name: 'modelArchetype',
    message: 'What kind of human presence do you want in your imagery?',
    choices: [
      { name: 'Aspirational — polished, editorial, fashion-forward', value: 'aspirational editorial model' },
      { name: 'Relatable — real people, candid, approachable', value: 'relatable everyday person' },
      { name: 'Abstract — partial body, hands, no face', value: 'abstract partial body, no face visible' },
      { name: 'No models — product and lifestyle only', value: 'no human models, product-focused' },
    ],
  },
  {
    type: 'list',
    name: 'contentBalance',
    message: 'What is the balance of your visual content?',
    choices: [
      { name: 'Mostly lifestyle (70% context, 30% product)', value: 'lifestyle-heavy, contextual storytelling' },
      { name: 'Balanced (50/50 lifestyle and product)', value: 'balanced lifestyle and product shots' },
      { name: 'Mostly product (70% product, 30% lifestyle)', value: 'product-focused, detail-oriented' },
    ],
  },
  {
    type: 'input',
    name: 'brandAdmiration',
    message: 'Name 1–3 brands whose aesthetics you admire (e.g. "Aritzia, Madewell, Cuyana"):',
    default: 'None specified',
  },
  {
    type: 'input',
    name: 'avoidList',
    message: 'What visual elements do you NEVER want in your imagery?',
    default: 'Over-edited skin, neon colors, cluttered backgrounds, aggressive poses',
  },
  {
    type: 'input',
    name: 'filmStockVibe',
    message: 'Describe the film/camera feel you want (e.g. "35mm film grain, Canon 5D", or leave blank):',
    default: '35mm film, slight grain, natural color grading',
  },
];
