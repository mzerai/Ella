/**
 * AILE Lab page — handles two lab types:
 *   Type A (02_genai_demo): PE-style prompt editor + LLM execution + ELLA evaluation
 *   Type B (01, 03, 04, 05): Written analysis textarea + ELLA qualitative feedback
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EllaAvatar from "@/components/EllaAvatar";
import EllaCoachingPanel from "@/components/EllaCoachingPanel";
import MaturityDiagnosticWizard from "@/components/MaturityDiagnosticWizard";
import {
  getAILELabDetail,
  evaluateAILEResponse,
  runPELab,
  type PELabDetail,
  type PEMission,
  type PELabRunResponse,
  type AILEEvalResponse,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileModal, { type ProfileType } from "@/components/ProfileModal";

// Labs link to the NEXT MODULE (lesson), not the next lab
const NEXT_LESSONS: Record<string, { id: string; title: { fr: string; en: string } } | null> = {
  "01_self_assessment": { id: "aile_01_demystify", title: { fr: "L'IA Demystifiee", en: "AI Demystified" } },
  "02_genai_demo": { id: "aile_02_strategy", title: { fr: "Strategie IA", en: "AI Strategy" } },
  "03_competitive_analysis": { id: "aile_03_governance", title: { fr: "Gouvernance & Risques", en: "Governance & Risks" } },
  "04_risk_audit": { id: "aile_04_roi", title: { fr: "ROI & Business Cases", en: "ROI & Business Cases" } },
  "05_business_case": { id: "aile_05_roadmap", title: { fr: "Roadmap de Transformation", en: "Transformation Roadmap" } },
  "06_maturity_diagnostic": null,
};

const AILE_PROFILE_LABELS: Record<string, { fr: string; en: string }> = {
  finance: { fr: "Banque & Finance", en: "Banking & Finance" },
  engineering: { fr: "Industrie & Manufacturing", en: "Industry & Manufacturing" },
  health: { fr: "Santé & Pharma", en: "Health & Pharma" },
  business: { fr: "Commerce & Services", en: "Commerce & Services" },
  marketing: { fr: "IT & Télécoms", en: "IT & Telecom" },
  humanities: { fr: "Éducation & Formation", en: "Education & Training" },
};

const QUALITATIVE_BADGES: Record<string, { label: { fr: string; en: string }; color: string }> = {
  excellent: {
    label: { fr: "Excellent", en: "Excellent" },
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  good: {
    label: { fr: "Bien", en: "Good" },
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  needs_improvement: {
    label: { fr: "A approfondir", en: "Needs improvement" },
    color: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

function AILELabContent() {
  const params = useParams();
  const labId = params.labId as string;
  const isGenAIDemo = labId === "02_genai_demo";
  const isMaturityDiagnostic = labId === "06_maturity_diagnostic";

  const { user, firstName } = useAuth();
  const supabase = createClient();

  const [lab, setLab] = useState<PELabDetail | null>(null);
  const [selectedMission, setSelectedMission] = useState<PEMission | null>(null);
  const [studentText, setStudentText] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  // Type A state (GenAI Demo)
  const [peResult, setPeResult] = useState<PELabRunResponse | null>(null);

  // Type B state (Written labs)
  const [evalResult, setEvalResult] = useState<AILEEvalResponse | null>(null);

  const [profile, setProfile] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load lab detail
  useEffect(() => {
    const savedProfile = localStorage.getItem("ellaUserProfile");
    setProfile(savedProfile);

    getAILELabDetail(labId)
      .then((data) => {
        setLab(data);
        if (data.missions.length > 0) {
          const filtered = data.missions.find(
            (m) => m.audience?.toLowerCase() === savedProfile?.toLowerCase()
          );
          setSelectedMission(filtered || data.missions[0]);
        }
      })
      .catch((err) => setError(err.message));
  }, [labId]);

  const handleProfileSelect = async (newProfile: ProfileType) => {
    localStorage.setItem("ellaUserProfile", newProfile);
    if (user) {
      await supabase
        .from("profiles")
        .update({ profile_type: newProfile })
        .eq("id", user.id);
    }
    setProfile(newProfile);
    setIsProfileModalOpen(false);
    window.location.reload();
  };

  const saveAttempt = async (data: {
    llm_output?: string;
    total_score?: number;
    max_score?: number;
    evaluation?: unknown;
    execution_time_ms?: number;
    student_response?: string;
    feedback?: string;
    score_qualitative?: string;
  }) => {
    if (!user) return;
    try {
      await supabase.from("lab_attempts").insert({
        user_id: user.id,
        course_id: "aile",
        lab_id: labId,
        mission_id: selectedMission?.mission_id,
        student_prompt: studentText,
        llm_output: data.llm_output || data.feedback || "",
        total_score: data.total_score ?? null,
        max_score: data.max_score ?? null,
        evaluation: data.evaluation || { feedback: data.feedback, score_qualitative: data.score_qualitative },
        execution_time_ms: data.execution_time_ms ?? null,
      });
    } catch (err) {
      console.error("Error saving attempt:", err);
    }
  };

  // Type A — Run GenAI Demo (PE-style)
  const handleRunGenAI = async () => {
    if (!selectedMission || !studentText.trim()) return;
    setLoading(true);
    setError(null);
    setPeResult(null);

    try {
      const response = await runPELab({
        lab_id: labId,
        mission_id: selectedMission.mission_id,
        student_prompt: studentText,
        language: lang,
      });
      setPeResult(response);
      await saveAttempt({
        llm_output: response.llm_output,
        total_score: response.evaluation.total_score,
        max_score: response.evaluation.max_score,
        evaluation: response.evaluation,
        execution_time_ms: response.execution_time_ms,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // Type B — Submit written analysis
  const handleSubmitWritten = async () => {
    if (!selectedMission || !studentText.trim()) return;
    setLoading(true);
    setError(null);
    setEvalResult(null);

    try {
      const response = await evaluateAILEResponse({
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

  const hasResult = isGenAIDemo ? !!peResult : !!evalResult;
  const canShowNext = isGenAIDemo
    ? peResult && peResult.evaluation.total_score >= peResult.evaluation.max_score * 0.5
    : evalResult && evalResult.score_qualitative !== "needs_improvement";

  // --- Type C: Maturity Diagnostic (full-page wizard) ---
  if (isMaturityDiagnostic) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header with lang toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/courses/ai-leadership"
              className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm hover:bg-amber-700 transition-colors"
            >
              06
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {lang === "fr" ? "Diagnostic de Maturite IA" : "AI Maturity Diagnostic"}
              </h1>
              <p className="text-xs text-gray-500">
                {lang === "fr"
                  ? "Evaluez votre organisation sur 7 dimensions."
                  : "Assess your organization across 7 dimensions."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang("fr")}
              className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${lang === "fr" ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
            >
              FR
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${lang === "en" ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
            >
              EN
            </button>
          </div>
        </div>
        <MaturityDiagnosticWizard lang={lang} />
      </div>
    );
  }

  // --- Error state ---
  if (error && !lab) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center flex flex-col items-center">
        <EllaAvatar size="lg" className="mb-6 opacity-30" />
        <div className="bg-ella-accent-bg text-ella-accent-dark p-6 rounded-xl border border-ella-accent/20">
          <p className="font-bold mb-2">Ella est momentanement indisponible.</p>
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
            href="/courses/ai-leadership"
            className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm hover:bg-amber-700 transition-colors"
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
                <>A vous de jouer{firstName ? <>, <span className="font-bold text-amber-600">{firstName}</span></> : null} !</>
              ) : (
                <>Your turn{firstName ? <>, <span className="font-bold text-amber-600">{firstName}</span></> : null}!</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang("fr")}
            className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
              lang === "fr"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                : "bg-ella-gray-100 text-ella-gray-400 hover:bg-ella-gray-200"
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
              lang === "en"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                : "bg-ella-gray-100 text-ella-gray-400 hover:bg-ella-gray-200"
            }`}
          >
            EN
          </button>
        </div>

        {/* Profile indicator */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-ella-gray-400 font-bold uppercase tracking-wider">
              {lang === "fr" ? "Secteur" : "Sector"}
            </span>
            <span className="text-sm font-bold text-amber-700">
              {AILE_PROFILE_LABELS[profile || "business"]?.[lang] ?? AILE_PROFILE_LABELS.business[lang]}
            </span>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="p-2 hover:bg-ella-gray-100 rounded-full transition-colors text-ella-gray-400 hover:text-amber-600"
            title={lang === "fr" ? "Changer de secteur" : "Change sector"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mission & Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mission Description */}
          <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-amber-700 mb-2 uppercase tracking-wider">
              {lang === "fr" ? "Votre Mission" : "Your Mission"}
            </h2>
            <div className="prose prose-sm max-w-none text-ella-gray-800 leading-relaxed font-medium mb-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedMission.instructions[lang]}</ReactMarkdown>
            </div>
            {selectedMission.hints && selectedMission.hints.length > 0 && (
              <details className="group border-t border-ella-gray-100 pt-3">
                <summary className="text-xs text-amber-600 cursor-pointer font-bold list-none flex items-center gap-1 group-open:mb-2">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  {lang === "fr" ? "Besoin d'un coup de pouce ?" : "Need a hint?"}
                </summary>
                <div className="space-y-2">
                  {selectedMission.hints.map((hint, i) => (
                    <div key={i} className="bg-amber-50 rounded-lg p-3 text-xs text-amber-900 leading-relaxed italic prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{typeof hint === "object" ? hint[lang] : hint}</ReactMarkdown>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Input text (source data for GenAI Demo) */}
          {selectedMission.input_text && Object.keys(selectedMission.input_text).length > 0 && (
            <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
              <details open>
                <summary className="text-sm font-semibold text-ella-gray-900 cursor-pointer mb-2">
                  {lang === "fr" ? "Donnees source" : "Source data"}
                </summary>
                <div className="text-sm text-ella-gray-700 leading-relaxed bg-ella-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {typeof selectedMission.input_text === "object"
                      ? selectedMission.input_text[lang] || selectedMission.input_text["fr"]
                      : selectedMission.input_text}
                  </ReactMarkdown>
                </div>
              </details>
            </div>
          )}

          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-ella-gray-500 mb-2 block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                {isGenAIDemo
                  ? (lang === "fr" ? "VOTRE PROMPT" : "YOUR PROMPT")
                  : (lang === "fr" ? "VOTRE ANALYSE" : "YOUR ANALYSIS")
                }
              </label>
              <textarea
                value={studentText}
                onChange={(e) => setStudentText(e.target.value)}
                placeholder={
                  isGenAIDemo
                    ? (lang === "fr" ? "Redigez votre prompt ici..." : "Write your prompt here...")
                    : (lang === "fr" ? "Redigez votre analyse ici. Soyez precis et structurez votre reponse..." : "Write your analysis here. Be specific and structure your response...")
                }
                className="prompt-editor w-full"
                style={{ minHeight: isGenAIDemo ? "200px" : "350px" }}
              />
              {!isGenAIDemo && (
                <p className="text-[10px] text-ella-gray-400 mt-1">
                  {lang === "fr"
                    ? `${studentText.length} caracteres — visez au moins 500 caracteres pour une analyse substantielle.`
                    : `${studentText.length} characters — aim for at least 500 characters for a substantial analysis.`
                  }
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={isGenAIDemo ? handleRunGenAI : handleSubmitWritten}
                disabled={loading || !studentText.trim()}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {lang === "fr" ? "Ella analyse..." : "Ella is analyzing..."}
                  </>
                ) : isGenAIDemo ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    {lang === "fr" ? "Executer et evaluer" : "Run and evaluate"}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    {lang === "fr" ? "Soumettre a Ella" : "Submit to Ella"}
                  </>
                )}
              </button>
              {peResult && (
                <div className="flex items-center gap-4 text-[10px] font-bold text-ella-gray-400 uppercase tracking-widest">
                  <span>Latency: {Math.round(peResult.execution_time_ms)}ms</span>
                </div>
              )}
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
                  {lang === "fr" ? "Pret pour le defi ?" : "Ready for the challenge?"}
                </h4>
                <p className="text-xs text-ella-gray-500">
                  {isGenAIDemo
                    ? (lang === "fr"
                        ? "Redigez votre prompt a gauche et cliquez sur 'Executer'. Ella evaluera votre approche."
                        : "Write your prompt on the left and click 'Run'. Ella will evaluate your approach.")
                    : (lang === "fr"
                        ? "Redigez votre analyse a gauche et soumettez-la. Ella vous donnera un feedback detaille."
                        : "Write your analysis on the left and submit it. Ella will give you detailed feedback.")
                  }
                </p>
              </div>
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="bg-white rounded-xl border border-ella-gray-200 h-full flex items-center justify-center text-center p-8 shadow-sm">
              <div className="animate-fade-in">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-amber-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-amber-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <EllaAvatar size="sm" />
                  </div>
                </div>
                <p className="text-sm font-bold text-amber-800">
                  {lang === "fr" ? "Ella analyse votre travail..." : "Ella is analyzing your work..."}
                </p>
                <p className="text-xs text-ella-gray-500 mt-2">
                  {lang === "fr" ? "La reponse arrive dans quelques secondes." : "The answer will arrive in a few seconds."}
                </p>
              </div>
            </div>
          )}

          {/* Type A — GenAI Demo results (PE-style) */}
          {isGenAIDemo && peResult && (
            <div className="animate-fade-in space-y-6">
              {/* LLM Output */}
              <div className="bg-ella-dark rounded-xl shadow-xl overflow-hidden border border-white/5">
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-ella-success"></span>
                    LLM Output
                  </span>
                </div>
                <div className="p-4 overflow-auto max-h-[300px]">
                  <pre className="text-xs text-ella-dark-text whitespace-pre-wrap font-mono leading-relaxed">
                    {peResult.llm_output}
                  </pre>
                </div>
              </div>

              {/* Evaluation Card */}
              <div className="bg-white rounded-xl border border-ella-gray-200 shadow-lg overflow-hidden">
                <div className="bg-amber-600 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EllaAvatar size="sm" className="ring-2 ring-white/20" />
                    <span className="font-bold text-sm">
                      {lang === "fr" ? "Verdict d'Ella" : "Ella's Verdict"}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-black shadow-inner flex items-center gap-1.5
                    ${peResult.evaluation.total_score >= peResult.evaluation.max_score * 0.8 ? "bg-white/20 text-white" :
                      peResult.evaluation.total_score >= peResult.evaluation.max_score * 0.5 ? "bg-white/15 text-white" : "bg-white/10 text-white"}`}>
                    <span className="text-lg">{peResult.evaluation.total_score}</span>
                    <span className="opacity-50">/ {peResult.evaluation.max_score}</span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <p className="text-[9px] font-black text-emerald-700 mb-2 uppercase tracking-wider">
                        {lang === "fr" ? "Points forts" : "Strengths"}
                      </p>
                      <div className="space-y-1.5">
                        {peResult.evaluation.strengths.slice(0, 2).map((s, i) => (
                          <p key={i} className="text-[11px] text-emerald-900 leading-tight flex gap-1 items-start">
                            <span>&#10003;</span> {s}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <p className="text-[9px] font-black text-amber-700 mb-2 uppercase tracking-wider">
                        {lang === "fr" ? "Ameliorations" : "Improvements"}
                      </p>
                      <div className="space-y-1.5">
                        {peResult.evaluation.improvements.slice(0, 2).map((s, i) => (
                          <p key={i} className="text-[11px] text-amber-900 leading-tight flex gap-1 items-start">
                            <span>!</span> {s}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {peResult.evaluation.improved_prompt_hint && (
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <h5 className="text-[10px] font-black text-amber-700 mb-1 uppercase tracking-widest">
                        {lang === "fr" ? "Conseil d'Ella" : "Ella's Advice"}
                      </h5>
                      <p className="text-xs text-amber-900 font-medium leading-relaxed italic">
                        &quot;{peResult.evaluation.improved_prompt_hint}&quot;
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 pt-3">
                    {Object.entries(peResult.evaluation.criteria_scores).map(([id, criterion]) => (
                      <div key={id} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-ella-gray-600">
                          <span className="uppercase tracking-wide">{id}</span>
                          <span>{criterion.score}/2</span>
                        </div>
                        <div className="h-1.5 bg-ella-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ${
                              criterion.score === 2 ? "bg-amber-600" : criterion.score === 1 ? "bg-amber-400" : "bg-ella-gray-300"
                            }`}
                            style={{ width: `${(criterion.score / 2) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Type B — Written lab results */}
          {!isGenAIDemo && evalResult && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-white rounded-xl border border-ella-gray-200 shadow-lg overflow-hidden">
                {/* Header with qualitative badge */}
                <div className="bg-amber-600 p-4 text-white flex items-center justify-between">
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
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                  <p className="text-sm font-bold text-amber-800 mb-1">
                    {lang === "fr" ? "Vous pouvez faire mieux !" : "You can do better!"}
                  </p>
                  <p className="text-xs text-amber-700">
                    {lang === "fr"
                      ? "Relisez le feedback d'Ella, enrichissez votre analyse, et soumettez a nouveau."
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
                  href={`/courses/ai-leadership/modules/${NEXT_LESSONS[labId]?.id}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <span className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">
                    {lang === "fr" ? "Module suivant" : "Next Module"}
                  </span>
                  <div className="px-6 py-4 rounded-2xl bg-amber-600/10 flex items-center gap-4 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-lg hover:shadow-amber-600/30">
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
                  <span className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">
                    {lang === "fr" ? "Parcours termine" : "Course Completed"}
                  </span>
                  <div className="px-6 py-4 rounded-2xl bg-emerald-500/10 flex items-center gap-4 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg hover:shadow-emerald-500/30">
                    <span className="font-bold">
                      {lang === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
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
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-200 mt-6 shadow-sm">
          {lang === "fr"
            ? `Oups ! ${error}. Ella est momentanement indisponible, reessayez dans un instant.`
            : `Oops! ${error}. Ella is temporarily unavailable, try again in a moment.`
          }
        </div>
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSelect={handleProfileSelect}
      />

      <EllaCoachingPanel
        courseId="aile"
        pageId={labId}
        pageTitle={lab.title[lang]}
        pageType="lab"
        lang={lang}
        studentFirstName={firstName}
        labContext={{
          profile,
          missionId: selectedMission?.mission_id,
          lastScore: peResult?.evaluation?.total_score,
          lastQualitative: evalResult?.score_qualitative,
        }}
      />
    </div>
  );
}

export default function AILELabPage() {
  return (
    <ProtectedRoute>
      <AILELabContent />
    </ProtectedRoute>
  );
}
