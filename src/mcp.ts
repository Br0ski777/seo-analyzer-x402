import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { API_CONFIG } from "./config";
import { buildMcpTools } from "../../../packages/shared";

const server = new McpServer({ name: API_CONFIG.name, version: API_CONFIG.version });
const tools = buildMcpTools(API_CONFIG.routes);
const API_BASE = process.env.API_BASE_URL || "http://localhost:3000";

for (const tool of tools) {
  server.tool(tool.name, tool.description, tool.inputSchema as any, async (params: Record<string, unknown>) => {
    const route = tool._route;
    let url = `${API_BASE}${route.path}`;
    let response: Response;
    if (route.method === "GET") {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) if (v != null) sp.set(k, String(v));
      url += `?${sp.toString()}`;
      response = await fetch(url);
    } else {
      response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params) });
    }
    return { content: [{ type: "text", text: JSON.stringify(await response.json(), null, 2) }] };
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);
