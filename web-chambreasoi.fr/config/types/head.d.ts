/* config/types/site.d.ts */
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
  favicons: {
    faviconPng: string;
    appleTouchIcon: string;
    webManifest: string;
    faviconSvg: string;
    faviconPng96: string;
    faviconIco: string;
  };
}
