import { MCPClient } from "./mcp-client.class.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const getConnectedClient = async () => {
    const client = new MCPClient();
    const clientTransport = new StdioClientTransport({
        command: 'node',
        args: ['./build/mcp/servers/index-stdio.js']
    })

    await client.connectToTransport(clientTransport);
    return client.getClient();
}