type FallbackDomain = "pricing" | "organization" | "accommodation" | "surroundings";

type FallbackCounter = Record<FallbackDomain, number>;

const counters: FallbackCounter = {
  pricing: 0,
  organization: 0,
  accommodation: 0,
  surroundings: 0,
};

export function incrementFallbackCounter(domain: FallbackDomain): void {
  counters[domain] += 1;
}

export function getFallbackCounters(): FallbackCounter {
  return { ...counters };
}
