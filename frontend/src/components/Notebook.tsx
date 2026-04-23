"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import EllaAvatar from "./EllaAvatar";
import { sendChatMessage, type NotebookCell } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import remarkGfm from "remark-gfm";

interface NotebookProps {
    cells: NotebookCell[];
    moduleId: string;
    lang: "fr" | "en";
    courseId?: "pe" | "rl";
}

export default function Notebook({ cells, moduleId, lang, courseId = "pe" }: NotebookProps) {
    const { user } = useAuth();
    // Track which cells are unlocked.
    const [unlockedUpTo, setUnlockedUpTo] = useState(0);
    const hasInitialized = useRef(false);
    // Track checkpoint responses and Ella feedback
    const [checkpointState, setCheckpointState] = useState<
        Record<string, {
            response: string;
            feedback: string;
            loading: boolean;
            submitted: boolean;
            passed: boolean;
            attempts: number
        }>
    >({});

    const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // On mount, auto-unlock consecutive content cells from the start
    useEffect(() => {
        const isAdmin = user?.email === "mourad.zerai@gmail.com";
        if (isAdmin) {
            setUnlockedUpTo(cells.length - 1);
            return;
        }

        // Only auto-calculate progress once per module load to avoid resetting on session updates
        if (hasInitialized.current) return;

        let autoUnlock = 0;
        for (let i = 0; i < cells.length; i++) {
            autoUnlock = i;
            if (cells[i].type === "ella_checkpoint") {
                break; // Stop AFTER the first checkpoint (include it)
            }
        }
        setUnlockedUpTo(autoUnlock);
        hasInitialized.current = true;
    }, [cells, user]);

    // Manual scroll helper
    const scrollToCell = (cellId: string, block: ScrollLogicalPosition = "start") => {
        setTimeout(() => {
            const el = cellRefs.current[cellId] || document.getElementById(`feedback-${cellId}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block });
            }
        }, 100);
    };

    const unlockAfterCheckpoint = (fromIndex: number) => {
        let target = fromIndex + 1;
        for (let i = fromIndex + 1; i < cells.length; i++) {
            target = i;
            if (cells[i].type === "ella_checkpoint" || cells[i].type === "ella_gate") {
                break;
            }
        }
        setUnlockedUpTo(Math.max(unlockedUpTo, target));
    };

    const handleCheckpointSubmit = async (cellId: string, cellIndex: number, question: string, hint: string) => {
        const state = checkpointState[cellId] || {
            response: "", feedback: "", loading: false, submitted: false, passed: false, attempts: 0
        };
        if (!state.response.trim()) return;

        const currentAttempts = state.attempts + 1;

        setCheckpointState(prev => ({
            ...prev,
            [cellId]: { ...prev[cellId], loading: true, attempts: currentAttempts }
        }));

        try {
            // Append strict evaluation instructions
            const evaluationInstruction = `\n\nIMPORTANT: Termine ta réponse par EXACTEMENT l'une de ces deux lignes (et rien d'autre sur cette ligne):\n[CHECKPOINT_PASSED]\n[CHECKPOINT_RETRY]\n\nUtilise [CHECKPOINT_PASSED] uniquement si l'étudiant montre une compréhension réelle et correcte du concept. Utilise [CHECKPOINT_RETRY] si la réponse est hors-sujet, trop vague, incorrecte ou montre une incompréhension fondamentale. Sois encourageante mais honnête.`;

            // Send to Ella with the system hint as context
            const result = await sendChatMessage({
                message: `[NOTEBOOK_CHECKPOINT]\nQuestion posée à l'étudiant: "${question}"\n\nRéponse de l'étudiant: "${state.response}"\n\nConsigne pour l'évaluation (NE PAS RÉVÉLER À L'ÉTUDIANT): ${hint}${evaluationInstruction}`,
                context: {
                    page_id: moduleId,
                    page_title: `Module ${moduleId}`,
                    algorithm: "",
                    lab_name: `Checkpoint ${cellId}`,
                    extra: { course_id: courseId, checkpoint_mode: true }
                },
                conversation_history: []
            });

            let passed = result.answer.includes("[CHECKPOINT_PASSED]");
            const retry = result.answer.includes("[CHECKPOINT_RETRY]");

            // Fallback heuristic if tags are missing
            if (!passed && !retry) {
                const lower = result.answer.toLowerCase();
                // Negative signals — only block if clearly telling student to retry
                const negativeSignals = [
                    "pas tout à fait", "pas correct", "incorrect", "réessaie",
                    "essaie encore", "pas encore", "manque", "oublié", "erreur",
                    "not quite", "try again", "incorrect", "missing", "wrong",
                    "not correct", "needs improvement", "reconsider",
                ];
                const isNegative = negativeSignals.some(signal => lower.includes(signal));
                // Default to PASSED unless clearly negative — be generous
                passed = !isNegative;
            }

            let cleanFeedback = result.answer
                .replace("[CHECKPOINT_PASSED]", "")
                .replace("[CHECKPOINT_RETRY]", "")
                .trim();
            
            // Remove "Lien avec le lab" section from checkpoint feedback (we're in a lesson, not a lab)
            cleanFeedback = cleanFeedback
                .replace(/🎯\s*\*\*Lien avec le lab\*\*.*?(\n\n|\n(?=🔍|⛔|📌)|$)/gs, "")
                .replace(/🔗\s*\*\*Connection to Current Lab\*\*.*?(\n\n|\n(?=💡|⚠️|📚)|$)/gs, "")
                .trim();

            const isFinallyUnlocked = passed || currentAttempts >= 3;

            setCheckpointState(prev => ({
                ...prev,
                [cellId]: {
                    ...prev[cellId],
                    feedback: cleanFeedback,
                    loading: false,
                    submitted: true,
                    passed: passed,
                    attempts: currentAttempts
                }
            }));

            // Only unlock if passed or attempts exhausted
            if (isFinallyUnlocked) {
                unlockAfterCheckpoint(cellIndex);
            }

            // Scroll to the entire checkpoint card (question + response + feedback)
            setTimeout(() => {
                const checkpointEl = cellRefs.current[cellId];
                if (checkpointEl) {
                    checkpointEl.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 100);
        } catch (err) {
            setCheckpointState(prev => ({
                ...prev,
                [cellId]: {
                    ...prev[cellId],
                    feedback: "Oups, j'ai eu un souci technique. Réessaie !",
                    loading: false,
                    submitted: true,
                    attempts: currentAttempts
                }
            }));
            unlockAfterCheckpoint(cellIndex);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 pb-20">
            {cells.map((cell, index) => {
                const isLocked = index > unlockedUpTo;

                return (
                    <div
                        key={cell.id}
                        ref={(el) => { cellRefs.current[cell.id] = el; }}
                        className={`transition-all duration-700 ${isLocked ? "opacity-20 pointer-events-none grayscale blur-[2px]" : "opacity-100"}`}
                    >
                        {/* CONTENT CELL */}
                        {cell.type === "content" && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-black text-ella-gray-900 mb-6 tracking-tight">
                                    {cell.title[lang]}
                                </h2>
                                <div className="prose prose-sm max-w-none text-ella-gray-700 leading-relaxed space-y-4">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            h3: ({ children }) => {
                                                // Extract text-only content for emoji detection
                                                // but preserve React nodes (math, links, etc.) for rendering
                                                const childArray = Array.isArray(children) ? children : [children];

                                                // Check if the first child starts with an emoji
                                                let emoji = "";
                                                let restChildren = childArray;

                                                const firstChild = childArray[0];
                                                if (typeof firstChild === "string") {
                                                    const emojiMatch = firstChild.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[🎮🏁♟️🧬🤖🚗🧠🎯🔑💡⚠️📖])\s*/u);
                                                    if (emojiMatch) {
                                                        emoji = emojiMatch[1];
                                                        const restText = firstChild.slice(emojiMatch[0].length);
                                                        restChildren = [restText, ...childArray.slice(1)].filter(c => c !== "");
                                                    }
                                                }

                                                return (
                                                    <h3 className="text-lg font-black text-ella-gray-900 mt-10 mb-4 flex items-center gap-3">
                                                        {emoji && <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-ella-gray-100 text-base">{emoji}</span>}
                                                        <span className="border-b-2 border-ella-primary/10 pb-1">{restChildren}</span>
                                                    </h3>
                                                );
                                            },
                                            blockquote: ({ children }) => {
                                                const content = String(children);
                                                const isSuccess = content.includes("✅");
                                                const isWarning = content.includes("❌");

                                                let bgColor = "bg-ella-accent/5";
                                                let borderColor = "border-ella-accent";

                                                if (isSuccess) {
                                                    bgColor = "bg-green-50/50";
                                                    borderColor = "border-green-500";
                                                } else if (isWarning) {
                                                    bgColor = "bg-red-50/50";
                                                    borderColor = "border-red-500";
                                                }

                                                return (
                                                    <blockquote className={`border-l-4 ${borderColor} pl-6 my-8 ${bgColor} rounded-r-2xl py-5 pr-6 text-base italic text-ella-gray-800 shadow-sm ring-1 ring-black/5`}>
                                                        {children}
                                                    </blockquote>
                                                );
                                            },
                                            strong: ({ children }) => <strong className="font-bold text-ella-gray-900">{children}</strong>,
                                            code: ({ children }) => (
                                                <code className="bg-ella-gray-100 text-ella-accent-dark px-1.5 py-0.5 rounded text-[13px] font-mono border border-ella-gray-200">
                                                    {children}
                                                </code>
                                            ),
                                            pre: ({ children }) => (
                                                <pre className="bg-ella-dark text-ella-dark-text p-5 rounded-2xl overflow-x-auto my-6 shadow-lg border border-white/5">
                                                    {children}
                                                </pre>
                                            ),
                                            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-ella-accent hover:text-ella-accent-dark underline font-bold">{children}</a>,
                                            ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 my-4">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 my-4">{children}</ol>,
                                            table: ({ children }) => (
                                                <div className="overflow-x-auto my-6">
                                                    <table className="w-full text-sm border-collapse rounded-xl overflow-hidden shadow-sm ring-1 ring-ella-gray-200">
                                                        {children}
                                                    </table>
                                                </div>
                                            ),
                                            thead: ({ children }) => (
                                                <thead className="bg-ella-gray-50 text-ella-gray-900 font-black text-xs uppercase tracking-wider">
                                                    {children}
                                                </thead>
                                            ),
                                            tbody: ({ children }) => (
                                                <tbody className="divide-y divide-ella-gray-100">
                                                    {children}
                                                </tbody>
                                            ),
                                            tr: ({ children }) => (
                                                <tr className="hover:bg-ella-primary-bg/30 transition-colors">
                                                    {children}
                                                </tr>
                                            ),
                                            th: ({ children }) => (
                                                <th className="px-4 py-3 text-left border-b-2 border-ella-gray-200">
                                                    {children}
                                                </th>
                                            ),
                                            td: ({ children }) => (
                                                <td className="px-4 py-3 text-ella-gray-700">
                                                    {children}
                                                </td>
                                            ),
                                        }}
                                    >
                                        {cell.content[lang]}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {/* ELLA CHECKPOINT CELL */}
                        {cell.type === "ella_checkpoint" && (
                            <div className="bg-white border-2 border-ella-primary/10 rounded-[2rem] p-6 md:p-8 my-10 shadow-xl shadow-ella-primary/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-ella-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                                <div className="flex items-start gap-4 mb-6 relative z-10">
                                    <div className="shrink-0 p-1 bg-white rounded-xl shadow-sm border border-ella-primary/10">
                                        <EllaAvatar size="md" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-ella-primary px-2 py-0.5 bg-ella-primary/10 rounded">Checkpoint</span>
                                            <p className="text-sm font-black text-ella-gray-900">Ella te demande...</p>
                                        </div>
                                        <p className="text-base font-bold text-ella-gray-700 leading-relaxed">
                                            {cell.question[lang]}
                                        </p>
                                    </div>
                                </div>

                                {/* Interaction Area */}
                                <div className="ml-0 md:ml-16 relative z-10 space-y-6">
                                    {/* Ella's Feedback (shown if submitted) */}
                                    {checkpointState[cell.id]?.submitted && (
                                        <div
                                            id={`feedback-${cell.id}`}
                                            className={`bg-white border-l-4 rounded-r-2xl p-6 shadow-lg ring-1 transition-all animate-slide-up
                                                ${checkpointState[cell.id]?.passed
                                                    ? 'border-ella-success ring-ella-success/10 shadow-ella-success/5'
                                                    : 'border-ella-accent ring-ella-accent/10 shadow-ella-accent/5'}`}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <EllaAvatar size="sm" />
                                                <p className={`text-sm font-black uppercase tracking-widest
                                                    ${checkpointState[cell.id]?.passed ? 'text-ella-success' : 'text-ella-accent'}`}>
                                                    Feedback d'Ella
                                                </p>
                                            </div>
                                            <div className="text-sm font-medium text-ella-gray-700 leading-relaxed prose prose-sm max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm, remarkMath]}
                                                    rehypePlugins={[rehypeKatex]}
                                                    components={{
                                                        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-ella-accent hover:text-ella-accent-dark underline font-bold">{children}</a>,
                                                    }}
                                                >
                                                    {checkpointState[cell.id]?.feedback}
                                                </ReactMarkdown>
                                            </div>
                                            {(checkpointState[cell.id]?.attempts || 0) >= 3 && !checkpointState[cell.id]?.passed && (
                                                <div className="mt-4 pt-4 border-t border-ella-gray-100">
                                                    <p className="text-xs font-bold text-ella-gray-400 italic text-center">
                                                        On continue — reviens sur cette section plus tard si tu veux approfondir.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Input / UI for retry or initial attempt */}
                                    {(!checkpointState[cell.id]?.submitted || (!checkpointState[cell.id]?.passed && (checkpointState[cell.id]?.attempts || 0) < 3)) ? (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">
                                                    {(checkpointState[cell.id]?.attempts || 0) > 0 ? `Tentative ${(checkpointState[cell.id]?.attempts || 0)}/3` : "Ta réponse"}
                                                </p>
                                                {checkpointState[cell.id]?.passed === false && checkpointState[cell.id]?.submitted && (
                                                    <span className="text-[10px] font-bold text-ella-accent uppercase animate-pulse pr-2">Corrige ta réponse ci-dessous</span>
                                                )}
                                            </div>
                                            <textarea
                                                value={checkpointState[cell.id]?.response || ""}
                                                onKeyDown={(e) => {
                                                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleCheckpointSubmit(cell.id, index, cell.question[lang], cell.ella_system_hint);
                                                    }
                                                }}
                                                onChange={(e) => setCheckpointState(prev => ({
                                                    ...prev,
                                                    [cell.id]: {
                                                        ...prev[cell.id],
                                                        response: e.target.value,
                                                        submitted: false // Reset submitted to "clean" view for next try
                                                    }
                                                }))}
                                                placeholder={checkpointState[cell.id]?.submitted ? "Améliore ta réponse ici..." : "Écris ta réponse ici pour débloquer la suite..."}
                                                className="w-full bg-ella-gray-50 border border-ella-gray-200 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-ella-primary/10 focus:border-ella-primary outline-none transition-all min-h-[120px] placeholder-ella-gray-400"
                                                rows={3}
                                                disabled={checkpointState[cell.id]?.loading}
                                            />
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-ella-gray-400 uppercase tracking-widest">Ctrl+Enter pour envoyer</p>
                                                <button
                                                    onClick={() => handleCheckpointSubmit(
                                                        cell.id,
                                                        index,
                                                        cell.question[lang],
                                                        cell.ella_system_hint
                                                    )}
                                                    disabled={
                                                        checkpointState[cell.id]?.loading ||
                                                        !checkpointState[cell.id]?.response?.trim()
                                                    }
                                                    className="btn-primary !px-8 flex items-center gap-2 shadow-lg shadow-ella-accent/20"
                                                >
                                                    {checkpointState[cell.id]?.loading ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                            Analyse...
                                                        </>
                                                    ) : (
                                                        <>
                                                            {checkpointState[cell.id]?.submitted ? "Renvoyer à Ella" : "Envoyer ma réponse"}
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Progression Button (only if passed or exhausted) */}
                                    {(checkpointState[cell.id]?.passed || (checkpointState[cell.id]?.attempts || 0) >= 3) && (
                                        <div className="flex justify-center pt-2">
                                            <button
                                                onClick={() => {
                                                    unlockAfterCheckpoint(index);
                                                    const nextIndex = index + 1;
                                                    if (nextIndex < cells.length) {
                                                        const nextCellId = cells[nextIndex].id;
                                                        scrollToCell(nextCellId);
                                                    }
                                                }}
                                                className="group flex flex-col items-center gap-2"
                                            >
                                                <span className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest group-hover:text-ella-primary transition-colors">Continuer la leçon</span>
                                                <div className="w-10 h-10 rounded-full bg-ella-primary/10 flex items-center justify-center text-ella-primary group-hover:bg-ella-primary group-hover:text-white transition-all animate-bounce">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ELLA GATE CELL */}
                        {cell.type === "ella_gate" && (
                            <div className="bg-gradient-to-br from-ella-success-bg to-white border-2 border-green-200 rounded-[2.5rem] p-8 md:p-12 my-16 text-center shadow-2xl shadow-green-900/5 animate-pulse-slow">
                                <div className="inline-flex p-4 bg-white rounded-full shadow-lg mb-6 ring-8 ring-green-50">
                                    <EllaAvatar size="lg" />
                                </div>
                                <h3 className="text-2xl font-black text-ella-gray-900 mb-3">Bravo ! Module complété.</h3>
                                <div className="text-base font-bold text-ella-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
                                    {(() => {
                                        const fullName = user?.user_metadata?.full_name || "";
                                        const firstName = fullName.split(" ")[0] || "";
                                        const prefix = firstName ? `Bravo ${firstName} ! ` : "Bravo ! ";
                                        return prefix + cell.message[lang];
                                    })()}
                                </div>
                                <a
                                    href={cell.next_url}
                                    onClick={() => {
                                        // Save module completion to localStorage
                                        try {
                                            const completed = JSON.parse(localStorage.getItem("ellaCompletedLessons") || "[]");
                                            if (!completed.includes(moduleId)) {
                                                localStorage.setItem("ellaCompletedLessons", JSON.stringify([...completed, moduleId]));
                                            }
                                        } catch (e) {
                                            console.error("Failed to save progress", e);
                                        }
                                    }}
                                    className="btn-primary !py-4 !px-12 !text-lg !font-black !rounded-2xl shadow-xl shadow-ella-accent/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3"
                                >
                                    {cell.next_url.includes('/labs/')
                                        ? (lang === "fr" ? "Passer au Lab →" : "Go to Lab →")
                                        : (lang === "fr" ? "Module suivant →" : "Next Module →")
                                    }
                                </a>
                            </div>
                        )}

                        {/* DIAGRAM CELL */}
                        {cell.type === "diagram" && (
                            <div className="py-4 animate-fade-in">
                                <h3 className="text-base font-bold text-ella-gray-900 mb-3 ml-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-ella-primary/30"></div>
                                    {cell.title[lang]}
                                </h3>
                                <div
                                    className="w-full overflow-hidden rounded-3xl border border-ella-gray-100 bg-white p-6 shadow-md shadow-ella-gray-400/5"
                                    dangerouslySetInnerHTML={{ __html: cell.svg }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
