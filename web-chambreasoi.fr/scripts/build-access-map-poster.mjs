// scripts/build-access-map-poster.mjs
/**
 * One-shot stitch of the four OSM tiles that cover the access-page map
 * at zoom 13. Run manually: `node scripts/build-access-map-poster.mjs`
 * (not wired into `astro build`, so deploys never hit the tile server).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../src/assets/maps");
const OUT_FILE = path.join(OUT_DIR, "acces-poster.webp");

/** Zoom-13 tile indices covering the chambre / Médipôle viewport. */
const TILES = [
  { x: 4231, y: 2928, left: 0, top: 0 },
  { x: 4232, y: 2928, left: 1, top: 0 },
  { x: 4231, y: 2929, left: 0, top: 1 },
  { x: 4232, y: 2929, left: 1, top: 1 },
];

const ZOOM = 13;
const TARGET_WIDTH = 1024;
const USER_AGENT = "chambreasoi.fr-map-poster/1.0 (local build; contact: contact@chambreasoi.fr)";

/**
 * Tries @2x retina tiles first, then falls back to standard 256px tiles.
 * @param {number} x
 * @param {number} y
 * @returns {Promise<Buffer>}
 */
async function fetchTile(x, y) {
  const candidates = [
    `https://tile.openstreetmap.org/${ZOOM}/${x}/${y}@2x.png`,
    `https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`,
  ];

  for (const url of candidates) {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "image/png" },
    });
    if (res.ok) {
      console.log(`fetched ${url}`);
      return Buffer.from(await res.arrayBuffer());
    }
    console.warn(`miss ${url} → ${res.status}`);
  }

  throw new Error(`Could not fetch OSM tile ${ZOOM}/${x}/${y}`);
}

async function main() {
  const buffers = await Promise.all(TILES.map((t) => fetchTile(t.x, t.y)));

  const metas = await Promise.all(buffers.map((buf) => sharp(buf).metadata()));
  const tileW = Math.min(...metas.map((m) => m.width ?? 256));
  const tileH = Math.min(...metas.map((m) => m.height ?? 256));

  const composites = await Promise.all(
    TILES.map(async (tile, i) => {
      const resized = await sharp(buffers[i])
        .resize(tileW, tileH, { fit: "fill" })
        .png()
        .toBuffer();
      return {
        input: resized,
        left: tile.left * tileW,
        top: tile.top * tileH,
      };
    })
  );

  const attributionSvg = Buffer.from(`
    <svg width="${tileW * 2}" height="${tileH * 2}" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="${tileH * 2 - 28}" width="148" height="18" rx="2" fill="rgba(255,255,255,0.85)"/>
      <text x="16" y="${tileH * 2 - 15}" font-family="sans-serif" font-size="12" fill="#333">© OpenStreetMap</text>
    </svg>
  `);

  const stitched = await sharp({
    create: {
      width: tileW * 2,
      height: tileH * 2,
      channels: 3,
      background: { r: 240, g: 240, b: 240 },
    },
  })
    .composite([...composites, { input: attributionSvg, left: 0, top: 0 }])
    .resize(TARGET_WIDTH)
    .webp({ quality: 75 })
    .toBuffer();

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, stitched);
  console.log(`wrote ${OUT_FILE} (${stitched.byteLength} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
