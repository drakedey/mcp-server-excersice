import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import z from "zod";
import Connectable from "../conetable.interface.js";

export class MCPServer implements Connectable {

     initilizeServe(): McpServer {

        const server = new McpServer({
            name: "Calculator server",
            version: "1.0.0"
        })

        server.registerTool("add", {
            title: 'Addition tool',
            description: 'Add two numbers',
            inputSchema: {
                a: z.number(), b: z.number()
            },
            outputSchema: {
                result: z.number()
            }
        }, async ({ a, b }) => {
            const output = { result: a + b };
            console.log("Adding:", a, b, "=", output.result);
            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output
            }
        })

        server.registerTool("multiply", {
            title: 'Multiplication tool',
            description: 'Multiply two numbers',
            inputSchema: {
                a: z.number(), b: z.number()
            },
            outputSchema: {
                result: z.number()
            }
        }, async ({ a, b }) => {
            const output = { result: a * b };
            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output
            }
        })

        server.registerResource("greeting", new ResourceTemplate("greeting://{name}", { list: undefined }), { title: 'Greeting resource', description: 'Dynamic Greeting gen' }, async (uri, { name }) => ({
            contents: [{
                uri: uri.href,
                text: `Hello ${name}!`
            }]
        }))
        return server;
    }

    connectToTransport(transport: Transport): McpServer {
        const server = this.initilizeServe();
        if (!server.isConnected())
            server.connect(transport);
        return server;
    }

}