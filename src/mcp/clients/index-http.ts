import { Client } from '@modelcontextprotocol/sdk/client';
import { MCPClient } from './mcp-client.class.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { randomUUID } from 'crypto';

export const getConnectedHttpClient = async (): Promise<Client> => {
 const client = new MCPClient();
    const clientTransport = new StreamableHTTPClientTransport(new URL('http://localhost:3001/mcp'), {
        sessionId: randomUUID()
    })

    await client.connectToTransport(clientTransport);
    return client.getClient();
}