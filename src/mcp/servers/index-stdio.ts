import { MCPServer } from "./mcp-server.class.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// When working with STDIO server should always be a subprocess so client can connect

const server = new MCPServer();
const transport = new StdioServerTransport();
server.connectToTransport(transport)
