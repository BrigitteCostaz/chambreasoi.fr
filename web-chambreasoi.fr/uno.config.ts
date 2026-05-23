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
      mono: '"Victor Mono", monospace',
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
    // Headings
    "heading-1":
      "text-[clamp(24px,calc(24px+32*(100vw-375px)/1225),32px)] font-[var(--font-display)] font-medium tracking-[var(--font-display-tracking)] leading-[1.1]",
    "heading-2":
      "text-[clamp(20px,calc(20px+16*(100vw-375px)/1225),28px)] font-[var(--font-display)] font-medium leading-[1.1]",
    "heading-3":
      "text-[clamp(14px,calc(14*1px+(6)*(100vw-375*1px)/(1225)),18px)] font-[var(--font-sans)] leading-[1.2] [text-transform:uppercase]",
    // Body / UI
    "text-ui-sm": "text-[clamp(14px,calc(14px+4*(100vw-360px)/920),18px)]",
    "text-ui-md": "text-[clamp(16px,calc(16px+8*(100vw-360px)/920),20px)] leading-[1.3]",
    "text-ui-lg": "text-[clamp(18px,calc(18px+22.5*(100vw-375px)/1225),22.5px)] leading-[1.1]",
    "text-ui-xl": "text-[clamp(22.5px,calc(22.5px+28*(100vw-375px)/1225),28px)] leading-[1.1]",
    "text-ui-map": "text-[clamp(18px,calc(16.68px+0.3516vw),20px)]",

    "text-primary": "text-txtPri leading-none",
    "text-muted": "text-txtMuted leading-tight",
    "forest-muted": "text-accentForest/70",
    "terra-muted": "text-accentTerra/86",
    "stone-muted": "text-accentStone/70",
    "bistre-muted": "text-accentBistre/80",

    "box-pad": "p-3 md:p-6",
    "box-pad-lg": "p-[0.8rem]",
    "gap-grid": "gap-[0.4rem]",

    "flex-col-start": "flex flex-col items-start justify-start",
    "flex-col-end": "flex flex-col items-end justify-start",
    "flex-col-between": "flex flex-col justify-between",

    square: "aspect-square",

    "list-ui": "flex flex-col font-display font-medium leading-none [list-style-position:inside]",

    "list-ui-disc":
      "flex flex-col font-display font-medium leading-none [list-style-type:disc] [list-style-position:inside]",

    "cta-top": "absolute p-0.8rem inset-x-0 top-0.8rem flex justify-center z-10",

    "cta-bottom": "absolute p-0.8rem inset-x-0 bottom-0.8rem flex justify-center z-10",

    "price-ui":
      "text-[clamp(28px,calc(28px+36*(100vw-375px)/1225),64px)] font-[var(--font-display)] font-medium tracking-[var(--font-display-tracking)] leading-[1.1]",
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
        sans: { name: "Karla", weights: [400, 500, 700] },
        mono: {
          name: "Victor Mono",
          provider: "none",
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
