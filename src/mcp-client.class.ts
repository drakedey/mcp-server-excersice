import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { Response } from "express";
import OpenAI from "openai";
import { z } from "zod"; // Import zod for schema validation

export class MCPClient {
    private openai: OpenAI;
    private client: Client;
    constructor() {
        process.loadEnvFile();
        this.openai = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: process.env.GITHUB_TOKEN,
        });

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

    async run(prompt: string, res: Response) {
        const toolsFromServer = await this.client.listTools();

        const tools = toolsFromServer.tools.map((tool) => {
            return this.openAiToolAdapter({
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            });
        });

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
            role: 'user',
            content: prompt
        }]

        console.log('Querying LLM: ', messages[0].content);

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 1000,
            messages,
            tools
        });

        let results: any[] = [];
        for await (const choice of response.choices) {
            const { message } = choice;
            if (message.tool_calls) {
                const result = await this.callTools(message.tool_calls, results);
                console.log(res.writableEnded);
                res.write(`data: ${result}\n\n`);
            }
        }
    }

    private openAiToolAdapter(tool: {
        name: string;
        description?: string;
        input_schema: any;
    }) {
        // Create a zod schema based on the input_schema
        const schema = z.object(tool.input_schema);

        return {
            type: "function" as const, // Explicitly set type to "function"
            function: {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: "object",
                    properties: tool.input_schema.properties,
                    required: tool.input_schema.required,
                },
            },
        };
    }

    async callTools(
        tool_calls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
        toolResults: any[]
    ) {
        for (const tool_call of tool_calls) {
            const toolName = tool_call.type === 'function' && tool_call.function.name || '';
            const args = tool_call.type === 'function' && tool_call.function.arguments || '';

            console.log(`Calling tool ${toolName} with args ${JSON.stringify(args)}`);


            // 2. Call the server's tool 
            const toolResult = await this.client.callTool({
                name: toolName,
                arguments: JSON.parse(args),
            });

            console.log("Tool result: ", toolResult);
            return JSON.stringify(toolResult);

        }
    }

}