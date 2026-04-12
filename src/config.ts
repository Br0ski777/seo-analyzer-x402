import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "seo-analyzer",
  slug: "seo-analyzer",
  description: "Complete on-page SEO audit of any URL with score 0-100 and prioritized recommendations.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/audit",
      price: "$0.02",
      description: "Full SEO audit of a single URL",
      toolName: "seo_audit_page",
      toolDescription: "Use this when you need to analyze a webpage's SEO health. Returns: title tag analysis, meta description check, canonical URL, robots meta, Open Graph tags, Twitter Card, H1/H2 heading hierarchy, internal vs external link count, images missing alt text, word count, Schema.org types, page load time ms, and SEO score 0-100 with prioritized issues. Do NOT use for keyword research or backlink analysis. Do NOT use for content extraction — use web_scrape_to_markdown. Do NOT use for screenshots — use capture_screenshot. Do NOT use for tech detection — use website_detect_tech_stack.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "Full URL to audit (e.g. https://example.com)" },
        },
        required: ["url"],
      },
    },
    {
      method: "POST",
      path: "/api/audit/batch",
      price: "$0.15",
      description: "SEO audit of up to 10 URLs in batch",
      toolName: "seo_audit_batch",
      toolDescription: "Use this when you need to compare SEO across multiple pages (up to 10). Same analysis as seo_audit_page for each URL. Ideal for competitor analysis or sitemap auditing. Do NOT use for single URLs — use seo_audit_page.",
      inputSchema: {
        type: "object",
        properties: {
          urls: { type: "array", items: { type: "string" }, description: "Array of URLs (max 10)" },
        },
        required: ["urls"],
      },
    },
  ],
};
