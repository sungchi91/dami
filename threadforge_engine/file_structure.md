/threadforge_engine
│
├── /server (NestJS)
│   ├── /src
│   │   ├── /cli           # Bootstrap scripts for analyzing moodboards
│   │   ├── /gemini        # Gemini API Service (Generation & Editing)
│   │   ├── /prompt        # Prompt Assembly Engine
│   │   └── /filesystem    # Saving outputs and history.json
│   ├── /config
│   │   ├── /references    # Raw moodboard images go here
│   │   ├── brand_dna.md
│   │   ├── guardrails.json
│   │   ├── asset_types.json
│   │   └── virtual_sets.json
│   └── /outputs           # Final saved images
│       └── history.json   # Log of all approved generations
│
└── /client (React - Vite)
    ├── /src
    │   ├── /components
    │   │   ├── GeneratorForm.tsx    # Selectors and Texture Slider
    │   │   ├── StagingArea.tsx      # The Adjustment Loop UI
    │   │   └── RecipeBook.tsx       # Visual grid of history.json
    │   └── /services