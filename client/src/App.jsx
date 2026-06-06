import { useState} from "react";
import AgentStream from "./AgentStream";

export default function App() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [running, setRunning] = useState(false);

  const startResearch = async () => {
    if (!query.trim() || running) return;
    setEvents([]);
    setRunning(true);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event = JSON.parse(line.slice(6));
            setEvents((prev) => [...prev, event]);
          } catch {
            console.log("Error");
          }
        }
      }
    }

    setRunning(false);
  };

  return (
    <div style={{
      maxWidth: 720,
      margin: "0 auto",
      padding: "40px 24px",
      fontFamily: "sans-serif",
    }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>
          Research agent
        </h1>
        <p style={{ fontSize: 14, color: "#888", lineHeight: 1.5 }}>
          Ask anything. The agent searches, reads pages, and writes a report.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startResearch()}
          placeholder="e.g. How does RAG work in production AI systems?"
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: 15,
            border: "1px solid #e0e0e0",
            borderRadius: 12,
            outline: "none",
            background: "#000000",
          }}
        />
        <button
          onClick={startResearch}
          disabled={running || !query.trim()}
          style={{
            padding: "12px 22px",
            fontSize: 14,
            fontWeight: 500,
            background: running ? "#ccc" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            cursor: running ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            opacity: running ? 0.6 : 1,
          }}
        >
          {running ? "Researching..." : "Research"}
        </button>
      </div>

      <AgentStream events={events} running={running} />
    </div>
  );
}