export const PRESETS = [
  { name: "Grand Tote",            bgImage: '/images/products/l_tote/l_navy.jpg',                                      bgColor: '#F0EBE0', widthRatio: 0.80, heightRatio: 0.33, offsetX: -0.02, offsetY:  0.09, physicalWidthInches: 25    },
  { name: "Signature Tote",        bgImage: '/images/products/m_tote/m_navy.jpg',                                      bgColor: '#F0EBE0', widthRatio: 0.71, heightRatio: 0.34, offsetX: -0.01, offsetY:  0.12, physicalWidthInches: 18    },
  { name: "Petite Tote",           bgImage: '/images/products/s_tote/s_navy.png',                                      bgColor: '#F0EBE0', widthRatio: 0.62, heightRatio: 0.37, offsetX: -0.01, offsetY:  0.10, physicalWidthInches: 13.5  },
  { name: "Petite Crossbody",      bgImage: '/images/products/s_crossbody/Screen Shot 2026-04-18 at 1.00.08 AM.png',   bgColor: '#EDE9E3', widthRatio: 0.73, heightRatio: 0.33, offsetX:  0.00, offsetY:  0.10, physicalWidthInches: 13    },
  { name: "Waffle Pouch",          bgImage: '/images/products/pouch/pouch_navy.png',                                   bgColor: '#EAE4DA', widthRatio: 0.60, heightRatio: 0.26, offsetX:  0.04, offsetY:  0.13, physicalWidthInches: 11    },
  { name: "Grand Waffle Pouch",    bgImage: null,                                                                       bgColor: '#EAE4DA', widthRatio: 0.60, heightRatio: 0.26, offsetX:  0.04, offsetY:  0.13, physicalWidthInches: 13    },
  { name: "Seersucker Pouch",      bgImage: null,                                                                       bgColor: '#EAE4DA', widthRatio: 0.60, heightRatio: 0.26, offsetX:  0.04, offsetY:  0.13, physicalWidthInches: 11    },
  { name: "Linen Cocktail Napkin", bgImage: null,                                                                       bgColor: '#F5F2EE', widthRatio: 0.42, heightRatio: 0.42, offsetX:  0.16, offsetY:  0.16, physicalWidthInches:  5    },
  { name: "The Oxford",            bgImage: null,                                                                       bgColor: '#EDE9E3', widthRatio: 0.60, heightRatio: 0.40, offsetX:  0.00, offsetY:  0.00, physicalWidthInches: 10    },
]

export type Preset = typeof PRESETS[number]
