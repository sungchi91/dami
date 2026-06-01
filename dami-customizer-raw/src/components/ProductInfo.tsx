import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Truck, Sparkles, Gift, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ITEM_TYPES } from '@/config/products'
import type { TextSize, TextPosition, MotifEntry } from '@/hooks/useCustomizer'
import { buildCartPayload, submitToCart } from '@/lib/cart'
import { getMotifSizeLimits } from '@/config/fixed-layouts'

// ── Thread swatches ────────────────────────────────────────────────────────────

export const threadSwatches = [
  { name: 'Forest Pine',     color: '#183823' },
  { name: 'Deep Navy',       color: '#1B2F4A' },
  { name: 'Vintage Wood',    color: '#5C2B1E' },
  { name: 'Bordeaux',        color: '#9A1019' },
  { name: 'Ember Lane Blue', color: '#476E87' },
  { name: 'Pale Sky',        color: '#C5DCEC' },
  { name: 'Linen White',     color: '#F5EDD8' },
  { name: 'Canvas Stone',    color: '#EBEBDA' },
  { name: 'Thread Red',      color: '#B80606' },
  { name: 'True Black',      color: '#1A1A1A' },
]

const fontStyles = [
  { id: 'edwardian',    label: 'Elegant Script',  fontFamily: 'Edwardian'   },
  { id: 'chateauneuf',  label: 'Delicate Script', fontFamily: 'Chateauneuf' },
  { id: 'ballantines',  label: 'Bold Script',     fontFamily: 'Ballantines' },
  { id: 'katelyn',      label: 'Playful Script',  fontFamily: 'Katelyn'     },
  { id: 'garamond',     label: 'Classic Serif',   fontFamily: 'Garamond'    },
  { id: 'block',        label: 'Modern Block',    fontFamily: 'Block'       },
]

const TEXT_SIZE_MIN  = 0.5
const TEXT_SIZE_MAX  = 1.75
const TEXT_SIZE_STEP = 0.25

const FONT_SIZE_FLOOR: Record<string, number> = {}

const CDN = 'https://cdn.shopify.com/s/files/1/0990/0326/9486/files/'
const CB  = '?v=20260517'

function parseSz(s: string): number { return parseFloat(s.replace('p', '.')) }
// Each motif has a single PNG file named with its MIN size suffix; we re-scale on canvas for larger sizes.
// noSuffix: true means the CDN file has no size suffix (e.g. motif_champagneFlutes.png).
function motifUrl(motif: { baseName: string; sizes: string[]; noSuffix?: boolean }): string {
  if (motif.noSuffix) return `${CDN}${motif.baseName}.png${CB}`
  return `${CDN}${motif.baseName}_${motif.sizes[0]}.png${CB}`
}

type MotifDef = { label: string; baseName: string; sizes: string[]; noSuffix?: boolean }

