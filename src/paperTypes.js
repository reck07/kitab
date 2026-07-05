export const PAPER_TYPES = {
  ruled: {
    id: 'ruled',
    name: 'College Ruled',
    description: '7.1mm line spacing for standard writing',
    category: 'lined',
    spacing: 7.1,
    color: 'var(--text-muted)',
    lineWidth: 0.5,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 24,
    marginBottom: 24,
    showMarginLine: true,
    marginLineColor: '#e03e3e',
    marginLinePosition: 32,
  },
  wideRuled: {
    id: 'wideRuled',
    name: 'Wide Ruled',
    description: '8.7mm spacious line spacing',
    category: 'lined',
    spacing: 8.7,
    color: 'var(--text-muted)',
    lineWidth: 0.5,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 24,
    marginBottom: 24,
    showMarginLine: true,
    marginLineColor: '#e03e3e',
    marginLinePosition: 32,
  },
  narrowRuled: {
    id: 'narrowRuled',
    name: 'Narrow Ruled',
    description: '6.3mm high-density spacing',
    category: 'lined',
    spacing: 6.3,
    color: 'var(--text-muted)',
    lineWidth: 0.4,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 24,
    marginBottom: 24,
    showMarginLine: true,
    marginLineColor: '#e03e3e',
    marginLinePosition: 32,
  },
  dotGrid: {
    id: 'dotGrid',
    name: 'Dot Grid',
    description: '5mm subtle dots for bullet journaling',
    category: 'grid',
    spacing: 5,
    color: 'var(--text-muted)',
    dotSize: 1.5,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 16,
    showMarginLine: false,
  },
  graph: {
    id: 'graph',
    name: 'Graph Paper',
    description: '5mm square grid for math & diagrams',
    category: 'grid',
    spacing: 5,
    color: 'var(--text-muted)',
    lineWidth: 0.4,
    majorLineInterval: 5,
    majorLineWidth: 0.8,
    majorLineColor: 'var(--text-muted)',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 16,
    showMarginLine: false,
  },
  isometric: {
    id: 'isometric',
    name: 'Isometric Grid',
    description: '3D perspective drawing grid',
    category: 'grid',
    spacing: 5,
    color: 'var(--text-muted)',
    lineWidth: 0.3,
    angle: 30,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 16,
    showMarginLine: false,
  },
  blank: {
    id: 'blank',
    name: 'Blank',
    description: 'Total sketching freedom',
    category: 'plain',
    marginLeft: 24,
    marginRight: 24,
    marginTop: 24,
    marginBottom: 24,
    showMarginLine: false,
  },
  cornell: {
    id: 'cornell',
    name: 'Cornell Layout',
    description: 'Built-in cues/summary margins for study notes',
    category: 'specialty',
    spacing: 7.1,
    color: 'var(--text-muted)',
    lineWidth: 0.5,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 24,
    marginBottom: 48,
    showMarginLine: true,
    marginLineColor: '#e03e3e',
    marginLinePosition: 32,
    cueColumnWidth: 60,
    summaryHeight: 40,
  },
  seyes: {
    id: 'seyes',
    name: 'Seyes Ruled (French)',
    description: 'French multi-line grid for handwriting practice',
    category: 'specialty',
    spacing: 8,
    color: 'var(--text-muted)',
    lineWidth: 0.4,
    majorLineInterval: 3,
    majorLineWidth: 0.8,
    majorLineColor: 'var(--text-muted)',
    marginLeft: 32,
    marginRight: 16,
    marginTop: 24,
    marginBottom: 24,
    showMarginLine: true,
    marginLineColor: '#e03e3e',
    marginLinePosition: 32,
  },
  music: {
    id: 'music',
    name: 'Music Stave',
    description: 'Pre-printed sheet music staff lines',
    category: 'specialty',
    staffLines: 5,
    staffSpacing: 12,
    staffGroupSpacing: 30,
    marginLeft: 40,
    marginRight: 24,
    marginTop: 24,
    marginBottom: 24,
    showMarginLine: false,
  },
  storyboard: {
    id: 'storyboard',
    name: 'Storyboard',
    description: 'Framed boxes for animation & comics',
    category: 'specialty',
    frameWidth: 160,
    frameHeight: 90,
    frameGap: 16,
    framesPerRow: 2,
    marginLeft: 24,
    marginRight: 24,
    marginTop: 24,
    marginBottom: 24,
    showMarginLine: false,
  },
  logbook: {
    id: 'logbook',
    name: 'Logbook Fields',
    description: 'Columns for time/date/entry tracking',
    category: 'specialty',
    columns: [
      { key: 'time', label: 'Time', width: 80 },
      { key: 'date', label: 'Date', width: 100 },
      { key: 'entry', label: 'Entry', width: 'auto' },
    ],
    headerHeight: 28,
    rowHeight: 28,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 16,
    showMarginLine: false,
  },
  checklist: {
    id: 'checklist',
    name: 'To-Do Checkboxes',
    description: 'Pre-printed task bullet points',
    category: 'specialty',
    spacing: 28,
    checkboxSize: 18,
    checkboxGap: 12,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 24,
    marginBottom: 24,
    showMarginLine: false,
  },
  dualLayout: {
    id: 'dualLayout',
    name: 'Dual Layout',
    description: 'Lines left, blank right for notes & sketches',
    category: 'specialty',
    spacing: 7.1,
    color: 'var(--text-muted)',
    lineWidth: 0.5,
    splitRatio: 0.5,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 24,
    marginBottom: 24,
    showMarginLine: true,
    marginLineColor: '#e03e3e',
    marginLinePosition: 32,
  },
};

