/* config/theme.ts */
import type { ColorConfig } from "@config/types";

export const ColorData: ColorConfig = {
  colors: {
    mode: "auto",
    light: {
      bgBase: "oklch(96.1% 0.026 119°)", //#f0f5e2
      bgAlt: "oklch(94.8% 0.030 119°)", //#ebf1db
      bgCard: "oklch(98.6% 0.007 116°)", //#fafbf6

      txtPri: "oklch(30.3% 0.005 122°)", //#2e2f2c
      txtMuted: "oklch(50.0% 0.019 118°)", //#626559

      accentForest: "oklch(48.0% 0.084 145°)", //#3d6a3f
      accentStone: "oklch(48.0% 0.029 193°)", //#4b6362
      accentTerra: "oklch(50.0% 0.101 31°)", //#944b3e

      info: "oklch(47.9% 0.065 225°)", //#306579
      warning: "oklch(50.0% 0.090 75°)", //#815b1f
      alert: "oklch(47.9% 0.090 22°)", //#894746
      success: "oklch(46.0% 0.075 145°)", //#3c633d
    },
    dark: {
      bgBase: "oklch(17.5% 0.016 108°)", //#111109
      bgAlt: "oklch(21.0% 0.019 108°)", //#19190f
      bgCard: "oklch(24.9% 0.015 107°)", //#22221a

      txtPri: "oklch(93.5% 0.012 107°)", //#eaeae1
      txtMuted: "oklch(65.0% 0.016 107°)", //#909085

      accentForest: "oklch(74.0% 0.101 145°)", //#82bc83
      accentStone: "oklch(73.1% 0.038 192°)", //#8db0ae
      accentTerra: "oklch(74.0% 0.110 31°)", //#e89080

      info: "oklch(71.9% 0.070 226°)", //#73aec6
      warning: "oklch(78.1% 0.090 79°)", //#d7b174
      alert: "oklch(73.0% 0.094 22°)", //#dd908d
      success: "oklch(72.9% 0.079 145°)", //#88b589
    },
  },
};
