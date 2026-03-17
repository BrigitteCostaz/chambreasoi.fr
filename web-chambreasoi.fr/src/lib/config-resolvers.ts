export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function resolveString(fallback: string, cms: unknown): string {
  return isNonEmptyString(cms) ? cms.trim() : fallback;
}

export function resolveNumber(fallback: number, cms: unknown): number {
  return typeof cms === "number" && Number.isFinite(cms) ? cms : fallback;
}

export function resolveStringArray(fallback: string[], cms: unknown): string[] {
  return Array.isArray(cms) && cms.length > 0
    ? cms.filter((value): value is string => isNonEmptyString(value))
    : fallback;
}
