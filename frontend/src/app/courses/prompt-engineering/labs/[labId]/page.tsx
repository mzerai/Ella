/**
 * PE Lab interface — prompt editor + LLM output + Ella evaluation.
 * This is the core interactive learning experience.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EllaAvatar from "@/components/EllaAvatar";
import {
  getPELabDetail,
  runPELab,
  type PELabDetail,
  type PEMission,
  type PELabRunResponse,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileModal from "@/components/ProfileModal";
import ScoreBadge from "@/components/ScoreBadge";

function LabContent() {
  const params = useParams();
  const labId = params.labId as string;

  const { user } = useAuth();
  const supabase = createClient();

  const [lab, setLab] = useState<PELabDetail | null>(null);
  const [selectedMission, setSelectedMission] = useState<PEMission | null>(null);
  const [studentPrompt, setStudentPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [result, setResult] = useState<PELabRunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang] = useState<"fr" | "en">("fr");
  const isSystemPromptLab = labId === "04_system_prompts";

  const [profile, setProfile] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load lab detail
  useEffect(() => {
    const savedProfile = localStorage.getItem("ellaUserProfile");
    setProfile(savedProfile);

    getPELabDetail(labId)
      .then((data) => {
        setLab(data);
        
        // Filter mission based on profile
        if (data.missions.length > 0) {
          const filtered = data.missions.find(m => m.audience?.toLowerCase() === savedProfile?.toLowerCase());
          setSelectedMission(filtered || data.missions[0]);
        }
      })
      .catch((err) => setError(err.message));
  }, [labId]);

  const handleProfileSelect = async (newProfile: "engineering" | "business") => {
    localStorage.setItem("ellaUserProfile", newProfile);
    
    // Also save to Supabase profile
    if (user) {
      await supabase
        .from("profiles")
        .update({ profile_type: newProfile })
        .eq("id", user.id);
    }
    
    setProfile(newProfile);
    setIsProfileModalOpen(false);
    window.location.reload(); // Refresh to update mission
  };

  const saveAttempt = async (resp: PELabRunResponse) => {
    if (!user) return;
    
    try {
      await supabase.from("lab_attempts").insert({
        user_id: user.id,
        lab_id: labId,
        mission_id: selectedMission?.mission_id,
        student_prompt: studentPrompt,
        llm_output: resp.llm_output,
        total_score: resp.evaluation.total_score,
        max_score: resp.evaluation.max_score,
        evaluation: resp.evaluation,
        execution_time_ms: resp.execution_time_ms,
      });
    } catch (err) {
      console.error("Error saving attempt:", err);
    }
  };

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
      await saveAttempt(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

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

  if (!lab || !selectedMission) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center animate-pulse-warm">
          <EllaAvatar size="lg" className="mb-4" />
          <p className="text-ella-gray-500 font-medium">Chargement du lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ella-primary text-white flex items-center justify-center font-bold shadow-sm">
            {lab.lab_id.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-ella-gray-900 leading-tight">
              {lab.title[lang]}
            </h1>
            <p className="text-xs text-ella-gray-500">
              {lab.concept?.[lang] || lab.description[lang]}
            </p>
          </div>
        </div>

        {/* Profile indicator instead of mission tabs */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-ella-gray-400 font-bold uppercase tracking-wider">Mission Contextuelle</span>
            <span className="text-sm font-bold text-ella-primary">
              Profil {profile === "engineering" ? "Ingénierie" : "Business"}
            </span>
          </div>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="p-2 hover:bg-ella-gray-100 rounded-full transition-colors text-ella-gray-400 hover:text-ella-primary"
            title="Changer de profil"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mission & Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mission Description */}
          <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-ella-primary mb-2 uppercase tracking-wider">Mission Actuelle</h2>
            <p className="text-sm text-ella-gray-800 leading-relaxed font-medium mb-4">
              {selectedMission.instructions[lang]}
            </p>
            {selectedMission.hints && selectedMission.hints.length > 0 && (
              <details className="group border-t border-ella-gray-100 pt-3">
                <summary className="text-xs text-ella-accent cursor-pointer font-bold list-none flex items-center gap-1 group-open:mb-2">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  Besoin d'un coup de pouce ?
                </summary>
                <div className="bg-ella-accent-bg rounded-lg p-3 text-xs text-ella-accent-dark leading-relaxed italic">
                  {typeof selectedMission.hints[0] === "object" ? selectedMission.hints[0][lang] : selectedMission.hints[0]}
                </div>
              </details>
            )}
          </div>

          {selectedMission.input_text && (
            <div className="ella-card mb-6">
              <details open>
                <summary className="text-sm font-semibold text-ella-gray-900 cursor-pointer mb-2">
                  Texte source
                </summary>
                <div className="text-sm text-ella-gray-700 leading-relaxed whitespace-pre-line bg-ella-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {typeof selectedMission.input_text === "object"
                    ? selectedMission.input_text[lang] || selectedMission.input_text["fr"]
                    : selectedMission.input_text}
                </div>
              </details>
            </div>
          )}

          {/* Editors */}
          <div className="space-y-4">
            {isSystemPromptLab && (
              <div>
                <label className="text-xs font-bold text-ella-gray-500 mb-2 block flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ella-primary"></span>
                  SYSTEM PROMPT
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Tu es un assistant RH spécialisé..."
                  className="prompt-editor w-full !min-h-[100px]"
                  rows={4}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-ella-gray-500 mb-2 block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ella-accent"></span>
                {isSystemPromptLab ? "MESSAGE UTILISATEUR (TEST)" : "TON PROMPT"}
              </label>
              <textarea
                value={studentPrompt}
                onChange={(e) => setStudentPrompt(e.target.value)}
                placeholder={isSystemPromptLab ? "Pose une question au bot..." : "Écris ton prompt ici..."}
                className="prompt-editor w-full !min-h-[200px]"
                rows={8}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleRun}
                disabled={loading || !studentPrompt.trim()}
                className="btn-primary flex items-center gap-2 px-8 shadow-lg shadow-ella-accent/20 active:translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Ella analyse...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                    Exécuter et évaluer
                  </>
                )}
              </button>
              {result && (
                <div className="flex items-center gap-4 text-[10px] font-bold text-ella-gray-400 uppercase tracking-widest">
                  <span>Latency: {Math.round(result.execution_time_ms)}ms</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {!result && !loading && (
            <div className="bg-ella-gray-100 rounded-xl border-2 border-dashed border-ella-gray-200 h-full flex items-center justify-center text-center p-8">
              <div className="max-w-xs">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <EllaAvatar size="sm" />
                </div>
                <h4 className="font-bold text-ella-gray-900 mb-1">Prêt pour l'action ?</h4>
                <p className="text-xs text-ella-gray-500">
                  Configure ton prompt à gauche et clique sur "Exécuter". Ella évaluera ta réponse en temps réel.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-xl border border-ella-gray-200 h-full flex items-center justify-center text-center p-8 shadow-sm">
              <div className="animate-fade-in">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-ella-primary/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-ella-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <EllaAvatar size="sm" />
                  </div>
                </div>
                <p className="text-sm font-bold text-ella-primary-dark">Ella réfléchit...</p>
                <p className="text-xs text-ella-gray-500 mt-2">La réponse arrive dans quelques secondes.</p>
              </div>
            </div>
          )}

          {result && (
            <div className="animate-fade-in space-y-6">
              {/* LLM Output Card */}
              <div className="bg-ella-dark rounded-xl shadow-xl overflow-hidden border border-white/5">
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-ella-success"></span>
                    LLM Output
                  </span>
                </div>
                <div className="p-4 overflow-auto max-h-[300px]">
                  <pre className="text-xs text-ella-dark-text whitespace-pre-wrap font-mono leading-relaxed">
                    {result.llm_output}
                  </pre>
                </div>
              </div>

              {/* Evaluation Card */}
              <div className="bg-white rounded-xl border border-ella-gray-200 shadow-lg overflow-hidden flex flex-col">
                <div className="bg-ella-primary p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EllaAvatar size="sm" className="ring-2 ring-white/20" />
                    <span className="font-bold text-sm">Verdict d'Ella</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-black shadow-inner flex items-center gap-1.5
                    ${result.evaluation.total_score >= result.evaluation.max_score * 0.8 ? 'bg-ella-success/20 text-white' : 
                      result.evaluation.total_score >= result.evaluation.max_score * 0.5 ? 'bg-ella-warning/20 text-white' : 'bg-ella-accent/20 text-white'}`}>
                    <span className="text-lg">{result.evaluation.total_score}</span>
                    <span className="opacity-50">/ {result.evaluation.max_score}</span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Feedback Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-ella-success-bg p-3 rounded-lg border border-ella-success/10">
                      <p className="text-[9px] font-black text-ella-success mb-2 uppercase tracking-wider">Points forts</p>
                      <div className="space-y-1.5">
                        {result.evaluation.strengths.slice(0, 2).map((s, i) => (
                          <p key={i} className="text-[11px] text-green-900 leading-tight flex gap-1 items-start">
                            <span>✓</span> {s}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="bg-ella-accent-bg p-3 rounded-lg border border-ella-accent/10">
                      <p className="text-[9px] font-black text-ella-accent mb-2 uppercase tracking-wider">Améliorations</p>
                      <div className="space-y-1.5">
                        {result.evaluation.improvements.slice(0, 2).map((s, i) => (
                          <p key={i} className="text-[11px] text-ella-accent-dark leading-tight flex gap-1 items-start">
                            <span>!</span> {s}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hint Card */}
                  {result.evaluation.improved_prompt_hint && (
                    <div className="bg-ella-primary-bg rounded-lg p-4 border border-ella-primary/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zm6.364-1.636a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM5 10a5 5 0 1110 0 5 5 0 01-10 0z"></path></svg>
                      </div>
                      <h5 className="text-[10px] font-black text-ella-primary mb-1 uppercase tracking-widest">Conseil d'Ella</h5>
                      <p className="text-xs text-ella-primary-dark font-medium leading-relaxed italic z-10 relative">
                        "{result.evaluation.improved_prompt_hint}"
                      </p>
                    </div>
                  )}

                  {/* Criteria Chart */}
                  <div className="space-y-3 pt-3">
                    {Object.entries(result.evaluation.criteria_scores).map(([id, criterion]) => (
                      <div key={id} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-ella-gray-600">
                          <span className="uppercase tracking-wide">{id}</span>
                          <span>{criterion.score}/2</span>
                        </div>
                        <div className="h-1.5 bg-ella-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-700 ${criterion.score === 2 ? 'bg-ella-primary' : criterion.score === 1 ? 'bg-ella-warning' : 'bg-ella-accent'}`} style={{ width: `${(criterion.score / 2) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-ella-accent-bg text-ella-accent-dark p-4 rounded-lg text-sm border border-ella-accent/20 mt-6 shadow-sm">
          Oups ! {error}. Ella est un peu fatiguée, réessaie dans un instant.
        </div>
      )}

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onSelect={handleProfileSelect} 
      />
    </div>
  );
}

export default function LabPage() {
  return (
    <ProtectedRoute>
      <LabContent />
    </ProtectedRoute>
  );
}
