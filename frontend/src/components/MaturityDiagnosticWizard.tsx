"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EllaAvatar from "@/components/EllaAvatar";
import {
  getAILELabDetail,
  runMaturityDiagnostic,
  downloadMaturityPDF,
  type MaturityDiagnosticResponse,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Types for lab JSON structure
// ---------------------------------------------------------------------------

interface LabField {
  id: string;
  label: Record<string, string>;
  type: string;
  options: { value: string; label: Record<string, string> }[];
}

interface LabQuestion {
  id: string;
  text: Record<string, string>;
  anchors: Record<string, Record<string, string>>;
}

interface LabDimension {
  id: string;
  name: Record<string, string>;
  icon: string;
  questions: LabQuestion[];
}

interface TransitionAction {
  action: string | Record<string, string>;
  owner: string | Record<string, string>;
  deliverable: string | Record<string, string>;
}

interface TransitionPlan {
  objective: Record<string, string>;
  actions: TransitionAction[];
  criteria: Record<string, string>[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LabData = Record<string, any>;

// ---------------------------------------------------------------------------
// UI text
// ---------------------------------------------------------------------------

const T = {
  step1_title: { fr: "Profil de votre organisation", en: "Your organization profile" },
  step2_title: { fr: "Evaluation — Dimension", en: "Assessment — Dimension" },
  step3_title: { fr: "ELLA analyse votre organisation...", en: "ELLA is analyzing your organization..." },
  step4_title: { fr: "Votre Diagnostic de Maturite IA", en: "Your AI Maturity Diagnostic" },
  next: { fr: "Suivant", en: "Next" },
  previous: { fr: "Precedent", en: "Previous" },
  finish: { fr: "Lancer le diagnostic", en: "Run diagnostic" },
  download_pdf: { fr: "Telecharger le rapport PDF", en: "Download PDF report" },
  restart: { fr: "Recommencer", en: "Start over" },
  dashboard: { fr: "Retour au tableau de bord", en: "Back to dashboard" },
  global_score: { fr: "Score global", en: "Global score" },
  dimension_scores: { fr: "Scores par dimension", en: "Scores by dimension" },
  ella_analysis: { fr: "Analyse ELLA", en: "ELLA Analysis" },
  action_plan: { fr: "Plan d'action", en: "Action plan" },
  prudence_warning: { fr: "Regle de prudence appliquee", en: "Prudence rule applied" },
  progress: { fr: "Dimension", en: "Dimension" },
  loading_lab: { fr: "Chargement du diagnostic...", en: "Loading diagnostic..." },
  error_lab: { fr: "Impossible de charger le diagnostic.", en: "Failed to load diagnostic." },
  step3_sub: { fr: "Cela peut prendre jusqu'a 30 secondes.", en: "This may take up to 30 seconds." },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function txt(obj: Record<string, string>, lang: string): string {
  return obj[lang] || obj.fr || "";
}

function localize(v: string | Record<string, string>, lang: string): string {
  return typeof v === "object" ? (v[lang] || v.fr || "") : v;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-300",
  2: "bg-orange-100 text-orange-800 border-orange-300",
  3: "bg-yellow-100 text-yellow-800 border-yellow-300",
  4: "bg-emerald-100 text-emerald-800 border-emerald-300",
  5: "bg-purple-100 text-purple-800 border-purple-300",
};

function scoreColor(score: number): string {
  if (score >= 4) return "bg-emerald-500";
  if (score >= 3) return "bg-yellow-400";
  if (score >= 2) return "bg-orange-400";
  return "bg-red-500";
}

function scoreBgColor(score: number): string {
  if (score >= 4) return "bg-emerald-50";
  if (score >= 3) return "bg-yellow-50";
  if (score >= 2) return "bg-orange-50";
  return "bg-red-50";
}

// ---------------------------------------------------------------------------
// SVG Radar Chart
// ---------------------------------------------------------------------------

function RadarChart({
  dimensions,
  scores,
}: {
  dimensions: { id: string; name: string }[];
  scores: Record<string, number>;
}) {
  const n = dimensions.length;
  const cx = 160;
  const cy = 160;
  const R = 120;
  const levels = [1, 2, 3, 4, 5];

  function polar(i: number, r: number): [number, number] {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  function gridPolygon(level: number): string {
    const r = (level / 5) * R;
    return dimensions.map((_, i) => polar(i, r).join(",")).join(" ");
  }

  const dataPoints = dimensions.map((d, i) => {
    const s = scores[d.id] ?? 0;
    return polar(i, (s / 5) * R);
  });
  const dataPolygon = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[340px] mx-auto">
      {/* Grid rings */}
      {levels.map((lv) => (
        <polygon
          key={lv}
          points={gridPolygon(lv)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={lv === 5 ? 1.5 : 0.5}
        />
      ))}
      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const [x, y] = polar(i, R);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#D1D5DB"
            strokeWidth={0.5}
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(217,119,6,0.20)"
        stroke="#D97706"
        strokeWidth={2}
      />
      {/* Data points */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="#D97706" stroke="#fff" strokeWidth={1.5} />
      ))}
      {/* Labels */}
      {dimensions.map((d, i) => {
        const labelR = R + 28;
        const [lx, ly] = polar(i, labelR);
        const s = scores[d.id] ?? 0;
        const anchor =
          Math.abs(lx - cx) < 5 ? "middle" : lx > cx ? "start" : "end";
        return (
          <g key={d.id}>
            <text
              x={lx}
              y={ly - 6}
              textAnchor={anchor}
              fontSize={9}
              fontWeight={600}
              fill="#374151"
            >
              {d.name}
            </text>
            <text
              x={lx}
              y={ly + 7}
              textAnchor={anchor}
              fontSize={10}
              fontWeight={700}
              fill="#D97706"
            >
              {s.toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main Wizard Component
// ---------------------------------------------------------------------------

export default function MaturityDiagnosticWizard({ lang }: { lang: "fr" | "en" }) {
  // Lab data
  const [labData, setLabData] = useState<LabData | null>(null);
  const [labError, setLabError] = useState<string | null>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [companyProfile, setCompanyProfile] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [dimIndex, setDimIndex] = useState(0);

  // Results
  const [diagnostic, setDiagnostic] = useState<MaturityDiagnosticResponse | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Load lab JSON
  useEffect(() => {
    getAILELabDetail("06_maturity_diagnostic")
      .then((data) => {
        setLabData(data as LabData);
        // Init answers to 3 (midpoint) for every question
        const dims = (data as LabData).dimensions as LabDimension[];
        const init: Record<string, number> = {};
        dims.forEach((d) => d.questions.forEach((q) => (init[q.id] = 3)));
        setAnswers(init);
      })
      .catch(() => setLabError(txt(T.error_lab, lang)));
  }, [lang]);

  if (labError) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-red-600 font-medium">{labError}</p>
      </div>
    );
  }

  if (!labData) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center flex flex-col items-center gap-4">
        <EllaAvatar size="lg" className="animate-pulse opacity-50" />
        <p className="text-ella-gray-500 font-medium">{txt(T.loading_lab, lang)}</p>
      </div>
    );
  }

  const fields: LabField[] = labData.company_profile?.fields ?? [];
  const dimensions: LabDimension[] = labData.dimensions ?? [];
  const currentDim = dimensions[dimIndex];

  // ---------------------------------------------------------------
  // Step 1 — Company Profile
  // ---------------------------------------------------------------

  const profileComplete = fields.every((f) => !!companyProfile[f.id]);

  const handleProfileChange = (fieldId: string, value: string) => {
    setCompanyProfile((prev) => ({ ...prev, [fieldId]: value }));
  };

  // ---------------------------------------------------------------
  // Step 2 — Questionnaire helpers
  // ---------------------------------------------------------------

  const handleAnswer = (qId: string, val: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const goNextDim = () => {
    if (dimIndex < dimensions.length - 1) {
      setDimIndex(dimIndex + 1);
    } else {
      // All dimensions done → launch diagnostic
      setStep(3);
      runDiagnostic();
    }
  };

  const goPrevDim = () => {
    if (dimIndex > 0) setDimIndex(dimIndex - 1);
    else setStep(1);
  };

  // ---------------------------------------------------------------
  // Step 3 — Run diagnostic
  // ---------------------------------------------------------------

  const runDiagnostic = async () => {
    setDiagLoading(true);
    setDiagError(null);
    try {
      const result = await runMaturityDiagnostic({
        company_profile: companyProfile,
        answers,
        language: lang,
      });
      setDiagnostic(result);
      setStep(4);
    } catch (err: unknown) {
      setDiagError(err instanceof Error ? err.message : "Error");
      setStep(2);
      setDimIndex(dimensions.length - 1);
    } finally {
      setDiagLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // PDF download
  // ---------------------------------------------------------------

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const blob = await downloadMaturityPDF({
        company_profile: companyProfile,
        answers,
        language: lang,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ELLA_AI_Maturity_Diagnostic.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — user can retry
    } finally {
      setPdfLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // Restart
  // ---------------------------------------------------------------

  const handleRestart = () => {
    setStep(1);
    setDimIndex(0);
    setCompanyProfile({});
    const init: Record<string, number> = {};
    dimensions.forEach((d) => d.questions.forEach((q) => (init[q.id] = 3)));
    setAnswers(init);
    setDiagnostic(null);
    setDiagError(null);
  };

  // ===============================================================
  // RENDER
  // ===============================================================

  // --- Step 1: Company Profile ---
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
            <h2 className="text-lg font-bold text-amber-900">{txt(T.step1_title, lang)}</h2>
            <p className="text-xs text-amber-700 mt-1">
              {lang === "fr"
                ? "Ces informations permettent a ELLA de contextualiser votre diagnostic."
                : "This information allows ELLA to contextualize your diagnostic."}
            </p>
          </div>

          <div className="p-6 space-y-5">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {txt(field.label, lang)}
                </label>
                <select
                  value={companyProfile[field.id] || ""}
                  onChange={(e) => handleProfileChange(field.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                >
                  <option value="">—</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {txt(opt.label, lang)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-amber-100 flex justify-end">
            <button
              disabled={!profileComplete}
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {txt(T.next, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 2: Questionnaire ---
  if (step === 2 && currentDim) {
    return (
      <div className="max-w-2xl mx-auto">
        {diagError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {diagError}
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
            <span>
              {txt(T.progress, lang)} {dimIndex + 1} / {dimensions.length}
            </span>
            <span className="text-amber-600">{txt(currentDim.name, lang)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${((dimIndex + 1) / dimensions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          {/* Dimension header */}
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3">
            <span className="text-2xl">{currentDim.icon}</span>
            <h2 className="text-lg font-bold text-amber-900">{txt(currentDim.name, lang)}</h2>
          </div>

          {/* Questions */}
          <div className="p-6 space-y-8">
            {currentDim.questions.map((q) => {
              const val = answers[q.id] ?? 3;
              return (
                <div key={q.id}>
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    {txt(q.text, lang)}
                  </p>

                  {/* Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={val}
                      onChange={(e) => handleAnswer(q.id, Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-amber-600"
                    />

                    {/* Tick marks */}
                    <div className="flex justify-between px-0.5">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => handleAnswer(q.id, v)}
                          className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                            val === v
                              ? "bg-amber-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>

                    {/* Anchors */}
                    <div className="flex justify-between text-[10px] text-gray-400 leading-tight mt-1">
                      <span className="max-w-[30%]">{txt(q.anchors["1"], lang)}</span>
                      <span className="max-w-[30%] text-center">{txt(q.anchors["3"], lang)}</span>
                      <span className="max-w-[30%] text-right">{txt(q.anchors["5"], lang)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-amber-100 flex justify-between">
            <button
              onClick={goPrevDim}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              {txt(T.previous, lang)}
            </button>
            <button
              onClick={goNextDim}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
            >
              {dimIndex < dimensions.length - 1 ? txt(T.next, lang) : txt(T.finish, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 3: Loading ---
  if (step === 3 && diagLoading) {
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
          <p className="text-lg font-bold text-amber-900">{txt(T.step3_title, lang)}</p>
          <p className="text-sm text-gray-500 mt-2">{txt(T.step3_sub, lang)}</p>
        </div>
        {/* Animated dots */}
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-amber-400"
              style={{
                animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,80%,100% { opacity:0.3; transform:scale(0.8); } 40% { opacity:1; transform:scale(1.2); } }`}</style>
      </div>
    );
  }

  // --- Step 4: Results ---
  if (step === 4 && diagnostic) {
    const transitionPlans = labData.transition_plans as Record<string, TransitionPlan> | undefined;
    const plan = transitionPlans?.[diagnostic.transition_plan_key];
    const dimMap: Record<string, number> = {};
    diagnostic.dimension_scores.forEach((ds) => (dimMap[ds.dimension_id] = ds.score));

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 4a — Global Score */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="bg-amber-50 px-6 py-6 text-center border-b border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 mb-4">{txt(T.step4_title, lang)}</h2>

            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 text-lg font-black ${LEVEL_COLORS[diagnostic.global_level] || LEVEL_COLORS[1]}`}>
              <span className="text-3xl">L{diagnostic.global_level}</span>
              <span className="text-base">{diagnostic.global_level_name}</span>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              {txt(T.global_score, lang)}: <span className="font-bold text-amber-700 text-lg">{diagnostic.global_score.toFixed(2)}</span> / 5
            </p>
          </div>

          {diagnostic.prudence_applied && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-bold text-red-700">{txt(T.prudence_warning, lang)}</p>
              <p className="text-xs text-red-600 mt-1">{diagnostic.prudence_details}</p>
            </div>
          )}

          {/* 4b — Radar Chart */}
          <div className="px-6 py-6">
            <RadarChart
              dimensions={diagnostic.dimension_scores.map((ds) => ({
                id: ds.dimension_id,
                name: ds.dimension_name,
              }))}
              scores={dimMap}
            />
          </div>
        </div>

        {/* 4c — Heat Map Table */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100">
            <h3 className="text-base font-bold text-amber-900">{txt(T.dimension_scores, lang)}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-50 text-xs text-amber-800 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Dimension</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">{lang === "fr" ? "Niveau" : "Level"}</th>
                  <th className="px-6 py-3 text-left" />
                </tr>
              </thead>
              <tbody>
                {diagnostic.dimension_scores.map((ds) => (
                  <tr key={ds.dimension_id} className={`border-t border-gray-100 ${scoreBgColor(ds.score)}`}>
                    <td className="px-6 py-3 font-semibold text-gray-800">{ds.dimension_name}</td>
                    <td className="px-4 py-3 text-center font-bold text-amber-700">{ds.score.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${LEVEL_COLORS[ds.level] || LEVEL_COLORS[1]}`}>
                        L{ds.level} {ds.level_name}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-28">
                        <div
                          className={`h-full rounded-full transition-all ${scoreColor(ds.score)}`}
                          style={{ width: `${(ds.score / 5) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4d — ELLA Analysis */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-3">
            <EllaAvatar size="sm" />
            <h3 className="text-base font-bold text-amber-900">{txt(T.ella_analysis, lang)}</h3>
          </div>
          <div className="px-6 py-5 prose prose-sm max-w-none text-gray-800 leading-relaxed [&>h2]:text-amber-800 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mt-5 [&>h2]:mb-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {diagnostic.ella_analysis}
            </ReactMarkdown>
          </div>
        </div>

        {/* 4e — Transition Plan */}
        {plan && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100">
              <h3 className="text-base font-bold text-amber-900">{txt(T.action_plan, lang)}</h3>
              <p className="text-xs text-amber-700 mt-1">{txt(plan.objective, lang)}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-800 text-white text-xs font-bold uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">{lang === "fr" ? "Responsable" : "Owner"}</th>
                    <th className="px-4 py-3 text-left">{lang === "fr" ? "Livrable" : "Deliverable"}</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.actions.map((a, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-5 py-3 text-gray-800">{localize(a.action, lang)}</td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{localize(a.owner, lang)}</td>
                      <td className="px-4 py-3 text-gray-600">{localize(a.deliverable, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Criteria */}
            <div className="px-6 py-4 border-t border-amber-100 bg-amber-50">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                {lang === "fr" ? "Criteres de passage au niveau suivant" : "Criteria to reach the next level"}
              </p>
              <ul className="space-y-1">
                {plan.criteria.map((c, i) => (
                  <li key={i} className="text-xs text-amber-900 flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {txt(c, lang)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 4f — Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
          >
            {pdfLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            )}
            {txt(T.download_pdf, lang)}
          </button>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            {txt(T.restart, lang)}
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all border border-amber-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            {txt(T.dashboard, lang)}
          </Link>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
