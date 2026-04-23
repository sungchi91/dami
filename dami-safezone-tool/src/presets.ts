export const PRESETS = [
  { name: "The Grand Market Tote",   bgImage: '/images/products/l_tote/l_navy.png',       bgColor: '#F0EBE0', widthRatio: 0.78, heightRatio: 0.33, offsetX: -0.02, offsetY:  0.10, physicalWidthInches: 25   },
  { name: "The Signature Day Tote",  bgImage: '/images/products/m_tote/m-navy.png',       bgColor: '#F0EBE0', widthRatio: 0.62, heightRatio: 0.30, offsetX: -0.01, offsetY:  0.12, physicalWidthInches: 18   },
  { name: "The Petit Café Tote",     bgImage: '/images/products/s_tote/s_navy.png',       bgColor: '#F0EBE0', widthRatio: 0.58, heightRatio: 0.35, offsetX:  0.00, offsetY:  0.11, physicalWidthInches: 13   },
  { name: "The Promenade Crossbody", bgImage: '/images/products/s_crossbody/Screen Shot 2026-04-18 at 1.00.08 AM.png', bgColor: '#EDE9E3', widthRatio: 0.73, heightRatio: 0.33, offsetX: 0.00, offsetY: 0.10, physicalWidthInches: 13   },
  { name: "The Souvenir Charm",      bgImage: null,                                       bgColor: '#F5F2EE', widthRatio: 0.40, heightRatio: 0.40, offsetX:  0,    offsetY:  0,    physicalWidthInches:  1.25 },
  { name: "The Companion Pouch",     bgImage: '/images/products/pouch/pouch_navy.png',    bgColor: '#EAE4DA', widthRatio: 0.60, heightRatio: 0.26, offsetX:  0.04, offsetY:  0.13, physicalWidthInches: 11   },
  { name: "The Atelier Apron",       bgImage: null,                                       bgColor: '#EDE9E3', widthRatio: 0.52, heightRatio: 0.38, offsetX:  0,    offsetY: -0.08, physicalWidthInches:  5   },
  { name: "The Apéritif Napkins",    bgImage: null,                                       bgColor: '#F5F2EE', widthRatio: 0.42, heightRatio: 0.42, offsetX:  0.16, offsetY:  0.16, physicalWidthInches:  5   },
  { name: "The Heirloom Tea Towels", bgImage: null,                                       bgColor: '#EDE9E3', widthRatio: 0.72, heightRatio: 0.28, offsetX:  0,    offsetY:  0.06, physicalWidthInches: 14   },
]

export type Preset = typeof PRESETS[number]
