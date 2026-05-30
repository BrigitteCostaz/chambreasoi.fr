## Data Modules

Centralized data modules are split by responsibility:

- `fallback/`: static fallback datasets used when Sanity content is missing.
- `adapters/`: pure mapping functions from CMS/raw input to render-ready models.

Each file is named by domain (`surroundings`, `practical-info`, `la-chambre`, `fold`, `location-page`, `location-section`) to keep imports explicit and avoid duplication.

## Sanity singletons (local dev)

- **surroundingsPageContent** — Studio → *Page - Bons plans* (`_id: surroundingsPageContent`). Requires 3 accordéons and **Publish**; drafts are not returned by the public API.
- **pricingSettings** — Studio → *Tarifs*; used via `getPricing()` (home fold, price section, tarifs practical-info cards).
- **practicalInfoContent** — Studio → *Page - Infos pratiques*; tarifs heading and kitchen image on `/tarifs-et-reservation`.

Align `PUBLIC_SANITY_PROJECT_ID` / dataset with `studio-chambreasoi.fr/.env` (see `.env.example` files).
