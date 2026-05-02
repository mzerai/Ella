"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { 
  ChevronRight, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  BookOpen,
  RefreshCw
} from "lucide-react";

import EllaAvatar from "@/components/EllaAvatar";
import { useAuth } from "@/components/AuthProvider";
import { 
  getManufacturingLabDetail, 
  evaluateManufacturingResponse,
  type PELabDetail,
  type ManufacturingEvalResponse
} from "@/lib/api";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccessCodeGate from "@/components/AccessCodeGate";

const NEXT_SEQUENCES: Record<string, string> = {
  "00_industrial_ai_framing_lab": "01_industrial_data_iot_it_ot_architecture",
  "01_industrial_data_architecture_lab": "02_predictive_maintenance_machine_learning",
  "02_predictive_maintenance_strategy_lab": "03_computer_vision_quality_control",
  "03_computer_vision_quality_control_lab": "04_ai_production_flow_supply_chain_optimization",
  "04_flow_supply_chain_optimization_lab": "05_digital_twins_simulation_industrial_scenarios",
  "05_digital_twin_scenario_lab": "06_deployment_ot_cybersecurity_industrial_ai_roadmap",
  "06_final_industrial_ai_roadmap_lab": "final",
};

// Anti-copy styles
const ANTI_COPY_STYLES = `
.ella-protected-content {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.ella-protected-content textarea,
.ella-protected-content input {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
}
`;

