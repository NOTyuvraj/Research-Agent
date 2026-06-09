import { GoogleGenerativeAI } from "@google/generative-ai";
import { webSearch } from "./tools/search.js";
import { scrapeURL } from "./tools/scrapper.js";
import { SYSTEM_PROMPT } from "./prompt.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const tools = [
  { 
    functionDeclarations: [
      {
        name: "web_search",
        description: "Search the web for information on a topic",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "Search Query" },
          },
          required: ["query"],
        },
      },
      {
        name:"scrape_url",
        description:"Get the full context of webpage",
        parameters:{
          type:"OBJECT",
          properties:{
            url:{type:"STRING", description:"URL to scrape"},
          },
          required:["url"],
        }
      }
    ],
  },
];


async function executeTool(name, args){
  if(name == "web_search") return await webSearch(args.query);
  if(name == "scrape_url") return await scrapeURL(args.url);
}

export async function runAgent(userQuery , emit){


  const model = genAI.getGenerativeModel({
    model:"gemini-2.5-flash",
    systemInstruction:SYSTEM_PROMPT,
    tools
  })

  const chat = model.startChat({history:[]});
  let message = userQuery;
  
  while(true){
    const result = await chat.sendMessage(message);
    const response = result.response;
    const candidate = response.candidates[0];
    const parts = candidate.content.parts;

    const toolCallParts = parts.filter((p) => p.functionCall);
    const textParts = parts.filter((p)=> p.text);

    for(const part of textParts){
      if(parts.text){
        emit({type:"thought" , text:part.text});
      }
    }

    if(toolCallParts.length === 0 ){
      const finalText = textParts.map((p) => p.text).join("\n");
      emit({type: "final" , text:finalText});
      break;
    }

    const toolResponseParts = [];
    for(const part of toolCallParts){
      const {name , args} = part.functionCall;
      emit({type:"tool_call" , tool:name , input:args});
      
      const result = await executeTool(name , args);

      toolResponseParts.push({
        functionResponse:{
          name,
          response:{result},
        }
      })

    }

    message = toolResponseParts;

  }

}