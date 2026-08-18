"use client";

import { useEffect, useRef, useState } from "react";

const initialMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hey, I'm Rath. What's on your mind?",
};

export default function Rath() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Rath could not respond right now.");
      }

      const reply = data.reply || data.message;
      if (!reply) {
        throw new Error("The server returned an empty response.");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (err) {
      if (err.name === "AbortError") return;

      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    if (loading) abortRef.current?.abort();
    setMessages([initialMessage]);
    setInput("");
    setError("");
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <section className="flex h-[min(760px,calc(100vh-4rem))] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-900/30">
              R
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">Rath</h1>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Online and ready
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearChat}
            className="rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            New chat
          </button>
        </header>

        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6"
        >
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                    isUser
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md bg-slate-800 text-slate-200"
                  }`}
                >
                  {!isUser && (
                    <div className="mb-1 text-xs font-semibold text-cyan-300">Rath</div>
                  )}
                  {message.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3">
                <div className="flex gap-1.5" aria-label="Rath is typing">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-2 w-2 animate-bounce rounded-full bg-cyan-300"
                      style={{ animationDelay: `${dot * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4 sm:p-5">
          {error && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 text-red-300 hover:text-white"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-2 transition focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-400/20">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                resizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message Rath..."
              rows={1}
              maxLength={4000}
              disabled={loading}
              aria-label="Message Rath"
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || loading}
              aria-label={loading ? "Sending message" : "Send message"}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500 text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              {loading ? "…" : "↑"}
            </button>
          </div>

          <p className="mt-2 text-center text-xs text-slate-500">
            Press Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </section>
    </main>
  );
        }
    
