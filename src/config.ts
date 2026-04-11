import type { ApiConfig } from "../../../packages/shared";

export const API_CONFIG: ApiConfig = {
  name: "seo-analyzer",
  slug: "seo-analyzer",
  description:
    "Complete SEO audit of any URL. Extracts title, meta description, Open Graph, Twitter Card, headings, links, images, schema.org, word count, and more. Returns structured JSON with all on-page SEO signals.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/audit",
      price: "$0.02",
      description: "Full SEO audit of a single URL",
      toolName: "seo_audit_page",
      toolDescription:
        "Run a complete SEO audit on any URL. Extracts and analyzes: title tag, meta description, canonical URL, robots meta, Open Graph tags (title, description, image, type), Twitter Card tags, H1/H2 headings, internal and external link counts, images with missing alt text, word count, language, charset, viewport, favicon, Schema.org types (JSON-LD), and page load time. Returns a structured JSON report. Use when the user asks for an SEO audit, wants to check on-page SEO, analyze meta tags, find missing alt text, or review a page before publishing.",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The full URL to audit (e.g. https://example.com)",
          },
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
      toolDescription:
        "Run SEO audits on multiple URLs at once (up to 10). Same analysis as seo_audit_page but for bulk checking. Use when comparing SEO across multiple pages, auditing a sitemap, or reviewing competitor pages side by side.",
      inputSchema: {
        type: "object",
        properties: {
          urls: {
            type: "array",
            items: { type: "string" },
            description: "Array of URLs to audit (max 10)",
          },
        },
        required: ["urls"],
      },
    },
  ],
};
