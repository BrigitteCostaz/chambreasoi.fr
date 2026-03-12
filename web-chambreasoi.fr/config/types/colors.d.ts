/* config/types/color.d.ts */

export interface ColorPalette {
  bgBase: string;
  bgAlt: string;
  bgCard: string;

  txtPri: string;
  txtMuted: string;

  accentForest: string;
  accentStone: string;
  accentTerra: string;

  info: string;
  warning: string;
  alert: string;
  success: string;
}

export type ColorMode = "light" | "dark" | "auto";

export interface ColorConfig {
  colors: {
    mode: ColorMode;
    light: ColorPalette;
    dark: ColorPalette;
  };
}
