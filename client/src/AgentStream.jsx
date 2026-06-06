import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function AgentStream({ events, running }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {events.map((e, i) => {
        if (e.type === "tool_call")
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: "#f7f7f7",
                border: "1px solid #efefef",
                borderRadius: 8,
                fontSize: 13,
                color: "#666",
              }}
            >
              <span>{e.tool === "web_search" ? "🔍" : "📄"}</span>
              <span>
                <strong style={{ color: "#222", fontWeight: 500 }}>
                  {e.tool}
                </strong>
                {" — "}
                {e.tool === "web_search" ? e.input.query : e.input.url}
              </span>
            </div>
          );

        if (e.type === "thought")
          return (
            <div
              key={i}
              style={{
                padding: "10px 14px",
                borderLeft: "2px solid #ddd",
                borderRadius: 0,
                fontSize: 13,
                color: "#888",
                fontStyle: "italic",
                lineHeight: 1.6,
              }}
            >
              {e.text}
            </div>
          );

        if (e.type === "error")
          return (
            <div
              key={i}
              style={{
                padding: "12px 16px",
                background: "#fff5f5",
                border: "1px solid #ffd0d0",
                borderRadius: 8,
                fontSize: 13,
                color: "#c00",
              }}
            >
              {e.text}
            </div>
          );

        if (e.type === "final")
          return (
            <div
              key={i}
              style={{
                marginTop: 16,
                padding: "24px 28px",
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                fontSize: 15,
                lineHeight: 1.8,
                color: "#111",
              }}
            >
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        marginBottom: 12,
                        marginTop: 0,
                      }}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        margin: "20px 0 8px",
                      }}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        margin: "16px 0 6px",
                      }}
                    >
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p style={{ margin: "0 0 12px", lineHeight: 1.8 }}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol style={{ paddingLeft: 20, margin: "0 0 12px" }}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li style={{ marginBottom: 4, lineHeight: 1.7 }}>
                      {children}
                    </li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#0066cc", textDecoration: "none" }}
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ fontWeight: 600, color: "#111" }}>
                      {children}
                    </strong>
                  ),
                  code: ({ children }) => (
                    <code
                      style={{
                        background: "#f3f3f3",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 13,
                        fontFamily: "monospace",
                      }}
                    >
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote
                      style={{
                        borderLeft: "3px solid #ddd",
                        margin: "12px 0",
                        paddingLeft: 14,
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {e.text}
              </ReactMarkdown>
            </div>
          );

        return null;
      })}

      {running && (
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "8px 0",
            alignItems: "center",
          }}
        >
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#bbb",
                animation: `pulse 1.2s ${delay}ms ease-in-out infinite`,
              }}
            />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
