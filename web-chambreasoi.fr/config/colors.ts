/* config/theme.ts */
import type { ColorConfig, ColorPalette } from "@config/types";

export const ColorData: ColorConfig = {
  colors: {
    mode: "auto",
    light: {
      bgBase: "oklch(96.1% 0.026 119deg)", //#f0f5e2
      bgAlt: "oklch(94.8% 0.030 119deg)", //#ebf1db
      bgCard: "oklch(98.6% 0.007 116deg)", //#fafbf6

      txtPri: "oklch(30.3% 0.005 122deg)", //#2e2f2c
      txtMuted: "oklch(50.0% 0.019 118deg)", //#626559

      accentForest: "oklch(48.0% 0.084 145deg)", //#3d6a3f
      accentStone: "oklch(48.0% 0.029 193deg)", //#4b6362
      accentTerra: "oklch(50.0% 0.101 31deg)", //#944b3e

      info: "oklch(47.9% 0.065 225deg)", //#306579
      warning: "oklch(50.0% 0.090 75deg)", //#815b1f
      alert: "oklch(47.9% 0.090 22deg)", //#894746
      success: "oklch(46.0% 0.075 145deg)", //#3c633d
    },
    dark: {
      bgBase: "oklch(17.5% 0.016 108deg)", //#111109
      bgAlt: "oklch(21.0% 0.019 108deg)", //#19190f
      bgCard: "oklch(24.9% 0.015 107deg)", //#22221a

      txtPri: "oklch(93.5% 0.012 107deg)", //#eaeae1
      txtMuted: "oklch(65.0% 0.016 107deg)", //#909085

      accentForest: "oklch(74.0% 0.101 145deg)", //#82bc83
      accentStone: "oklch(73.1% 0.038 192deg)", //#8db0ae
      accentTerra: "oklch(74.0% 0.110 31deg)", //#e89080

      info: "oklch(71.9% 0.070 226deg)", //#73aec6
      warning: "oklch(78.1% 0.090 79deg)", //#d7b174
      alert: "oklch(73.0% 0.094 22deg)", //#dd908d
      success: "oklch(72.9% 0.079 145deg)", //#88b589
    },
  },
};


export function paletteToCSSVars(palette: ColorPalette): string {
  return Object.entries(palette)
    .map(([k, v]) => `--color-${k}: ${v};`)
    .join("\n    ");
}
