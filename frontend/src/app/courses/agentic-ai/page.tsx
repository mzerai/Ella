"use client";

import { useEffect, useState } from "react";
import EllaAvatar from "@/components/EllaAvatar";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccessCodeGate from "@/components/AccessCodeGate";

const modules = [
  {
    number: "00",
    module_id: "00_course_positioning",
    title: "Comprendre l'IA agentique en entreprise",
    description: "Chatbot, assistant, workflow, agent, multi-agents — distinguer les vrais agents des faux et comprendre pourquoi l'IA agentique arrive maintenant.",
    concept: "Niveaux d'agenticité, composants d'un agent, cas d'usage entreprise.",
    has_lab: true,
    lab_url: "/courses/agentic-ai/labs/00_diagnose_fake_agent_lab",
  },
  {
    number: "01",
    module_id: "01_anatomy_of_enterprise_ai_agent",
    title: "Anatomie d'un agent IA d'entreprise",
    description: "Les 12 composants d'un agent : objectif, instructions, contexte, outils, permissions, garde-fous, logs, évaluation.",
    concept: "12 composants, lecture vs écriture, validation humaine, traçabilité.",
    has_lab: true,
    lab_url: "/courses/agentic-ai/labs/01_decompose_enterprise_agent_lab",
  },
  {
    number: "02",
    module_id: "02_design_agentic_workflow",
    title: "Concevoir un workflow agentique",
    description: "Partir du vrai travail, garder le chemin critique sous contrôle, placer l'humain au bon endroit.",
    concept: "Workflow vs agent, chemin critique, human-in-the-loop, points de décision.",
    has_lab: true,
    lab_url: "/courses/agentic-ai/labs/02_map_agentic_workflow_lab",
  },
  {
    number: "03",
    module_id: "03_tool_calling_api_enterprise_integration",
    title: "Tool Calling & Intégration API",
    description: "Un outil est un contrat. Les trois niveaux de risque : lecture, écriture, action externe.",
    concept: "Contrat outil, risques lecture/écriture/envoi, idempotence, secrets.",
    has_lab: true,
    lab_url: "/courses/agentic-ai/labs/03_specify_agent_tools_lab",
  },
  {
    number: "04",
    module_id: "04_rag_memory_context_management",
    title: "RAG, Mémoire & Gestion du contexte",
    description: "RAG n'est pas de la mémoire. Les quatre types de contexte, la gestion des sources, l'injection de prompt.",
    concept: "RAG vs mémoire, types de contexte, chunking, métadonnées, données personnelles.",
    has_lab: true,
    lab_url: "/courses/agentic-ai/labs/04_design_rag_memory_context_lab",
  },
  {
    number: "05",
    module_id: "05_single_agent_multi_agent_architectures",
    title: "Architectures mono et multi-agents",
    description: "Cinq architectures de complexité croissante. Commencer simple, ajouter de la complexité seulement si nécessaire.",
    concept: "5 architectures, critères de choix, anti-patterns, supervision.",
    has_lab: true,
    lab_url: "/courses/agentic-ai/labs/05_choose_agent_architecture_lab",
  },
  {
    number: "06",
    module_id: "06_security_governance_compliance",
    title: "Sécurité, Gouvernance & Conformité",
    description: "NIST AI RMF, garde-fous techniques et organisationnels, registre d'agents, mode observation.",
    concept: "Sécurité/gouvernance/conformité, NIST AI RMF, guardrails, registre agents.",
    has_lab: true,
    lab_url: "/courses/agentic-ai/labs/06_agentic_risk_review_lab",
  },
  {
    number: "07",
    module_id: "07_evaluation_observability_production_readiness",
    title: "Évaluation, Observabilité & Production",
    description: "Quatre niveaux d'évaluation, graders, traces, tests de régression et critères de production readiness.",
    concept: "4 niveaux évaluation, graders, traces, dataset test, monitoring.",
    has_lab: true,
    lab_url: "/courses/agentic-ai/labs/07_agent_evaluation_observability_plan_lab",
  },
  {
    number: "08",
    module_id: "08_deploy_enterprise_ai_agent_pilot",
    title: "Déployer un agent IA en entreprise",
    description: "Prototype, pilote, production. Plan 60/90 jours, rôles, KPI, communication, décision finale.",
    concept: "Prototype vs pilote vs production, plan pilote, KPI, rollback, décision.",
    has_lab: true,
    lab_url: "/courses/agentic-ai/labs/08_enterprise_agent_pilot_plan_lab",
  },
];

