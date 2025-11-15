import OpenAIAgent from "./mcp/agents/open-ai.agent.js";
import { getConnectedClient } from "./mcp/clients/index-stdio.js";
import express, { json, Request, Response } from 'express';

const client = await getConnectedClient();

const app = express();
const port = 3000;

app.use(json());

const streamResponse = (res: Response, data: string) => {
    res.write(`data: ${JSON.stringify({ content: data })}\n\n`);
}

app.post("/chat", async (req: Request, res: Response) => {
    const openAIAgent = new OpenAIAgent(client);

    try {
        // Set headers for SSE
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        });

        const prompt = req.body.prompt;

        if (!prompt) {
            res.write(`data: ${JSON.stringify({ error: "No prompt provided" })}\n\n`);
            res.end();
            return;
        }

        // Process the chat request
        const processChat = async () => {
            try {
                // Send initial message
                streamResponse(res, "Processing your request...");

                // Run the MCP client with the prompt
                await openAIAgent.executePrompt(prompt, (data: string) => {
                    streamResponse(res, data);
                })

                // Send completion signal
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                res.end();
            } catch (error) {
                console.error("Error processing chat:", error);
                streamResponse(res, "Error processing your request");
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                res.end();
            }
        };

        // Start processing
        processChat();
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
