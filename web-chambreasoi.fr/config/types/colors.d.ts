/* config/types/color.d.ts */

export type ColorToken =
  | "bgBase"
  | "bgAlt"
  | "bgCard"
  | "txtPri"
  | "txtMuted"
  | "accentForest"
  | "accentStone"
  | "accentTerra"
  | "info"
  | "warning"
  | "alert"
  | "success";

export type ColorPalette = Record<ColorToken, string>;

export type ColorMode = "light" | "dark" | "auto";

export interface ColorConfig {
  colors: {
    mode: ColorMode;
    light: ColorPalette;
    dark: ColorPalette;
  };
}
