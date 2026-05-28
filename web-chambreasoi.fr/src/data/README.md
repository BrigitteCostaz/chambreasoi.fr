## Data Modules

Centralized data modules are split by responsibility:

- `fallback/`: static fallback datasets used when Sanity content is missing.
- `adapters/`: pure mapping functions from CMS/raw input to render-ready models.

Each file is named by domain (`surroundings`, `practical-info`, `la-chambre`, `fold`, `location-page`, `location-section`) to keep imports explicit and avoid duplication.
