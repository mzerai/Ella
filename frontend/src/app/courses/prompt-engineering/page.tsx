/**
 * Prompt Engineering course page — learning path with modules and labs.
 */

"use client";

import { useEffect, useState } from "react";
import EllaAvatar from "@/components/EllaAvatar";
import LabCard from "@/components/LabCard";
import { listPELabs, type PELab } from "@/lib/api";

const modules = [
  {
    number: "01",
    lab_id: "01_zero_shot",
    title: "Zero-Shot Prompting",
    description:
      "Apprenez à obtenir des résultats du LLM sans fournir d'exemples, uniquement par la qualité de vos instructions.",
    concept: "Les 4C : Contexte, Consigne, Contraintes, Format de sortie.",
  },
  {
    number: "02",
    lab_id: "02_few_shot",
    title: "Few-Shot Prompting",
    description:
      "Sélectionnez et formatez des exemples qui guident le LLM vers le comportement désiré.",
    concept: "Les 5 règles d'or des exemples.",
  },
  {
    number: "03",
    lab_id: "03_chain_of_thought",
    title: "Chain-of-Thought",
    description:
      "Forcez le LLM à expliciter son raisonnement pour améliorer la fiabilité sur les tâches complexes.",
    concept: "3 niveaux : déclencheur simple, étapes imposées, few-shot CoT.",
  },
  {
    number: "04",
    lab_id: "04_system_prompts",
    title: "System Prompts",
    description:
      "Configurez le comportement global du LLM : personnalité, contraintes, format, garde-fous de sécurité.",
    concept: "Les 6 sections : identité, périmètre, ton, format, sécurité, cas limites.",
  },
  {
    number: "05",
    lab_id: "05_structured_output",
    title: "Structured Output",
    description:
      "Obtenez des sorties structurées et parsables — JSON, CSV, tableaux — pour intégrer un LLM dans un pipeline.",
    concept: "Schéma, types, validation, fallback en code.",
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Course Header */}
      <div className="mb-10">
        <span className="inline-block bg-ella-coral-50 text-ella-coral-600 text-xs font-medium px-2.5 py-1 rounded-md mb-3">
          Nouveau
        </span>
        <h1 className="font-heading text-3xl text-ella-gray-900 mb-3">
          Prompt Engineering
        </h1>
        <p className="text-ella-gray-700 leading-relaxed max-w-2xl">
          Maîtrisez l'art de communiquer avec les LLM en 5 modules progressifs.
          Chaque module contient une leçon et des missions pratiques évaluées par ELLA.
        </p>
      </div>

      {/* ELLA Welcome */}
      <div className="ella-bubble mb-10">
        <div className="flex items-start gap-3">
          <EllaAvatar size="sm" />
          <div>
            <p className="text-sm font-medium text-ella-amber-800 mb-1">
              ELLA
            </p>
            <p className="text-sm text-ella-gray-800 leading-relaxed">
              Bienvenue dans le parcours Prompt Engineering ! On commence par
              le zero-shot — la base de tout. Pas besoin de prérequis, juste
              de la curiosité. Quand tu es prêt, clique sur le premier module.
              Je serai là à chaque étape.
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-ella-coral-50 text-ella-coral-800 p-4 rounded-lg mb-6 text-sm">
          Impossible de charger les labs : {error}. Vérifiez que le backend est lancé.
        </div>
      )}

      {/* Module Learning Path */}
      <div className="space-y-4">
        {modules.map((mod, index) => (
          <LabCard
            key={mod.lab_id}
            number={mod.number}
            title={mod.title}
            description={mod.description}
            progress={0}
            href={`/courses/prompt-engineering/labs/${mod.lab_id}`}
            locked={false}
          />
        ))}
      </div>
    </div>
  );
}
