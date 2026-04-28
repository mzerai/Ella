"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Rocket, Database, Users, Shield, Lightbulb } from "lucide-react";
import EllaAvatar from "./EllaAvatar";
import { evaluateAILEResponse, type AILEEvalResponse } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

interface GuidedAssessmentLabProps {
  lang: "fr" | "en";
  labId: string;
  missionId: string;
  onComplete?: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  initiatives: <Rocket className="w-5 h-5" />,
  data: <Database className="w-5 h-5" />,
  skills: <Users className="w-5 h-5" />,
  governance: <Shield className="w-5 h-5" />,
  culture: <Lightbulb className="w-5 h-5" />,
};

const ASSESSMENT_DIMENSIONS = [
  {
    id: "initiatives",
    title: { fr: "Initiatives IA", en: "AI Initiatives" },
    question: {
      fr: "Votre organisation a-t-elle des projets IA en cours ?",
      en: "Does your organization have AI projects underway?",
    },
    anchors: {
      1: { fr: "Aucun projet IA", en: "No AI projects" },
      3: { fr: "Quelques exp\u00e9rimentations", en: "Some experiments" },
      5: { fr: "Projets IA en production", en: "AI projects in production" },
    } as Record<number, { fr: string; en: string }>,
    placeholder: {
      fr: "Ex: chatbot en test, scoring en PoC...",
      en: "E.g.: chatbot in testing, scoring PoC...",
    },
  },
  {
    id: "data",
    title: { fr: "\u00c9tat des donn\u00e9es", en: "Data Readiness" },
    question: {
      fr: "Vos donn\u00e9es sont-elles accessibles et exploitables pour l\u2019IA ?",
      en: "Is your data accessible and usable for AI?",
    },
    anchors: {
      1: { fr: "Donn\u00e9es en silos, qualit\u00e9 inconnue", en: "Siloed data, unknown quality" },
      3: { fr: "Partiellement centralis\u00e9es", en: "Partially centralized" },
      5: { fr: "Centralis\u00e9es, document\u00e9es, de qualit\u00e9", en: "Centralized, documented, quality" },
    } as Record<number, { fr: string; en: string }>,
    placeholder: {
      fr: "Ex: tout est dans des Excel, CRM centralis\u00e9...",
      en: "E.g.: everything in Excel, centralized CRM...",
    },
  },
  {
    id: "skills",
    title: { fr: "Comp\u00e9tences", en: "Skills" },
    question: {
      fr: "Avez-vous des profils data/IA en interne ?",
      en: "Do you have data/AI profiles internally?",
    },
    anchors: {
      1: { fr: "Aucun profil data/IA", en: "No data/AI profiles" },
      3: { fr: "Quelques profils, rattach\u00e9s \u00e0 l\u2019IT", en: "Some profiles, attached to IT" },
      5: { fr: "\u00c9quipe data structur\u00e9e avec leadership", en: "Structured data team with leadership" },
    } as Record<number, { fr: string; en: string }>,
    placeholder: {
      fr: "Ex: 2 data analysts c\u00f4t\u00e9 IT, pas de data scientist...",
      en: "E.g.: 2 data analysts in IT, no data scientist...",
    },
  },
  {
    id: "governance",
    title: { fr: "Gouvernance", en: "Governance" },
    question: {
      fr: "Avez-vous une politique d\u2019utilisation de l\u2019IA ou des donn\u00e9es ?",
      en: "Do you have an AI or data usage policy?",
    },
    anchors: {
      1: { fr: "Aucune politique", en: "No policy" },
      3: { fr: "R\u00e8gles partielles ou informelles", en: "Partial or informal rules" },
      5: { fr: "Politique formelle, audit\u00e9e, appliqu\u00e9e", en: "Formal policy, audited, enforced" },
    } as Record<number, { fr: string; en: string }>,
    placeholder: {
      fr: "Ex: charte en cours de r\u00e9daction, RGPD respect\u00e9...",
      en: "E.g.: charter being drafted, GDPR compliant...",
    },
  },
  {
    id: "culture",
    title: { fr: "Culture & Adoption", en: "Culture & Adoption" },
    question: {
      fr: "Vos \u00e9quipes sont-elles ouvertes \u00e0 l\u2019IA ?",
      en: "Are your teams open to AI?",
    },
    anchors: {
      1: { fr: "M\u00e9fiance g\u00e9n\u00e9ralis\u00e9e", en: "Widespread distrust" },
      3: { fr: "Adoption in\u00e9gale selon les \u00e9quipes", en: "Uneven adoption across teams" },
      5: { fr: "Usage naturel et encadr\u00e9", en: "Natural and supervised use" },
    } as Record<number, { fr: string; en: string }>,
    placeholder: {
      fr: "Ex: certains utilisent ChatGPT, la direction h\u00e9site...",
      en: "E.g.: some use ChatGPT, management hesitates...",
    },
  },
];