export const PAPER_CATEGORIES = {
  lined: { name: 'Lined', icon: '📝', types: ['ruled', 'wideRuled', 'narrowRuled'] },
  grid: { name: 'Grid', icon: '📐', types: ['dotGrid', 'graph', 'isometric'] },
  plain: { name: 'Plain', icon: '📄', types: ['blank'] },
  specialty: { name: 'Specialty', icon: '✨', types: ['cornell', 'seyes', 'music', 'storyboard', 'logbook', 'checklist', 'dualLayout'] },
};

export const CANVAS_SIZES = {
  A4: { id: 'A4', name: 'A4', width: 210, height: 297, unit: 'mm', aspectRatio: 1.414, category: 'standard' },
  A5: { id: 'A5', name: 'A5', width: 148, height: 210, unit: 'mm', aspectRatio: 1.414, category: 'standard' },
  A6: { id: 'A6', name: 'A6', width: 105, height: 148, unit: 'mm', aspectRatio: 1.414, category: 'standard' },
  B5: { id: 'B5', name: 'B5', width: 176, height: 250, unit: 'mm', aspectRatio: 1.42, category: 'standard' },
  B6: { id: 'B6', name: 'B6', width: 125, height: 176, unit: 'mm', aspectRatio: 1.408, category: 'standard' },
  Letter: { id: 'Letter', name: 'Letter (US)', width: 8.5, height: 11, unit: 'in', aspectRatio: 1.294, category: 'standard' },
  Legal: { id: 'Legal', name: 'Legal (US)', width: 8.5, height: 14, unit: 'in', aspectRatio: 1.647, category: 'standard' },
  Executive: { id: 'Executive', name: 'Executive', width: 7, height: 10, unit: 'in', aspectRatio: 1.428, category: 'standard' },
  Square: { id: 'Square', name: 'Square', width: 210, height: 210, unit: 'mm', aspectRatio: 1, category: 'creative' },
  Landscape: { id: 'Landscape', name: 'Landscape', width: 297, height: 210, unit: 'mm', aspectRatio: 1.414, category: 'creative' },
  Pocket: { id: 'Pocket', name: 'Pocket Slim', width: 90, height: 180, unit: 'mm', aspectRatio: 2, category: 'portable' },
  Passport: { id: 'Passport', name: 'Passport', width: 88, height: 125, unit: 'mm', aspectRatio: 1.42, category: 'portable' },
  Tabloid: { id: 'Tabloid', name: 'Tabloid (11x17)', width: 11, height: 17, unit: 'in', aspectRatio: 1.545, category: 'large' },
  Custom: { id: 'Custom', name: 'Custom Size', width: 210, height: 297, unit: 'mm', aspectRatio: 1.414, category: 'custom', isCustom: true },
};

