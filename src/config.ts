import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "seo-analyzer",
  slug: "seo-analyzer",
  description: "Full on-page SEO audit for any URL. Score 0-100, meta tags, headings, schema markup, images, links, load time. Prioritized fixes.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/audit",
      price: "$0.02",
      description: "Full SEO audit of a single URL",
      toolName: "seo_audit_page",
      toolDescription: `Use this when you need to analyze a webpage's on-page SEO health. Returns a structured JSON audit with score 0-100 and prioritized recommendations.

1. score (number 0-100) -- overall SEO health score
2. title -- tag content, length, keyword presence
3. metaDescription -- content, length, truncation risk
4. canonical -- canonical URL and self-referencing check
5. headings -- H1/H2/H3 hierarchy, count, missing H1 flag
6. links -- internal count, external count, broken link flags
7. images -- total count, missing alt text count
8. schema -- Schema.org types detected (Article, Product, FAQ, etc.)
9. openGraph -- og:title, og:image, og:description completeness
10. performance -- page load time in ms, word count
11. issues -- prioritized array of problems with severity (critical/warning/info)

Example output: {"score":72,"title":{"content":"My Page","length":7},"headings":{"h1":1,"h2":3},"images":{"total":5,"missingAlt":2},"issues":[{"severity":"critical","message":"Missing meta description"}]}

Use this BEFORE optimizing any webpage, writing SEO recommendations, or auditing a client's site. Essential for competitive page-level analysis and content audits.

Do NOT use for content extraction -- use web_scrape_to_markdown instead. Do NOT use for screenshots -- use capture_screenshot instead. Do NOT use for tech detection -- use website_detect_tech_stack instead. Do NOT use for domain-level data (WHOIS/DNS) -- use domain_lookup_intelligence instead.`,
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
      toolDescription: `Use this when you need to compare SEO health across multiple pages at once (up to 10 URLs). Returns the same full audit as seo_audit_page for each URL in a single call.

1. results (array) -- each entry contains the full SEO audit (score, title, meta, headings, links, images, schema, issues)
2. summary -- average score, worst-performing URL, most common issues across all pages

Example output: {"results":[{"url":"https://a.com","score":85},{"url":"https://b.com","score":62}],"summary":{"avgScore":73,"worstUrl":"https://b.com"}}

Use this FOR competitor analysis, sitemap audits, or comparing landing pages side by side. Essential when benchmarking multiple pages in one workflow.

Do NOT use for single URLs -- use seo_audit_page instead. Do NOT use for content extraction -- use web_scrape_batch instead.`,
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