const LEVEL_NAMES: Record<number, { fr: string; en: string }> = {
  1: { fr: "Awareness", en: "Awareness" },
  2: { fr: "Active", en: "Active" },
  3: { fr: "Operational", en: "Operational" },
  4: { fr: "Systemic", en: "Systemic" },
  5: { fr: "Transformational", en: "Transformational" },
};

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-300",
  2: "bg-orange-100 text-orange-800 border-orange-300",
  3: "bg-yellow-100 text-yellow-800 border-yellow-300",
  4: "bg-emerald-100 text-emerald-800 border-emerald-300",
  5: "bg-purple-100 text-purple-800 border-purple-300",
};

function scoreColor(score: number): string {
  if (score < 2) return "bg-red-400";
  if (score < 3) return "bg-orange-400";
  if (score < 4) return "bg-yellow-400";
  return "bg-emerald-500";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GuidedAssessmentLab({ lang, labId, missionId }: GuidedAssessmentLabProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(ASSESSMENT_DIMENSIONS.map((d) => [d.id, 3]))
  );
  const [comments, setComments] = useState<Record<string, string>>({});
  const [evalResult, setEvalResult] = useState<AILEEvalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const txt = (obj: { fr: string; en: string }) => obj[lang] || obj.fr;

  const buildAssessmentText = () => {
    return ASSESSMENT_DIMENSIONS.map((dim) => {
      const score = scores[dim.id] || 3;
      const comment = comments[dim.id] || "";
      const anchorKey = score <= 2 ? 1 : score <= 4 ? 3 : 5;
      const anchorText = dim.anchors[score] || dim.anchors[anchorKey];
      const label = txt(dim.title);
      return `${label}: ${score}/5 (${txt(anchorText)})${comment ? ` \u2014 ${comment}` : ""}`;
    }).join("\n");
  };

  const runDiagnostic = async () => {
    setStep(2);
    setError(null);
    try {
      const response = await evaluateAILEResponse({
        lab_id: labId,
        mission_id: missionId || "assessment_general",
        student_response: buildAssessmentText(),
        language: lang,
      });
      setEvalResult(response);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      setStep(1);
    }
  };

  const avgScore = ASSESSMENT_DIMENSIONS.reduce((sum, d) => sum + (scores[d.id] || 3), 0) / ASSESSMENT_DIMENSIONS.length;
  const level = Math.min(5, Math.max(1, Math.round(avgScore)));

  // -------------------------------------------------------------------------
  // Step 2 — Loading
  // -------------------------------------------------------------------------
  if (step === 2) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center flex flex-col items-center gap-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-amber-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-amber-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <EllaAvatar size="sm" />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-amber-900">
            {lang === "fr" ? "ELLA analyse la maturit\u00e9 IA de votre organisation..." : "ELLA is analyzing your organization\u2019s AI readiness..."}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {lang === "fr" ? "Cela peut prendre quelques secondes." : "This may take a few seconds."}
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-amber-400"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 3 — Results
  // -------------------------------------------------------------------------
  if (step === 3 && evalResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Global Score */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="bg-amber-50 px-6 py-5 border-b border-amber-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-amber-900">
                {lang === "fr" ? "Votre score global" : "Your global score"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {lang === "fr" ? "Moyenne sur 5 dimensions" : "Average across 5 dimensions"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-amber-700">{avgScore.toFixed(1)}</span>
              <span className="text-sm text-gray-400">/ 5</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold border ${LEVEL_COLORS[level]}`}>
                {txt(LEVEL_NAMES[level])}
              </span>
            </div>
          </div>

          {/* Dimension Bars */}
          <div className="p-6 space-y-4">
            {ASSESSMENT_DIMENSIONS.map((dim) => {
              const s = scores[dim.id] || 3;
              return (
                <div key={dim.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 text-amber-600 flex-shrink-0">{ICONS[dim.id]}</div>
                  <span className="text-sm font-semibold text-gray-700 w-36 flex-shrink-0">{txt(dim.title)}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${scoreColor(s)}`}
                      style={{ width: `${(s / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-600 w-8 text-right">{s}/5</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Qualitative Badge */}
        {evalResult.score_qualitative && (
          <div className="flex justify-center">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                evalResult.score_qualitative === "excellent"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : evalResult.score_qualitative === "good"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-rose-100 text-rose-800 border-rose-200"
              }`}
            >
              {evalResult.score_qualitative === "excellent"
                ? (lang === "fr" ? "Bon positionnement" : "Good positioning")
                : evalResult.score_qualitative === "good"
                ? (lang === "fr" ? "En progression" : "Progressing")
                : (lang === "fr" ? "A renforcer" : "Needs strengthening")}
            </span>
          </div>
        )}

        {/* ELLA Feedback */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3">
            <EllaAvatar size="sm" />
            <h2 className="text-lg font-bold text-amber-900">
              {lang === "fr" ? "Analyse ELLA" : "ELLA Analysis"}
            </h2>
          </div>
          <div className="p-6 prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{evalResult.feedback}</ReactMarkdown>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              setStep(1);
              setEvalResult(null);
              setScores(Object.fromEntries(ASSESSMENT_DIMENSIONS.map((d) => [d.id, 3])));
              setComments({});
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            {lang === "fr" ? "Recommencer" : "Start over"}
          </button>
          <Link
            href="/courses/ai-leadership/modules/aile_01_demystify"
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2"
          >
            {lang === "fr" ? "Continuer vers le Module 01" : "Continue to Module 01"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 1 — Assessment (default)
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="bg-amber-50 px-6 py-5 border-b border-amber-100">
          <h2 className="text-lg font-bold text-amber-900">
            {lang === "fr" ? "Auto-diagnostic rapide" : "Quick Self-Assessment"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {lang === "fr"
              ? "Positionnez votre organisation sur 5 dimensions. ELLA analysera votre profil."
              : "Position your organization across 5 dimensions. ELLA will analyze your profile."}
          </p>
        </div>

        <div className="p-6 space-y-8">
          {ASSESSMENT_DIMENSIONS.map((dim) => {
            const val = scores[dim.id] || 3;
            return (
              <div key={dim.id} className="space-y-3">
                {/* Dimension header */}
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">{ICONS[dim.id]}</span>
                  <h3 className="text-sm font-bold text-amber-900">{txt(dim.title)}</h3>
                </div>

                {/* Question */}
                <p className="text-sm font-medium text-gray-700">{txt(dim.question)}</p>

                {/* Score buttons */}
                <div className="space-y-2">
                  <div className="flex justify-between px-0.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setScores((prev) => ({ ...prev, [dim.id]: v }))}
                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                          val === v
                            ? "bg-amber-600 text-white shadow-md scale-110"
                            : "bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-700"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>

                  {/* Anchors */}
                  <div className="flex justify-between text-[10px] text-gray-400 leading-tight">
                    <span className="max-w-[30%]">{txt(dim.anchors[1])}</span>
                    <span className="max-w-[30%] text-center">{txt(dim.anchors[3])}</span>
                    <span className="max-w-[30%] text-right">{txt(dim.anchors[5])}</span>
                  </div>
                </div>

                {/* Optional comment */}
                <input
                  type="text"
                  maxLength={200}
                  value={comments[dim.id] || ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [dim.id]: e.target.value }))}
                  placeholder={txt(dim.placeholder)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all placeholder-gray-400"
                />
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="px-6 py-5 border-t border-amber-100 flex justify-end">
          <button
            onClick={runDiagnostic}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2"
          >
            {lang === "fr" ? "Lancer le diagnostic ELLA" : "Run ELLA diagnostic"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
