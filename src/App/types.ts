import { RGB } from "../color";

export interface Palette {
  hues: string[];
  shades: string[];
  colors: RGB[][]; // invariant: colors.length === hues.length, and colors[i].length === shades.length
}