function WorkshopContent() {
  const params = useParams();
  const { firstName } = useAuth();
  const labId = params.labId as string;
  const [lab, setLab] = useState<PELabDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  
  const [studentResponse, setStudentResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<ManufacturingEvalResponse | null>(null);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    loadLab();
  }, [labId]);

  // Anti-copy protection
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = ANTI_COPY_STYLES;
    document.head.appendChild(style);

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
      if (target.closest?.(".ella-protected-content")) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    return () => {
      document.removeEventListener("copy", handleCopy);
      style.remove();
    };
  }, []);

  const loadLab = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getManufacturingLabDetail(labId);
      setLab(data);
    } catch (err: any) {
      console.error("Error loading Manufacturing workshop:", err);
      setError(err.message || "Erreur lors du chargement de l'atelier.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!studentResponse.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const resp = await evaluateManufacturingResponse({
        lab_id: labId,
        mission_id: lab?.missions[0]?.mission_id || "m1",
        student_response: studentResponse,
        language: lang
      });
      setEvaluation(resp);
      
      // Save progress if successful
      if (resp.score_qualitative === "excellent" || resp.score_qualitative === "good") {
        const completed = JSON.parse(localStorage.getItem("ellaCompletedManufacturingSequences") || "[]");
        // Use sequence logic mapping
        const currentSeqId = Object.keys(NEXT_SEQUENCES).find(k => k === labId) ? labId : "unknown";
        if (currentSeqId !== "unknown" && !completed.includes(currentSeqId)) {
          completed.push(currentSeqId);
          localStorage.setItem("ellaCompletedManufacturingSequences", JSON.stringify(completed));
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Chargement de l'atelier...</p>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-50 px-4 text-center">
        <div className="bg-red-50 p-6 rounded-full">
           <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Oups ! Une erreur est survenue</h2>
          <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">{error || "Atelier introuvable."}</p>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={loadLab}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link href="/courses/ai-manufacturing" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all">
            Retour au Workshop
          </Link>
        </div>
      </div>
    );
  }

  const nextSeqId = NEXT_SEQUENCES[labId];

  return (
    <div className="bg-slate-50 min-h-screen ella-protected-content">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30 mb-8">
        <Link href="/courses/ai-manufacturing" className="text-slate-400 hover:text-indigo-600 transition-all p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
          </svg>
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
             Atelier Pratique — AI for Manufacturing
          </p>
          <h2 className="text-base font-black text-slate-900 leading-none uppercase tracking-tight">
            {lab.title[lang] || labId}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang("fr")} className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${lang === "fr" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 text-slate-400"}`}>FR</button>
          <button onClick={() => setLang("en")} className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${lang === "en" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 text-slate-400"}`}>EN</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        {/* Mission Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Mission Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="bg-indigo-600 px-8 py-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-200" />
                <h3 className="text-lg font-black uppercase tracking-widest">{lang === "fr" ? "Votre Mission" : "Your Mission"}</h3>
              </div>
              <span className="bg-white/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Workshop Mode</span>
            </div>
            
            <div className="p-8 md:p-10">
              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-600 prose-p:font-medium prose-p:leading-relaxed prose-strong:text-indigo-600 prose-strong:font-bold">
                <ReactMarkdown>
                  {lab.missions[0].instructions[lang] || lab.missions[0].instructions["fr"] || ""}
                </ReactMarkdown>
              </div>

              {/* Hints */}
              <div className="mt-10">
                <button 
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors mb-4"
                >
                  <Sparkles className={`w-4 h-4 ${showHints ? "text-indigo-500 fill-indigo-500" : ""}`} />
                  {lang === "fr" ? (showHints ? "Masquer les indices" : "Afficher les indices d'Ella") : (showHints ? "Hide hints" : "Show Ella's hints")}
                </button>
                
                {showHints && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    {lab.missions[0].hints.map((hint, idx) => (
                      <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
                        <span className="text-indigo-500 font-black text-xs shrink-0 mt-0.5">{idx + 1}.</span>
                        <p className="text-sm font-bold text-indigo-800 leading-relaxed italic">{hint[lang]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Input Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-8 flex flex-col h-full sticky top-32">
            <div className="flex items-center gap-3 mb-6">
              <EllaAvatar size="sm" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{lang === "fr" ? "Analyse d'Ella" : "Ella's Analysis"}</h3>
            </div>

            {/* Input area */}
            {!evaluation ? (
              <div className="flex flex-col flex-1 gap-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
                  {lang === "fr" ? "Votre réponse industrielle :" : "Your industrial response:"}
                </label>
                <textarea
                  value={studentResponse}
                  onChange={(e) => setStudentResponse(e.target.value)}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData("text").trim();
                    const previousFeedback = (evaluation?.feedback || "").trim();
                    if (previousFeedback && pastedText.length > 30) {
                      const feedbackWords = new Set(previousFeedback.toLowerCase().split(/\s+/));
                      const pastedWords = pastedText.toLowerCase().split(/\s+/);
                      const overlap = pastedWords.filter(w => feedbackWords.has(w)).length;
                      const similarity = overlap / pastedWords.length;
                      if (similarity > 0.6) {
                        e.preventDefault();
                        alert(lang === "fr" 
                          ? "Vous ne pouvez pas copier-coller le feedback d'Ella. Reformulez avec vos propres mots !"
                          : "You can't paste Ella's feedback. Use your own words!");
                        return;
                      }
                    }
                  }}
                  placeholder={lang === "fr" ? "Détaillez votre approche technique, les contraintes OT identifiées et les KPIs visés..." : "Detail your technical approach, identified OT constraints, and targeted KPIs..."}
                  className="flex-1 min-h-[300px] w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-700 font-bold leading-relaxed focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300 resize-none"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!studentResponse.trim() || isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group uppercase tracking-widest text-xs"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {lang === "fr" ? "Soumettre pour évaluation" : "Submit for evaluation"}
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col flex-1 gap-6 animate-in zoom-in-95 duration-500">
                <div className={`p-6 rounded-3xl border-2 ${
                  evaluation.score_qualitative === "excellent" ? "bg-emerald-50 border-emerald-100" :
                  evaluation.score_qualitative === "good" ? "bg-blue-50 border-blue-100" :
                  "bg-amber-50 border-amber-100"
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {evaluation.score_qualitative === "excellent" ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> :
                     evaluation.score_qualitative === "good" ? <Sparkles className="w-6 h-6 text-blue-500" /> :
                     <AlertCircle className="w-6 h-6 text-amber-500" />}
                    <span className={`text-xs font-black uppercase tracking-widest ${
                      evaluation.score_qualitative === "excellent" ? "text-emerald-700" :
                      evaluation.score_qualitative === "good" ? "text-blue-700" :
                      "text-amber-700"
                    }`}>
                      {evaluation.score_qualitative === "excellent" ? (lang === "fr" ? "Excellent travail" : "Excellent work") :
                       evaluation.score_qualitative === "good" ? (lang === "fr" ? "Bonne analyse" : "Good analysis") :
                       (lang === "fr" ? "À approfondir" : "Needs more depth")}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                    {evaluation.feedback}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { setEvaluation(null); setStudentResponse(""); }}
                    className="w-full py-4 rounded-2xl text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                  >
                    {lang === "fr" ? "Nouvelle tentative" : "Try again"}
                  </button>
                  
                  {(evaluation.score_qualitative === "excellent" || evaluation.score_qualitative === "good") && nextSeqId && (
                    <Link
                      href={nextSeqId === "final" ? "/courses/ai-manufacturing" : `/courses/ai-manufacturing/sequences/${nextSeqId}`}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-xs"
                    >
                      {lang === "fr" ? "Séquence suivante" : "Next Sequence"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManufacturingWorkshopPage() {
  return (
    <ProtectedRoute>
      <AccessCodeGate courseId="manufacturing" courseTitle="Workshop : AI for Manufacturing" accentColor="indigo">
        <WorkshopContent />
      </AccessCodeGate>
    </ProtectedRoute>
  );
}
