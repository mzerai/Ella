"use client";

/**
 * EllaCoachingPanel — floating chat panel for ELLA coaching.
 * Course-agnostic: works in PE lessons, RL lessons, PE labs, and RL labs.
 */

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EllaAvatar from "./EllaAvatar";
import { sendChatMessage, type ChatMessage } from "@/lib/api";

interface EllaCoachingPanelProps {
  courseId: string;
  pageId: string;
  pageTitle: string;
  pageType: "lesson" | "lab";
  lang: "fr" | "en";
  studentFirstName?: string | null;
  labContext?: Record<string, unknown>;
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

function getQuickActions(
  lang: "fr" | "en",
  courseId: string,
  pageType: "lesson" | "lab",
) {
  const isLesson = pageType === "lesson";
  const isPE = courseId === "pe";

  if (lang === "fr") {
    const contextAction = isLesson && isPE
      ? { label: "Cette leçon", message: "Explique-moi les concepts clés de cette leçon sur le prompt engineering." }
      : isLesson
      ? { label: "Cette leçon", message: "Explique-moi les concepts clés de cette leçon sur le reinforcement learning." }
      : isPE
      ? { label: "Ce lab", message: "Quel est l'objectif de ce lab et comment je peux réussir la mission ?" }
      : { label: "Ce lab", message: "Qu'est-ce que je dois observer dans ce lab et comment interpréter les résultats ?" };

    const resultsAction = isLesson
      ? { label: "Ma progression", message: "Comment je progresse dans cette leçon ? Quels concepts devrais-je revoir ?" }
      : isPE
      ? { label: "Mon prompt", message: "Analyse mon dernier prompt et donne-moi des pistes d'amélioration." }
      : { label: "Mes résultats", message: "Explique-moi mes résultats et ce que j'observe sur la grille." };

    const coachAction = isLesson
      ? { label: "Coach-moi", message: "[COACH_MODE] Pose-moi 2-3 questions pour tester ma compréhension de cette leçon." }
      : { label: "Coach-moi", message: "[COACH_MODE] Donne-moi un indice pour améliorer mon approche sans me donner la réponse." };

    return [contextAction, resultsAction, coachAction];
  }

  // --- English ---
  const contextAction = isLesson && isPE
    ? { label: "This lesson", message: "Explain the key concepts of this prompt engineering lesson." }
    : isLesson
    ? { label: "This lesson", message: "Explain the key concepts of this reinforcement learning lesson." }
    : isPE
    ? { label: "This lab", message: "What is the goal of this lab and how can I succeed at the mission?" }
    : { label: "This lab", message: "What should I observe in this lab and how do I interpret the results?" };

  const resultsAction = isLesson
    ? { label: "My progress", message: "How am I progressing in this lesson? Which concepts should I review?" }
    : isPE
    ? { label: "My prompt", message: "Analyze my last prompt and suggest improvements." }
    : { label: "My results", message: "Explain my results and what I'm seeing on the grid." };

  const coachAction = isLesson
    ? { label: "Coach me", message: "[COACH_MODE] Ask me 2-3 questions to test my understanding of this lesson." }
    : { label: "Coach me", message: "[COACH_MODE] Give me a hint to improve my approach without giving me the answer." };

  return [contextAction, resultsAction, coachAction];
}

/** Strip formatted rubrics added by the backend formatter — keep only the main answer text. */
function stripRubrics(text: string): string {
  return text
    .replace(/🔍\s*\*\*Intuition\*\*:.*?(\n\n|\n(?=🎯|⛔|📌|$$)|$)/gs, "")
    .replace(/🎯\s*\*\*Lien avec le lab\*\*:.*?(\n\n|\n(?=🔍|⛔|📌|$$)|$)/gs, "")
    .replace(/⛔\s*\*\*Attention\*\*:.*?(\n\n|\n(?=🔍|🎯|📌|$$)|$)/gs, "")
    .replace(/📌\s*\*\*Pour aller plus loin\*\*:[\s\S]*?(_Links are curated.*?\n\n|$)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function EllaCoachingPanel({
  courseId,
  pageId,
  pageTitle,
  pageType,
  lang,
  studentFirstName,
  labContext,
}: EllaCoachingPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLesson = pageType === "lesson";
  const isPE = courseId === "pe";
  const quickActions = getQuickActions(lang, courseId, pageType);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const buildContext = () => {
    const extra: Record<string, unknown> = {
      course_id: courseId,
      page_type: pageType,
      ...(studentFirstName ? { student_first_name: studentFirstName } : {}),
      ...(labContext || {}),
    };

    const ctx: {
      page_id: string;
      page_title: string;
      algorithm: string;
      lab_name: string;
      environment?: { name: string; is_slippery: boolean };
      hyperparameters?: Record<string, number>;
      metrics?: { iterations_to_converge: number; final_delta: number; is_mathematically_valid: boolean };
      extra: Record<string, unknown>;
    } = {
      page_id: pageId,
      page_title: pageTitle,
      algorithm: (labContext?.algorithm as string) || "",
      lab_name: isLesson ? `Leçon: ${pageTitle}` : `Lab: ${pageTitle}`,
      extra,
    };

    // Only include RL-specific fields when in a lab with actual data
    if (!isLesson && labContext) {
      const env = labContext.environment as { name: string; is_slippery: boolean } | undefined;
      if (env) ctx.environment = env;
      const hp = labContext.hyperparameters as Record<string, number> | undefined;
      if (hp) ctx.hyperparameters = hp;
      const m = labContext.metrics as { iterations_to_converge?: number; final_delta?: number; success_rate?: number } | undefined;
      if (m) ctx.metrics = { iterations_to_converge: m.iterations_to_converge ?? 0, final_delta: m.final_delta ?? 0, is_mathematically_valid: (m.success_rate ?? 0) > 0 };
    }

    return ctx;
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
              ? `Je ne peux pas traiter ce type de message. Pose-moi une question sur ${isLesson ? "cette leçon" : "ce lab"} !`
              : `I can't process that kind of message. Ask me a question about this ${isLesson ? "lesson" : "lab"}!`,
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
      const cpSummary = (labContext?.checkpointSummary as string) || "";
      const enrichedMessage = cpSummary
        ? `${msg}\n\n[CONTEXT: ${cpSummary}]`
        : msg;

      // Force scope restriction when asking about progress
      let scopeInstruction = "";
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("progression") || lowerMsg.includes("progress") || lowerMsg.includes("progresse")) {
        scopeInstruction = "\n\n[INSTRUCTION CRITIQUE: L'apprenant demande sa progression. Réponds UNIQUEMENT en te basant sur les checkpoints qu'il a passés (listés dans le CONTEXT ci-dessus). Ne mentionne AUCUN concept qu'il n'a pas encore étudié. Si le checkpoint_summary montre qu'il n'a fait que checkpoint_01 de intro_01, ne parle que du concept de zero-shot (instruction sans exemples). Ne mentionne PAS les 4C, le few-shot, le chain-of-thought, ou tout autre concept des sections suivantes. Sois spécifique à SES réponses et SES tentatives.]";
      }

      const finalMessage = enrichedMessage + scopeInstruction;

      const resp = await sendChatMessage({
        message: finalMessage,
        context: buildContext(),
        conversation_history: [...messages, userMsg].slice(-10),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: stripRubrics(resp.answer) },
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

  const placeholderText = lang === "fr"
    ? (isLesson
        ? (isPE ? "Une question sur le prompt engineering ?" : "Une question sur le reinforcement learning ?")
        : "Une question sur ce lab ?")
    : (isLesson
        ? (isPE ? "A question about prompt engineering?" : "A question about reinforcement learning?")
        : "A question about this lab?");

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
                {studentFirstName ? `ELLA — Coach de ${studentFirstName}` : "ELLA — Coaching"}
              </h4>
              <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest mt-0.5">
                {pageTitle}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[320px]">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-ella-gray-400 font-bold mb-4">
                  {lang === "fr"
                    ? (studentFirstName ? `Salut ${studentFirstName} ! Je suis là pour t'accompagner.` : `Pose-moi une question sur ${isLesson ? "cette leçon" : "ce lab"} !`)
                    : (studentFirstName ? `Hey ${studentFirstName}! I'm here to help you out.` : `Ask me a question about this ${isLesson ? "lesson" : "lab"}!`)}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((qa) => (
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
                  {...(msg.role === "assistant" ? { style: { userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" } as React.CSSProperties } : {})}
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
              {quickActions.map((qa) => (
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
              placeholder={placeholderText}
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