const MOTIF_GROUPS: { group: string; motifs: MotifDef[] }[] = [
  { group: 'Drinks', motifs: [
    { label: 'Aperol Spritz',    baseName: 'motif_aperolSpritz',    sizes: ['1p57','1p97'] },
    { label: 'Champagne',        baseName: 'motif_champagne',        sizes: ['1p5','2','2p5'] },
    { label: 'Champagne Flutes', baseName: 'motif_champagneFlutes',  sizes: ['1','1p5','2','2p5','3'], noSuffix: true },
    { label: 'Espresso Martini', baseName: 'motif_espressoMartini',  sizes: ['1p57','1p97'] },
    { label: 'Gin & Tonic',      baseName: 'motif_ginAndTonic',      sizes: ['1p57','1p97'] },
    { label: 'Iced Coffee',      baseName: 'motif_icedCoffee',       sizes: ['1p57','1p97','2p36'], noSuffix: true },
    { label: 'Martini',          baseName: 'motif_martini',          sizes: ['1p5','2','2p5'] },
    { label: 'Spicy Marg',       baseName: 'motif_spicyMarg',        sizes: ['1'] },
    { label: 'Tequila',          baseName: 'motif_tequila',          sizes: ['1'] },
    { label: 'Whiskey Glass',    baseName: 'motif_whiskeyGlass',     sizes: ['1','1p5','2','2p5','3'], noSuffix: true },
    { label: 'Wine Bottle',      baseName: 'motif_wineBottle',       sizes: ['1p57','1p97','2p36'], noSuffix: true },
    { label: 'Wine Glass',       baseName: 'motif_wineGlass',        sizes: ['1p57','1p97','2p36'], noSuffix: true },
  ]},
  { group: 'Food', motifs: [
    { label: 'Cherries',         baseName: 'motif_cherries',         sizes: ['1p18','1p57','1p97'], noSuffix: true },
    { label: 'Chili Pepper',     baseName: 'motif_chiliPepper',      sizes: ['1p25','1p5','1p75','2','2p25','2p5','2p75','3','3p25','3p5'], noSuffix: true },
    { label: 'Crab',             baseName: 'motif_crab',             sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Croissant',        baseName: 'motif_croissant',        sizes: ['0p75'], noSuffix: true },
    { label: 'French Fries',     baseName: 'motif_frenchFries',      sizes: ['1','1p5','2'], noSuffix: true },
    { label: 'Hamburger',        baseName: 'motif_hamburger',        sizes: ['1','1p5','2'] },
    { label: 'Hot Dog',          baseName: 'motif_hotDog',           sizes: ['1','1p5','2'] },
    { label: 'Ice Cream Cone',   baseName: 'motif_iceCreamCone',     sizes: ['1p57','1p97','2p36'], noSuffix: true },
    { label: 'Lemons',           baseName: 'motif_lemons',           sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Lobster',          baseName: 'motif_lobster',          sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Olive Branch',     baseName: 'motif_oliveBranch',      sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Olive Oil',        baseName: 'motif_oliveOil',         sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Olive Pick',       baseName: 'motif_olivePick',        sizes: ['1','1p5','2'] },
    { label: 'Olives',           baseName: 'motif_olives',           sizes: ['1','1p5','2','2p5','3'], noSuffix: true },
    { label: 'Oysters',          baseName: 'motif_oysters',          sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Pizza',            baseName: 'motif_pizza',            sizes: ['1','1p5','2'] },
    { label: 'Sardines',         baseName: 'motif_sardines',         sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Taco',             baseName: 'motif_taco',             sizes: ['1','1p5','2'] },
    { label: 'Tomatoes',         baseName: 'motif_tomatoes',         sizes: ['1','1p5','2','2p5','3'] },
  ]},
  { group: 'Beauty', motifs: [
    { label: 'Brush',            baseName: 'motif_brush',            sizes: ['1p4','1p6','2'] },
    { label: 'Cream',            baseName: 'motif_cream',            sizes: ['1','1p2','1p6'] },
    { label: 'Eye Shadow',       baseName: 'motif_eyeShadow',        sizes: ['1p2','1p4','1p8'] },
    { label: 'Eyelash Curler',   baseName: 'motif_eyelashCurler',    sizes: ['1p2','1p4','1p8'] },
    { label: 'Face Mask',        baseName: 'motif_faceMask',         sizes: ['1p4','1p6','2'] },
    { label: 'Facial Massager',  baseName: 'motif_facialMassager',   sizes: ['1p4','1p6','2'] },
    { label: 'Gua Sha',          baseName: 'motif_guaSha',           sizes: ['1','1p2','1p6'] },
    { label: 'Hand Cream',       baseName: 'motif_handCream',        sizes: ['1p4','1p6','2'] },
    { label: 'Lip Gloss',        baseName: 'motif_lipGloss',         sizes: ['1p4','1p6','2'] },
    { label: 'Lips',             baseName: 'motif_lips',             sizes: ['1p80','2p80','3p80'], noSuffix: true },
    { label: 'Lipstick',         baseName: 'motif_lipstick',         sizes: ['1p2','1p4','1p8'] },
    { label: 'Mirror',           baseName: 'motif_mirror',           sizes: ['1p2','1p4','1p8'] },
    { label: 'Perfume',          baseName: 'motif_perfume',          sizes: ['1p2','1p4','1p8'] },
    { label: 'Perfume (Clean)',  baseName: 'motif_perfumeClean',     sizes: ['1p2','1p4','1p8'] },
    { label: 'Red Lipstick',     baseName: 'motif_redLipstick',      sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Serum',            baseName: 'motif_serum',            sizes: ['1p4','1p6','2'] },
    { label: 'Vintage Perfume',  baseName: 'motif_vintagePerfume',   sizes: ['1','1p5','2','2p5','3'] },
  ]},
  { group: 'Fashion', motifs: [
    { label: 'Ballet',           baseName: 'motif_ballet',           sizes: ['1p06','1p22','1p42','1p61','1p81','2p01','2p28','2p56','2p80','3p15','3p70'], noSuffix: true },
    { label: 'Bikini',            baseName: 'motif_bikini',           sizes: ['2','3','4','5'], noSuffix: true },
    { label: 'Bow',              baseName: 'motif_bow',              sizes: ['1','1p5','2','2p5','3'], noSuffix: true },
    { label: 'Cowboy Boot',      baseName: 'motif_cowboyBoot',       sizes: ['1','2','3','4','5','6'], noSuffix: true },
    { label: 'Flat Hair Clip',   baseName: 'motif_flatHairClip',     sizes: ['1p4','1p6','2'] },
    { label: 'Hair Clip',        baseName: 'motif_hairClip',         sizes: ['1p2','1p4','1p8'] },
    { label: 'Hair Comb',        baseName: 'motif_hairComb',         sizes: ['1p2','1p4','1p8'] },
    { label: 'Handbag',          baseName: 'motif_handbag',          sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Heel',             baseName: 'motif_heel',             sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Neat Bow',         baseName: 'motif_neatBow',          sizes: ['0p5','1','1p5','2','2p5','3'], noSuffix: true },
    { label: 'Scarf',            baseName: 'motif_scarf',            sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Scrunchie',        baseName: 'motif_scrunchie',        sizes: ['1p2','1p4','1p8'] },
    { label: 'Sunglasses',       baseName: 'motif_sunglasses',       sizes: ['1','1p5','2','2p5','3'] },
  ]},
  { group: 'Floral', motifs: [
    { label: 'Clover',           baseName: 'motif_clover',           sizes: ['0p80','1','1p20','1p40'], noSuffix: true },
    { label: 'Daisy',             baseName: 'motif_daisy',            sizes: ['0p80','1','1p25','1p50','1p75','2','2p25','2p50','2p75','3'], noSuffix: true },
    { label: 'Rose (Red)',        baseName: 'motif_roseRed',          sizes: ['1p18','1p42','1p65','1p89','2p17','2p48','2p87','3p31'], noSuffix: true },
    { label: 'Rose (White)',      baseName: 'motif_roseWhite',        sizes: ['1p18','1p42','1p65','1p89','2p17','2p48','2p87','3p31'], noSuffix: true },
    { label: 'Tulip',            baseName: 'motif_tulip',            sizes: ['1p50','2','3','4','5','6','7'], noSuffix: true },
  ]},
  { group: 'Travel', motifs: [
    { label: 'Airplane',         baseName: 'motif_airplane',         sizes: ['1p38','1p77','2p17'], noSuffix: true },
    { label: 'Anchor',           baseName: 'motif_anchor',           sizes: ['1p18','1p57','1p97'], noSuffix: true },
    { label: 'Passport',         baseName: 'motif_passport',         sizes: ['1p57','1p97','2p36'], noSuffix: true },
    { label: 'Sailboat',         baseName: 'motif_sailboat',         sizes: ['1p18','1p57','1p97'], noSuffix: true },
    { label: 'Suitcase',         baseName: 'motif_suitcase',         sizes: ['1p77','2p17','2p56'], noSuffix: true },
  ]},
  { group: 'Fun & Games', motifs: [
    { label: '8 Ball',           baseName: 'motif_8ball',            sizes: ['1','1p5','2','2p5','3'], noSuffix: true },
    { label: 'Dice',             baseName: 'motif_dice',             sizes: ['1','1p5','2','2p5','3'], noSuffix: true },
    { label: 'Horseshoe',        baseName: 'motif_horseshoe',        sizes: ['0p39','0p59','0p79','0p98','1p18','1p38','1p57','1p77','1p97','2p17','2p36','2p76'], noSuffix: true },
    { label: 'Lucky 777',        baseName: 'motif_lucky777',         sizes: ['2','3','4','5'], noSuffix: true },
    { label: 'Lucky Dice',       baseName: 'motif_luckyDice',        sizes: ['2','3','4','5'], noSuffix: true },
    { label: 'Lucky Heart',      baseName: 'motif_luckyHeart',       sizes: ['0p75','1','2','3','4','5'], noSuffix: true },
    { label: 'Playing Cards',    baseName: 'motif_playingCards',     sizes: ['1','1p5','2','2p5','3'], noSuffix: true },
  ]},
  { group: 'Golf', motifs: [
    { label: 'Golf Cart',        baseName: 'motif_golfCart',         sizes: ['1','1p5','2','2p5'] },
    { label: 'Golf Club Bag',    baseName: 'motif_golfClubBag',      sizes: ['1','1p5','2','2p5'] },
    { label: 'Golf Flag',        baseName: 'motif_golfFlag',         sizes: ['1','1p5','2','2p5'] },
  ]},
  { group: 'NYC', motifs: [
    { label: 'NYC Apple',        baseName: 'motif_nycApple',         sizes: ['1p25','1p75','2p25'] },
    { label: 'NYC Crown',        baseName: 'motif_nycCrown',         sizes: ['1','1p5','2'] },
    { label: 'NYC Empire',       baseName: 'motif_nycEmpire',        sizes: ['1p5','2','2p5'] },
    { label: 'NYC Taxi',         baseName: 'motif_nycTaxi',          sizes: ['1p5','2','2p5'] },
  ]},
  { group: 'I♥SF', motifs: [
    { label: 'Cable Car',        baseName: 'motif_cableCar',         sizes: ['1p50','2','2p50'], noSuffix: true },
    { label: 'Victorian Row',    baseName: 'motif_victorianRow',     sizes: ['1p25','1p75','2p25'], noSuffix: true },
  ]},
  { group: 'Bachelorette', motifs: [
    { label: 'Locket',           baseName: 'motif_locketFrame',          sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Balloon',          baseName: 'motif_bacheloretteBalloon',  sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Bands',            baseName: 'motif_bacheloretteBands',    sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Boots',            baseName: 'motif_bacheloretteBoots',    sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Bow',              baseName: 'motif_bacheloretteBow',      sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Bucket',           baseName: 'motif_bacheloretteBucket',   sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Cake',             baseName: 'motif_bacheloretteCake',     sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Card',             baseName: 'motif_bacheloretteCard',     sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Dice',             baseName: 'motif_bacheloretteDice',     sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Disco',            baseName: 'motif_bacheloretteDisco',    sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Hat',              baseName: 'motif_bacheloretteHat',      sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Lips',             baseName: 'motif_bacheloretteLips',     sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Lipstick',         baseName: 'motif_bacheloretteLipstick', sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Long Bow',         baseName: 'motif_bacheloretteLongBow',  sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Sunnies',          baseName: 'motif_bacheloretteSunnies',  sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Tower',            baseName: 'motif_bacheloretteTower',    sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Vinyl',            baseName: 'motif_bacheloretteVinyl',    sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
    { label: 'Wine',             baseName: 'motif_bacheloretteWine',     sizes: ['1p50','2','2p50','3','4'], noSuffix: true },
  ]},
  { group: 'Sentimental', motifs: [
    { label: 'Coquette',         baseName: 'motif_locketCoquette',   sizes: ['2','3','4','5','6','7','8'], noSuffix: true },
    { label: 'Coquette 2',       baseName: 'motif_locketCoquette2',  sizes: ['2','2p50','3','3p50','4','4p50','5','5p50','6','6p50','7'], noSuffix: true },
    { label: 'Heart 2',          baseName: 'motif_locketHeart2',     sizes: ['2','2p50','3','3p50','4','4p50','5','5p50','6','6p50'], noSuffix: true },
    { label: 'Heart 3',          baseName: 'motif_locketHeart3',     sizes: ['2','2p50','3','3p50','4','4p50','5','5p50','6'], noSuffix: true },
  ]},
  { group: 'Animals', motifs: [
    { label: 'Bichon Frise',     baseName: 'motif_bichonFrise',      sizes: ['2p80','3p78','4p76'], noSuffix: true },
    { label: 'Brown Dog',        baseName: 'motif_brownDog',         sizes: ['2p80','3p80','4p80'], noSuffix: true },
    { label: 'Pomeranian',       baseName: 'motif_pomeranian',       sizes: ['2p2','2p8','3p8'] },
  ]},
  { group: 'Lifestyle', motifs: [
{ label: 'Evil Eye',         baseName: 'motif_evilEye',          sizes: ['0p83','1p22','1p62','2p02','2p82','3p61','4p41'], noSuffix: true },
    { label: 'Heart',            baseName: 'motif_heart',            sizes: ['0p8','1','1p4'] },
    { label: 'Key',               baseName: 'motif_key',              sizes: ['1p10','1p26','1p46','1p73','1p97','2p24','2p60','2p99','3p39','3p82','4p21'], noSuffix: true },
    { label: 'Match Box',        baseName: 'motif_matchBox',         sizes: ['1','1p5','2','2p5','3'], noSuffix: true },
    { label: 'Palm Tree',        baseName: 'motif_palmTree',         sizes: ['1','2'] },
    { label: 'Pine Tree',        baseName: 'motif_pineTree',         sizes: ['1','1p5','2','2p5','3'], noSuffix: true },
    { label: 'Smile',            baseName: 'motif_smile',            sizes: ['0p80','1','1p20'], noSuffix: true },
    { label: 'Teddy Bear',       baseName: 'motif_teddyBear',        sizes: ['1','2','3'], noSuffix: true },
    { label: 'Tennis Racket',    baseName: 'motif_tennisRacket',     sizes: ['2'], noSuffix: true },
    { label: 'Wedding Rings',    baseName: 'motif_weddingRings',     sizes: ['0p96','1p42','1p91'], noSuffix: true },
    { label: 'XOXO Heart (Red)',  baseName: 'motif_xoxoHeartRed',     sizes: ['1','1p25','1p50','1p75','2','2p25','2p50','3'], noSuffix: true },
    { label: 'XOXO Heart (Pink)', baseName: 'motif_xoxoHeartPink',    sizes: ['1','1p25','1p50','1p75','2','2p25','2p50','3'], noSuffix: true },
    { label: 'XOXO Heart (Green)',baseName: 'motif_xoxoHeartGreen',   sizes: ['1','1p25','1p50','1p75','2','2p25','2p50','3'], noSuffix: true },
    { label: 'XOXO Heart (Blue)', baseName: 'motif_xoxoHeartBlue',    sizes: ['1','1p25','1p50','1p75','2','2p25','2p50','3'], noSuffix: true },
  ]},
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProductInfoProps {
  showPersonalize:   boolean
  onPersonalize:     () => void
  onBack:            () => void
  embroideryText:    string
  setEmbroideryText: (v: string) => void
  textColor:         string
  setTextColor:      (v: string) => void
  fontStyle:         string
  setFontStyle:      (v: string) => void
  textSize:          TextSize
  setTextSize:       (v: TextSize) => void
  variantId:         number
  selectedItem:      number
  productPrice:      string
  textPosition:      TextPosition
  motifEntries:      MotifEntry[]
  onAddMotif:           (url: string, label: string, baseName: string, widthInches: number) => void
  onRemoveMotif:        (id: string) => void
  onUpdateMotifsByBaseName: (baseName: string, newUrl: string, newWidthInches: number) => void
  maxMotifs:         number
  categoryLabel:     string
  tagline:           string
  description:       string
  founderQuote:      string
  founderName:       string
  colors:            { name: string; color: string; available?: boolean; variantId?: number; variantsByCount?: Record<string, { id: number; price: string }>; mediaId?: string; imageUrl?: string }[]
  selectedColor:     number
  onColorChange:     (mediaId: string, imageUrl: string, idx: number) => void
  motifCountOptions:    string[]
  selectedMotifCount:   string
  onMotifCountChange:   (v: string) => void
  feature1:          string
  feature2:          string
  feature3:          string
  dimension:         string
  care:              string
  customizerType?:   string
  available?:        boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductInfo({
  showPersonalize,
  onPersonalize,
  onBack,
  embroideryText,
  setEmbroideryText,
  textColor,
  setTextColor,
  fontStyle,
  setFontStyle,
  textSize,
  setTextSize,
  variantId,
  selectedItem,
  productPrice,
  textPosition,
  motifEntries,
  onAddMotif,
  onRemoveMotif,
  onUpdateMotifsByBaseName,
  maxMotifs,
  categoryLabel,
  tagline,
  description,
  founderQuote,
  founderName,
  colors,
  selectedColor,
  onColorChange,
  motifCountOptions,
  selectedMotifCount,
  onMotifCountChange,
  feature1,
  feature2,
  feature3,
  dimension,
  care,
  customizerType,
  available = true,
}: ProductInfoProps) {
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [exceededWarning, setExceededWarning] = useState(false)
  const [quantity,        setQuantity]        = useState(1)
  const [motifSizeIdx,    setMotifSizeIdx]    = useState<Record<string, number>>({})
  const [activeMotifTab,  setActiveMotifTab]  = useState('')
  const [notes,           setNotes]           = useState('')
  const motifScrollRef = useRef<HTMLDivElement>(null)
  const [motifScroll,    setMotifScroll]     = useState({ left: false, right: false })
  const tabScrollRef   = useRef<HTMLDivElement>(null)
  const [tabScroll,     setTabScroll]        = useState({ left: false, right: false })
  const motifGridRef   = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown]   = useState(false)
  const [motifTooltip, setMotifTooltip]     = useState<{ text: string; x: number; y: number } | null>(null)

  const showMotifTooltip = useCallback((e: React.MouseEvent, text: string) => {
    if (window.matchMedia('(hover: none)').matches) return
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMotifTooltip({ text, x: r.left + r.width / 2, y: r.bottom + 6 })
  }, [])
  const hideMotifTooltip = useCallback(() => setMotifTooltip(null), [])

  const handleAddToBasket = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = buildCartPayload({ selectedItem, embroideryText, fontStyle, textColor, textSize, textPosition, motifEntries, customizerType, notes })
      await submitToCart(variantId, payload, quantity, customizerType)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Add to basket failed:', err)
      alert(`Something went wrong adding to basket: ${msg}`)
      setIsSubmitting(false)
    }
  }

  // Motif availability based on layout type
  const isMotifOnly   = customizerType === 'side-motif' || customizerType === 'classic-motif'
  const showTextStep  = !isMotifOnly
  const showMotifStep = !customizerType || customizerType === 'freeform'
    || customizerType === 'crown' || customizerType === 'pedestal' || customizerType === 'sidenote'
    || customizerType === 'side-motif' || customizerType === 'classic-motif'

  const textMet  = !showTextStep || embroideryText.trim().length > 0
  const motifMet = !showMotifStep
    || (selectedMotifCount
      ? motifEntries.length >= parseInt(selectedMotifCount, 10)
      : motifEntries.length > 0)
  const hasInput = textMet && motifMet
  const layoutMax = (customizerType === 'sidenote' || customizerType === 'side-motif' || customizerType === 'classic-motif') ? 1 : maxMotifs
  const countMax  = selectedMotifCount ? parseInt(selectedMotifCount, 10) : Infinity
  const effectiveMaxMotifs = Math.min(layoutMax, isFinite(countMax) ? countMax : layoutMax)

  const motifCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const entry of motifEntries) {
      counts[entry.baseName] = (counts[entry.baseName] ?? 0) + 1
    }
    return counts
  }, [motifEntries])

  const totalMotifs = motifEntries.length
  const atMax       = totalMotifs >= effectiveMaxMotifs

  const handleRemoveLastOfBaseName = (baseName: string) => {
    const last = [...motifEntries].reverse().find(e => e.baseName === baseName)
    if (last) { onRemoveMotif(last.id); setExceededWarning(false) }
  }

  const handleSizeChange = (motif: MotifDef, delta: number) => {
    const cur = motifSizeIdx[motif.baseName] ?? 0
    const next = Math.max(0, Math.min(motif.sizes.length - 1, cur + delta))
    if (next === cur) return
    setMotifSizeIdx(prev => ({ ...prev, [motif.baseName]: next }))
    onUpdateMotifsByBaseName(motif.baseName, motifUrl(motif), parseSz(motif.sizes[next]))
  }

  const selectedThreadIndex = threadSwatches.findIndex(s => s.color === textColor)
  const threadName = threadSwatches[selectedThreadIndex < 0 ? 0 : selectedThreadIndex].name

  const mergedMotifGroups = useMemo(() => {
    const title    = (ITEM_TYPES[selectedItem] ?? '').toLowerCase()
    const isNapkin = title.includes('napkin')
    const isTote   = title.includes('tote')
    const isPouch  = title.includes('pouch')

    const TOTE_NAMES:   Record<string, string> = {
      'Travel': 'Jet Set', 'Golf': 'On the Green', 'Fun & Games': 'Lucky Girl',
      'Lifestyle': 'Everyday Chic', 'NYC': 'City Girl', 'I♥SF': 'City Girl',
      'Food': 'Her Favorite Things', 'Drinks': 'Her Favorite Things', 'Fashion': 'Her Favorite Things',
      'Bachelorette': 'Bach Bag', 'Floral': 'Garden Party', 'Animals': 'Best Friend',
    }
    const POUCH_NAMES:  Record<string, string> = {
      'Beauty': 'Vanity', 'Fashion': 'Getting Dressed', 'Bachelorette': 'Bach Bag',
      'Drinks': 'Pre-Game', 'Floral': 'Pretty Things',
      'Food': 'Her Favorite Things', 'Travel': 'Jet Set', 'Fun & Games': 'Lucky Girl',
      'NYC': 'City Girl', 'I♥SF': 'City Girl', 'Animals': 'Best Friend', 'Lifestyle': 'Everyday Chic',
    }
    const NAPKIN_NAMES: Record<string, string> = {
      'Drinks': 'Cocktail Hour', 'Food': 'On the Table', 'Floral': 'In Bloom',
      'Golf': 'Club House', 'Fun & Games': 'Game Night', 'Bachelorette': 'Cheers to Her',
      'NYC': 'City Souvenir', 'I♥SF': 'City Souvenir', 'Lifestyle': 'The Details',
    }
    const displayName = (group: string) => {
      if (isTote)   return TOTE_NAMES[group]   ?? group
      if (isPouch)  return POUCH_NAMES[group]  ?? group
      if (isNapkin) return NAPKIN_NAMES[group] ?? group
      return group
    }
    const TOTE_ORDER   = ['Everyday Chic','Garden Party','Bach Bag','Her Favorite Things','Best Friend','Jet Set','On the Green','Lucky Girl','City Girl']
    const POUCH_ORDER  = ['Vanity','Getting Dressed','Pretty Things','Sentimental','Bach Bag','Pre-Game','Her Favorite Things','Best Friend','Everyday Chic','Jet Set','Lucky Girl','City Girl']
    const NAPKIN_ORDER = ['Cocktail Hour','On the Table','In Bloom','Cheers to Her','The Details','Game Night','Club House','City Souvenir']
    const sortOrder = isTote ? TOTE_ORDER : isPouch ? POUCH_ORDER : isNapkin ? NAPKIN_ORDER : []

    const merged: { label: string; motifs: MotifDef[] }[] = []
    MOTIF_GROUPS.filter(({ group }) => {
      if ((isTote || isNapkin) && group === 'Beauty')  return false
      if (isNapkin && (group === 'Fashion' || group === 'Travel' || group === 'Animals')) return false
      if (isPouch && group === 'Golf') return false
      return true
    }).forEach(({ group, motifs }) => {
      const label = displayName(group)
      const existing = merged.find(m => m.label === label)
      if (existing) existing.motifs = [...existing.motifs, ...motifs]
      else merged.push({ label, motifs: [...motifs] })
    })
    if (sortOrder.length) {
      merged.sort((a, b) => {
        const ai = sortOrder.indexOf(a.label); const bi = sortOrder.indexOf(b.label)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      })
    }
    return merged
  }, [selectedItem])

  const motifLimits = useMemo(() =>
    getMotifSizeLimits(ITEM_TYPES[selectedItem] ?? '', customizerType ?? ''),
    [selectedItem, customizerType]
  )

  const visibleMotifGroups = useMemo(() =>
    mergedMotifGroups
      .map(g => ({
        ...g,
        motifs: g.motifs.filter(m => {
          const minIdx = m.sizes.findIndex(s => parseSz(s) >= motifLimits.min)
          const maxIdx = m.sizes.reduce((b, s, i) => parseSz(s) <= motifLimits.max ? i : b, -1)
          return minIdx >= 0 && maxIdx >= 0 && minIdx <= maxIdx
        }),
      }))
      .filter(g => g.motifs.length > 0),
    [mergedMotifGroups, motifLimits]
  )

  const resolvedTab = visibleMotifGroups.find(g => g.label === activeMotifTab)
    ? activeMotifTab
    : visibleMotifGroups[0]?.label ?? ''

  useEffect(() => {
    const el = motifScrollRef.current
    if (!el) return
    el.scrollLeft = 0
    setMotifScroll({ left: false, right: el.scrollWidth > el.clientWidth + 1 })
  }, [resolvedTab])

  useEffect(() => {
    const check = () => {
      const el = tabScrollRef.current
      if (!el) return
      setTabScroll({ left: el.scrollLeft > 1, right: el.scrollWidth > el.clientWidth + 1 })
    }
    check()
    const id = setTimeout(check, 50)
    return () => clearTimeout(id)
  }, [visibleMotifGroups, showPersonalize])

  useEffect(() => {
    const check = () => {
      const el = motifGridRef.current
      if (!el) return
      setCanScrollDown(el.scrollHeight > el.clientHeight + 50)
    }
    check()
    const id = setTimeout(check, 50)
    return () => clearTimeout(id)
  }, [resolvedTab, showPersonalize])

  const handleMotifGridScroll = () => {
    const el = motifGridRef.current
    if (!el) return
    setCanScrollDown(el.scrollTop < el.scrollHeight - el.clientHeight - 50)
  }

  const handleMotifScroll = () => {
    const el = motifScrollRef.current
    if (!el) return
    setMotifScroll({
      left:  el.scrollLeft > 1,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
    })
  }

  const handleTabScroll = () => {
    const el = tabScrollRef.current
    if (!el) return
    setTabScroll({
      left:  el.scrollLeft > 1,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
    })
  }

  const scrollMotifs = (dir: number) =>
    motifScrollRef.current?.scrollBy({ left: dir, behavior: 'smooth' })

  const scrollTabs = (dir: number) =>
    tabScrollRef.current?.scrollBy({ left: dir, behavior: 'smooth' })

  return (
    <><div className="flex flex-col gap-6">

      {/* ── Product overview (always visible) ─────────────────────────────── */}
      {!showPersonalize && (
        <div className="flex flex-col gap-5">
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{description.trim()}</p>
          )}
          {dimension && (
            <p className="text-sm text-muted-foreground">{dimension}</p>
          )}
          {care && (
            <p className="text-sm text-muted-foreground">{care}</p>
          )}

          {founderQuote && (
            <div className="bg-secondary/50 p-6 border border-border/50">
              <p className="text-foreground/80 leading-relaxed italic">&ldquo;{founderQuote}&rdquo;</p>
              {founderName && (
                <p className="font-[family-name:var(--font-cursive)] text-xl text-primary mt-3">— {founderName}</p>
              )}
            </div>
          )}

          {colors.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                Color: <span className="text-muted-foreground font-normal">{colors[selectedColor]?.name}</span>
              </p>
              <div className="flex gap-3 flex-wrap">
                {colors.map((c, i) => {
                  const unavailable = c.available === false
                  return (
                    <button
                      key={c.name}
                      onClick={() => { if (!unavailable) onColorChange(c.mediaId ?? '', c.imageUrl ?? '', i) }}
                      title={c.name}
                      aria-label={c.name}
                      disabled={unavailable}
                      className={`relative w-10 h-10 rounded-full transition-all duration-200 ${
                        unavailable ? 'opacity-40 cursor-not-allowed' :
                        selectedColor === i ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.color, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {motifCountOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                Number of Motifs: <span className="text-muted-foreground font-normal">{selectedMotifCount}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {motifCountOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onMotifCountChange(opt)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedMotifCount === opt
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 scale-110'
                        : 'bg-secondary text-foreground hover:bg-secondary/70 hover:scale-105'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Personalize CTA */}
          <Button
            onClick={onPersonalize}
            className="w-full py-6 text-base bg-primary hover:bg-primary/90 text-primary-foreground mt-1"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Personalize
          </Button>

          {/* ── Feature strip ─────────────────────────────────────────────── */}
          {(feature1 || feature2 || feature3) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
              {feature1 && <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0"><Truck className="w-4 h-4 text-primary" /></div><span>{feature1}</span></div>}
              {feature2 && <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-primary" /></div><span>{feature2}</span></div>}
              {feature3 && <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0"><Gift className="w-4 h-4 text-primary" /></div><span>{feature3}</span></div>}
            </div>
          )}

          <div className="flex flex-col gap-3 text-sm text-muted-foreground border-t border-border pt-4">
            <div className="flex gap-3">
              <span className="font-medium text-foreground shrink-0 w-32">Production Time</span>
              <span>Ships within 5–7 business days.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-medium text-foreground shrink-0 w-32">Return</span>
              <span>All items are made to order and final sale. No returns or exchanges.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-medium text-foreground shrink-0 w-32">Disclaimer</span>
              <span className="leading-relaxed">
                Mockups are approximate. Minor variations may occur in the final embroidered result. Alignment, sizing, and thread color will be adjusted during production for best results.
                <br /><br />
                Thread colors displayed on screen may differ from actual thread due to monitor calibration and dye lot variation. Thread color selections are final once the order is placed. Light thread colors on light backgrounds may result in low contrast, particularly on fine-line or detailed designs. For best visibility, choose a darker thread color.
                <br /><br />
                Font rendering varies by device and browser. The stitched result follows the font name and reference images shown in the Custom Font section.
                <br /><br />
                Please double-check spelling and capitalization before ordering — personalized items cannot be returned or exchanged.
                {(ITEM_TYPES[selectedItem] ?? '').toLowerCase().includes('tote') && (
                  <><br /><br />Embroidery placed on the front pocket will close the pocket opening.</>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Personalize steps ─────────────────────────────────────────────── */}
      {showPersonalize && (
        <div className="flex flex-col gap-6">

          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 self-start px-4 py-2 border border-border text-sm font-medium text-foreground hover:border-primary/60 hover:text-primary transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to product
          </button>

          {/* 01 · Thread */}
          {!isMotifOnly && <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-base font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">01</span>
              Choose a Thread
              <span className="ml-1 text-muted-foreground font-normal">—&nbsp;{threadName}</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 32px)', gap: '8px' }}>
              {threadSwatches.map((swatch) => (
                <button
                  key={swatch.name}
                  onClick={() => setTextColor(swatch.color)}
                  title={swatch.name}
                  aria-label={`Select thread: ${swatch.name}`}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    textColor === swatch.color
                      ? 'ring-2 ring-[#7594B4] ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: swatch.color,
                    boxShadow: textColor === swatch.color ? '0 4px 12px rgba(0,0,0,0.18)' : '0 2px 6px rgba(0,0,0,0.12)',
                    border: ['#F5EDD8', '#EBEBDA', '#C5DCEC', '#FFFFFF'].includes(swatch.color) ? '1px solid #ccc' : 'none',
                  }}
                />
              ))}
            </div>
          </div>}

          {/* 02 · Text */}
          {showTextStep && <div className="flex flex-col gap-3">
            <label htmlFor="custom-text" className="flex items-center gap-2 text-base font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">02</span>
              Add Your Text
            </label>
            <input
              id="custom-text"
              type="text"
              maxLength={40}
              value={embroideryText}
              onChange={(e) => setEmbroideryText(e.target.value)}
              placeholder="Type your text here…"
              className="w-full px-4 py-2.5 border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200 text-base"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {fontStyles.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setFontStyle(f.id); const floor = FONT_SIZE_FLOOR[f.id] ?? TEXT_SIZE_MIN; if (textSize < floor) setTextSize(floor) }}
                  className={`px-3 py-1 border transition-all duration-200 ${
                    fontStyle === f.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                  style={{ fontFamily: f.fontFamily, fontSize: '1.35rem', lineHeight: '1.2', padding: '4px 6px' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{embroideryText.length}/40 characters</p>
          </div>}

          {/* 03 · Size */}
          {showTextStep && (
            <div className="flex items-center gap-3">
              <p className="flex items-center gap-2 text-base font-medium text-foreground">
                <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">03</span>
                Text Size
              </p>
              {(() => {
                const effectiveMin = Math.max(TEXT_SIZE_MIN, FONT_SIZE_FLOOR[fontStyle] ?? 0)
                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTextSize(Math.max(effectiveMin, parseFloat((textSize - TEXT_SIZE_STEP).toFixed(2))))}
                      disabled={textSize <= effectiveMin}
                      className="w-8 h-8 border text-sm font-medium transition-all duration-200 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{Math.round((textSize - TEXT_SIZE_MIN) / TEXT_SIZE_STEP) + 1}</span>
                    <button
                      onClick={() => setTextSize(Math.min(TEXT_SIZE_MAX, parseFloat((textSize + TEXT_SIZE_STEP).toFixed(2))))}
                      disabled={textSize >= TEXT_SIZE_MAX}
                      className="w-8 h-8 border text-sm font-medium transition-all duration-200 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Motifs */}
          {showMotifStep && (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-base font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">{isMotifOnly ? '01' : '04'}</span>
              Add Motifs
              <span className="text-xs text-muted-foreground font-normal">({totalMotifs}/{effectiveMaxMotifs})</span>
            </p>

            {exceededWarning && (
              <p className="text-xs text-amber-600/80 bg-amber-50 border border-amber-200 px-3 py-2">
                Maximum motifs reached for this item
              </p>
            )}

            {/* Selected motifs tray */}
            {motifEntries.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground">Added:</p>
                <div className="flex gap-2 flex-wrap">
                  {motifEntries.map((entry) => (
                    <div key={entry.id} className="relative flex flex-col items-center gap-0.5">
                      <div className="relative w-12 h-12 border border-primary/30 bg-primary/5 flex items-center justify-center p-0.5">
                        <img src={entry.url} alt={entry.label} className="w-full h-full object-contain" />
                        <button
                          onClick={() => { onRemoveMotif(entry.id); setExceededWarning(false) }}
                          aria-label={`Remove ${entry.label}`}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground text-background flex items-center justify-center text-xs leading-none hover:bg-primary transition-colors duration-150"
                        >
                          ×
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground text-center leading-tight max-w-[3rem] truncate">{entry.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category tabs */}
            <div className="flex items-end border-b border-border">
              <button
                onClick={() => scrollTabs(-160)}
                className="shrink-0 w-14 self-stretch flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150 z-10"
                style={{ background: 'linear-gradient(to right, white 70%, transparent)', fontSize: '2rem', visibility: tabScroll.left ? 'visible' : 'hidden' }}
              >
                ‹
              </button>
              <div
                ref={tabScrollRef}
                onScroll={handleTabScroll}
                className="flex flex-1 overflow-x-auto overflow-y-hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {visibleMotifGroups.map(({ label }) => {
                  const hasSelected = visibleMotifGroups.find(g => g.label === label)?.motifs.some(m => (motifCounts[m.baseName] ?? 0) > 0)
                  return (
                    <button
                      key={label}
                      onClick={() => setActiveMotifTab(label)}
                      className={`relative shrink-0 px-4 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
                        resolvedTab === label
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      {label}
                      {hasSelected && resolvedTab !== label && (
                        <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-primary align-middle" />
                      )}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => scrollTabs(160)}
                className="shrink-0 w-14 self-stretch flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150 z-10"
                style={{ background: 'linear-gradient(to left, white 70%, transparent)', fontSize: '2rem', visibility: tabScroll.right ? 'visible' : 'hidden' }}
              >
                ›
              </button>
            </div>

            {/* Active tab motifs */}
            {visibleMotifGroups.filter(g => g.label === resolvedTab).map(({ label, motifs }) => {
              return (<div key={label} className="relative">
                <div
                  ref={motifGridRef}
                  onScroll={handleMotifGridScroll}
                  className="flex flex-wrap gap-3 content-start"
                  style={{ maxHeight: '240px', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin' }}
                >
                {motifs.map((motif) => {
                  const count       = motifCounts[motif.baseName] ?? 0
                  const minValidIdx = motif.sizes.findIndex(s => parseSz(s) >= motifLimits.min)
                  const maxValidIdx = motif.sizes.reduce((b, s, i) => parseSz(s) <= motifLimits.max ? i : b, -1)
                  const clampMin    = minValidIdx >= 0 ? minValidIdx : 0
                  const clampMax    = maxValidIdx >= 0 ? maxValidIdx : motif.sizes.length - 1
                  const sizeIdx     = Math.max(clampMin, Math.min(motifSizeIdx[motif.baseName] ?? clampMin, clampMax))
                  const curUrl      = motifUrl(motif)
                  const curWidth    = parseSz(motif.sizes[sizeIdx])
                  return (
                    <div key={motif.baseName} className="flex flex-col items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => { if (!atMax) { onAddMotif(curUrl, motif.label, motif.baseName, curWidth); setExceededWarning(false) } else setExceededWarning(true) }}
                        onMouseEnter={(e) => showMotifTooltip(e, motif.label)}
                        onMouseLeave={hideMotifTooltip}
                        aria-label={`Add ${motif.label}`}
                        className={`w-16 h-16 border transition-all duration-200 flex items-center justify-center p-1 ${
                          count > 0 ? 'border-primary bg-primary/10' :
                          atMax ? 'border-border bg-background opacity-40 cursor-not-allowed' :
                          'border-border bg-background hover:border-primary/50 hover:scale-105'
                        }`}
                      >
                        <img src={curUrl} alt={motif.label} className="w-full h-full object-contain" />
                      </button>
                      {count > 0 && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleRemoveLastOfBaseName(motif.baseName)} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs">−</button>
                            <span className="w-4 text-center text-xs font-medium tabular-nums">{count}</span>
                            <button onClick={() => { if (!atMax) { onAddMotif(curUrl, motif.label, motif.baseName, curWidth); setExceededWarning(false) } else setExceededWarning(true) }} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs">+</button>
                          </div>
                          {motif.sizes.length > 1 && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleSizeChange(motif, -1)} disabled={sizeIdx <= clampMin} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs disabled:opacity-30">‹</button>
                              <span className="w-8 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>size</span>
                              <button onClick={() => handleSizeChange(motif, 1)} disabled={sizeIdx >= clampMax} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs disabled:opacity-30">›</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                </div>
                {canScrollDown && (
                  <div
                    className="absolute bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none"
                    style={{ height: '40px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))' }}
                  >
                    <span className="text-muted-foreground mb-0.5" style={{ fontSize: '1.75rem', lineHeight: 1 }}>↓</span>
                  </div>
                )}
              </div>)
            })}

            {totalMotifs > 0 && customizerType === 'freeform' && (
              <p className="text-xs text-muted-foreground">Drag motifs on the canvas to position them · press Delete to remove</p>
            )}
          </div>
          )}

          {/* 05 · Notes */}
          <div className="flex flex-col gap-3">
            <label htmlFor="customizer-notes" className="flex items-center gap-2 text-base font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">{isMotifOnly ? '02' : '05'}</span>
              Notes
            </label>
            <p className="text-sm text-muted-foreground -mt-1">Please let us know if you have any notes on thread color or placement!</p>
            <textarea
              id="customizer-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder=""
              className="w-full px-4 py-2.5 border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200 text-sm resize-none"
            />
          </div>

          {/* ── Quantity ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-base font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">{isMotifOnly ? '03' : '06'}</span>
              Quantity
            </p>
            <div className="flex items-center w-fit border border-border">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="px-4 py-2 text-sm text-center min-w-[2.5rem]">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-primary/50"
              >
                +
              </button>
            </div>
          </div>

          {/* ── Add to Basket ────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 pt-2 border-t border-border">
            {available ? (
              <>
                {!hasInput && (
                  <p className="text-base text-center" style={{ color: 'var(--muted-foreground)' }}>
                    {!textMet && !motifMet
                      ? `Please enter your text and add ${selectedMotifCount} motif${parseInt(selectedMotifCount, 10) !== 1 ? 's' : ''} to continue.`
                      : !textMet
                        ? 'Please enter your embroidery text to continue.'
                        : `Please add ${selectedMotifCount} motif${parseInt(selectedMotifCount, 10) !== 1 ? 's' : ''} to continue.`}
                  </p>
                )}
                <Button
                  className="w-full py-6 text-base bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
                  disabled={isSubmitting || !hasInput}
                  onClick={handleAddToBasket}
                >
                  {isSubmitting ? 'Adding…' : 'Add to Basket'}
                </Button>
              </>
            ) : (
              <Button
                className="flex-1 py-6 text-base"
                disabled
              >
                Sold Out
              </Button>
            )}
          </div>
        </div>
      )}

    </div>

      {motifTooltip && createPortal(
      <div
        style={{
          position: 'fixed',
          left: motifTooltip.x,
          top: motifTooltip.y,
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 9999,
          background: 'var(--foreground)',
          color: 'var(--background)',
          fontSize: '0.75rem',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
        }}
      >
        {motifTooltip.text}
      </div>,
      document.body
      )}
    </>
  )
}
