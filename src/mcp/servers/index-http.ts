import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import express, { json, Request, Response } from 'express';
import InMemoryEventStore from '../utils/in-memory-event-store.class.js';
import { randomUUID } from 'crypto';
import { MCPServer } from './mcp-server.class.js';
const app = express();
const port = 3001;

app.use(json());

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.post('/mcp', async (req: Request, res: Response) => {
    try {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;
        console.log('\n\n')
        console.log(`sessionId: ${sessionId} - headers: ${JSON.stringify(req.headers)} - isInitializeRequest: ${isInitializeRequest(req.body)}`)
        console.log(req.body);
        if (sessionId && transports[sessionId]) {
            // Fetch existing transport
            transport = transports[sessionId];
            console.log('EXISTING TRANSPORT FOR SESSION ID: ', sessionId);
        } else if (!sessionId && isInitializeRequest(req.body)) {

            console.log('INITIALIZE REQUEST: ', req.body);
            // Create new transport for new session
            const eventStore = new InMemoryEventStore();
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                eventStore,
                onsessioninitialized: (sessionId) => {
                    console.log('session initialized with ID: ' + sessionId);
                    transports[sessionId] = transport
                }
            })

            transport.onclose = () => {
                const sid = transport.sessionId;
                if (sid && transports[sid]) {
                    console.log(`Transport closed: ${sid}`)
                    delete transports[sid];
                }
            }

            const server = new MCPServer();
            await server.connectToTransport(transport)
            console.log('REQUEST HANDLED');
            await transport.handleRequest(req, res, req.body);
            return;
        } else {
            // Invalid request - no session ID or not an initialization request
            console.log('RETURNING ERROR');
            res.status(400).json({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Bad Request: No valid session ID provided",
                },
                id: null,
            });
            return;
        }
        await transport.handleRequest(req, res, req.body);
        return;
    } catch (e) {
        console.log(e);
        res.status(400).json({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Bad Request: No valid session ID provided",
            },
            id: null,
        });
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});