import { describe, expect, it } from "vitest";
import { mergeSanityRuntimeEnv } from "./sanity-env";

describe("mergeSanityRuntimeEnv", () => {
  it("keeps Cloudflare Worker Sanity bindings ahead of build-time public values", () => {
    expect(
      mergeSanityRuntimeEnv(
        {
          PUBLIC_SANITY_PROJECT_ID: "runtime-project",
          PUBLIC_SANITY_DATASET: "runtime-dataset",
          SANITY_PROJECT_ID: "runtime-project",
          SANITY_DATASET: "runtime-dataset",
        },
        {
          PUBLIC_SANITY_PROJECT_ID: "build-project",
          PUBLIC_SANITY_DATASET: "build-dataset",
        }
      )
    ).toMatchObject({
      PUBLIC_SANITY_PROJECT_ID: "runtime-project",
      PUBLIC_SANITY_DATASET: "runtime-dataset",
      SANITY_PROJECT_ID: "runtime-project",
      SANITY_DATASET: "runtime-dataset",
      SANITY_STUDIO_PROJECT_ID: "runtime-project",
      SANITY_STUDIO_DATASET: "runtime-dataset",
    });
  });

  it("uses build-time public values when runtime bindings are missing", () => {
    expect(
      mergeSanityRuntimeEnv(
        {},
        {
          PUBLIC_SANITY_PROJECT_ID: "build-project",
          PUBLIC_SANITY_DATASET: "build-dataset",
        }
      )
    ).toMatchObject({
      PUBLIC_SANITY_PROJECT_ID: "build-project",
      PUBLIC_SANITY_DATASET: "build-dataset",
      SANITY_PROJECT_ID: "build-project",
      SANITY_DATASET: "build-dataset",
      SANITY_STUDIO_PROJECT_ID: "build-project",
      SANITY_STUDIO_DATASET: "build-dataset",
    });
  });
});