export const COVER_MATERIALS = {
  hardcover: { id: 'hardcover', name: 'Hardcover', description: 'Rigid exterior protection', icon: '📘', premium: true },
  softcover: { id: 'softcover', name: 'Softcover', description: 'Flexible, lightweight casing', icon: '📙', premium: false },
  pp: { id: 'pp', name: 'Polypropylene (PP)', description: 'Waterproof plastic shell', icon: '🛡️', premium: false },
  puLeather: { id: 'puLeather', name: 'PU Leather', description: 'Synthetic, animal-free leather finish', icon: '🧳', premium: true },
  genuineLeather: { id: 'genuineLeather', name: 'Genuine Leather', description: 'Premium, aging-patina material', icon: '🏷️', premium: true },
  kraft: { id: 'kraft', name: 'Kraft Paper', description: 'Eco-friendly, minimalist cardboard', icon: '📦', premium: false },
  laminated: { id: 'laminated', name: 'Laminated Board', description: 'High-gloss, scratch-resistant', icon: '✨', premium: false },
  fabric: { id: 'fabric', name: 'Fabric (Linen/Canvas)', description: 'Textured fabric cover', icon: '🧵', premium: true },
  bamboo: { id: 'bamboo', name: 'Bamboo Veneer', description: 'Sustainable wooden exterior', icon: '🎋', premium: true },
  recycled: { id: 'recycled', name: 'Recycled Board', description: 'Post-consumer waste cover', icon: '♻️', premium: false },
};

export const BINDING_TYPES = {
  twinWire: { id: 'twinWire', name: 'Twin-Wire Spiral', description: 'Snag-free double metal loops', icon: '🔗', layFlat: 180 },
  singleSpiral: { id: 'singleSpiral', name: 'Single Spiral', description: 'Traditional continuous coil', icon: '🌀', layFlat: 360 },
  caseBound: { id: 'caseBound', name: 'Case Bound', description: 'Thread-sewn book-style spine', icon: '📖', layFlat: 180 },
  smythSewn: { id: 'smythSewn', name: 'Smyth Sewn', description: 'Premium signatures sewn flat', icon: '📚', layFlat: 180 },
  perfectBound: { id: 'perfectBound', name: 'Perfect Bound', description: 'Clean adhesive spine', icon: '📄', layFlat: 150 },
  discBound: { id: 'discBound', name: 'Disc Bound', description: 'Customizable removable pages', icon: '💿', layFlat: 360 },
  ringBound: { id: 'ringBound', name: 'Ring Bound', description: 'Six-ring loose-leaf mechanism', icon: '📂', layFlat: 360 },
  refillable: { id: 'refillable', name: 'Refillable Spine', description: 'Opens to replace paper', icon: '🔄', layFlat: 180 },
  screwPost: { id: 'screwPost', name: 'Screw-Post', description: 'Industrial expandable posts', icon: '🔩', layFlat: 180 },
};

export const PAPER_WEIGHTS = {
  '58': { gsm: 58, name: '58 GSM', description: 'Lightweight economy paper', suitableFor: ['pencil', 'ballpoint'] },
  '70': { gsm: 70, name: '70 GSM', description: 'Standard student weight', suitableFor: ['pencil', 'ballpoint', 'gel'] },
  '80': { gsm: 80, name: '80 GSM', description: 'Standard office copy weight', suitableFor: ['pencil', 'ballpoint', 'gel', 'fountain'] },
  '100': { gsm: 100, name: '100 GSM', description: 'Premium bleed-resistant', suitableFor: ['pencil', 'ballpoint', 'gel', 'fountain', 'marker'] },
  '120': { gsm: 120, name: '120 GSM', description: 'Ultra-thick heavy ink', suitableFor: ['pencil', 'ballpoint', 'gel', 'fountain', 'marker', 'watercolor'] },
  '160': { gsm: 160, name: '160 GSM', description: 'Heavyweight mixed-media', suitableFor: ['pencil', 'ballpoint', 'gel', 'fountain', 'marker', 'watercolor', 'acrylic'] },
};

export const PAPER_FINISHES = {
  acidFree: { id: 'acidFree', name: 'Acid-Free', description: "Won't yellow over decades" },
  woodFree: { id: 'woodFree', name: 'Wood-Free', description: 'Pure cellulose, high strength' },
  recycled: { id: 'recycled', name: 'Recycled Content', description: 'Made from reused pulp' },
  stonePaper: { id: 'stonePaper', name: 'Stone Paper', description: 'Waterproof, tear-resistant' },
  bambooPaper: { id: 'bambooPaper', name: 'Bamboo Paper', description: 'Sustainable soft-fiber alternative' },
  tomoeRiver: { id: 'tomoeRiver', name: 'Tomoe River', description: 'Ultra-thin fountain-pen paper' },
  coated: { id: 'coated', name: 'Coated Finish', description: 'Smooth sheen, slower dry' },
  uncoated: { id: 'uncoated', name: 'Uncoated Finish', description: 'Matte texture, instant absorbing' },
  highOpacity: { id: 'highOpacity', name: 'High Opacity', description: 'Minimizes ghosting' },
  brightWhite: { id: 'brightWhite', name: 'Bright White', description: 'High contrast for ink' },
  cream: { id: 'cream', name: 'Cream/Ivory', description: 'Low-glare, eye-strain reducing' },
  tooth: { id: 'tooth', name: 'Tooth Texture', description: 'Rough grip for pencils' },
  satin: { id: 'satin', name: 'Satin Finish', description: 'Silky feel for markers' },
};

