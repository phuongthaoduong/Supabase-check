import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../App.css";

type MessageRole = "assistant" | "user" | "error" | "loading";

interface ChatMessage {
  id: string;
  role: MessageRole;
  title?: string;
  text: string;
  timestamp: string;
  meta?: string;
}

const featureCards = [
  { icon: "📰", title: "Personalized News Digests" },
  { icon: "🤖", title: "AI-Powered Summaries" },
  { icon: "⚡", title: "Real-time Updates" },
  { icon: "🛡️", title: "Trusted Sources" }
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    title: "Welcome to BUTDA!",
    text: "I'm your personal news assistant. Tell me what topics you're interested in, I'll curate a 3-minute feed. All the news you need.",
    timestamp: "Just now"
  }
];

declare global {
  interface Window {
    __APP_ENV__?: Record<string, string>;
  }
}

const runtime = typeof window !== "undefined" ? window.__APP_ENV__ : undefined;

const resolveApiBase = () => {
  if (import.meta.env.DEV) {
    return "";
  }
  return runtime?.API_URL || import.meta.env.VITE_API_URL || import.meta.env.API_URL || "";
};

const API_BASE = resolveApiBase();

const formatTimestamp = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderMarkdownHtml = (input: string) => {
  let text = input.replace(/\r\n/g, "\n");
  text = text.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  });
  text = escapeHtml(text);
  text = text.replace(/^###\s?(.*)$/gm, "<h3>$1</h3>");
  text = text.replace(/^##\s?(.*)$/gm, "<h2>$1</h2>");
  text = text.replace(/^#\s?(.*)$/gm, "<h1>$1</h1>");
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*(.*?)\*/g, "$1<em>$2</em>");
  text = text.replace(/(^|[^_])_(.*?)_/g, "$1<em>$2</em>");
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => {
    const safeUrl = url.startsWith("http") ? url : "#";
    return `<a href="${safeUrl}" rel="noopener">${label}</a>`;
  });
  const listBlockRegex = /(^|\n)(?:-\s+.*(?:\n-\s+.*)*)/g;
  text = text.replace(listBlockRegex, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((l) => l.replace(/^-\s+/, ""))
      .map((c) => `<li>${c}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });
  text = text.replace(/\n{2,}/g, "</p><p>");
  text = `<p>${text}</p>`;
  return text;
};

export default function Main() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || isSending) {
      return;
    }
    const timestamp = formatTimestamp();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp
    };
    const loadingId = `loading-${Date.now()}`;
    const loadingMessage: ChatMessage = {
      id: loadingId,
      role: "loading",
      text: "",
      timestamp: "Processing..."
    };
    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setUserInput("");
    setIsSending(true);
    const finalize = (message: ChatMessage) => {
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== loadingId);
        return [...filtered, message];
      });
    };
    try {
      const response = await fetch(`${API_BASE}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text })
      });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.success && payload.data) {
        const summary = payload.data.summary || "No summary available.";
        finalize({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          title: "Research Summary",
          text: summary,
          timestamp: "Just now"
        });
      } else {
        const message =
          payload?.error?.message ||
          "Failed to get a response from the server.";
        finalize({
          id: `error-${Date.now()}`,
          role: "error",
          title: "Error",
          text: message,
          timestamp: "Just now"
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Network error while contacting the server.";
      finalize({
        id: `error-${Date.now()}`,
        role: "error",
        title: "Error",
        text: message,
        timestamp: "Just now"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="main-app">
      <header className="app-header">
        <div className="brand-belt">
          <div className="brand-lockup">
            <img src="/logo.png" alt="BUTDA Logo" />
            <div>
              <span className="brand-name">BUTDA</span>
              <p>Being-up-to-date Assistant</p>
            </div>
          </div>
        </div>
        <button className="settings-button" type="button" aria-label="Logout" onClick={handleLogout}>
          ⎋
        </button>
      </header>
      <main className="chat-main">
        {messages.map((message) => {
          if (message.role === "loading") {
            return (
              <div key={message.id} className="message-row">
                <img src="/logo.png" alt="BUTDA" className="message-avatar" />
                <div className="chat-bubble incoming loading">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            );
          }
          const isUser = message.role === "user";
          const bubbleClass = [
            "chat-bubble",
            isUser ? "outgoing" : "incoming",
            message.role === "error" ? "error" : ""
          ]
            .filter(Boolean)
            .join(" ");
          const renderBody = () => {
            if (!message.text) return null;
            if (message.role === "error") {
              return <p className="message-body">{message.text}</p>;
            }
            const safe = renderMarkdownHtml(message.text);
            return <div className="message-body" dangerouslySetInnerHTML={{ __html: safe }} />;
          };
          return (
            <div key={message.id} className={`message-row ${isUser ? "align-end" : ""}`}>
              {!isUser && (
                <img src="/logo.png" alt="BUTDA" className="message-avatar" />
              )}
              <div className={bubbleClass}>
                {message.title && <h4 className="message-title">{message.title}</h4>}
                {renderBody()}
                {message.meta && <p className="message-meta">{message.meta}</p>}
                <p className="message-timestamp">{message.timestamp}</p>
              </div>
            </div>
          );
        })}
      </main>
      <footer className="chat-input">
        <input
          type="text"
          placeholder="Ask about any topic..."
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
          disabled={isSending}
        />
        <button type="button" onClick={handleSend} disabled={isSending || !userInput.trim()}>
          {isSending ? "Working..." : "Send 🚀"}
        </button>
      </footer>
    </div>
  );
}