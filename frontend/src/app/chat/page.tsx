/**
 * Ella Chat page — free conversation with the AI tutor.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import EllaAvatar from "@/components/EllaAvatar";
import { sendChatMessage, type ChatMessage } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import ReactMarkdown from "react-markdown";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
}

function ChatContent() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      role: "assistant",
      content:
        "Salut ! Moi c'est Ella, ton assistante pédagogique. Je suis là pour t'accompagner dans tes cours sur la plateforme. Qu'est-ce que tu veux explorer aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // Build conversation history (exclude the first Ella greeting)
      const history: ChatMessage[] = messages
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage({
        message: userMessage,
        context: {
          page_id: "",
          page_title: "Chat libre",
          algorithm: "",
          lab_name: "",
          extra: { course_id: "pe" },
        },
        conversation_history: history,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Oups, j'ai eu un souci technique. Réessaie dans un instant !",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-ella-gray-200">
        <div className="flex items-center gap-3 font-bold text-ella-gray-900">
          <EllaAvatar size="sm" />
          <span>Discuter avec Ella</span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 bg-ella-primary-bg text-ella-primary text-[10px] rounded font-bold uppercase">Assistant IA</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 no-scrollbar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <EllaAvatar size="sm" className={msg.role === "user" ? "bg-ella-gray-300 shadow-inner" : ""} />
            <div
              className={`max-w-[85%] sm:max-w-[75%] ${msg.role === "assistant" ? "ella-bubble" : "user-bubble shadow-sm"}`}
            >
              <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ella-accent hover:text-ella-accent-dark underline font-bold"
                      />
                    ),
                    p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                    ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 mb-2" />,
                    ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 mb-2" />,
                    li: ({ node, ...props }) => <li {...props} className="mb-1" />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <EllaAvatar size="sm" />
            <div className="ella-bubble flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-ella-primary/40 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-ella-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-ella-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-xs font-bold text-ella-primary">Ella réfléchit...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border border-ella-gray-200 rounded-2xl p-2 shadow-lg focus-within:border-ella-primary/50 transition-all">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Pose ta question à Ella..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none min-h-[40px] max-h-[120px] placeholder-ella-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-ella-accent hover:bg-ella-accent-dark text-white p-2.5 rounded-xl transition-all disabled:opacity-30 disabled:grayscale active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}
