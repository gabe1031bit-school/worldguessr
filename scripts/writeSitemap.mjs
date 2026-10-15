
import fs from "fs";
import path from "path";

const exportDir = path.resolve(process.env.NEXT_DIST_DIR || "out");

// Static export writes into out/. Server deployments use public/.
const outDir = fs.existsSync(exportDir)
  ? exportDir
  : path.resolve("public");

fs.mkdirSync(outDir, { recursive: true });

const sitemapPath = path.join(outDir, "sitemap-pages.xml");

// Read generated routes if the export manifest exists.
const manifestPath = path.join(exportDir, "prerender-manifest.json");

let routes = [];

if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(manifestPath, "utf8")
    );

    routes = Object.keys(manifest.routes || {});
  } catch (error) {
    console.warn("Could not read prerender manifest:", error.message);
  }
}

if (routes.length === 0) {
  console.log(
    "No prerender manifest found; writing a minimal sitemap."
  );

  routes = ["/"];
}

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://worldguessr.com"
).replace(/\/+$/, "");

const urls = [...new Set(routes)]
  .filter((route) => !route.startsWith("/404"))
  .map((route) => {
    const cleanRoute = route === "/" ? "" : route;

    return `  <url><loc>${baseUrl}${cleanRoute}</loc></url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemap, "utf8");

console.log(`Sitemap written to ${sitemapPath}`);
