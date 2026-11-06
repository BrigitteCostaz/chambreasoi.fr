import { ALL_PUBLIC_ROUTES } from "@config/public-routes";

const CMS_TYPE_TO_PATHS: Record<string, readonly string[]> = {
  foldContent: ["/"],
  headlineContent: ["/"],
  locationSectionContent: ["/"],
  organizationSettings: ALL_PUBLIC_ROUTES,
  pricingSettings: ["/", "/tarifs-et-reservation"],
  accommodationSettings: ["/", "/la-chambre", "/tarifs-et-reservation"],
  availability: ["/tarifs-et-reservation"],
  locationPageContent: ["/acces-et-localisation"],
  practicalInfoContent: ["/tarifs-et-reservation"],
  roomPageContent: ["/la-chambre"],
  surroundingsPageContent: ["/decouvrir-les-environs"],
};

export type SanityWebhookPayload = {
  _type?: unknown;
  _id?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function dedupeSortedPaths(paths: readonly string[]): string[] {
  return [...new Set(paths)].sort((a, b) => a.localeCompare(b));
}

/**
 * Map a Sanity webhook body to public site paths.
 * Returns null when _type is missing or unmapped (skip purge / IndexNow).
 */
export function resolvePathsFromWebhook(body: unknown): string[] | null {
  if (!isRecord(body)) {
    return null;
  }

  const id = typeof body._id === "string" ? body._id : "";
  if (id.startsWith("drafts.")) {
    return null;
  }

  const type = typeof body._type === "string" ? body._type : "";
  if (!type) {
    return null;
  }

  const paths = CMS_TYPE_TO_PATHS[type];
  if (!paths) {
    return null;
  }

  return dedupeSortedPaths(paths);
}