function CourseContent() {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const isAdmin = user?.email === "mourad.zerai@gmail.com";

  useEffect(() => {
    const updateProgress = () => {
      try {
        const completed = JSON.parse(
          localStorage.getItem("ellaCompletedAgenticLessons") || "[]"
        );
        setCompletedLessons(completed);
      } catch (e) {
        console.error("Failed to load Agentic progress", e);
      }
    };

    updateProgress();
    window.addEventListener("storage", updateProgress);
    return () => window.removeEventListener("storage", updateProgress);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Course Header Band */}
      <header className="bg-gradient-to-br from-ella-dark to-ella-primary-dark text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/"
              className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Catalogue
            </Link>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-white/90 text-xs font-bold uppercase tracking-widest">
              Agentic AI for Enterprise
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">
            Agentic AI for Enterprise Workflows
          </h1>
          <p className="text-ella-dark-text/70 max-w-2xl text-lg leading-relaxed font-medium">
            Concevez, gouvernez et déployez des agents IA dans de vrais processus d'entreprise. Du workflow agentique au pilote en production — avec ELLA comme coach technique.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-20 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black text-ella-gray-400 uppercase tracking-widest">
                Le parcours technique
              </h2>
            </div>

            {modules.map((mod) => (
              <div
                key={mod.module_id}
                className="bg-white rounded-[2rem] border border-ella-gray-200 p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all hover:shadow-2xl hover:shadow-ella-gray-900/5 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-2xl shadow-lg transition-transform group-hover:scale-110
                  ${
                    completedLessons.includes(mod.module_id) || isAdmin
                      ? "bg-ella-success text-white"
                      : "bg-purple-50 text-purple-300 border border-purple-100"
                  }`}
                >
                  {mod.number}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-ella-gray-900 mb-1.5">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-ella-gray-500 line-clamp-2 md:line-clamp-1 font-medium italic mb-4 md:mb-0 opacity-80">
                    {mod.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/agentic-ai/modules/${mod.module_id}`}
                    className="btn-secondary !text-xs !py-3 !px-5 !rounded-xl font-black bg-purple-600/5 text-purple-700 hover:bg-purple-600 hover:text-white border-none shadow-none"
                  >
                    Module
                  </Link>
                  {mod.has_lab &&
                    (isAdmin ||
                    completedLessons.includes(mod.module_id) ? (
                      <Link
                        href={mod.lab_url || "#"}
                        className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black shadow-lg shadow-ella-accent/10"
                      >
                        Cas pratique
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black opacity-30 grayscale cursor-not-allowed flex items-center gap-2"
                        title="Complétez le module pour débloquer le cas pratique"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                          ></path>
                        </svg>
                        Cas pratique
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ella Welcome */}
            <div className="bg-white border-2 border-purple-600/10 rounded-[2rem] p-6 shadow-xl shadow-purple-600/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full -mr-12 -mt-12"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <EllaAvatar size="sm" />
                <h4 className="font-black text-ella-gray-900 uppercase tracking-widest text-[10px]">
                  Le mot d'Ella
                </h4>
              </div>
              <p className="text-sm text-ella-gray-700 leading-relaxed font-bold italic relative z-10">
                "Bienvenue dans le parcours Agentic AI ! Chaque module te donnera les outils concrets pour concevoir des agents IA robustes, sécurisés et déployables en entreprise. Les checkpoints sont là pour ancrer ce que tu apprends."
              </p>
            </div>

            {/* Course Progress */}
            <div className="bg-white border border-ella-gray-200 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-ella-gray-900 uppercase tracking-widest text-[10px]">
                  Ma Progression
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-purple-700">
                    {Math.round(
                      ((isAdmin ? modules.length : completedLessons.length) / modules.length) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-ella-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-1000"
                  style={{
                    width: `${
                      isAdmin
                        ? 100
                        : (completedLessons.length / modules.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="mt-4 flex justify-between text-[10px] uppercase tracking-widest font-black text-ella-gray-400">
                <span>
                  {isAdmin ? modules.length : completedLessons.length}/
                  {modules.length} Modules
                </span>
                <span>
                  {isAdmin ? 0 : modules.length - completedLessons.length}{" "}
                  restants
                </span>
              </div>
            </div>

            {/* Help Card */}
            <Link
              href="/chat"
              className="group block p-6 bg-purple-600 rounded-[2rem] text-white hover:bg-purple-700 transition-all shadow-2xl shadow-purple-600/30 active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-tight leading-none mb-1">
                    Une question ?
                  </h4>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest">
                    Parler à Ella
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AgenticAICourse() {
  return (
    <ProtectedRoute>
      <AccessCodeGate courseId="agentic" courseTitle="Agentic AI for Enterprise Workflows" accentColor="purple">
        <CourseContent />
      </AccessCodeGate>
    </ProtectedRoute>
  );
}
