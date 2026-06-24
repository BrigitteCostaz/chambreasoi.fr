// web-chambreasoi.fr/config/site.ts

/**
 * Site-wide configuration.
 *
 * This file is intentionally simple and serializable.
 * It can be imported from Astro components, layouts, and config modules.
 */

export type ThemeColorMode = "auto" | "light" | "dark";

export interface ThemeConfig {
  colors: {
    /**
     * Color mode behavior:
     * - "auto": follow system preference (prefers-color-scheme) unless user overrides
     * - "light": force light mode
     * - "dark": force dark mode
     */
    mode: ThemeColorMode;
  };
}

export interface SiteConfig {
  themeConfig: ThemeConfig;
}

export const siteConfig: SiteConfig = {
  themeConfig: {
    colors: {
      mode: "light",
    },
  },
};
