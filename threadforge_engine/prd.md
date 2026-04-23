# Product Requirements Document (PRD): ThreadForge

**Target User:** Personalized Embroidery Business Owner
**Objective:** A stateful, local application (React + NestJS) that systemizes the generation, iteration, and storage of brand-consistent marketing and product imagery using the Gemini API.

## 1. Background & Context
For a personalized embroidery business, visual marketing is everything. Customers need to trust the physical quality of the garments (texture, weave, tension) and feel inspired by the lifestyle imagery (aspiration, mood). Currently, generating AI imagery for these purposes is a fragmented, manual process. It requires constantly uploading moodboards, copy-pasting massive prompt formulas, and fighting the AI's tendency to drift off-brand or generate "too AI-looking" artifacts. 

ThreadForge is being built to transition the business from "playing with an AI image generator" to operating a **Scalable Visual Production Engine**. By wrapping the Gemini API in a stateful, opinionated architecture, ThreadForge will automate brand consistency, eliminate prompt fatigue, and compound brand equity over time.

## 2. Problem Statements
The current manual workflow suffers from four critical pain points:
1. **Context Degradation:** The AI loses the brand's "Visual DNA" unless massive moodboards and reference images are re-attached to every single prompt, which is token-inefficient and tedious.
2. **Workflow Friction:** Adjusting an image requires the user to manually download the output, re-upload it with the original moodboard, and rewrite the prompt. Furthermore, saving and organizing outputs is entirely manual.
3. **Inconsistent Outputs:** Without strict structural boundaries, the AI hallucinates different lighting, environments, and human models, breaking the illusion of a cohesive brand universe.
4. **Lack of Specificity:** Generating specific asset types (e.g., a scroll-stopping Hero ad vs. a functional texture close-up) requires memorizing complex photography terminology. 

## 3. User Stories

### Epic 1: Brand & Quality Enforcement
* **As a Creative Director**, I want the system to silently inject my core brand rules (lighting, mood, film stock) into every generation, so that every output inherently feels like it belongs to my brand universe.
* **As a Brand Guardian**, I want a global negative prompt (Anti-AI Guardrails) applied automatically, so that I never see plastic skin, 3D-rendered textures, or floating threads.

### Epic 2: Content Generation & Mockups
* **As a Marketer**, I want to select "Model Shot" and "Sunlit Studio" from a dropdown, so that I only have to type the subject (e.g., "woman wearing navy crewneck") without remembering complex photography prompts.
* **As a Product Designer**, I want to trigger a "Clean Blank" mode, so that the AI generates unbranded, graphic-free garments that I can digitally overlay my custom embroidery designs onto.
* **As a Craftsman**, I want to increase a "Texture Fidelity" slider for product shots, so that the AI focuses heavily on the macro-details of fabric weave and thread tension.

### Epic 3: Iteration & Curation
* **As a Creator**, I want to type "make the lighting slightly warmer" after generating an image, so that the system automatically uses the previous image as a base and iterates without losing the composition.
* **As a Visual Manager**, I want the system to auto-save my approved images into categorized folders, so that my file system stays organized without manual dragging and dropping.
* **As a Content Planner**, I want to browse a "Recipe Book" of my past successful images and click one to instantly reload its exact settings, so that I can easily recreate a previous aesthetic for a new campaign.

## Core Features & Requirements

### 1. Stateful Architecture & Configuration Setup
* **File-Driven System:** The backend must rely on a local `/config` directory containing `brand_dna.md`, `virtual_sets.json`, `templates.json`, and `guardrails.json`.
* **CLI Bootstrap System:** A NestJS command-line script utilizing Gemini Multimodal capabilities to analyze user reference images and automatically generate the core configuration files.

### 2. Dynamic UI & Control Surface (React Frontend)
* **Tier Selectors:** Dynamic dropdowns for Asset Tier, Format, and Virtual Set.
* **Texture Fidelity Control:** A specific slider/toggle that appears *only* when a "Functional Asset" (like a product shot) is selected, which increases the weight of macro-detail prompts.
* **The Recipe Book (Library):** A visual gallery of previously approved images. Clicking an image automatically populates the Generator Form with the exact parameters used to create that image.

### 3. Prompt Assembly Engine (NestJS Backend)
* The backend constructs the final API payload using strict concatenation: 
    * **Positive Prompt:** `[brand_dna.md] + [Template Rules] + [Virtual Set] + [Texture Fidelity (if applicable)] + [User Subject]`
    * **Negative Prompt:** `[guardrails.json]`

### 4. Iteration & Editing Workflow (The Staging Area)
* Generated images enter a "Staging Area".
* Users can input text adjustments. The system sends the *staged image + adjustment text* back to the API (Image Editing endpoint) for refinement.

### 5. Automated Asset Management
* An "Approve & Save" action saves the final image to a structured local directory (`/outputs/YYYY-MM/asset_tier/`).
* Appends full execution metadata to `history.json` to power the Recipe Book feature.