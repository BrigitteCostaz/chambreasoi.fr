import { sitemap } from "@config/pages";
import type { LegalLinkItem, NavLinkItem } from "@config/types/navigation";

export const headerNavigation: NavLinkItem[] = [
  {
    pageKey: "home",
    text: "Accueil",
    link: sitemap.home.path,
    icon: "tabler/home",
    showInDesktopNav: false,
    accentColor: "Forest",
  },
  {
    pageKey: "room",
    text: sitemap.room.titleNav ?? sitemap.room.title,
    link: sitemap.room.path,
    icon: "ion/bed-sharp",
    showInDesktopNav: true,
    accentColor: "Stone",
  },
  {
    pageKey: "reservations",
    text: sitemap.reservations.titleNav ?? sitemap.reservations.title,
    link: sitemap.reservations.path,
    icon: "ion/calendar-sharp",
    showInDesktopNav: true,
    accentColor: "Stone",
  },
  {
    pageKey: "location",
    text: sitemap.location.titleNav ?? sitemap.location.title,
    link: sitemap.location.path,
    icon: "ion/navigate-sharp",
    showInDesktopNav: true,
    accentColor: "Stone",
  },
  {
    pageKey: "surroundings",
    text: sitemap.surroundings.titleNav ?? sitemap.surroundings.title,
    link: sitemap.surroundings.path,
    icon: "ion/binocular-sharp",
    showInDesktopNav: true,
    accentColor: "Bistre",
  },
];

export const footerNavigation: NavLinkItem[] = [
  // Can be a subset or different ordering
  ...headerNavigation.map((item) => ({ ...item, icon: undefined })),
];

export const legalNavigation: LegalLinkItem[] = [
  {
    pageKey: "mentionsLegales",
    text: sitemap.mentionsLegales.titleNav ?? sitemap.mentionsLegales.title,
    link: sitemap.mentionsLegales.path,
  },
  {
    pageKey: "politiqueConfidentialite",
    text: sitemap.politiqueConfidentialite.titleNav ?? sitemap.politiqueConfidentialite.title,
    link: sitemap.politiqueConfidentialite.path,
  },
];
