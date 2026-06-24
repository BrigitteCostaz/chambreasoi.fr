# Data Modules

Centralized data modules are split by responsibility:

- `fallback/`: static fallback datasets used when Sanity content is missing.
- `adapters/`: pure mapping functions from CMS/raw input to render-ready models.

Each file is named by domain (`surroundings`, `practical-info`, `la-chambre`, `fold`, `location-page`, `location-section`) to keep imports explicit and avoid duplication.

## Sanity singletons (local dev)

Studio singletons use fixed document IDs (`roomPageContent`, `foldContent`, etc.). GROQ queries must filter on `_id` — not `[0]` alone — because legacy duplicate documents may exist in the dataset.

- **roomPageContent** — Studio → *Page - La chambre* (`_id: roomPageContent`)
- **surroundingsPageContent** — Studio → *Page - Bons plans* (`_id: surroundingsPageContent`). Includes **Image d’introduction** (intro hero column), galerie page, 3 accordéons; requires **Publish** (drafts are not returned by the public API).
- **pricingSettings** — Studio → *Tarifs*; used via `getPricing()` (home fold, price section, tarifs practical-info cards).
- **practicalInfoContent** — Studio → *Page - Infos pratiques* (`_id: practicalInfoContent`); disponibilités, tarifs, modalités et services on `/tarifs-et-reservation`. Requires **Publish** (drafts are not returned by the public API).

Align `PUBLIC_SANITY_PROJECT_ID` / dataset with `studio-chambreasoi.fr/.env` (see `.env.example` files).
