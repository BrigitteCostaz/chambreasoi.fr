/**
 * Centralised GROQ query constants.
 *
 * Keep all queries here so they are shared across the Astro web app
 * and any other consumer (scripts, previews, tests…).
 *
 * Rules:
 * - Export plain strings only — no execution, no client imports.
 * - Name queries with a consistent pattern: `<TYPE>_QUERY` / `<TYPE>_BY_SLUG_QUERY`.
 * - Use GROQ parameter placeholders ($slug, $id, etc.) for dynamic values.
 */

// ---------------------------------------------------------------------------
// testContent
// ---------------------------------------------------------------------------

/** Fetch all testContent documents (list view). */
export const TEST_CONTENT_LIST_QUERY = /* groq */ `
  *[_type == "testContent"] | order(_createdAt desc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    image {
      asset->,
      alt
    }
  }
`;

/** Fetch a single testContent document by slug. */
export const TEST_CONTENT_BY_SLUG_QUERY = /* groq */ `
  *[_type == "testContent" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    body,
    image {
      asset->,
      alt
    }
  }
`;

// ---------------------------------------------------------------------------
// Site settings (example — uncomment when schema exists)
// ---------------------------------------------------------------------------

// export const SITE_SETTINGS_QUERY = /* groq */ `
//   *[_type == "siteSettings"][0] {
//     title,
//     description,
//     ogImage {
//       asset->,
//       alt
//     }
//   }
// `;
