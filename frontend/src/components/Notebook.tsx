"use client";

import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import EllaAvatar from "./EllaAvatar";
import { sendChatMessage, fetchLessonProgress, saveCheckpointProgress, type NotebookCell } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Anti-copy styles injected via useEffect
const ANTI_COPY_STYLES = `
.ella-protected-content .prose,
.ella-protected-content [id^="feedback-"] {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.ella-protected-content textarea,
.ella-protected-content input {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
}
`;

import remarkGfm from "remark-gfm";

export interface CheckpointSummaryEntry {
    cellId: string;
    passed: boolean;
    attempts: number;
    question: string;
    response: string;
    feedback: string;
}

interface NotebookProps {
    cells: NotebookCell[];
    moduleId: string;
    lang: "fr" | "en";
    courseId?: "pe" | "rl" | "aile" | "finance" | "healthcare" | "manufacturing";
    onCheckpointUpdate?: (summaries: CheckpointSummaryEntry[]) => void;
}

export default function Notebook({ cells, moduleId, lang, courseId = "pe", onCheckpointUpdate }: NotebookProps) {
    const { user, firstName } = useAuth();
    // Track which cells are unlocked.
    const [unlockedUpTo, setUnlockedUpTo] = useState(0);

    // Dynamic checkpoint questions
    const [dynamicQuestions, setDynamicQuestions] = useState<Record<string, string>>({});
    const [generatingQuestion, setGeneratingQuestion] = useState<Record<string, boolean>>({});
    const [isHydrating, setIsHydrating] = useState(true);

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

    // On mount, hydrate progress from backend and then auto-unlock cells
    useEffect(() => {
        if (hasInitialized.current) return;
        if (user === undefined) return; // Wait for AuthProvider session

        const initProgress = async () => {
            const isAdmin = user?.email === "mourad.zerai@gmail.com";

            try {
                if (user) {
                    const { checkpoints } = await fetchLessonProgress(courseId, moduleId);
                    
                    if (checkpoints && checkpoints.length > 0) {
                        const newDynQ: Record<string, string> = {};
                        const newState: any = {};
                        let lastPassedIdx = -1;

                        checkpoints.forEach(cp => {
                            if (cp.dynamic_question) {
                                newDynQ[cp.checkpoint_id] = cp.dynamic_question;
                            }
                            if (cp.student_response || cp.ella_feedback || cp.attempts > 0) {
                                newState[cp.checkpoint_id] = {
                                    response: cp.student_response || "",
                                    feedback: cp.ella_feedback || "",
                                    passed: cp.passed || false,
                                    attempts: cp.attempts || 0,
                                    loading: false,
                                    submitted: !!cp.ella_feedback || cp.attempts > 0
                                };
                            }

                            const idx = cells.findIndex((c) => c.id === cp.checkpoint_id);
                            if (idx > lastPassedIdx && (cp.passed || cp.attempts >= 3)) {
                                lastPassedIdx = idx;
                            }
                        });

                        setDynamicQuestions(prev => ({ ...prev, ...newDynQ }));
                        setCheckpointState(prev => ({ ...prev, ...newState }));

                        let autoUnlock = 0;
                        if (isAdmin) {
                            autoUnlock = cells.length - 1;
                        } else if (lastPassedIdx >= 0) {
                            for (let i = lastPassedIdx + 1; i < cells.length; i++) {
                                autoUnlock = i;
                                if (cells[i].type === "ella_checkpoint" || cells[i].type === "ella_gate") break;
                            }
                        } else {
                            for (let i = 0; i < cells.length; i++) {
                                autoUnlock = i;
                                if (cells[i].type === "ella_checkpoint") break;
                            }
                        }

                        setUnlockedUpTo(autoUnlock);
                        setIsHydrating(false);
                        hasInitialized.current = true;
                        return;
                    }
                }
            } catch (err) {
                console.error("Hydration error:", err);
            }

            // Fallback logic: brand new module or fail
            let autoUnlock = 0;
            if (isAdmin) {
                autoUnlock = cells.length - 1;
            } else {
                for (let i = 0; i < cells.length; i++) {
                    autoUnlock = i;
                    if (cells[i].type === "ella_checkpoint") break;
                }
            }
            setUnlockedUpTo(autoUnlock);
            
            setIsHydrating(false);
            hasInitialized.current = true;
        };

        if (cells && cells.length > 0) {
            initProgress();
        }
    }, [cells, user, courseId, moduleId]);

    // Inject anti-copy styles and block copy/paste on protected content
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = ANTI_COPY_STYLES;
        document.head.appendChild(style);

        const handleCopy = (e: ClipboardEvent) => {
            const target = e.target as HTMLElement;
            // Allow copy inside textareas (student's own input)
            if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
            // Block copy on lesson content and ELLA feedback
            if (target.closest?.(".ella-protected-content")) {
                e.preventDefault();
            }
        };

        document.addEventListener("copy", handleCopy);
        return () => {
            document.removeEventListener("copy", handleCopy);
            style.remove();
        };
    }, []);

    // Manual scroll helper
    const scrollToCell = (cellId: string, block: ScrollLogicalPosition = "start") => {
        setTimeout(() => {
            const el = cellRefs.current[cellId] || document.getElementById(`feedback-${cellId}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block });
            }
        }, 100);
    };

    // Notify parent of checkpoint state changes for ELLA context
    useEffect(() => {
        if (!onCheckpointUpdate) return;
        const summaries: CheckpointSummaryEntry[] = [];
        for (const cell of cells) {
            if (cell.type !== "ella_checkpoint") continue;
            const state = checkpointState[cell.id];
            if (state && (state.submitted || state.attempts > 0)) {
                summaries.push({
                    cellId: cell.id,
                    passed: state.passed,
                    attempts: state.attempts,
                    question: dynamicQuestions[cell.id] || "",
                    response: state.response,
                    feedback: state.feedback?.substring(0, 150) || "",
                });
            }
        }
        onCheckpointUpdate(summaries);
    }, [checkpointState, dynamicQuestions, cells, onCheckpointUpdate]);

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
            const evaluationInstruction = courseId === "aile"
  ? `\n\nIMPORTANT: Termine ta réponse par EXACTEMENT l'une de ces deux lignes (et rien d'autre sur cette ligne):\n[CHECKPOINT_PASSED]\n[CHECKPOINT_RETRY]\n\nRègles d'évaluation AILE (formation dirigeants) :\n- [CHECKPOINT_PASSED] si le participant a répondu à la question de manière pertinente, même brièvement. Une réponse courte (1-2 phrases) est parfaitement acceptable.\n- [CHECKPOINT_PASSED] si le participant montre un engagement avec le sujet, même si la réponse n'est pas parfaite.\n- [CHECKPOINT_RETRY] UNIQUEMENT si la réponse est complètement hors-sujet, vide, ou si le participant demande de l'aide au lieu de répondre.\n- Utilise "vous" (vouvoiement). Tu parles à un dirigeant d'entreprise, pas à un étudiant.\n- Sois bref (2-3 phrases max), professionnel, et direct. Pas de "Excellente réponse !" ou "Bravo !". Utilise plutôt "Bien noté.", "C'est pertinent.", "Tout à fait.".\n- Tu dois TOUJOURS terminer par l'un des deux tags, sans exception.`
  : `\n\nIMPORTANT: Termine ta réponse par EXACTEMENT l'une de ces deux lignes (et rien d'autre sur cette ligne):\n[CHECKPOINT_PASSED]\n[CHECKPOINT_RETRY]\n\nRègles d'évaluation :\n- [CHECKPOINT_PASSED] uniquement si l'étudiant montre une compréhension réelle et correcte du concept dans sa réponse.\n- [CHECKPOINT_RETRY] dans TOUS les autres cas : réponse hors-sujet, trop vague, incorrecte, incompréhension, ou si l'étudiant demande des indices/aide au lieu de répondre.\n- Si l'étudiant demande de l'aide, des indices ou dit qu'il ne comprend pas : donne-lui un indice pédagogique qui le guide vers la bonne réponse SANS la révéler, puis termine par [CHECKPOINT_RETRY].\n- Ne génère JAMAIS de question ambiguë ou piège. La question doit avoir une réponse claire et vérifiable.\n- Sois encourageante mais honnête. Ne valide jamais une non-réponse.\n- Tu dois TOUJOURS terminer par l'un des deux tags, sans exception.`;

            // Send to Ella with the system hint as context
            const result = await sendChatMessage({
                message: courseId === "aile"
                    ? `[NOTEBOOK_CHECKPOINT]\nQuestion posée au participant: "${question}"\n\nRéponse du participant: "${state.response}"\n\nConsigne pour l'évaluation (NE PAS RÉVÉLER AU PARTICIPANT): ${hint}${evaluationInstruction}`
                    : `[NOTEBOOK_CHECKPOINT]\nQuestion posée à l'étudiant: "${question}"\n\nRéponse de l'étudiant: "${state.response}"\n\nConsigne pour l'évaluation (NE PAS RÉVÉLER À L'ÉTUDIANT): ${hint}${evaluationInstruction}`,
                context: {
                    page_id: moduleId,
                    page_title: `Module ${moduleId}`,
                    algorithm: "",
                    lab_name: `Checkpoint ${cellId}`,
                    extra: { course_id: courseId, checkpoint_mode: true, ...(firstName ? { student_first_name: firstName } : {}) }
                },
                conversation_history: []
            });

            let passed = result.answer.includes("[CHECKPOINT_PASSED]");
            const retry = result.answer.includes("[CHECKPOINT_RETRY]");

            // Fallback: bidirectional heuristic if no tag found
            if (!passed && !retry) {
                const lower = result.answer.toLowerCase();
                const positiveSignals = [
                    "très bien", "bravo", "excellent", "tu as compris", "bonne réponse",
                    "correct", "bien compris", "great", "well done", "you understood",
                    "good answer", "correct answer", "nicely done",
                    "bien noté", "c'est pertinent", "tout à fait", "point intéressant",
                    "bon point", "pertinent", "bien identifié", "noted", "relevant", "good point",
                ];
                const negativeSignals = [
                    "pas tout à fait", "pas correct", "incorrect", "réessaie",
                    "essaie encore", "pas encore", "try again", "not quite",
                    "wrong", "rethink", "reconsider", "reformule", "indice", "hint",
                ];
                const hasPositive = positiveSignals.some(s => lower.includes(s));
                const hasNegative = negativeSignals.some(s => lower.includes(s));
                passed = hasPositive && !hasNegative;
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

            // Save state to backend
            saveCheckpointProgress({
                course_id: courseId,
                module_id: moduleId,
                checkpoint_id: cellId,
                dynamic_question: dynamicQuestions[cellId] || question,
                student_response: state.response,
                ella_feedback: cleanFeedback,
                passed: passed,
                attempts: currentAttempts
            });

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

    const generateCheckpointQuestion = async (cellId: string, config: any) => {
        if (isHydrating || dynamicQuestions[cellId] || generatingQuestion[cellId]) return;
        setGeneratingQuestion(prev => ({ ...prev, [cellId]: true }));

        try {
            let newQ = "";
            for (let attempt = 0; attempt < 3; attempt++) {
                if (attempt > 0) {
                    await new Promise(r => setTimeout(r, 1000));
                }
                try {
                    const result = await sendChatMessage({
                        message: `[GENERATE_CHECKPOINT_QUESTION]\n\nTopic: ${config.topic}\nSection context: ${config.section_context}\nQuestion type: ${config.question_type}\nDifficulty: ${config.difficulty}\nLanguage: ${lang === "fr" ? "French" : "English"}\n\n${config.anti_gpt_instructions || ""}\n\nCRITICAL CONSTRAINT: You MUST follow the anti_gpt_instructions above. If they say to NOT mention certain topics, do NOT mention them in your question. Stay strictly within the topic described.\n\nSCOPE RESTRICTION: You are generating a question for Module '${moduleId}'. The student has ONLY studied the content described in 'Section context' above. Do NOT reference, mention, or compare with ANY concept from other modules or sections that the student has not yet studied. If the topic is about zero-shot, do NOT mention few-shot, chain-of-thought, or system prompts. Stay strictly within the section context provided.\n\nGenerate ONE checkpoint question. The question must:\n- Reference specific content from the lesson section described above\n- Ask the student to apply the concept to a personal or concrete example\n- Be impossible to answer correctly by just asking ChatGPT (requires lesson context)\n- Be concise (2-3 sentences max)\n\nRespond in JSON format: {"answer": "Your generated question here"}. No other fields.`,
                        context: {
                            page_id: moduleId,
                            page_title: `Module ${moduleId}`,
                            algorithm: "",
                            lab_name: `Generate question for ${cellId}`,
                            extra: { course_id: courseId, generate_question: true, ...(firstName ? { student_first_name: firstName } : {}) }
                        },
                        conversation_history: []
                    });

                    if (result.answer) {
                        newQ = result.answer;

                        // Detect backend error responses disguised as answers
                        if (!newQ || newQ.trim() === "" || newQ.toLowerCase().includes("an error occurred") || newQ.toLowerCase().includes("api error") || newQ.toLowerCase().startsWith("{\"error\"")) {
                            throw new Error("Backend returned error response: " + newQ);
                        }

                        // If the answer is JSON with a question field, extract it (required for LLM compatibility)
                        try {
                            const parsed = JSON.parse(newQ);
                            if (parsed.answer) newQ = parsed.answer; else if (parsed.question) newQ = parsed.question;
                        } catch { /* not JSON, use as-is */ }
                        break;
                    }
                } catch (retryErr) {
                    console.error(`generateCheckpointQuestion attempt ${attempt + 1}/3 failed:`, retryErr, "cellId:", cellId);
                    if (attempt === 2) throw retryErr;
                }
            }

            if (!newQ) {
                throw new Error("All 3 attempts returned empty answer");
            }

            setDynamicQuestions(prev => ({ ...prev, [cellId]: newQ }));
            saveCheckpointProgress({
                course_id: courseId,
                module_id: moduleId,
                checkpoint_id: cellId,
                dynamic_question: newQ
            });
        } catch (err) {
            console.error("generateCheckpointQuestion failed:", err);
            // Fallback: use a generic question
            const fallbackQ = lang === "fr"
                ? "Explique le concept qu'on vient de voir avec un exemple concret tiré de ton domaine d'études ou de travail."
                : "Explain the concept we just covered using a concrete example from your field of study or work.";
            setDynamicQuestions(prev => ({ ...prev, [cellId]: fallbackQ }));
            saveCheckpointProgress({
                course_id: courseId,
                module_id: moduleId,
                checkpoint_id: cellId,
                dynamic_question: fallbackQ
            });
        }
        setGeneratingQuestion(prev => ({ ...prev, [cellId]: false }));
    };

    const handleNewQuestion = async (cellId: string, config: any) => {
        // Reset checkpoint state for a new question attempt (keep passed=true so progression stays unlocked)
        setCheckpointState(prev => ({
            ...prev,
            [cellId]: {
                ...prev[cellId],
                response: "",
                feedback: "",
                submitted: false,
                // Keep passed as true so the lesson stays unlocked
            }
        }));
        // Clear the old question so generateCheckpointQuestion can run
        setDynamicQuestions(prev => {
            const next = { ...prev };
            delete next[cellId];
            return next;
        });
        // Generate a new question
        await generateCheckpointQuestion(cellId, config);
    };

    if (isHydrating) {
        return (
            <div className="max-w-3xl mx-auto space-y-10 pb-20 mt-10">
                <div className="animate-pulse space-y-10">
                    <div className="h-8 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                    </div>
                    <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-6 mt-12 object-fill">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-24 bg-slate-50 rounded border border-slate-200 mb-4"></div>
                    </div>
                    <div className="flex justify-end pr-4">
                      <div className="h-8 bg-slate-200 rounded-md w-32"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10 pb-20 ella-protected-content">
            {cells.map((cell, index) => {
                const isLocked = index > unlockedUpTo;

                // Generate dynamic question when checkpoint becomes visible
                if (!isLocked && cell.type === "ella_checkpoint" && !dynamicQuestions[cell.id]) {
                    // Type assertion to ensure checkpoint_config exists, as we've migrated all static checkpoints
                    const config = cell.checkpoint_config as NonNullable<typeof cell.checkpoint_config>;
                    generateCheckpointQuestion(cell.id, config);
                }

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
                                            <p className="text-sm font-black text-ella-gray-900">{courseId === "aile" ? "ELLA vous demande..." : "Ella te demande..."}</p>
                                        </div>
                                        <p className="text-base font-bold text-ella-gray-700 leading-relaxed">
                                            {dynamicQuestions[cell.id] || (lang === "fr" ? (courseId === "aile" ? "ELLA prépare votre question..." : "Ella prépare ta question...") : "Ella is preparing your question...")}
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
                                                    {(checkpointState[cell.id]?.attempts || 0) > 0 ? `Tentative ${(checkpointState[cell.id]?.attempts || 0)}/3` : (courseId === "aile" ? "Votre réponse" : "Ta réponse")}
                                                </p>
                                                {checkpointState[cell.id]?.passed === false && checkpointState[cell.id]?.submitted && (
                                                    <span className="text-[10px] font-bold text-ella-accent uppercase animate-pulse pr-2">{courseId === "aile" ? "Corrigez votre réponse ci-dessous" : "Corrige ta réponse ci-dessous"}</span>
                                                )}
                                            </div>
                                            <textarea
                                                value={checkpointState[cell.id]?.response || ""}
                                                onKeyDown={(e) => {
                                                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleCheckpointSubmit(
                                                            cell.id,
                                                            index,
                                                            dynamicQuestions[cell.id] || "",
                                                            cell.checkpoint_config?.hint || "Veuillez évaluer cette réponse de l'étudiant."
                                                        );
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    const pastedText = e.clipboardData.getData("text").trim();
                                                    const previousFeedback = (checkpointState[cell.id]?.feedback || "").trim();
                                                    // Detect if student is pasting ELLA's previous feedback
                                                    if (previousFeedback && pastedText.length > 30) {
                                                        // Check similarity: if >60% of pasted text appears in feedback
                                                        const feedbackWords = new Set(previousFeedback.toLowerCase().split(/\s+/));
                                                        const pastedWords = pastedText.toLowerCase().split(/\s+/);
                                                        const overlap = pastedWords.filter(w => feedbackWords.has(w)).length;
                                                        const similarity = overlap / pastedWords.length;
                                                        if (similarity > 0.6) {
                                                            e.preventDefault();
                                                            alert(lang === "fr"
                                                                ? (courseId === "aile" ? "Vous ne pouvez pas copier-coller le feedback d'ELLA. Reformulez avec vos propres mots." : "Tu ne peux pas copier-coller le feedback d'Ella. Reformule avec tes propres mots !")
                                                                : "You can't paste Ella's feedback. Use your own words!");
                                                            return;
                                                        }
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
                                                placeholder={courseId === "aile"
                                                    ? (checkpointState[cell.id]?.submitted ? "Modifiez votre réponse ici..." : "Écrivez votre réponse ici pour débloquer la suite...")
                                                    : (checkpointState[cell.id]?.submitted ? "Améliore ta réponse ici..." : "Écris ta réponse ici pour débloquer la suite...")}
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
                                                        dynamicQuestions[cell.id] || "",
                                                        cell.checkpoint_config?.hint || "Veuillez évaluer cette réponse de l'étudiant."
                                                    )}
                                                    disabled={
                                                        checkpointState[cell.id]?.loading ||
                                                        !checkpointState[cell.id]?.response?.trim() ||
                                                        (cell.checkpoint_config && !dynamicQuestions[cell.id])
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

                                    {/* Progression + New Question (only if passed or exhausted) */}
                                    {(checkpointState[cell.id]?.passed || (checkpointState[cell.id]?.attempts || 0) >= 3) && checkpointState[cell.id]?.submitted && (
                                        <div className="flex items-center justify-between pt-2">
                                            <button
                                                onClick={() => handleNewQuestion(cell.id, cell.checkpoint_config)}
                                                disabled={generatingQuestion[cell.id]}
                                                className="flex items-center gap-1.5 text-xs font-bold text-ella-gray-400 hover:text-ella-primary transition-colors disabled:opacity-30"
                                            >
                                                <RefreshCw className={`w-3.5 h-3.5 ${generatingQuestion[cell.id] ? "animate-spin" : ""}`} />
                                                {lang === "fr" ? "Tester une autre question" : "Try another question"}
                                            </button>
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
