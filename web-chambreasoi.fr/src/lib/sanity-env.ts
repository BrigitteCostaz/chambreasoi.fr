type RuntimeEnv = Record<string, unknown>;

type PublicSanityBuildEnv = {
  PUBLIC_SANITY_PROJECT_ID?: string;
  PUBLIC_SANITY_DATASET?: string;
};

function readString(env: RuntimeEnv, key: string): string | undefined {
  const value = env[key];
  return typeof value === "string" && value !== "" ? value : undefined;
}

/**
 * Merge Sanity env sources for request-time resolution.
 *
 * Cloudflare Worker bindings are authoritative in production. Build-time
 * PUBLIC_* values are only a fallback for local/dev contexts where bindings
 * are not available.
 */
export function mergeSanityRuntimeEnv(
  runtimeEnv: RuntimeEnv,
  buildEnv: PublicSanityBuildEnv
): RuntimeEnv {
  const projectId =
    readString(runtimeEnv, "SANITY_PROJECT_ID") ??
    readString(runtimeEnv, "PUBLIC_SANITY_PROJECT_ID") ??
    readString(runtimeEnv, "SANITY_STUDIO_PROJECT_ID") ??
    buildEnv.PUBLIC_SANITY_PROJECT_ID;

  const dataset =
    readString(runtimeEnv, "SANITY_DATASET") ??
    readString(runtimeEnv, "PUBLIC_SANITY_DATASET") ??
    readString(runtimeEnv, "SANITY_STUDIO_DATASET") ??
    buildEnv.PUBLIC_SANITY_DATASET;

  return {
    ...runtimeEnv,
    ...(projectId
      ? {
          PUBLIC_SANITY_PROJECT_ID: projectId,
          SANITY_PROJECT_ID: projectId,
          SANITY_STUDIO_PROJECT_ID: projectId,
        }
      : {}),
    ...(dataset
      ? {
          PUBLIC_SANITY_DATASET: dataset,
          SANITY_DATASET: dataset,
          SANITY_STUDIO_DATASET: dataset,
        }
      : {}),
  };
}
