import { resolvePathsFromWebhook } from "@config/cms-route-map";
import { ALL_PUBLIC_ROUTES } from "@config/public-routes";

export type RevalidationResolution = {
  paths: string[];
  usedFallback: boolean;
  skipped: boolean;
  skipReason?: "draft" | "unmapped_type" | "missing_type";
  webhookType?: string;
  webhookId?: string;
};

function readWebhookMeta(parsed: unknown): { type?: string; id?: string } {
  if (typeof parsed !== "object" || parsed === null) {
    return {};
  }

  const record = parsed as { _type?: unknown; _id?: unknown };

  return {
    type: typeof record._type === "string" ? record._type : undefined,
    id: typeof record._id === "string" ? record._id : undefined,
  };
}

/**
 * Map a signed Sanity webhook body to public paths for purge/warm.
 *
 * - Mapped publish events → targeted paths
 * - Draft events → skipped (no purge)
 * - Unknown `_type` → skipped (no purge)
 * - Invalid JSON → fallback to all public routes
 */
export function resolveRevalidationPaths(body: string): RevalidationResolution {
  try {
    const parsed: unknown = JSON.parse(body);
    const { type, id } = readWebhookMeta(parsed);

    if (id?.startsWith("drafts.")) {
      return {
        paths: [],
        usedFallback: false,
        skipped: true,
        skipReason: "draft",
        webhookType: type,
        webhookId: id,
      };
    }

    const mapped = resolvePathsFromWebhook(parsed);

    if (mapped) {
      return {
        paths: mapped,
        usedFallback: false,
        skipped: false,
        webhookType: type,
        webhookId: id,
      };
    }

    if (type) {
      return {
        paths: [],
        usedFallback: false,
        skipped: true,
        skipReason: "unmapped_type",
        webhookType: type,
        webhookId: id,
      };
    }

    return {
      paths: [],
      usedFallback: false,
      skipped: true,
      skipReason: "missing_type",
      webhookId: id,
    };
  } catch {
    return {
      paths: [...ALL_PUBLIC_ROUTES],
      usedFallback: true,
      skipped: false,
    };
  }
}
