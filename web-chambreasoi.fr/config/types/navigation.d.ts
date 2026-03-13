/* config/types/navigation.d.ts */

// Common fields shared by all link items
export interface BaseLinkItem {
  text?: string;
  link: `/${string}` | `https://${string}`;
  newTab?: boolean;
  icon?: string;
}

// Navigation
export interface NavLinkItem extends BaseLinkItem {
  pageKey?: keyof typeof sitemap;
  button?: "primary" | "secondary" | "ghost";
  showInDesktopNav?: boolean;
}

// Legal
export interface LegalLinkItem extends BaseLinkItem { }

// Social
export interface SocialLinkItem extends BaseLinkItem { }
