/* config/theme.ts */
import type { ColorConfig, ColorPalette } from "@config/types";

export const ColorData: ColorConfig = {
  colors: {
    mode: "light",
    light: {
      bgBase: "oklch(96.1% 0.026 119deg)", // #f0f5e2
      bgAlt: "oklch(94.8% 0.030 119deg)", // #ebf1db
      bgCard: "oklch(98.6% 0.007 116deg)", // #fafbf6

      txtPri: "oklch(30.3% 0.005 122deg)", // #2e2f2c
      txtMuted: "oklch(0.4672 0.0228 133.29)", // #555d50

      accentForest: "oklch(48.0% 0.084 145deg)", // #3d6a3f
      accentStone: "oklch(0.4876 0.0303 221.14)", // #4b6362
      accentTerra: "oklch(50.0% 0.101 31deg)", // #944b3e
      accentBistre: "oklch(0.5465 0.0961 68.27)", // #95652b
      accentBurgundy: "oklch(46% 0.16 17deg)", // #9f1d35

      info: "oklch(47.9% 0.065 225deg)", // #306579
      warning: "oklch(50.0% 0.090 75deg)", // #815b1f
      alert: "oklch(47.9% 0.090 22deg)", // #894746
      success: "oklch(46.0% 0.075 145deg)", // #3c633d
    },
    dark: {
      bgBase: "oklch(16% 0.018 119deg)", // ~ #191e13
      bgAlt: "oklch(13% 0.020 119deg)", // ~ #141910
      bgCard: "oklch(20% 0.010 116deg)", // ~ #1e231a

      txtPri: "oklch(92% 0.008 122deg)", // ~ #e4ebe0
      txtMuted: "oklch(65% 0.016 118deg)", // ~ #97a08f

      accentForest: "oklch(64% 0.094 145deg)", // ~ #5a9c5e
      accentStone: "oklch(63% 0.036 193deg)", // ~ #7a9e9b
      accentTerra: "oklch(66% 0.108 31deg)", // ~ #be7a6d
      accentBistre: "oklch(62% 0.042 75deg)", // ~ #907f65
      accentBurgundy: "oklch(63% 0.148 17deg)", // ~ #c44f6e

      info: "oklch(64% 0.075 225deg)", // ~ #6698ad
      warning: "oklch(66% 0.095 75deg)", // ~ #a08040
      alert: "oklch(64% 0.095 22deg)", // ~ #b47070
      success: "oklch(62% 0.085 145deg)", // ~# 5a9060
    },
  },
};

export function paletteToCSSVars(palette: ColorPalette): string {
  return Object.entries(palette)
    .map(([k, v]) => `--color-${k}: ${v};`)
    .join("\n    ");
}
