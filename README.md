# SEO Page Analyzer

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://seo-analyzer.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Full on-page SEO audit for any URL. Score 0-100, meta tags, headings, schema markup, images, links, load time. Prioritized fixes. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "seo-analyzer": {
      "url": "https://seo-analyzer.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl "https://seo-analyzer.api.klymax402.com/api/audit?url=https://example.com"
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `seo_audit_page` | GET | `/api/audit` | $0.06 | Full SEO audit of a single URL |
| `seo_audit_batch` | POST | `/api/audit/batch` | $0.40 | SEO audit of up to 10 URLs in batch |

### `seo_audit_page`

Use this when you need to analyze a webpage's on-page SEO health. Returns a structured JSON audit with score 0-100 and prioritized recommendations.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `url` | string | yes | Full URL to audit (e.g. https://example.com) |

Example response:

```json
{"score":72,"title":{"content":"My Page","length":7},"headings":{"h1":1,"h2":3},"images":{"total":5,"missingAlt":2},"issues":[{"severity":"critical","message":"Missing meta description"}]}
```

**When to use**: optimizing any webpage, writing SEO recommendations, or auditing a client's site. Essential for competitive page-level analysis and content audits.

**Not for**: content extraction (use `web_scrape_to_markdown`), screenshots (use `capture_screenshot`), tech detection (use `website_detect_tech_stack`).

### `seo_audit_batch`

Use this when you need to compare SEO health across multiple pages at once (up to 10 URLs). Returns the same full audit as seo_audit_page for each URL in a single call.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `urls` | array | yes | Array of URLs (max 10) |

Example response:

```json
{"results":[{"url":"https://a.com","score":85},{"url":"https://b.com","score":62}],"summary":{"avgScore":73,"worstUrl":"https://b.com"}}
```

**When to use**: competitor analysis, sitemap audits, or comparing landing pages side by side. Essential when benchmarking multiple pages in one workflow.

**Not for**: single URLs (use `seo_audit_page`), content extraction (use `web_scrape_batch`).

## Example agent prompts

- "Analyze a webpage's on-page SEO health"
- "Compare SEO health across multiple pages at once (up to 10 URLs)"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
