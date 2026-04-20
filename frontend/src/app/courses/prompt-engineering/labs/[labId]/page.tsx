/**
 * PE Lab interface — prompt editor + LLM output + ELLA evaluation.
 * This is the core interactive learning experience.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EllaAvatar from "@/components/EllaAvatar";
import ScoreBadge from "@/components/ScoreBadge";
import {
  getPELabDetail,
  runPELab,
  type PELabDetail,
  type PEMission,
  type PELabRunResponse,
} from "@/lib/api";

export default function LabPage() {
  const params = useParams();
  const labId = params.labId as string;

  const [lab, setLab] = useState<PELabDetail | null>(null);
  const [selectedMission, setSelectedMission] = useState<PEMission | null>(null);
  const [studentPrompt, setStudentPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [result, setResult] = useState<PELabRunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang] = useState<"fr" | "en">("fr");
  const isSystemPromptLab = labId === "04_system_prompts";

  // Load lab detail
  useEffect(() => {
    getPELabDetail(labId)
      .then((data) => {
        setLab(data);
        if (data.missions.length > 0) {
          setSelectedMission(data.missions[0]);
        }
      })
      .catch((err) => setError(err.message));
  }, [labId]);

  // Run the lab
  const handleRun = async () => {
    if (!selectedMission || !studentPrompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await runPELab({
        lab_id: labId,
        mission_id: selectedMission.mission_id,
        student_prompt: studentPrompt,
        language: lang,
        system_prompt: isSystemPromptLab ? systemPrompt : undefined,
      });
      setResult(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (error && !lab) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-ella-coral-50 text-ella-coral-800 p-4 rounded-lg text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!lab || !selectedMission) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse-warm text-ella-gray-500 text-center py-12">
          Chargement du lab...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Lab Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-ella-amber-100 flex items-center justify-center text-sm font-medium text-ella-amber-800">
            {lab.lab_id.slice(0, 2)}
          </div>
          <h1 className="font-heading text-2xl text-ella-gray-900">
            {lab.title[lang]}
          </h1>
        </div>
        <p className="text-sm text-ella-gray-700">
          {lab.concept?.[lang] || lab.description[lang]}
        </p>
      </div>

      {/* Mission Selector */}
      <div className="flex gap-3 mb-6">
        {lab.missions.map((mission) => (
          <button
            key={mission.mission_id}
            onClick={() => {
              setSelectedMission(mission);
              setResult(null);
              setStudentPrompt("");
              setSystemPrompt("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedMission.mission_id === mission.mission_id
                ? "bg-ella-amber-400 text-white"
                : "bg-ella-gray-100 text-ella-gray-700 hover:bg-ella-gray-200"
            }`}
          >
            {mission.title[lang]}
            <span className="ml-2 text-xs opacity-70">
              ({mission.audience})
            </span>
          </button>
        ))}
      </div>

      {/* Mission Instructions */}
      <div className="ella-card mb-6">
        <h2 className="font-body font-medium text-base mb-3 text-ella-gray-900">
          Mission : {selectedMission.title[lang]}
        </h2>
        <p className="text-sm text-ella-gray-700 leading-relaxed whitespace-pre-line">
          {selectedMission.instructions[lang]}
        </p>
        {selectedMission.hints && selectedMission.hints.length > 0 && (
          <details className="mt-4">
            <summary className="text-sm text-ella-amber-600 cursor-pointer font-medium">
              Besoin d'un indice ?
            </summary>
            <ul className="mt-2 space-y-1">
              {selectedMission.hints.map((hint, i) => (
                <li
                  key={i}
                  className="text-sm text-ella-gray-700 pl-4 border-l-2 border-ella-amber-200"
                >
                  {typeof hint === "object" ? hint[lang] : hint}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Two-column layout: Editor + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Prompt Editor */}
        <div>
          <h3 className="text-sm font-medium text-ella-gray-800 mb-2">
            {isSystemPromptLab ? "Ton system prompt" : "Ton prompt"}
          </h3>

          {/* System prompt editor for Lab 04 */}
          {isSystemPromptLab && (
            <div className="mb-4">
              <label className="text-xs text-ella-gray-500 mb-1 block">
                System prompt (configuration du LLM)
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Tu es un assistant RH spécialisé..."
                className="prompt-editor w-full"
                rows={6}
              />
            </div>
          )}

          {/* Main prompt editor */}
          <textarea
            value={studentPrompt}
            onChange={(e) => setStudentPrompt(e.target.value)}
            placeholder={
              isSystemPromptLab
                ? "Message utilisateur de test..."
                : "Écris ton prompt ici..."
            }
            className="prompt-editor w-full"
            rows={8}
          />

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleRun}
              disabled={loading || !studentPrompt.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-pulse-warm">●</span>
                  ELLA analyse...
                </>
              ) : (
                "Exécuter et évaluer"
              )}
            </button>
            {result && (
              <span className="text-xs text-ella-gray-500">
                {Math.round(result.execution_time_ms)}ms
              </span>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div>
          {!result && !loading && (
            <div className="ella-card h-full flex items-center justify-center text-center">
              <div>
                <EllaAvatar size="lg" className="mx-auto mb-4" />
                <p className="text-sm text-ella-gray-500">
                  Pas encore de résultat.
                  <br />
                  Écris ton prompt et lance l'exécution !
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="ella-card h-full flex items-center justify-center text-center">
              <div>
                <EllaAvatar size="lg" className="mx-auto mb-4 animate-pulse-warm" />
                <p className="text-sm text-ella-amber-600 font-medium">
                  ELLA exécute ton prompt et prépare son évaluation...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* LLM Output */}
              <div className="ella-card">
                <h3 className="text-sm font-medium text-ella-gray-800 mb-2">
                  Résultat du LLM
                </h3>
                <pre className="text-sm text-ella-gray-700 whitespace-pre-wrap font-mono bg-ella-gray-50 p-3 rounded-lg overflow-auto max-h-64">
                  {result.llm_output}
                </pre>
              </div>

              {/* ELLA Evaluation */}
              <div className="ella-card border-l-4 border-ella-amber-400">
                <div className="flex items-start gap-3 mb-4">
                  <EllaAvatar size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ella-amber-800">
                      Évaluation d'ELLA
                    </p>
                    <div className="mt-2">
                      <ScoreBadge
                        score={result.evaluation.total_score}
                        maxScore={result.evaluation.max_score}
                      />
                    </div>
                  </div>
                </div>

                {/* Criteria Scores */}
                <div className="space-y-2 mb-4">
                  {Object.entries(result.evaluation.criteria_scores).map(
                    ([id, criterion]) => (
                      <div
                        key={id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="flex gap-0.5 mt-0.5 shrink-0">
                          {[0, 1].map((i) => (
                            <div
                              key={i}
                              className={`w-2.5 h-2.5 rounded-full ${
                                i < criterion.score
                                  ? "bg-ella-teal-400"
                                  : "bg-ella-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <div>
                          <span className="font-medium text-ella-gray-800">
                            {id}
                          </span>
                          <span className="text-ella-gray-500 ml-1">
                            — {criterion.feedback}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Strengths & Improvements */}
                {result.evaluation.strengths.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-ella-teal-600 mb-1">
                      Points forts
                    </p>
                    {result.evaluation.strengths.map((s, i) => (
                      <p
                        key={i}
                        className="text-sm text-ella-gray-700 pl-3 border-l-2 border-ella-teal-200 mb-1"
                      >
                        {s}
                      </p>
                    ))}
                  </div>
                )}

                {result.evaluation.improvements.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-ella-amber-600 mb-1">
                      Axes d'amélioration
                    </p>
                    {result.evaluation.improvements.map((s, i) => (
                      <p
                        key={i}
                        className="text-sm text-ella-gray-700 pl-3 border-l-2 border-ella-amber-200 mb-1"
                      >
                        {s}
                      </p>
                    ))}
                  </div>
                )}

                {/* Hint */}
                {result.evaluation.improved_prompt_hint && (
                  <div className="bg-ella-amber-50 rounded-lg p-3 mt-3">
                    <p className="text-xs font-medium text-ella-amber-800 mb-1">
                      Indice d'ELLA
                    </p>
                    <p className="text-sm text-ella-amber-900">
                      {result.evaluation.improved_prompt_hint}
                    </p>
                  </div>
                )}

                {/* Pedagogical Note */}
                {result.evaluation.pedagogical_note && (
                  <p className="text-xs text-ella-gray-500 mt-3 italic">
                    {result.evaluation.pedagogical_note}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-ella-coral-50 text-ella-coral-800 p-4 rounded-lg text-sm mt-4">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
