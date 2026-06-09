import axios from "axios";

export async function webSearch(query) {
  const res = await axios.post(
     "https://api.tavily.com/search",
     {query , max_results: 5},
     {headers: {Authorization : `Bearer ${process.env.TAVILY_API_KEY}`}}
  );
  return JSON.stringify(res.data.results.map((r) =>({
    title:r.title,
    url:r.url,
    snippet:r.content,
  })))
}