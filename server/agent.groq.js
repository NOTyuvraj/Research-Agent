import Groq from "groq-sdk";
import { webSearch } from "./tools/search.js";
import { scrapeURL } from "./tools/scrapper.js";
import { SYSTEM_PROMPT } from "./prompt.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API,
});

const tools = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for information on a topic",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scrape_url",
      description: "Get the full text content of a webpage",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to scrape" },
        },
        required: ["url"],
      },
    },
  },
];

async function executeTool(name, args) {
  if (name === "web_search") return await webSearch(args.query);
  if (name === "scrape_url") return await scrapeURL(args.url);
}

export async function runAgent(userQuery, emit) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userQuery },
  ];

  while (true) {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",  // better than 8b for tool use
      messages,
      tools,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    if (message.content) {
      emit({ type: "thought", text: message.content });
    }

    if (!message.tool_calls || message.tool_calls.length === 0) {
      emit({ type: "final", text: message.content });
      break;
    }

    messages.push(message);

    for (const toolCall of message.tool_calls) {
      const name = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      emit({ type: "tool_call", tool: name, input: args });

      const result = await executeTool(name, args);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }
}