"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Notebook from "@/components/Notebook";
import EllaAvatar from "@/components/EllaAvatar";
import EllaCoachingPanel from "@/components/EllaCoachingPanel";
import { useAuth } from "@/components/AuthProvider";
import { getModuleCells, type ModuleData } from "@/lib/api";
import Link from "next/link";

const MODULE_NAMES: Record<string, string> = {
    "01_zero_shot": "Zero-Shot Prompting",
    "02_few_shot": "Few-Shot Prompting",
    "03_chain_of_thought": "Chain-of-Thought",
    "04_system_prompts": "System Prompts",
    "05_structured_output": "Structured Output",
};

function ModuleLessonContent() {
    const params = useParams();
    const router = useRouter();
    const { firstName } = useAuth();
    const moduleId = params.moduleId as string;
    const [module, setModule] = useState<ModuleData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lang, setLang] = useState<"fr" | "en">("fr");

    useEffect(() => {
        getModuleCells(moduleId)
            .then(setModule)
            .catch((err) => {
                console.error("Error loading module:", err);
                setError(err.message);
            });
    }, [moduleId]);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 border-b border-ella-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30 mb-8">
                <Link href="/courses/prompt-engineering" className="text-ella-gray-400 hover:text-ella-primary transition-all p-2 -ml-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
                </Link>
                <div className="text-center">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-0.5">
                        {lang === "fr" ? "Leçon Interactive" : "Interactive Lesson"}
                    </p>
                    <h2 className="text-base font-black text-ella-gray-900 leading-none">
                        {module?.title[lang] || MODULE_NAMES[moduleId] || moduleId}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLang("fr")}
                        className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
                            lang === "fr"
                                ? "bg-ella-accent text-white shadow-lg shadow-ella-accent/20"
                                : "bg-ella-gray-100 text-ella-gray-400 hover:bg-ella-gray-200"
                        }`}
                    >
                        FR
                    </button>
                    <button
                        onClick={() => setLang("en")}
                        className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
                            lang === "en"
                                ? "bg-ella-accent text-white shadow-lg shadow-ella-accent/20"
                                : "bg-ella-gray-100 text-ella-gray-400 hover:bg-ella-gray-200"
                        }`}
                    >
                        EN
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Module Header & Ella Intro */}
                <header className="mb-12">
                    <div className="flex items-start gap-4 md:gap-6 bg-gradient-to-br from-ella-primary-bg via-white to-white border border-ella-primary/10 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-ella-primary/5">
                        <div className="shrink-0 p-1.5 bg-white rounded-2xl shadow-sm border border-ella-primary/10">
                            <EllaAvatar size="lg" />
                        </div>
                        <div className="flex-1">
                            <div className="mb-4">
                                <span className="bg-ella-accent text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg shadow-ella-accent/20">
                                    {lang === "fr" ? "C'est parti !" : "Let's go!"}
                                </span>
                                <h1 className="text-3xl font-black text-ella-gray-900 leading-tight">
                                    {module?.title[lang] || MODULE_NAMES[moduleId] || moduleId}
                                </h1>
                            </div>
                            <p className="text-base font-bold text-ella-gray-600 leading-relaxed max-w-2xl">
                                {lang === "fr"
                                    ? <>Bienvenue dans ce module interactif{firstName ? <>, <span className="font-bold text-ella-accent">{firstName}</span></> : null} ! Nous allons explorer ensemble les concepts clés du Prompt Engineering. Lis attentivement chaque section. À chaque checkpoint, je serai là pour te poser une petite question ou te demander de pratiquer. Tu ne pourras débloquer la suite qu&#39;une fois que nous aurons validé l&#39;étape ensemble. On y va ?</>
                                    : <>Welcome to this interactive module{firstName ? <>, <span className="font-bold text-ella-accent">{firstName}</span></> : null}! Together, we will explore the key concepts of Prompt Engineering. Read each section carefully. At each checkpoint, I&#39;ll be there to ask a question or give you a task. You can only unlock the next part once we&#39;ve validated the step together. Shall we start?</>
                                }
                            </p>
                        </div>
                    </div>
                </header>

                {/* Error state */}
                {error && (
                    <div className="bg-ella-accent/5 border border-ella-accent/20 text-ella-accent text-sm font-bold p-6 rounded-3xl mb-12 flex items-center gap-4 animate-shake">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">⚠️</div>
                        <p>{lang === "fr" ? "Impossible de charger le module :" : "Failed to load module:"} {error}</p>
                    </div>
                )}

                {/* Loading state */}
                {!module && !error && (
                    <div className="flex flex-col items-center py-24 gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-ella-gray-100 border-t-ella-primary rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <EllaAvatar size="sm" className="scale-75 opacity-50" />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-ella-gray-400 uppercase tracking-widest animate-pulse">
                            {lang === "fr" ? "Chargement de la leçon..." : "Loading lesson..."}
                        </p>
                    </div>
                )}

                {/* Notebook */}
                {module && (
                    <Notebook
                        cells={module.cells}
                        moduleId={moduleId}
                        lang={lang}
                    />
                )}
            </div>

            <EllaCoachingPanel
                courseId="pe"
                pageId={moduleId}
                pageTitle={module?.title[lang] || MODULE_NAMES[moduleId] || moduleId}
                pageType="lesson"
                lang={lang}
                studentFirstName={firstName}
            />
        </div>
    );
}

export default function ModulePage() {
    return (
        <ProtectedRoute>
            <ModuleLessonContent />
        </ProtectedRoute>
    );
}
