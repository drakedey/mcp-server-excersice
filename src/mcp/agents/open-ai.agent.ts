import { Client } from "@modelcontextprotocol/sdk/client";
import OpenAI from "openai";
import Agent from "./agent.interface.js";

export default class OpenAIAgent implements Agent {
    private client: Client;
    private openai: OpenAI;
    constructor(client: Client) {
        this.client = client;
        process.loadEnvFile();
        this.openai = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: process.env.GITHUB_TOKEN,
        });
    }

    async executePrompt(prompt: string, handleResponse?: (data: any) => void): Promise<any | void> {
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
                handleResponse?.(result);
            }
        }
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

    private openAiToolAdapter(tool: {
        name: string;
        description?: string;
        input_schema: any;
    }) {
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

}