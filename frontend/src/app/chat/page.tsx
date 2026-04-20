/**
 * ELLA Chat page — free conversation with the AI tutor.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import EllaAvatar from "@/components/EllaAvatar";
import { sendChatMessage, type ChatMessage, type ChatResponse } from "@/lib/api";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      role: "assistant",
      content:
        "Salut ! Moi c'est ELLA, ta sherpa en IA. Tu peux me poser des questions sur le Prompt Engineering ou le Reinforcement Learning. Par quoi on commence ?",
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
      // Build conversation history (exclude the first ELLA greeting)
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-6">
        <EllaAvatar size="md" />
        <div>
          <h1 className="font-heading text-xl text-ella-gray-900">
            Parler à ELLA
          </h1>
          <p className="text-xs text-ella-gray-500">
            Prompt Engineering & Reinforcement Learning
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-fade-in ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && <EllaAvatar size="sm" />}
            <div
              className={`max-w-[80%] ${
                msg.role === "assistant" ? "ella-bubble" : "user-bubble"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <EllaAvatar size="sm" />
            <div className="ella-bubble">
              <p className="text-sm text-ella-amber-600 animate-pulse-warm">
                ELLA réfléchit...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Pose ta question à ELLA..."
          rows={2}
          className="flex-1 prompt-editor resize-none"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="btn-primary shrink-0"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
