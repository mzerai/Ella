/**
 * Prompt Engineering course page — learning path with modules and labs.
 */

"use client";

import { useEffect, useState } from "react";
import EllaAvatar from "@/components/EllaAvatar";
import LabCard from "@/components/LabCard";
import { listPELabs, type PELab } from "@/lib/api";

import Link from "next/link";

const modules = [
  {
    number: "01",
    lab_id: "01_zero_shot",
    title: "Zero-Shot Prompting",
    description:
      "Apprenez à obtenir des résultats du LLM sans fournir d'exemples, uniquement par la qualité de vos instructions.",
    concept: "Les 4C : Contexte, Consigne, Contraintes, Format de sortie.",
    status: "in-progress",
  },
  {
    number: "02",
    lab_id: "02_few_shot",
    title: "Few-Shot Prompting",
    description:
      "Sélectionnez et formatez des exemples qui guident le LLM vers le comportement désiré.",
    concept: "Les 5 règles d'or des exemples.",
    status: "not-started",
  },
  {
    number: "03",
    lab_id: "03_chain_of_thought",
    title: "Chain-of-Thought",
    description:
      "Forcez le LLM à expliciter son raisonnement pour améliorer la fiabilité sur les tâches complexes.",
    concept: "3 niveaux : déclencheur simple, étapes imposées, few-shot CoT.",
    status: "not-started",
  },
  {
    number: "04",
    lab_id: "04_system_prompts",
    title: "System Prompts",
    description:
      "Configurez le comportement global du LLM : personnalité, contraintes, format, garde-fous de sécurité.",
    concept: "Les 6 sections : identité, périmètre, ton, format, sécurité, cas limites.",
    status: "not-started",
  },
  {
    number: "05",
    lab_id: "05_structured_output",
    title: "Structured Output",
    description:
      "Obtenez des sorties structurées et parsables — JSON, CSV, tableaux — pour intégrer un LLM dans un pipeline.",
    concept: "Schéma, types, validation, fallback en code.",
    status: "not-started",
  },
];

export default function PromptEngineeringCourse() {
  const [labs, setLabs] = useState<PELab[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPELabs()
      .then((data) => setLabs(data.labs))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-ella-bg">
      {/* Course Header Band */}
      <header className="bg-ella-primary text-white pt-10 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/courses" className="text-white/70 hover:text-white text-sm transition-colors">Cours</Link>
            <span className="text-white/40 text-sm">/</span>
            <span className="text-white text-sm font-medium">Prompt Engineering</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Prompt Engineering</h1>
          <p className="text-ella-primary-bg/80 max-w-2xl text-lg leading-relaxed font-light">
            Maîtrisez l'art de piloter les Large Language Models (LLM) avec précision pour transformer vos idées en résultats concrets.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-2 space-y-4">
            {modules.map((mod, index) => (
              <Link
                key={mod.lab_id}
                href={`/courses/prompt-engineering/labs/${mod.lab_id}`}
                className="block group"
              >
                <div className="bg-white rounded-xl border border-ella-gray-200 p-5 flex items-center gap-5 transition-all hover:border-ella-primary/40 hover:shadow-sm">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 font-bold text-xl transition-colors
                    ${mod.status === 'in-progress' ? 'bg-ella-accent text-white' : 
                      mod.status === 'completed' ? 'bg-ella-success text-white' : 'bg-ella-gray-100 text-ella-gray-400'}`}>
                    {mod.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ella-gray-900 mb-1 group-hover:text-ella-primary transition-colors">{mod.title}</h3>
                    <p className="text-xs text-ella-gray-600 line-clamp-1">{mod.description}</p>
                  </div>
                  <div className="text-ella-gray-300 group-hover:text-ella-primary transition-colors pr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ella Welcome */}
            <div className="bg-ella-primary-bg border border-ella-primary/20 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <EllaAvatar size="sm" />
                <h4 className="font-bold text-ella-primary-dark">Le mot d'Ella</h4>
              </div>
              <p className="text-sm text-ella-primary-dark/80 leading-relaxed italic">
                "Content de te voir ici ! Le Prompt Engineering n'est pas une science exacte, c'est un dialogue. Prends ton temps sur le zero-shot, c'est la base de tout ce qui suit."
              </p>
            </div>

            {/* Course Progress */}
            <div className="bg-white border border-ella-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-ella-gray-900 text-sm italic">Progression</h4>
                <span className="text-xs font-bold text-ella-primary">20%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill bg-ella-primary" style={{ width: '20%' }}></div>
              </div>
              <div className="mt-4 flex justify-between text-[10px] uppercase tracking-wider font-bold text-ella-gray-500">
                <span>1/5 Modules</span>
                <span>4 missions à venir</span>
              </div>
            </div>

            {/* Help Card */}
            <Link href="/chat" className="block p-4 bg-ella-accent rounded-xl text-white hover:bg-ella-accent-dark transition-colors shadow-lg shadow-ella-accent/20">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold">Un blocage ?</h4>
                  <p className="text-xs text-white/80">Demande de l'aide à Ella en direct.</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Error state */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
          <div className="bg-ella-accent-bg text-ella-accent-dark p-4 rounded-lg text-sm border border-ella-accent/20">
             Désolé {error}. Ella fait une petite sieste...
          </div>
        </div>
      )}
    </div>
  );
}
