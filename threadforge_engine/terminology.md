# ThreadForge: Visual Production Terminology

This document standardizes the internal language for the ThreadForge engine to ensure consistent system architecture and UI state management.

## Asset Tiers (Classification)
Instead of generic "image types," outputs are categorized by their business mission:
* **Hero Assets:** High-fidelity, scroll-stopping visuals (Marketing Graphics, Campaign Covers). Mission: Aspiration & Attention.
* **Contextual Assets:** Lifestyle shots, model shots, in-use scenarios. Mission: Believability & Trust.
* **Functional Assets:** Product shots, flat lays, close-up texture shots, logos, icons. Mission: Clarity & Detail.

## Core System Components
* **Virtual Sets:** Pre-defined environmental contexts stored as JSON (e.g., "Sunlit Oak Studio Table", "Moody Velvet Display").
* **Semantic Style Matrix (Brand DNA):** A rigid text framework (`brand_dna.md`) injected into every positive prompt. It dictates global lighting, camera settings, and overall brand mood.
* **Anti-AI Guardrails (The Global Negative):** A strict list of forbidden visual artifacts (`guardrails.json`) appended to every request as a negative prompt to prevent the "AI look" (e.g., "plastic skin, floating threads, 3D render, over-saturated").

## Workflow Mechanisms
* **The Adjustment Loop:** Utilizing the Gemini API's image+text-to-image capabilities. It takes the immediate previous output in the "Staging Area" and applies delta changes via text (e.g., "shift lighting 10% warmer") without losing the base composition.
* **Texture Fidelity Weights:** A dynamic modifier applied specifically to Functional Assets. It injects macro-photography terminology (e.g., "macro lens, visible fabric weave, photorealistic thread tension") to force the model to focus on physical textile properties.
* **The Recipe Book:** A UI library that visualizes historical outputs (`history.json`). Clicking an historical image automatically rehydrates the UI state (Virtual Set, DNA, base prompt, and settings) used to create it, allowing for instant, consistent recreation with new subjects.