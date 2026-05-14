import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://mirandacoast.com.br";
const OUTPUT_PATH = resolve("public", "sitemap.xml");

const staticRoutes = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/loja", changefreq: "daily", priority: "0.9" },
  { path: "/novidades", changefreq: "weekly", priority: "0.8" },
  { path: "/sobre", changefreq: "monthly", priority: "0.6" },
  { path: "/contato", changefreq: "monthly", priority: "0.6" },
  { path: "/rastreamento", changefreq: "monthly", priority: "0.4" },
  { path: "/politica-troca", changefreq: "yearly", priority: "0.4" },
  { path: "/politica-de-privacidade", changefreq: "yearly", priority: "0.3" },
  { path: "/politica-de-cookies", changefreq: "yearly", priority: "0.3" },
];

const today = new Date().toISOString().slice(0, 10);

const loadDotEnv = () => {
  const envPath = resolve(".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim();
  }
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const routeToXml = ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${escapeXml(changefreq)}</changefreq>
    <priority>${escapeXml(priority)}</priority>
  </url>`;

const fetchProductRoutes = async () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  const endpoint = new URL("/rest/v1/products", supabaseUrl);
  endpoint.searchParams.set("select", "id,updated_at");
  endpoint.searchParams.set("is_active", "eq.true");
  endpoint.searchParams.set("order", "updated_at.desc");

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      console.warn(`Sitemap products skipped: Supabase returned ${response.status}`);
      return [];
    }

    const products = await response.json();
    if (!Array.isArray(products)) return [];

    return products.map((product) => ({
      loc: `${SITE_URL}/produto/${product.id}`,
      lastmod: product.updated_at ? String(product.updated_at).slice(0, 10) : today,
      changefreq: "weekly",
      priority: "0.7",
    }));
  } catch (error) {
    console.warn(`Sitemap products skipped: ${error instanceof Error ? error.message : "unknown error"}`);
    return [];
  }
};

loadDotEnv();

const staticUrls = staticRoutes.map((route) => ({
  loc: `${SITE_URL}${route.path === "/" ? "/" : route.path}`,
  lastmod: today,
  changefreq: route.changefreq,
  priority: route.priority,
}));
const productUrls = await fetchProductRoutes();
const urls = [...staticUrls, ...productUrls];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(routeToXml).join("\n")}
</urlset>
`;

mkdirSync(resolve("public"), { recursive: true });
writeFileSync(OUTPUT_PATH, sitemap);

console.log(`Sitemap generated with ${urls.length} URLs`);
