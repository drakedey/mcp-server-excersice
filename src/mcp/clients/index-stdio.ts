import { MCPClient } from "./mcp-client.class.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export const getConnectedClient = async (): Promise<Client> => {
    const client = new MCPClient();
    const clientTransport = new StdioClientTransport({
        command: 'node',
        args: ['./build/mcp/servers/index-stdio.js']
    })

    await client.connectToTransport(clientTransport);
    return client.getClient();
}