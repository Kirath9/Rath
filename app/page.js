"use client";
import { useState, useRef, useEffect } from "react";

export default function Rath() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey, I'm Rath. What's on your mind?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "…" }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection dropped. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", maxWidth: 480, margin: "0 auto", background: "#0B0F14", color: "#E7ECEF", fontFamily: "sans-serif" }}>
      <div style={{ padding: 16, borderBottom: "1px solid #1A2129", fontWeight: 700 }}>Rath</div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "80%", padding: "10px 14px", borderRadius: 12,
            background: m.role === "user" ? "#C97C4B" : "#141B22",
            color: m.role === "user" ? "#0B0F14" : "#E7ECEF",
          }}>{m.content}</div>
        ))}
        {loading && <div style={{ color: "#5C6B78" }}>Rath is typing…</div>}
      </div>
      <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #1A2129" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message Rath"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #1A2129", background: "#141B22", color: "#fff" }}
        />
        <button onClick={send} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#C97C4B" }}>Send</button>
      </div>
    </div>
  );
        }
