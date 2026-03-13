import type { NavLinkItem, LegalLinkItem } from "@config/types/navigation";
import { sitemap } from "@config/pages";

export const headerNavigation: NavLinkItem[] = [
  {
    pageKey: "home",
    text: "Accueil",
    link: sitemap.home.path,
    icon: "tabler/home",
    showInDesktopNav: true,
  },
  {
    pageKey: "room",
    text: sitemap.room.title,
    link: sitemap.room.path,
    icon: "tabler/bed",
    showInDesktopNav: true,
  },
  {
    pageKey: "reservations",
    text: sitemap.reservations.title,
    link: sitemap.reservations.path,
    icon: "tabler/calendar",
    showInDesktopNav: true,
  },
  {
    pageKey: "location",
    text: sitemap.location.title,
    link: sitemap.location.path,
    icon: "tabler/map-pin",
    showInDesktopNav: true,
  },
  {
    pageKey: "surroundings",
    text: sitemap.surroundings.title,
    link: sitemap.surroundings.path,
    icon: "tabler/compass",
    showInDesktopNav: true,
  },
];

export const footerNavigation: NavLinkItem[] = [
  // Can be a subset or different ordering
  ...headerNavigation.map(item => ({ ...item, icon: undefined })),
];
