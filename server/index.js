import "./config.js";
import express from "express";
import cors from "cors";

const provider = process.env.AI_PROVIDER || "groq";
const { runAgent } = await import(
  provider === "gemini" ? "./agent.gemini.js" : "./agent.groq.js"
);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/research", async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: "query is required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const emit = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await runAgent(query, emit);
  } catch (err) {
    emit({ type: "error", text: "Something went wrong. Try again." });
  } finally {
    res.end();
  }
  res.end();
});

app.listen(3001, () => {
  console.log(`Agent server on :3001 — using ${provider}`);
});
