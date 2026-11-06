/* config/types/head.d.ts */
export interface OgImageAsset {
  /** Path relative to site root, e.g. /og/og-chambreasoi-01.jpg */
  path: string;
  width: number;
  height: number;
  alt: string;
}

export interface HeadConfig {
  meta: {
    url: string;
    base: string;
    metaTitle: string;
    metaDescription: string;
    author: string;
    geoRegion: string;
    geoPlaceName: string;
    geoPosition: string;
    defaultOgImage: string;
  };
  ogImages: {
    primary: OgImageAsset;
    secondary: OgImageAsset;
  };
  favicons: {
    faviconPng: string;
    appleTouchIcon: string;
    webManifest: string;
    faviconSvg: string;
    faviconPng96: string;
    faviconIco: string;
  };
}
