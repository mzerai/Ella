"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Notebook from "@/components/Notebook";
import EllaAvatar from "@/components/EllaAvatar";
import EllaCoachingPanel from "@/components/EllaCoachingPanel";
import { useAuth } from "@/components/AuthProvider";
import { getFinanceModuleCells, type ModuleData } from "@/lib/api";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccessCodeGate from "@/components/AccessCodeGate";

const MODULE_NAMES: Record<string, string> = {
  "00_welcome_intro": "Bienvenue et Introduction",
  "01_credit_scoring_intro": "Introduction au Credit Scoring",
  "02_credit_scoring_data": "Données pour le Credit Scoring",
  "03_credit_scoring_models": "Modèles de Credit Scoring",
  "04_credit_scoring_metrics_thresholds": "Évaluation et Décision",
};

function ModuleLessonContent() {
  const params = useParams();
  const { firstName } = useAuth();
  const moduleId = params.moduleId as string;
  const [module, setModule] = useState<ModuleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    getFinanceModuleCells(moduleId)
      .then(setModule)
      .catch((err) => {
        console.error("Error loading Finance module:", err);
        setError(err.message);
      });
  }, [moduleId]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30 mb-8">
        <Link href="/courses/ai-finance-banking" className="text-slate-400 hover:text-amber-500 transition-all p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
            {lang === "fr" ? "Module — AI for Finance" : "Module — AI for Finance"}
          </p>
          <h2 className="text-base font-black text-slate-900 leading-none">
            {module?.title?.[lang] || MODULE_NAMES[moduleId] || moduleId}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang("fr")}
            className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
              lang === "fr"
                ? "bg-slate-900 text-amber-400 shadow-lg shadow-slate-900/20"
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
              lang === "en"
                ? "bg-slate-900 text-amber-400 shadow-lg shadow-slate-900/20"
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Module Header & Ella Intro */}
        <header className="mb-12">
          <div className="flex items-start gap-4 md:gap-6 bg-gradient-to-br from-slate-50 via-white to-white border border-amber-500/10 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-amber-500/5">
            <div className="shrink-0 p-1.5 bg-white rounded-2xl shadow-sm border border-amber-500/10">
              <EllaAvatar size="lg" />
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <span className="bg-slate-900 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg shadow-slate-900/20">
                  {lang === "fr" ? "C'est parti !" : "Let's go!"}
                </span>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">
                  {module?.title?.[lang] || MODULE_NAMES[moduleId] || moduleId}
                </h1>
              </div>
              <p className="text-base font-bold text-slate-600 leading-relaxed max-w-2xl">
                {lang === "fr"
                  ? <>Bienvenue dans ce module{firstName ? <>, <span className="font-bold text-amber-600">{firstName}</span></> : null} ! On va explorer les fondamentaux de l&#39;IA en finance. À chaque checkpoint, je te poserai une question pour ancrer les concepts. C&#39;est parti ?</>
                  : <>Welcome to this module{firstName ? <>, <span className="font-bold text-amber-600">{firstName}</span></> : null}! We&#39;ll explore the fundamentals of AI in finance. At each checkpoint, I&#39;ll ask you a question to anchor the concepts. Ready?</>
                }
              </p>
            </div>
          </div>
        </header>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-6 rounded-3xl mb-12 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">&#x26A0;&#xFE0F;</div>
            <p>{lang === "fr" ? "Impossible de charger le module :" : "Failed to load module:"} {error}</p>
          </div>
        )}

        {/* Loading state */}
        {!module && !error && (
          <div className="flex flex-col items-center py-24 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <EllaAvatar size="sm" className="scale-75 opacity-50" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              {lang === "fr" ? "Chargement du module..." : "Loading module..."}
            </p>
          </div>
        )}

        {/* Notebook */}
        {module && (
          <Notebook
            cells={module.cells}
            moduleId={moduleId}
            lang={lang}
            courseId="finance"
          />
        )}
      </div>

      <EllaCoachingPanel
        courseId="finance"
        pageId={moduleId}
        pageTitle={module?.title?.[lang] || MODULE_NAMES[moduleId] || moduleId}
        pageType="lesson"
        lang={lang}
        studentFirstName={firstName}
      />
    </div>
  );
}

export default function FinanceModulePage() {
  return (
    <ProtectedRoute>
      <AccessCodeGate courseId="finance" courseTitle="AI for Finance & Banking" accentColor="amber">
        <ModuleLessonContent />
      </AccessCodeGate>
    </ProtectedRoute>
  );
}
