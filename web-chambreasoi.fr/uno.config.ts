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
  theme: {
    colors: flattenColors(ColorData.colors),
    fontFamily: {
      sans: '"Karla", sans-serif',
      mono: '"Fira Code", monospace',
      display: "var(--font-display)",
    },
    extend: {
      letterSpacing: {
        display: "var(--font-display-tracking)",
      },
    },
  },
  safelist: ["font-sans", "font-serif", "font-mono", "sr-only"],
  shortcuts: {
    "heading-1":
      "text-[clamp(24px,calc(24px+32*(100vw-375px)/1225),32px)] font-[var(--font-display)] font-medium tracking-[var(--font-display-tracking)] leading-[1.1] max-w-full",
    "heading-2":
      "text-[clamp(1.875rem,1.6534rem+0.9848vw,2.4414rem)] font-[var(--font-display)] font-medium leading-[1] text- max-w-full",
    "heading-3":
      "text-[clamp(12px,calc(12*1px+(4)*(100vw-375*1px)/(1225)),16px)] font-[var(--font-sans)] font-regular tracking-wide case-upper",
    "body":
      "text-[clamp(16px,calc(16*1px+2*(100vw-375*1px)/1225),18px)] font-[var(--font-sans)] font-normal leading-[1.5] max-w-full",
  },
  rules: [
    [
      "header-nav",
      {
        "font-family": "var(--font-display)",
        "font-weight": "500",
        "letter-spacing": "var(--font-display-tracking)",
        "text-transform": "lowercase",
        "line-height": "1.4",
        "font-size": "clamp(16px,calc(16*1px + 2*(100vw-375*1px)/1225),18px)",
      },
    ],
  ],
  presets: [
    presetMini({
      dark: "class",
    }),
    presetWebFonts({
      provider: "bunny",
      inlineImports: false,
      fonts: {
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
});
