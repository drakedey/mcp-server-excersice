import express, { Request, Response } from "express";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { MCPClient } from "./mcp-client.class.js";
import { Readable } from "stream";
import { MCPServer } from "./mcp-server.class.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";


const app = express();
const port = 3000;

const client = new MCPClient();
app.use(express.json());

const transport = new StdioClientTransport({
    command: "node",
    args: ["./build/index.js"]
});
await client.connectToServer(transport);

function streamResponse(res: Response, data: string) {
  res.write(`data: ${JSON.stringify({ content: data })}\n\n`);
}

const httpTransport = new StreamableHTTPServerTransport({sessionIdGenerator: undefined, });
const serverWithHTTP = (new MCPServer()).connectServerToTransport(httpTransport);
const httpClientTransport = new StreamableHTTPClientTransport({});
const clientWithHTTP = new MCPClient();
clientWithHTTP.connectToServer(httpTransport);

app.post('/mcp', )

app.post("/chat", async (req: Request, res: Response) => {
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

    // Create a readable stream for the response
    const responseStream = new Readable({
      read() {}
    });

    // Process the chat request
    const processChat = async () => {
      try {
        // Send initial message
        streamResponse(res, "Processing your request...");
        
        // Run the MCP client with the prompt
        await client.run(prompt, res);
        
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



// await client.connectToServer(transport);