import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import Connectable from "../conetable.interface.js";
import { randomUUID, UUID } from "crypto";
import { ListResourcesResultSchema, LoggingMessageNotificationSchema, ResourceListChangedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

// TODO: research... There should be a better way to do this...
const CAPABILITIES = {
    prompts: {},
    resources: {},
    tools: {},
    logging: {},
    roots: { listChanged: true }
}
const CLIENT_INFO = {
    name: "example-client",
    version: "1.0.0",

}
export class MCPClient implements Connectable {
    private client: Client;
    private uuid: UUID;

    constructor(uuid?: UUID) {
        this.client = new Client(
            CLIENT_INFO,
            {
                capabilities: CAPABILITIES
            }
        );

        this.uuid = uuid || randomUUID();

        this.client.onerror = (error) => {
            console.error(error, ":", this.uuid);
        }

        this.client.setNotificationHandler(LoggingMessageNotificationSchema, (notification) => {
            console.log(`INCOMING NOTIFICATION: ${this.uuid}: [${notification.params.level}] - ${notification.params.data}`)
        });

        this.client.setNotificationHandler(
            ResourceListChangedNotificationSchema,
            async (_) => {
                console.log(`\nResource list changed notification received! [${this.uuid}]`);
                try {
                    if (!this.client) {
                        console.log(`Client [${this.uuid}] disconnected, cannot fetch resources`);
                        return;
                    }
                    const resourcesResult = await this.client.request(
                        {
                            method: "resources/list",
                            params: {},
                        },
                        ListResourcesResultSchema
                    );
                    console.log(
                        `[${this.uuid}] Available resources count:`,
                        resourcesResult.resources.length
                    );
                } catch {
                    console.log(`Failed to list resources after change notification - ${this.uuid}`);
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