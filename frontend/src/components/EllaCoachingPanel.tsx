"use client";

/**
 * EllaCoachingPanel — floating chat panel for ELLA coaching in RL labs.
 */

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EllaAvatar from "./EllaAvatar";
import { sendChatMessage, type ChatMessage } from "@/lib/api";
import type { RLLabRunResponse, RLLabTrainResponse } from "@/lib/api";

interface EllaCoachingPanelProps {
  labId: string;
  labTitle: string;
  algorithm: string;
  isSlippery: boolean;
  gamma: number;
  alpha?: number;
  result: RLLabRunResponse | RLLabTrainResponse | null;
  lang: "fr" | "en";
  studentFirstName?: string | null;
}

// Simple regex patterns to detect prompt injection attempts
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+(?:a|an)\s+/i,
  /disregard\s+(?:all|any|the)\s+/i,
  /forget\s+(?:all|everything|your)\s+/i,
  /new\s+instructions?\s*:/i,
  /system\s*prompt\s*:/i,
];

const QUICK_ACTIONS = {
  fr: [
    { label: "Ce lab", message: "Explique-moi ce que je fais dans ce lab et quel concept il illustre." },
    { label: "Mes résultats", message: "Analyse mes résultats actuels et dis-moi si je suis sur la bonne voie." },
    { label: "Coach-moi", message: "Donne-moi un conseil pédagogique pour mieux comprendre cet algorithme." },
  ],
  en: [
    { label: "This lab", message: "Explain what I'm doing in this lab and what concept it illustrates." },
    { label: "My results", message: "Analyze my current results and tell me if I'm on the right track." },
    { label: "Coach me", message: "Give me a pedagogical tip to better understand this algorithm." },
  ],
};

export default function EllaCoachingPanel({
  labId,
  labTitle,
  algorithm,
  isSlippery,
  gamma,
  alpha,
  result,
  lang,
  studentFirstName,
}: EllaCoachingPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const buildContext = () => {
    const isTrainResult = result && "n_episodes" in result;
    const isRunResult = result && "iterations" in result;

    return {
      page_id: labId,
      page_title: labTitle,
      algorithm,
      lab_name: labTitle,
      environment: { name: "FrozenLake", is_slippery: isSlippery },
      hyperparameters: { gamma, ...(alpha !== undefined ? { alpha } : {}) },
      metrics: {
        iterations_to_converge: isTrainResult
          ? (result as RLLabTrainResponse).n_episodes
          : isRunResult
          ? (result as RLLabRunResponse).iterations
          : 0,
        final_delta: isRunResult ? (result as RLLabRunResponse).final_delta : 0,
        is_mathematically_valid: isTrainResult
          ? (result as RLLabTrainResponse).success_rate > 0
          : isRunResult
          ? (result as RLLabRunResponse).goal_reachable
          : false,
      },
      extra: { course_id: "rl", ...(studentFirstName ? { student_first_name: studentFirstName } : {}) },
    };
  };

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    // Anti-injection check
    if (INJECTION_PATTERNS.some((p) => p.test(msg))) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: msg },
        {
          role: "assistant",
          content:
            lang === "fr"
              ? "Je ne peux pas traiter ce type de message. Pose-moi une question sur le lab !"
              : "I can't process that kind of message. Ask me a question about the lab!",
        },
      ]);
      setInput("");
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await sendChatMessage({
        message: msg,
        context: buildContext(),
        conversation_history: [...messages, userMsg].slice(-10),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: resp.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            lang === "fr"
              ? "Oups, j'ai eu un souci technique. Réessaie !"
              : "Oops, technical issue. Try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
          open
            ? "bg-ella-gray-200 shadow-ella-gray-900/10"
            : "bg-ella-primary shadow-ella-primary/30"
        }`}
      >
        {open ? (
          <svg className="w-6 h-6 text-ella-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        ) : (
          <EllaAvatar size="sm" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] bg-white border border-ella-primary/20 rounded-2xl shadow-2xl shadow-ella-primary/10 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-ella-primary px-4 py-3 flex items-center gap-3 shrink-0">
            <EllaAvatar size="sm" className="ring-2 ring-white/20" />
            <div>
              <h4 className="text-sm font-black text-white leading-none">
                ELLA — Coaching
              </h4>
              <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest mt-0.5">
                {algorithm}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[320px]">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-ella-gray-400 font-bold mb-4">
                  {lang === "fr"
                    ? "Pose-moi une question sur ce lab !"
                    : "Ask me a question about this lab!"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_ACTIONS[lang].map((qa) => (
                    <button
                      key={qa.label}
                      onClick={() => handleSend(qa.message)}
                      className="px-3 py-1.5 text-[10px] font-bold rounded-full bg-ella-primary/10 text-ella-primary hover:bg-ella-primary hover:text-white transition-all"
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <EllaAvatar size="sm" className="shrink-0 mt-0.5" />
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-ella-primary text-white rounded-br-sm"
                      : "bg-ella-gray-100 text-ella-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-xs prose-ella max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-ella-accent underline hover:text-ella-accent/80">{children}</a> }}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center">
                <EllaAvatar size="sm" className="shrink-0" />
                <div className="bg-ella-gray-100 rounded-xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-ella-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-ella-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-ella-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick actions (shown when messages exist) */}
          {messages.length > 0 && (
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {QUICK_ACTIONS[lang].map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => handleSend(qa.message)}
                  disabled={loading}
                  className="px-2 py-1 text-[9px] font-bold rounded-full bg-ella-gray-100 text-ella-gray-500 hover:bg-ella-primary/10 hover:text-ella-primary transition-all disabled:opacity-30"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-ella-gray-200 p-3 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={lang === "fr" ? "Demande à Ella..." : "Ask Ella..."}
              disabled={loading}
              className="flex-1 border border-ella-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ella-primary/20 focus:border-ella-primary placeholder-ella-gray-400 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-ella-primary text-white rounded-xl px-3 py-2 text-xs font-bold hover:bg-ella-primary-dark transition-colors disabled:opacity-30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
