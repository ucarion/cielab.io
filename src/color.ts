export interface RGB {
  r: number;
  g: number;
  b: number;
}

interface XYZ {
  x: number;
  y: number;
  z: number;
}

interface LAB {
  l: number;
  a: number;
  b: number;
}

export interface LCH {
  l: number;
  c: number;
  h: number;
}

const STD_ILL_D65: XYZ = { x: 0.950489, y: 1, z: 1.08884 };

export const MIN_SRGB_LUMINANCE = 0;
export const MAX_SRGB_LUMINANCE = 100;
export const MIN_SRGB_CHROMA = 0;
export const MAX_SRGB_CHROMA = 134;
export const MIN_SRGB_HUE = -Math.PI;
export const MAX_SRGB_HUE = Math.PI;

export function rgbIsDisplayable({ r, g, b }: RGB): boolean {
  return 0 <= r && r <= 1 && 0 <= g && g <= 1 && 0 <= b && b <= 1;
}

export function rgbToLCH(rgb: RGB): LCH {
  return labToLCH(xyzToLAB(rgbToXYZ(rgb)));
}

export function lchToRGB(lch: LCH): RGB {
  return xyzToRGB(labToXYZ(lchToLAB(lch)));
}

export function hexToRGB(hex: string): RGB {
  return {
    r: parseInt(hex.substring(1, 3), 16) / 255,
    g: parseInt(hex.substring(3, 5), 16) / 255,
    b: parseInt(hex.substring(5, 7), 16) / 255
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

export function channelToHex(t: number): string {
  return Math.round(t * 255)
    .toString(16)
    .padStart(2, "0");
}

function rgbToXYZ({ r, g, b }: RGB): XYZ {
  return {
    x:
      0.4124564 * gammaInv(r) +
      0.3575761 * gammaInv(g) +
      0.1804375 * gammaInv(b),
    y:
      0.2126729 * gammaInv(r) +
      0.7151522 * gammaInv(g) +
      0.072175 * gammaInv(b),
    z:
      0.0193339 * gammaInv(r) + 0.119192 * gammaInv(g) + 0.9503041 * gammaInv(b)
  };
}

function xyzToRGB({ x, y, z }: XYZ): RGB {
  return {
    r: gamma(3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
    g: gamma(-0.969266 * x + 1.8760108 * y + 0.041556 * z),
    b: gamma(0.0556434 * x - 0.2040259 * y + 1.0572252 * z)
  };
}

function gammaInv(t: number): number {
  if (t <= 0.04045) {
    return t / 12.92;
  } else {
    return Math.pow((t + 0.055) / 1.055, 2.4);
  }
}

function gamma(t: number): number {
  if (t <= 0.0031308) {
    return t * 12.92;
  } else {
    return 1.055 * Math.pow(t, 1 / 2.4) - 0.055;
  }
}

function xyzToLAB({ x, y, z }: XYZ): LAB {
  return {
    l: 116 * labF(y / STD_ILL_D65.y) - 16,
    a: 500 * (labF(x / STD_ILL_D65.x) - labF(y / STD_ILL_D65.y)),
    b: 200 * (labF(y / STD_ILL_D65.y) - labF(z / STD_ILL_D65.z))
  };
}

function labToXYZ({ l, a, b }: LAB): XYZ {
  const fY = (l + 16) / 116;
  const fX = a / 500 + fY;
  const fZ = fY - b / 200;

  return {
    x:
      STD_ILL_D65.x *
      (Math.pow(fX, 3) > 216 / 24389
        ? Math.pow(fX, 3)
        : (116 * fX - 16) / (24389 / 27)),
    y:
      STD_ILL_D65.y *
      (l > (216 / 24389) * (24389 / 27)
        ? Math.pow((l + 16) / 116, 3)
        : l / (24389 / 27)),
    z:
      STD_ILL_D65.z *
      (Math.pow(fZ, 3) > 216 / 24389
        ? Math.pow(fZ, 3)
        : (116 * fZ - 16) / (24389 / 27))
  };
}

function labF(t: number): number {
  if (t > 216 / 24389) {
    return Math.pow(t, 1 / 3);
  } else {
    return ((24389 / 27) * t + 16) / 116;
  }
}

function labToLCH({ l, a, b }: LAB): LCH {
  return {
    l,
    c: Math.sqrt(a * a + b * b),
    h: Math.atan2(b, a)
  };
}

function lchToLAB({ l, c, h }: LCH): LAB {
  return {
    l,
    a: c * Math.cos(h),
    b: c * Math.sin(h)
  };
}
