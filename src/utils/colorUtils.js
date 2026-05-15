// ── sRGB ↔ linear ────────────────────────────────────────────
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

// ── hex ↔ OKLCH ───────────────────────────────────────────────
// OKLCH is perceptually uniform: same L value looks equally bright across all hues,
// so palettes generated here feel balanced rather than HSL's uneven brightness.
export function hexToOklch(hex) {
  const r = srgbToLinear(parseInt(hex.slice(1, 3), 16) / 255)
  const g = srgbToLinear(parseInt(hex.slice(3, 5), 16) / 255)
  const b = srgbToLinear(parseInt(hex.slice(5, 7), 16) / 255)

  // Linear sRGB → LMS (cube root applied for OKLab)
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  // LMS → OKLab
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const bk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  // OKLab → OKLCH (polar)
  const C = Math.sqrt(a * a + bk * bk)
  const H = (Math.atan2(bk, a) * 180 / Math.PI + 360) % 360

  return { l: L, c: C, h: H }
}

export function oklchToHex(l, c, h) {
  const hRad = h * Math.PI / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  // OKLab → LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b

  // LMS → linear sRGB
  const r =  4.0767416621 * l_ ** 3 - 3.3077115913 * m_ ** 3 + 0.2309699292 * s_ ** 3
  const g = -1.2684380046 * l_ ** 3 + 2.6097574011 * m_ ** 3 - 0.3413193965 * s_ ** 3
  const bv = -0.0041960863 * l_ ** 3 - 0.7034186147 * m_ ** 3 + 1.7076147010 * s_ ** 3

  // Clamp to sRGB gamut (some hue+chroma combos sit outside sRGB)
  const toHex = (v) => Math.round(Math.max(0, Math.min(1, linearToSrgb(v))) * 255)
    .toString(16).padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(bv)}`
}

// Use OKLCH L (perceptual) to decide text color — more reliable than RGB luminance
export function getContrastColor(hex) {
  const { l } = hexToOklch(hex)
  return l > 0.58 ? '#1a1a1a' : '#ffffff'
}

function oklchToString(l, c, h) {
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${Math.round(h)}°)`
}

// ── Harmony definitions ───────────────────────────────────────
// lightnessMods are in OKLCH L units (0–1 scale); small values like 0.04 = 4% shift
const HARMONIES = {
  analogous: {
    label: 'Analogous',
    description: 'Colors adjacent on the color wheel',
    offsets: [-40, -20, 0, 20, 40],
    lightnessMods: [0.03, 0, 0, 0, 0.03],
  },
  complementary: {
    label: 'Complementary',
    description: 'Base + opposite color with supporting shades',
    offsets: [0, 180, 20, -20, 200],
    lightnessMods: [0, 0, 0.04, 0.04, 0.04],
  },
  triadic: {
    label: 'Triadic',
    description: 'Three colors evenly spaced on the wheel',
    offsets: [0, 120, 240, 60, 300],
    lightnessMods: [0, 0, 0, 0.04, 0.04],
  },
  splitComplementary: {
    label: 'Split-Complementary',
    description: 'Base + two colors flanking its complement',
    offsets: [0, 150, 210, 330, 30],
    lightnessMods: [0, 0, 0, 0.04, 0.04],
  },
  tetradic: {
    label: 'Tetradic',
    description: 'Four colors forming a rectangle on the wheel',
    offsets: [0, 90, 180, 270, 45],
    lightnessMods: [0, 0, 0, 0, 0.04],
  },
  designer: {
    label: 'Designer Kit',
    description: 'Base + light neutral, dark neutral, accent, secondary',
    offsets: [0, 0, 0, 180, 120],
    lightnessMods: [0, 0, 0, 0.03, 0],
    // Absolute L/C overrides bypass vibrant normalization — used for the tinted neutrals
    lOverrides: [null, 0.95, 0.20, null, null],
    cOverrides: [null, 0.015, 0.025, null, null],
    swatchLabels: ['Base', 'Light', 'Dark', 'Accent', 'Secondary'],
  },
}

export function getHarmonyTypes() {
  return Object.entries(HARMONIES).map(([key, val]) => ({
    key,
    label: val.label,
    description: val.description,
  }))
}

export function generatePalette(baseHex, harmonyKey = 'analogous') {
  const { l, c, h } = hexToOklch(baseHex)
  const harmony = HARMONIES[harmonyKey] || HARMONIES.analogous

  // Derived colors are normalized to a vibrant L/C range regardless of input darkness
  const vibrantL = Math.min(Math.max(l, 0.52), 0.68)
  const vibrantC = Math.max(c, 0.13)

  return harmony.offsets.map((offset, i) => {
    const newH = ((h + offset) % 360 + 360) % 360

    // Slot 0 always preserves the exact picked color; lOverrides/cOverrides bypass normalization
    const newL = harmony.lOverrides?.[i] != null
      ? harmony.lOverrides[i]
      : i === 0 ? l : Math.max(0, Math.min(1, vibrantL + (harmony.lightnessMods?.[i] || 0)))

    const newC = harmony.cOverrides?.[i] != null
      ? harmony.cOverrides[i]
      : i === 0 ? c : vibrantC

    const hex = oklchToHex(newL, newC, newH)
    return {
      hex,
      info: oklchToString(newL, newC, newH),
      isBase: i === 0,
      label: harmony.swatchLabels?.[i] ?? null,
    }
  })
}
