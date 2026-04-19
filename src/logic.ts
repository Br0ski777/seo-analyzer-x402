import type { Hono } from "hono";
import { parse, type HTMLElement } from "node-html-parser";


// ATXP: requirePayment only fires inside an ATXP context (set by atxpHono middleware).
// For raw x402 requests, the existing @x402/hono middleware handles the gate.
// If neither protocol is active (ATXP_CONNECTION unset), tryRequirePayment is a no-op.
async function tryRequirePayment(price: number): Promise<void> {
  if (!process.env.ATXP_CONNECTION) return;
  try {
    const { requirePayment } = await import("@atxp/server");
    const BigNumber = (await import("bignumber.js")).default;
    await requirePayment({ price: BigNumber(price) });
  } catch (e: any) {
    if (e?.code === -30402) throw e;
  }
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TIMEOUT_MS = 10_000;
const MAX_BATCH = 10;

interface SeoResult {
  url: string;
  status_code: number;
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots_meta: string | null;
  og: { title: string | null; description: string | null; image: string | null; type: string | null; url: string | null };
  twitter: { card: string | null; title: string | null; description: string | null; image: string | null };
  h1: string[];
  h2: string[];
  links: { internal: number; external: number };
  images: { total: number; without_alt: number };
  word_count: number;
  lang: string | null;
  charset: string | null;
  viewport: string | null;
  favicon: string | null;
  schema_types: string[];
  load_time_ms: number;
  seo_score: number;
  issues: string[];
}

function getMeta(root: HTMLElement, name: string): string | null {
  const el = root.querySelector(`meta[name="${name}"]`) || root.querySelector(`meta[name="${name.toLowerCase()}"]`);
  return el?.getAttribute("content") ?? null;
}

function getOg(root: HTMLElement, prop: string): string | null {
  return root.querySelector(`meta[property="og:${prop}"]`)?.getAttribute("content") ?? null;
}

function getTwitter(root: HTMLElement, name: string): string | null {
  return (root.querySelector(`meta[name="twitter:${name}"]`) || root.querySelector(`meta[property="twitter:${name}"]`))?.getAttribute("content") ?? null;
}

async function auditUrl(url: string): Promise<SeoResult> {
  const start = performance.now();
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
  });

  const html = await response.text();
  const loadTime = Math.round(performance.now() - start);
  const root = parse(html);

  const title = root.querySelector("title")?.text?.trim() ?? null;
  const description = getMeta(root, "description");
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;
  const robotsMeta = getMeta(root, "robots");

  const og = { title: getOg(root, "title"), description: getOg(root, "description"), image: getOg(root, "image"), type: getOg(root, "type"), url: getOg(root, "url") };
  const twitter = { card: getTwitter(root, "card"), title: getTwitter(root, "title"), description: getTwitter(root, "description"), image: getTwitter(root, "image") };

  const h1 = root.querySelectorAll("h1").map((el) => el.text.trim());
  const h2 = root.querySelectorAll("h2").map((el) => el.text.trim());

  const parsedUrl = new URL(url);
  let internal = 0, external = 0;
  for (const link of root.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    if (!href) continue;
    try {
      const linkUrl = new URL(href, url);
      linkUrl.hostname === parsedUrl.hostname ? internal++ : external++;
    } catch { internal++; }
  }

  const allImages = root.querySelectorAll("img");
  const withoutAlt = allImages.filter((img) => { const alt = img.getAttribute("alt"); return !alt || alt.trim() === ""; });

  const bodyText = root.querySelector("body")?.text ?? "";
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;

  const lang = root.querySelector("html")?.getAttribute("lang") ?? null;
  const charset = root.querySelector("meta[charset]")?.getAttribute("charset") ?? null;
  const viewport = getMeta(root, "viewport");
  const favicon = root.querySelector('link[rel="icon"]')?.getAttribute("href") ?? root.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ?? null;

  const schemaTypes: string[] = [];
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const json = JSON.parse(script.text);
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item["@type"]) schemaTypes.push(...(Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]]));
      }
    } catch {}
  }

  // Score and issues
  const issues: string[] = [];
  let score = 100;

  if (!title) { score -= 15; issues.push("Missing <title> tag"); }
  else if (title.length < 30) { score -= 5; issues.push("Title too short (< 30 chars)"); }
  else if (title.length > 60) { score -= 5; issues.push("Title too long (> 60 chars)"); }

  if (!description) { score -= 15; issues.push("Missing meta description"); }
  else if (description.length < 120) { score -= 5; issues.push("Meta description too short (< 120 chars)"); }
  else if (description.length > 160) { score -= 5; issues.push("Meta description too long (> 160 chars)"); }

  if (h1.length === 0) { score -= 10; issues.push("Missing H1 tag"); }
  else if (h1.length > 1) { score -= 5; issues.push(`Multiple H1 tags (${h1.length})`); }

  if (!canonical) { score -= 5; issues.push("Missing canonical URL"); }
  if (!og.title) { score -= 5; issues.push("Missing og:title"); }
  if (!og.description) { score -= 3; issues.push("Missing og:description"); }
  if (!og.image) { score -= 5; issues.push("Missing og:image"); }
  if (!viewport) { score -= 10; issues.push("Missing viewport meta tag (not mobile-friendly)"); }
  if (!lang) { score -= 5; issues.push("Missing lang attribute on <html>"); }

  if (withoutAlt.length > 0) { score -= Math.min(10, withoutAlt.length * 2); issues.push(`${withoutAlt.length} images missing alt text`); }
  if (wordCount < 300) { score -= 10; issues.push("Thin content (< 300 words)"); }
  if (schemaTypes.length === 0) { score -= 5; issues.push("No Schema.org structured data found"); }

  return {
    url, status_code: response.status, title, description, canonical, robots_meta: robotsMeta,
    og, twitter, h1, h2, links: { internal, external },
    images: { total: allImages.length, without_alt: withoutAlt.length },
    word_count: wordCount, lang, charset, viewport, favicon, schema_types: schemaTypes,
    load_time_ms: loadTime, seo_score: Math.max(0, score), issues,
  };
}

export function registerRoutes(app: Hono) {
  app.get("/api/audit", async (c) => {
    await tryRequirePayment(0.02);
    const url = c.req.query("url");
    if (!url) return c.json({ error: "Missing 'url' query parameter" }, 400);
    try { new URL(url); } catch { return c.json({ error: "Invalid URL" }, 400); }
    try {
      return c.json(await auditUrl(url));
    } catch (err: any) {
      return c.json({ error: err.name === "AbortError" ? "Request timed out" : err.message, url }, 500);
    }
  });

  app.post("/api/audit/batch", async (c) => {
    await tryRequirePayment(0.15);
    const body = await c.req.json<{ urls?: string[] }>();
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0)
      return c.json({ error: "Missing 'urls' array" }, 400);
    if (body.urls.length > MAX_BATCH)
      return c.json({ error: `Maximum ${MAX_BATCH} URLs per batch` }, 400);

    const results = await Promise.allSettled(body.urls.map(auditUrl));
    return c.json(results.map((r, i) =>
      r.status === "fulfilled" ? r.value : { url: body.urls![i], error: r.reason?.message }
    ));
  });
}
