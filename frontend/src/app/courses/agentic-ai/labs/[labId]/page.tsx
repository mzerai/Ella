/**
 * Agentic AI Lab page — handles written analysis labs with ELLA qualitative feedback
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EllaAvatar from "@/components/EllaAvatar";
import EllaCoachingPanel from "@/components/EllaCoachingPanel";
import {
  getAgenticLabDetail,
  evaluateAgenticResponse,
  type PELabDetail,
  type PEMission,
  type AgenticEvalResponse,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";

// Labs link to the NEXT MODULE (lesson), not the next lab
const NEXT_LESSONS: Record<string, { id: string; title: { fr: string; en: string } } | null> = {
  "00_diagnose_fake_agent_lab": { id: "01_anatomy_of_enterprise_ai_agent", title: { fr: "Anatomie d'un agent", en: "Agent Anatomy" } },
  "01_decompose_enterprise_agent_lab": { id: "02_design_agentic_workflow", title: { fr: "Workflow agentique", en: "Agentic Workflow" } },
  "01_anatomy_enterprise_agent_lab": { id: "02_design_agentic_workflow", title: { fr: "Workflow agentique", en: "Agentic Workflow" } },
  "02_map_agentic_workflow_lab": { id: "03_tool_calling_api_enterprise_integration", title: { fr: "Tool Calling & API", en: "Tool Calling & API" } },
  "03_specify_agent_tools_lab": { id: "04_rag_memory_context_management", title: { fr: "RAG, Mémoire & Contexte", en: "RAG, Memory & Context" } },
  "03_tool_specification_api_integration_lab": { id: "04_rag_memory_context_management", title: { fr: "RAG, Mémoire & Contexte", en: "RAG, Memory & Context" } },
  "04_design_rag_memory_context_lab": { id: "05_single_agent_multi_agent_architectures", title: { fr: "Architectures agents", en: "Agent Architectures" } },
  "04_rag_memory_strategy_lab": { id: "05_single_agent_multi_agent_architectures", title: { fr: "Architectures agents", en: "Agent Architectures" } },
  "05_choose_agent_architecture_lab": { id: "06_security_governance_compliance", title: { fr: "Sécurité & Gouvernance", en: "Security & Governance" } },
  "06_agentic_risk_review_lab": { id: "07_evaluation_observability_production_readiness", title: { fr: "Évaluation & Observabilité", en: "Evaluation & Observability" } },
  "07_agent_evaluation_observability_plan_lab": { id: "08_deploy_enterprise_ai_agent_pilot", title: { fr: "Déployer un pilote", en: "Deploy a Pilot" } },
  "08_enterprise_agent_pilot_plan_lab": { id: "final_governed_enterprise_agent_design_lab", title: { fr: "Lab final", en: "Final Lab" } },
  "final_governed_enterprise_agent_design_lab": null,
};

const QUALITATIVE_BADGES: Record<string, { label: { fr: string; en: string }; color: string }> = {
  excellent: {
    label: { fr: "Excellent", en: "Excellent" },
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  good: {
    label: { fr: "Bien", en: "Good" },
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  needs_improvement: {
    label: { fr: "A approfondir", en: "Needs improvement" },
    color: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

function AgenticLabContent() {
  const params = useParams();
  const labId = params.labId as string;
  const isGenAIDemo = false; // Agentic labs are all written analysis labs

  const { user, firstName } = useAuth();
  const supabase = createClient();

  const [lab, setLab] = useState<PELabDetail | null>(null);
  const [selectedMission, setSelectedMission] = useState<PEMission | null>(null);
  const [studentText, setStudentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  // Type B state (Written labs)
  const [evalResult, setEvalResult] = useState<AgenticEvalResponse | null>(null);

  // Load lab detail
  useEffect(() => {
    getAgenticLabDetail(labId)
      .then((data) => {
        setLab(data);
        if (data.missions.length > 0) {
          setSelectedMission(data.missions[0]);
        }
      })
      .catch((err) => setError(err.message));
  }, [labId]);

  const saveAttempt = async (data: {
    feedback?: string;
    score_qualitative?: string;
  }) => {
    if (!user) return;
    try {
      await supabase.from("lab_attempts").insert({
        user_id: user.id,
        course_id: "agentic",
        lab_id: labId,
        mission_id: selectedMission?.mission_id,
        student_prompt: studentText,
        llm_output: data.feedback || "",
        evaluation: { feedback: data.feedback, score_qualitative: data.score_qualitative },
      });
    } catch (err) {
      console.error("Error saving attempt:", err);
    }
  };

  // Submit written analysis
  const handleSubmitWritten = async () => {
    if (!selectedMission || !studentText.trim()) return;
    setLoading(true);
    setError(null);
    setEvalResult(null);

    try {
      const response = await evaluateAgenticResponse({
        lab_id: labId,
        mission_id: selectedMission.mission_id,
        student_response: studentText,
        language: lang,
      });
      setEvalResult(response);
      await saveAttempt({
        feedback: response.feedback,
        score_qualitative: response.score_qualitative,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const hasResult = !!evalResult;
  const canShowNext = evalResult && evalResult.score_qualitative !== "needs_improvement";

  // --- Error state ---
  if (error && !lab) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center flex flex-col items-center">
        <EllaAvatar size="lg" className="mb-6 opacity-30" />
        <div className="bg-ella-accent-bg text-ella-accent-dark p-6 rounded-xl border border-ella-accent/20">
          <p className="font-bold mb-2">Ella est momentanément indisponible.</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  // --- Loading state ---
  if (!lab || !selectedMission) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center animate-pulse-warm">
          <EllaAvatar size="lg" className="mb-4" />
          <p className="text-ella-gray-500 font-medium">Chargement du cas pratique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/courses/agentic-ai"
            className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm hover:bg-purple-700 transition-colors"
          >
            {lab.lab_id.slice(0, 2)}
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ella-gray-900 leading-tight">
              {lab.title[lang]}
            </h1>
            <p className="text-xs text-ella-gray-500">
              {lab.concept?.[lang] || lab.description[lang]}{" "}
              {lang === "fr" ? (
                <>À toi de jouer{firstName ? <>, <span className="font-bold text-purple-600">{firstName}</span></> : null} !</>
              ) : (
                <>Your turn{firstName ? <>, <span className="font-bold text-purple-600">{firstName}</span></> : null}!</>
              )}
            </p>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mission & Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mission Description */}
          <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-purple-700 mb-2 uppercase tracking-wider">
              {lang === "fr" ? "Ta Mission" : "Your Mission"}
            </h2>
            <div className="prose prose-sm max-w-none text-ella-gray-800 leading-relaxed font-medium mb-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedMission.instructions[lang]}</ReactMarkdown>
            </div>
            {selectedMission.hints && selectedMission.hints.length > 0 && (
              <details className="group border-t border-ella-gray-100 pt-3">
                <summary className="text-xs text-purple-600 cursor-pointer font-bold list-none flex items-center gap-1 group-open:mb-2">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  {lang === "fr" ? "Besoin d'un coup de pouce ?" : "Need a hint?"}
                </summary>
                <div className="space-y-2">
                  {selectedMission.hints.map((hint, i) => (
                    <div key={i} className="bg-purple-50 rounded-lg p-3 text-xs text-purple-900 leading-relaxed italic prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{typeof hint === "object" ? hint[lang] : hint}</ReactMarkdown>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-ella-gray-500 mb-2 block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                {lang === "fr" ? "TON ANALYSE" : "YOUR ANALYSIS"}
              </label>
              <textarea
                value={studentText}
                onChange={(e) => setStudentText(e.target.value)}
                placeholder={lang === "fr" ? "Rédige ton analyse ici. Sois précis et structure ta réponse..." : "Write your analysis here. Be specific and structure your response..."}
                className="prompt-editor w-full"
                style={{ minHeight: "350px" }}
              />
              <p className="text-[10px] text-ella-gray-400 mt-1">
                {lang === "fr"
                  ? `${studentText.length} caractères — vise au moins 500 caractères pour une analyse substantielle.`
                  : `${studentText.length} characters — aim for at least 500 characters for a substantial analysis.`
                }
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSubmitWritten}
                disabled={loading || !studentText.trim()}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {lang === "fr" ? "Ella analyse..." : "Ella is analyzing..."}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    {lang === "fr" ? "Soumettre à Ella" : "Submit to Ella"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Empty state */}
          {!hasResult && !loading && (
            <div className="bg-ella-gray-100 rounded-xl border-2 border-dashed border-ella-gray-200 h-full flex items-center justify-center text-center p-8">
              <div className="max-w-xs">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <EllaAvatar size="sm" />
                </div>
                <h4 className="font-bold text-ella-gray-900 mb-1">
                  {lang === "fr" ? "Prêt pour le défi ?" : "Ready for the challenge?"}
                </h4>
                <p className="text-xs text-ella-gray-500">
                  {lang === "fr"
                    ? "Rédige ton analyse à gauche et soumets-la. Ella te donnera un feedback détaillé."
                    : "Write your analysis on the left and submit it. Ella will give you detailed feedback."}
                </p>
              </div>
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="bg-white rounded-xl border border-ella-gray-200 h-full flex items-center justify-center text-center p-8 shadow-sm">
              <div className="animate-fade-in">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <EllaAvatar size="sm" />
                  </div>
                </div>
                <p className="text-sm font-bold text-purple-800">
                  {lang === "fr" ? "Ella analyse ton travail..." : "Ella is analyzing your work..."}
                </p>
                <p className="text-xs text-ella-gray-500 mt-2">
                  {lang === "fr" ? "La réponse arrive dans quelques secondes." : "The answer will arrive in a few seconds."}
                </p>
              </div>
            </div>
          )}

          {/* Written lab results */}
          {evalResult && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-white rounded-xl border border-ella-gray-200 shadow-lg overflow-hidden">
                {/* Header with qualitative badge */}
                <div className="bg-purple-600 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EllaAvatar size="sm" className="ring-2 ring-white/20" />
                    <span className="font-bold text-sm">
                      {lang === "fr" ? "Feedback d'Ella" : "Ella's Feedback"}
                    </span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-black border ${QUALITATIVE_BADGES[evalResult.score_qualitative]?.color || QUALITATIVE_BADGES.good.color}`}>
                    {QUALITATIVE_BADGES[evalResult.score_qualitative]?.label[lang] || evalResult.score_qualitative}
                  </div>
                </div>

                {/* Feedback content */}
                <div className="p-5">
                  <div className="prose prose-sm prose-ella max-w-none text-ella-gray-800 leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {evalResult.feedback}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Retry encouragement for needs_improvement */}
              {evalResult.score_qualitative === "needs_improvement" && (
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 text-center">
                  <p className="text-sm font-bold text-purple-800 mb-1">
                    {lang === "fr" ? "Tu peux faire mieux !" : "You can do better!"}
                  </p>
                  <p className="text-xs text-purple-700">
                    {lang === "fr"
                      ? "Relis le feedback d'Ella, enrichis ton analyse, et soumets à nouveau."
                      : "Review Ella's feedback, enrich your analysis, and submit again."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Next Lesson Button */}
          {canShowNext && (
            <div className="flex justify-center pt-8 pb-4">
              {NEXT_LESSONS[labId] ? (
                <Link
                  href={`/courses/agentic-ai/modules/${NEXT_LESSONS[labId]?.id}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <span className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest group-hover:text-purple-600 transition-colors">
                    {lang === "fr" ? "Module suivant" : "Next Module"}
                  </span>
                  <div className="px-6 py-4 rounded-2xl bg-purple-600/10 flex items-center gap-4 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-lg hover:shadow-purple-600/30">
                    <span className="font-bold">{NEXT_LESSONS[labId]?.title[lang]}</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="group flex flex-col items-center gap-2"
                >
                  <span className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest group-hover:text-purple-600 transition-colors">
                    {lang === "fr" ? "Parcours terminé" : "Course Completed"}
                  </span>
                  <div className="px-6 py-4 rounded-2xl bg-emerald-500/10 flex items-center gap-4 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg hover:shadow-emerald-500/30">
                    <span className="font-bold">
                      {lang === "fr" ? "Parcours Agentic AI terminé !" : "Agentic AI Course Completed!"}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-purple-50 text-purple-800 p-4 rounded-lg text-sm border border-purple-200 mt-6 shadow-sm">
          {lang === "fr"
            ? `Oups ! ${error}. Ella est momentanément indisponible, réessaye dans un instant.`
            : `Oops! ${error}. Ella is temporarily unavailable, try again in a moment.`
          }
        </div>
      )}

      <EllaCoachingPanel
        courseId="agentic"
        pageId={labId}
        pageTitle={lab.title[lang]}
        pageType="lab"
        lang={lang}
        studentFirstName={firstName}
        labContext={{
          missionId: selectedMission?.mission_id,
          lastQualitative: evalResult?.score_qualitative,
        }}
      />
    </div>
  );
}

import AccessCodeGate from "@/components/AccessCodeGate";

export default function AgenticLabPage() {
  return (
    <ProtectedRoute>
      <AccessCodeGate courseId="agentic" courseTitle="Agentic AI for Enterprise Workflows" accentColor="purple">
        <AgenticLabContent />
      </AccessCodeGate>
    </ProtectedRoute>
  );
}
