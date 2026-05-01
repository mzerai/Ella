"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Notebook from "@/components/Notebook";
import EllaAvatar from "@/components/EllaAvatar";
import EllaCoachingPanel from "@/components/EllaCoachingPanel";
import { useAuth } from "@/components/AuthProvider";
import { getAgenticModuleCells, type ModuleData } from "@/lib/api";
import Link from "next/link";

const MODULE_NAMES: Record<string, string> = {
  "00_course_positioning": "Comprendre l'IA agentique en entreprise",
  "01_anatomy_of_enterprise_ai_agent": "Anatomie d'un agent IA d'entreprise",
  "02_design_agentic_workflow": "Concevoir un workflow agentique",
  "03_tool_calling_api_enterprise_integration": "Tool Calling & Intégration API",
  "04_rag_memory_context_management": "RAG, Mémoire & Gestion du contexte",
  "05_single_agent_multi_agent_architectures": "Architectures mono et multi-agents",
  "06_security_governance_compliance": "Sécurité, Gouvernance & Conformité",
  "07_evaluation_observability_production_readiness": "Évaluation, Observabilité & Production",
  "08_deploy_enterprise_ai_agent_pilot": "Déployer un agent IA en entreprise",
};

import ProtectedRoute from "@/components/ProtectedRoute";
import AccessCodeGate from "@/components/AccessCodeGate";

function ModuleLessonContent() {
  const params = useParams();
  const { firstName } = useAuth();
  const moduleId = params.moduleId as string;
  const [module, setModule] = useState<ModuleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    getAgenticModuleCells(moduleId)
      .then(setModule)
      .catch((err) => {
        console.error("Error loading Agentic module:", err);
        setError(err.message);
      });
  }, [moduleId]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 border-b border-ella-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30 mb-8">
        <Link href="/courses/agentic-ai" className="text-ella-gray-400 hover:text-purple-600 transition-all p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-0.5">
            {lang === "fr" ? "Module — Agentic AI" : "Module — Agentic AI"}
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
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "bg-ella-gray-100 text-ella-gray-400 hover:bg-ella-gray-200"
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
              lang === "en"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
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
          <div className="flex items-start gap-4 md:gap-6 bg-gradient-to-br from-purple-50 via-white to-white border border-purple-600/10 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-purple-600/5">
            <div className="shrink-0 p-1.5 bg-white rounded-2xl shadow-sm border border-purple-600/10">
              <EllaAvatar size="lg" />
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg shadow-purple-600/20">
                  {lang === "fr" ? "C'est parti !" : "Let's go!"}
                </span>
                <h1 className="text-3xl font-black text-ella-gray-900 leading-tight">
                  {module?.title[lang] || MODULE_NAMES[moduleId] || moduleId}
                </h1>
              </div>
              <p className="text-base font-bold text-ella-gray-600 leading-relaxed max-w-2xl">
                {lang === "fr"
                  ? <>Bienvenue dans ce module{firstName ? <>, <span className="font-bold text-purple-600">{firstName}</span></> : null} ! On va explorer les fondamentaux de l&#39;IA agentique en entreprise. À chaque checkpoint, je te poserai une question pour ancrer les concepts. C&#39;est parti ?</>
                  : <>Welcome to this module{firstName ? <>, <span className="font-bold text-purple-600">{firstName}</span></> : null}! We&#39;ll explore the fundamentals of enterprise agentic AI. At each checkpoint, I&#39;ll ask you a question to anchor the concepts. Ready?</>
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
              <div className="w-16 h-16 border-4 border-ella-gray-100 border-t-purple-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <EllaAvatar size="sm" className="scale-75 opacity-50" />
              </div>
            </div>
            <p className="text-sm font-bold text-ella-gray-400 uppercase tracking-widest animate-pulse">
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
            courseId="agentic"
          />
        )}
      </div>

      <EllaCoachingPanel
        courseId="agentic"
        pageId={moduleId}
        pageTitle={module?.title[lang] || MODULE_NAMES[moduleId] || moduleId}
        pageType="lesson"
        lang={lang}
        studentFirstName={firstName}
      />
    </div>
  );
}

export default function AgenticModulePage() {
  return (
    <ProtectedRoute>
      <AccessCodeGate courseId="agentic" courseTitle="Agentic AI for Enterprise Workflows" accentColor="purple">
        <ModuleLessonContent />
      </AccessCodeGate>
    </ProtectedRoute>
  );
}

