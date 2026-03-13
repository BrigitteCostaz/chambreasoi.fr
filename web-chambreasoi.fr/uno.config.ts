// ./web-chambreasoi.fr/uno.config.ts
import { defineConfig, presetMini } from "unocss";
import { presetWebFonts } from "unocss/preset-web-fonts";

import { ColorData } from "./config/colors";

type ThemeColors = typeof ColorData.colors;

const flattenColors = (colors: ThemeColors) => {
  const darkPrefixed = Object.fromEntries(
    Object.entries(colors.dark).map(([key, value]) => [`dark-${key}`, value])
  );

  return {
    ...colors.light,
    ...darkPrefixed,
  };
};

export default defineConfig({
  safelist: ["font-sans", "font-serif", "font-mono"],
  presets: [
    presetMini({
      dark: "class",
    }),
    presetWebFonts({
      provider: "bunny",
      inlineImports: false,
      fonts: {
        sans: {
          name: "Karla",
          weights: [400, 500],
        },
        mono: {
          name: "Fira Code",
          weights: [400, 700],
        },
        // General Sans (self-hosted)
        display: {
          name: "General Sans",
          provider: "none",
        },
      },
    }),
  ],
  theme: {
    colors: flattenColors(ColorData.colors),
    fontFamily: {
      sans: '"Karla", sans-serif',
      mono: '"Fira Code", monospace',
      display: "var(--font-display)",
    },
  },
});
