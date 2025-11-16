# Getting Started
## Running STDIO endpoint
This guide will walk you through the initial setup and how to interact with the application.
### 1. Generate a GitHub Personal Access Token
To authenticate, you'll need to generate a GitHub Personal Access Token. Follow the instructions provided in this link:
`https://github.com/microsoft/mcp-for-beginners/tree/main/03-GettingStarted/03-llm-client#authentication-using-github-personal-access-token`
This token will be used to authenticate your requests.
### 2. Create a .env File
Create a file named .env in the root directory of your project. This file will store your environment variables.
### 3. Add Your GitHub Token to .env
Inside the .env file, specify the parameters that are going to initiate the AI model e.g:
``` .env
MODEL_TOKEN=NULL
MODEL_URL=http://127.0.0.1:1234/v1
MODEL_NAME=openai/gpt-oss-20b
```

### 4. Start the Application
Once your .env file is set up, you can start the application by running the following command:
``` bash
npm run host
```
This will run a server in `http://localhost:3000`.
### 5. Interact with the API
You can interact with the application's API using curl. Here's an example of how to send a prompt to the /stdio-chat endpoint:
``` bash
curl --location 'http://localhost:3000/stdio-chat' \
--header 'Content-Type: application/json' \
--data '{
    "prompt": "Add 2 and 10"
}'
```
## Running HttpStream endpoint
### 1. Start the Application
Once your .env file is set up, you can start the application by running the following command:
``` bash
npm run initialize-http-server && npm run host
```
This will run a server in `http://localhost:3000` and `http://localhost:3001`.
### 2. Interact with the API
You can interact with the application's API using curl. Here's an example of how to send a prompt to the /stdio-chat endpoint:
``` bash
curl --location 'http://localhost:3000/http-chat' \
--header 'Content-Type: application/json' \
--data '{
    "prompt": "Add 2 and 10"
}'
``