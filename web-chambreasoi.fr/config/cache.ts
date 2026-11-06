type CmsCacheResetter = () => void;

let epoch = 0;
const resetters = new Set<CmsCacheResetter>();

export function getCmsCacheEpoch(): number {
  return epoch;
}

export function registerCmsCacheResetter(resetter: CmsCacheResetter): () => void {
  resetters.add(resetter);

  return () => {
    resetters.delete(resetter);
  };
}

export function invalidateCmsCache(): number {
  epoch += 1;

  for (const resetter of resetters) {
    try {
      resetter();
    } catch (error) {
      console.error("[cms-cache] Failed to reset cache", error);
    }
  }

  return epoch;
}