export const THEME_PRESETS = {
  coffee: { name: 'Coffee', bg: '#2D2A26', bgCard: '#3A3530', bgMain: '#4A4540', text: '#F5F0EB', textMuted: '#B8B0A8', accent: '#D4A574', border: '#5A5550' },
  dark: { name: 'Dark', bg: '#1A1A2E', bgCard: '#16213E', bgMain: '#0F3460', text: '#E8E8E8', textMuted: '#A0A0A0', accent: '#E94560', border: '#2D2D44' },
  light: { name: 'Light', bg: '#FAFAFA', bgCard: '#FFFFFF', bgMain: '#F0F0F0', text: '#1A1A1A', textMuted: '#666666', accent: '#0066CC', border: '#E0E0E0' },
  sepia: { name: 'Sepia', bg: '#F4ECD8', bgCard: '#FDF6E3', bgMain: '#EEE8D5', text: '#3C2E21', textMuted: '#6B5B4A', accent: '#8B6914', border: '#D4C4A8' },
  forest: { name: 'Forest', bg: '#1B2D1B', bgCard: '#243B24', bgMain: '#2D4A2D', text: '#E8F5E8', textMuted: '#A8D0A8', accent: '#4CAF50', border: '#3D5A3D' },
  ocean: { name: 'Ocean', bg: '#0D1B2A', bgCard: '#1B2A4A', bgMain: '#2A3F5F', text: '#E0E8F0', textMuted: '#A0B8D0', accent: '#00B4D8', border: '#2A4A6A' },
  sunset: { name: 'Sunset', bg: '#2D1B2E', bgCard: '#3D1B3E', bgMain: '#4D2A4E2A4F', text: '#FAD8D8', textMuted: '#D0A0A0', accent: '#E86C5A', border: '#5D3A5E' },
  monochrome: { name: 'Monochrome', bg: '#0A0A0A', bgCard: '#141414', bgMain: '#1E1E1E', text: '#FFFFFF', textMuted: '#888888', accent: '#AAAAAA', border: '#2A2A2A' },
  paper: { name: 'Paper White', bg: '#FEFDFB', bgCard: '#FFFFFF', bgMain: '#FAF9F6', text: '#2D2A26', textMuted: '#6B6660', accent: '#8B7355', border: '#E8E4DD' },
  highContrast: { name: 'High Contrast', bg: '#000000', bgCard: '#0A0A0A', bgMain: '#141414', text: '#FFFF00', textMuted: '#CCCC00', accent: '#00FFFF', border: '#FFFF00' },
};

export const DEFAULT_NOTE_CONFIG = {
  paperType: 'ruled',
  canvasSize: 'A5',
  paperWeight: '100',
  paperFinish: ['acidFree', 'highOpacity', 'cream'],
  coverMaterial: 'hardcover',
  bindingType: 'smythSewn',
  pageCount: 192,
  theme: 'coffee',
  fontSize: 17,
  fontFamily: 'system',
  lineHeight: 1.5,
  showPageNumbers: true,
  showMarginLine: true,
  rtl: false,
  leftHanded: false,
};

export function getPaperType(id) {
  return PAPER_TYPES[id] || PAPER_TYPES.ruled;
}

export function getCanvasSize(id) {
  return CANVAS_SIZES[id] || CANVAS_SIZES.A5;
}

export function getCoverMaterial(id) {
  return COVER_MATERIALS[id] || COVER_MATERIALS.hardcover;
}

export function getBindingType(id) {
  return BINDING_TYPES[id] || BINDING_TYPES.smythSewn;
}

export function getThemePreset(id) {
  return THEME_PRESETS[id] || THEME_PRESETS.coffee;
}

export function pxFromMm(mm, dpi = 96) {
  return (mm / 25.4) * dpi;
}

export function pxFromIn(inches, dpi = 96) {
  return inches * dpi;
}

export function getCanvasDimensions(canvasSize, dpi = 96) {
  const size = getCanvasSize(canvasSize);
  if (size.unit === 'mm') {
    return { width: pxFromMm(size.width, dpi), height: pxFromMm(size.height, dpi) };
  }
  return { width: pxFromIn(size.width, dpi), height: pxFromIn(size.height, dpi) };
}