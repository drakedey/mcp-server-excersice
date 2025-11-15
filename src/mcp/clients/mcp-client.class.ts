import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import Connectable from "../conetable.interface.js";

export class MCPClient implements Connectable {
    private client: Client;
    constructor() {
        this.client = new Client(
            {
                name: "example-client",
                version: "1.0.0"
            },
            {
                capabilities: {
                    prompts: {},
                    resources: {},
                    tools: {},
                    logging: {}
                }
            }
        );
    }

    async connectToTransport(transport: Transport) {
        await this.client.connect(transport);
    }

    getClient(): Client {
        return this.client;
    }

}