/**
 * RL Lab page — interactive Policy Evaluation / Planning lab on FrozenLake.
 * Includes a progressive mission system with numeric and ELLA-evaluated missions.
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import EllaAvatar from "@/components/EllaAvatar";
import FrozenLakeGrid from "@/components/FrozenLakeGrid";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  runRLLab,
  sendChatMessage,
  fetchLessonProgress,
  saveCheckpointProgress,
  type RLLabRunRequest,
  type RLLabRunResponse,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

// ---------------------------------------------------------------------------
// Lab definitions
// ---------------------------------------------------------------------------

interface LabDef {
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  algorithms: string[];
  defaultAlgorithm: string;
  showPolicyMode: boolean;
  nextUrl: string;
  nextLabel: { fr: string; en: string };
}

const LABS: Record<string, LabDef> = {
  policy_evaluation: {
    title: {
      fr: "Lab — Évaluation de Politique",
      en: "Lab — Policy Evaluation",
    },
    description: {
      fr: "Évalue la fonction de valeur V(s) d'une politique fixée sur FrozenLake. Compare politique aléatoire vs politique manuelle et observe comment γ influence les valeurs.",
      en: "Evaluate the value function V(s) of a fixed policy on FrozenLake. Compare random vs manual policy and observe how γ influences values.",
    },
    algorithms: ["policy_evaluation"],
    defaultAlgorithm: "policy_evaluation",
    showPolicyMode: true,
    nextUrl: "/courses/reinforcement-learning/modules/rl_02_planning",
    nextLabel: {
      fr: "Planification — Policy & Value Iteration",
      en: "Planning — Policy & Value Iteration",
    },
  },
  planning: {
    title: {
      fr: "Lab — Planification (VI & PI)",
      en: "Lab — Planning (VI & PI)",
    },
    description: {
      fr: "Résous le MDP avec Value Iteration et Policy Iteration. Compare le nombre d'itérations, observe la convergence et navigue les étapes d'amélioration de PI.",
      en: "Solve the MDP with Value Iteration and Policy Iteration. Compare iteration counts, observe convergence and navigate PI improvement steps.",
    },
    algorithms: ["value_iteration", "policy_iteration"],
    defaultAlgorithm: "value_iteration",
    showPolicyMode: false,
    nextUrl: "/courses/reinforcement-learning/modules/rl_03_td_mc",
    nextLabel: {
      fr: "TD(0) et Monte Carlo",
      en: "TD(0) and Monte Carlo",
    },
  },
};

const ALGO_LABELS: Record<string, { fr: string; en: string }> = {
  policy_evaluation: { fr: "Policy Evaluation", en: "Policy Evaluation" },
  value_iteration: { fr: "Value Iteration", en: "Value Iteration" },
  policy_iteration: { fr: "Policy Iteration", en: "Policy Iteration" },
};

const THETA_OPTIONS = [1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-10];

// ---------------------------------------------------------------------------
// Mission definitions
// ---------------------------------------------------------------------------

interface MissionDef {
  id: string; // "mission_1", "mission_2", "mission_3"
  type: "numeric" | "ella_eval";
  question: { fr: string; en: string };
  hint?: string; // For ella_eval — sent to ELLA as evaluation context
  /** For numeric: extract expected answer from the last run result */
  getExpected?: (result: RLLabRunResponse) => number;
}

const LAB_MISSIONS: Record<string, MissionDef[]> = {
  policy_evaluation: [
    {
      id: "mission_1",
      type: "numeric",
      question: {
        fr: "Lance Policy Evaluation avec la politique aléatoire, γ=0.95, θ=1e-8, en mode déterministe. Quel est le nombre d'itérations pour converger ?",
        en: "Run Policy Evaluation with the random policy, γ=0.95, θ=1e-8, in deterministic mode. How many iterations to converge?",
      },
      getExpected: (r) => r.iterations,
    },
    {
      id: "mission_2",
      type: "ella_eval",
      question: {
        fr: "Compare V(s₀) entre γ=0.5 et γ=0.95 (politique aléatoire, déterministe). Lequel donne la plus grande valeur ? Explique en 1-2 phrases pourquoi γ élevé augmente V(s₀).",
        en: "Compare V(s₀) between γ=0.5 and γ=0.95 (random policy, deterministic). Which gives the higher value? Explain in 1-2 sentences why higher γ increases V(s₀).",
      },
      hint: "The student should mention that higher gamma gives more weight to future rewards, so the Goal's reward propagates further back through the state space. γ=0.95 should give a higher V(s₀). Accept if the core idea is correct even if wording is imprecise.",
    },
    {
      id: "mission_3",
      type: "ella_eval",
      question: {
        fr: "Observe la grille après Policy Evaluation. Pourquoi les états 5, 7, 11 et 12 ont-ils V(s)=0 ? Et pourquoi l'état 15 (le Goal 🏆) a-t-il aussi V=0 ?",
        en: "Look at the grid after Policy Evaluation. Why do states 5, 7, 11, and 12 have V(s)=0? And why does state 15 (the Goal 🏆) also have V=0?",
      },
      hint: "States 5,7,11,12 are Holes (terminal states with 0 reward). State 15 is the Goal — also terminal, V=0 because the reward +1 is received upon ARRIVING at the Goal (transition reward), not for being in it. No future transitions possible from terminal states. Accept if the student correctly identifies both reasons.",
    },
  ],
  planning: [
    {
      id: "mission_1",
      type: "numeric",
      question: {
        fr: "Lance Value Iteration en mode déterministe (γ=0.95, θ=1e-8). Combien d'itérations pour converger ?",
        en: "Run Value Iteration in deterministic mode (γ=0.95, θ=1e-8). How many iterations to converge?",
      },
      getExpected: (r) => r.iterations,
    },
    {
      id: "mission_2",
      type: "ella_eval",
      question: {
        fr: "Lance Value Iteration puis Policy Iteration avec les mêmes paramètres (γ=0.95, θ=1e-8, déterministe). Les deux trouvent-ils la même politique optimale ? Lequel est plus efficace en nombre total de sweeps ? Justifie.",
        en: "Run Value Iteration then Policy Iteration with the same parameters (γ=0.95, θ=1e-8, deterministic). Do both find the same optimal policy? Which is more efficient in total sweeps? Justify.",
      },
      hint: "Both converge to the same V* and π*. VI does ~7 sweeps total. PI does ~7 improvement steps but each includes a full policy evaluation, totaling ~29 sweeps. So VI is more efficient in sweeps for this small environment. Accept if the student correctly identifies that VI uses fewer total sweeps and gives a reasonable explanation.",
    },
    {
      id: "mission_3",
      type: "ella_eval",
      question: {
        fr: "Active le mode Slippery et relance Value Iteration (γ=0.95, θ=1e-8). Compare le nombre d'itérations et V(s₀) avec le mode déterministe. Explique pourquoi les deux changent drastiquement.",
        en: "Turn on Slippery mode and rerun Value Iteration (γ=0.95, θ=1e-8). Compare the number of iterations and V(s₀) with deterministic mode. Explain why both change drastically.",
      },
      hint: "Deterministic: ~7 iterations, V(s₀)≈0.77. Slippery: ~184 iterations, V(s₀)≈0.18. The stochasticity means the agent only moves in the intended direction 1/3 of the time, so it falls in holes more often (lower V) and the value updates are smaller per sweep (slower convergence). Accept if the student identifies both effects.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Mission state type
// ---------------------------------------------------------------------------

interface MissionState {
  response: string;
  feedback: string;
  loading: boolean;
  submitted: boolean;
  passed: boolean;
  attempts: number;
}

const EMPTY_MISSION_STATE: MissionState = {
  response: "",
  feedback: "",
  loading: false,
  submitted: false,
  passed: false,
  attempts: 0,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function LabContent() {
  const params = useParams();
  const labId = params.labId as string;
  const lab = LABS[labId];
  const missions = LAB_MISSIONS[labId] || [];

  const { user } = useAuth();
  const [lang, setLang] = useState<"fr" | "en">("fr");

  // Controls state
  const [gamma, setGamma] = useState(0.95);
  const [theta, setTheta] = useState(1e-8);
  const [isSlippery, setIsSlippery] = useState(false);
  const [algorithm, setAlgorithm] = useState(lab?.defaultAlgorithm ?? "");
  const [policyMode, setPolicyMode] = useState("random");

  // Execution state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RLLabRunResponse | null>(null);

  // Animation state
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(-1);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // PI step navigation
  const [piStepIdx, setPiStepIdx] = useState(0);

  // Mission state
  const [missionStates, setMissionStates] = useState<Record<string, MissionState>>({});
  const [isHydrating, setIsHydrating] = useState(true);
  const hasHydrated = useRef(false);

  // ---------------------------------------------------------------------------
  // Hydrate mission progress on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (hasHydrated.current) return;
    if (user === undefined) return; // Wait for AuthProvider

    const hydrate = async () => {
      if (user) {
        try {
          const { checkpoints } = await fetchLessonProgress("rl", labId);
          if (checkpoints && checkpoints.length > 0) {
            const restored: Record<string, MissionState> = {};
            checkpoints.forEach((cp) => {
              restored[cp.checkpoint_id] = {
                response: cp.student_response || "",
                feedback: cp.ella_feedback || "",
                passed: cp.passed || false,
                attempts: cp.attempts || 0,
                loading: false,
                submitted: !!(cp.ella_feedback || cp.attempts > 0),
              };
            });
            setMissionStates((prev) => ({ ...prev, ...restored }));
          }
        } catch (err) {
          console.error("Failed to hydrate mission progress:", err);
        }
      }
      setIsHydrating(false);
      hasHydrated.current = true;
    };

    hydrate();
  }, [user, labId]);

  // Derived: how many missions passed
  const passedCount = missions.filter(
    (m) => missionStates[m.id]?.passed
  ).length;

  // Which missions are unlocked: mission N is unlocked if N-1 is passed (or N=0)
  const isMissionUnlocked = (idx: number): boolean => {
    if (idx === 0) return true;
    const prev = missions[idx - 1];
    const prevState = missionStates[prev.id];
    return !!(prevState?.passed || (prevState?.attempts ?? 0) >= 3);
  };

  // Derived display values — either animated frame, PI step, or final
  const displayV =
    animStep >= 0 && result?.v_history?.[animStep]
      ? result.v_history[animStep]
      : result?.algorithm === "policy_iteration" &&
        result?.pi_steps &&
        result.pi_steps.length > 0
      ? result.pi_steps[piStepIdx]?.V ?? result.V
      : result?.V ?? [];

  const displayQ =
    result?.algorithm === "policy_iteration" &&
    result?.pi_steps &&
    result.pi_steps.length > 0 &&
    animStep < 0
      ? result.pi_steps[piStepIdx]?.Q ?? result.Q
      : result?.Q ?? [];

  const displayPolicy =
    result?.algorithm === "policy_iteration" &&
    result?.pi_steps &&
    result.pi_steps.length > 0 &&
    animStep < 0
      ? result.pi_steps[piStepIdx]?.policy ?? result.policy
      : result?.policy ?? [];

  // Reset PI step when result changes
  useEffect(() => {
    setPiStepIdx(0);
  }, [result]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  const stopAnimation = useCallback(() => {
    if (animRef.current) {
      clearInterval(animRef.current);
      animRef.current = null;
    }
    setAnimating(false);
    setAnimStep(-1);
  }, []);

  const startAnimation = useCallback(() => {
    if (!result?.v_history || result.v_history.length === 0) return;
    stopAnimation();
    setAnimating(true);
    setAnimStep(0);

    const total = result.v_history.length;
    const delay = total > 200 ? 30 : total > 50 ? 80 : 150;
    let step = 0;

    animRef.current = setInterval(() => {
      step += 1;
      if (step >= total) {
        clearInterval(animRef.current!);
        animRef.current = null;
        setAnimating(false);
        setAnimStep(-1);
        return;
      }
      setAnimStep(step);
    }, delay);
  }, [result, stopAnimation]);

  // ---- Run algorithm ----
  const handleRun = async () => {
    if (!lab) return;
    setLoading(true);
    setError(null);
    setResult(null);
    stopAnimation();

    const request: RLLabRunRequest = {
      algorithm,
      gamma,
      theta,
      max_iterations: 1000,
      is_slippery: isSlippery,
      map_name: "4x4",
      policy_mode: policyMode,
    };

    try {
      const resp = await runRLLab(request);
      setResult(resp);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Mission submission handlers
  // ---------------------------------------------------------------------------

  const handleNumericSubmit = (mission: MissionDef) => {
    if (!result || !mission.getExpected) return;

    const state = missionStates[mission.id] || { ...EMPTY_MISSION_STATE };
    const studentAnswer = parseFloat(state.response);
    if (isNaN(studentAnswer)) return;

    const expected = mission.getExpected(result);
    const passed = Math.abs(studentAnswer - expected) <= 1;
    const currentAttempts = state.attempts + 1;

    const feedback = passed
      ? lang === "fr"
        ? "Correct ! Bien joué."
        : "Correct! Well done."
      : lang === "fr"
      ? "Pas tout à fait — vérifie tes paramètres et relance."
      : "Not quite — check your parameters and rerun.";

    setMissionStates((prev) => ({
      ...prev,
      [mission.id]: {
        ...state,
        feedback,
        submitted: true,
        passed,
        attempts: currentAttempts,
        loading: false,
      },
    }));

    saveCheckpointProgress({
      course_id: "rl",
      module_id: labId,
      checkpoint_id: mission.id,
      dynamic_question: mission.question[lang],
      student_response: state.response,
      ella_feedback: feedback,
      passed,
      attempts: currentAttempts,
    });
  };

  const handleEllaSubmit = async (mission: MissionDef) => {
    const state = missionStates[mission.id] || { ...EMPTY_MISSION_STATE };
    if (!state.response.trim()) return;

    const currentAttempts = state.attempts + 1;

    setMissionStates((prev) => ({
      ...prev,
      [mission.id]: { ...state, loading: true, attempts: currentAttempts },
    }));

    try {
      const evaluationInstruction = `\n\nIMPORTANT: Termine ta réponse par EXACTEMENT l'une de ces deux lignes (et rien d'autre sur cette ligne):\n[CHECKPOINT_PASSED]\n[CHECKPOINT_RETRY]\n\nUtilise [CHECKPOINT_PASSED] uniquement si l'étudiant montre une compréhension réelle et correcte du concept. Utilise [CHECKPOINT_RETRY] si la réponse est hors-sujet, trop vague, incorrecte ou montre une incompréhension fondamentale. Sois encourageante mais honnête.`;

      const chatResult = await sendChatMessage({
        message: `[NOTEBOOK_CHECKPOINT]\nQuestion posée à l'étudiant: "${mission.question[lang]}"\n\nRéponse de l'étudiant: "${state.response}"\n\nConsigne pour l'évaluation (NE PAS RÉVÉLER À L'ÉTUDIANT): ${mission.hint}${evaluationInstruction}`,
        context: {
          page_id: labId,
          page_title: `RL Lab ${labId}`,
          algorithm: "",
          lab_name: `Mission ${mission.id}`,
          extra: { course_id: "rl", checkpoint_mode: true },
        },
        conversation_history: [],
      });

      let passed = chatResult.answer.includes("[CHECKPOINT_PASSED]");
      const retry = chatResult.answer.includes("[CHECKPOINT_RETRY]");

      // Fallback heuristic if tags are missing
      if (!passed && !retry) {
        const lower = chatResult.answer.toLowerCase();
        const negativeSignals = [
          "pas tout à fait", "pas correct", "incorrect", "réessaie",
          "essaie encore", "pas encore", "manque", "oublié", "erreur",
          "not quite", "try again", "incorrect", "missing", "wrong",
          "not correct", "needs improvement", "reconsider",
        ];
        const isNegative = negativeSignals.some((s) => lower.includes(s));
        passed = !isNegative;
      }

      let cleanFeedback = chatResult.answer
        .replace("[CHECKPOINT_PASSED]", "")
        .replace("[CHECKPOINT_RETRY]", "")
        .trim();

      // Remove "Lien avec le lab" boilerplate
      cleanFeedback = cleanFeedback
        .replace(/🎯\s*\*\*Lien avec le lab\*\*.*?(\n\n|\n(?=🔍|⛔|📌)|$)/gs, "")
        .replace(/🔗\s*\*\*Connection to Current Lab\*\*.*?(\n\n|\n(?=💡|⚠️|📚)|$)/gs, "")
        .trim();

      setMissionStates((prev) => ({
        ...prev,
        [mission.id]: {
          ...state,
          feedback: cleanFeedback,
          loading: false,
          submitted: true,
          passed,
          attempts: currentAttempts,
        },
      }));

      saveCheckpointProgress({
        course_id: "rl",
        module_id: labId,
        checkpoint_id: mission.id,
        dynamic_question: mission.question[lang],
        student_response: state.response,
        ella_feedback: cleanFeedback,
        passed,
        attempts: currentAttempts,
      });
    } catch {
      setMissionStates((prev) => ({
        ...prev,
        [mission.id]: {
          ...state,
          feedback:
            lang === "fr"
              ? "Oups, j'ai eu un souci technique. Réessaie !"
              : "Oops, technical issue. Try again!",
          loading: false,
          submitted: true,
          passed: false,
          attempts: currentAttempts,
        },
      }));
    }
  };

  // ---- Unknown lab ----
  if (!lab) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <EllaAvatar size="lg" className="mx-auto mb-6 opacity-30" />
        <h2 className="text-2xl font-bold text-ella-gray-900 mb-3">
          {lang === "fr" ? "Lab introuvable" : "Lab not found"}
        </h2>
        <p className="text-ella-gray-500 mb-8">
          {lang === "fr"
            ? `Le lab "${labId}" n'existe pas encore.`
            : `The lab "${labId}" does not exist yet.`}
        </p>
        <Link
          href="/courses/reinforcement-learning"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          {lang === "fr" ? "Retour au cours" : "Back to course"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ---- Sticky Header ---- */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-ella-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/courses/reinforcement-learning"
              className="text-ella-gray-400 hover:text-ella-primary transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-ella-gray-900 truncate">
                {lab.title[lang]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Mission score badge */}
            {missions.length > 0 && (
              <div className="flex items-center gap-1.5 bg-ella-primary-bg rounded-full px-3 py-1">
                <span className="text-[10px] font-black text-ella-primary uppercase tracking-widest">
                  Missions
                </span>
                <span className="text-xs font-black font-mono text-ella-primary">
                  {passedCount}/{missions.length}
                </span>
              </div>
            )}

            <button
              onClick={() => setLang("fr")}
              className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
                lang === "fr"
                  ? "bg-ella-accent text-white shadow-lg shadow-ella-accent/20"
                  : "bg-ella-gray-100 text-ella-gray-400 hover:bg-ella-gray-200"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
                lang === "en"
                  ? "bg-ella-accent text-white shadow-lg shadow-ella-accent/20"
                  : "bg-ella-gray-100 text-ella-gray-400 hover:bg-ella-gray-200"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* ---- Ella Intro Banner ---- */}
        <div className="bg-white border border-ella-primary/10 rounded-2xl p-5 mb-6 flex items-start gap-4 shadow-sm">
          <EllaAvatar size="sm" className="shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xs font-black text-ella-primary uppercase tracking-widest mb-1">
              {lang === "fr" ? "Le mot d'Ella" : "Ella says"}
            </h2>
            <p className="text-sm text-ella-gray-700 leading-relaxed font-medium italic">
              &quot;{lab.description[lang]}&quot;
            </p>
          </div>
        </div>

        {/* ---- Main Grid: Controls | Results ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ---- Controls Panel (4 cols) ---- */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm space-y-5">
              <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">
                {lang === "fr" ? "Hyperparamètres" : "Hyperparameters"}
              </h3>

              {/* Gamma slider */}
              <div>
                <label className="flex justify-between text-xs font-bold text-ella-gray-700 mb-1.5">
                  <span>γ (discount)</span>
                  <span className="font-mono text-ella-primary">{gamma.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))}
                  className="w-full accent-ella-primary"
                />
                <div className="flex justify-between text-[9px] text-ella-gray-400 mt-0.5">
                  <span>0</span>
                  <span>1</span>
                </div>
              </div>

              {/* Theta select */}
              <div>
                <label className="text-xs font-bold text-ella-gray-700 mb-1.5 block">
                  θ (convergence)
                </label>
                <select
                  value={theta}
                  onChange={(e) => setTheta(parseFloat(e.target.value))}
                  className="w-full border border-ella-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-ella-gray-700 focus:outline-none focus:ring-2 focus:ring-ella-primary/30"
                >
                  {THETA_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t.toExponential()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slippery toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ella-gray-700">
                  {lang === "fr" ? "Glissant (stochastique)" : "Slippery (stochastic)"}
                </span>
                <button
                  onClick={() => setIsSlippery(!isSlippery)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    isSlippery ? "bg-ella-primary" : "bg-ella-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      isSlippery ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Algorithm selector (planning lab) */}
              {lab.algorithms.length > 1 && (
                <div>
                  <label className="text-xs font-bold text-ella-gray-700 mb-1.5 block">
                    {lang === "fr" ? "Algorithme" : "Algorithm"}
                  </label>
                  <div className="flex gap-2">
                    {lab.algorithms.map((alg) => (
                      <button
                        key={alg}
                        onClick={() => setAlgorithm(alg)}
                        className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                          algorithm === alg
                            ? "bg-ella-primary text-white shadow-md"
                            : "bg-ella-gray-100 text-ella-gray-500 hover:bg-ella-gray-200"
                        }`}
                      >
                        {ALGO_LABELS[alg]?.[lang] ?? alg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Policy mode selector (PE lab) */}
              {lab.showPolicyMode && (
                <div>
                  <label className="text-xs font-bold text-ella-gray-700 mb-1.5 block">
                    {lang === "fr" ? "Politique" : "Policy"}
                  </label>
                  <div className="flex gap-2">
                    {["random", "manual"].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPolicyMode(mode)}
                        className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                          policyMode === mode
                            ? "bg-ella-primary text-white shadow-md"
                            : "bg-ella-gray-100 text-ella-gray-500 hover:bg-ella-gray-200"
                        }`}
                      >
                        {mode === "random"
                          ? lang === "fr"
                            ? "Aléatoire"
                            : "Random"
                          : lang === "fr"
                          ? "Manuelle (→)"
                          : "Manual (→)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Run button */}
              <button
                onClick={handleRun}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 shadow-lg shadow-ella-accent/20 active:translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {lang === "fr" ? "Calcul en cours..." : "Computing..."}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    {lang === "fr" ? "Lancer l'algorithme" : "Run algorithm"}
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-ella-accent-bg text-ella-accent-dark p-4 rounded-lg text-sm border border-ella-accent/20 shadow-sm">
                {error}
              </div>
            )}
          </div>

          {/* ---- Results Panel (8 cols) ---- */}
          <div className="lg:col-span-8 space-y-6">
            {/* Empty state */}
            {!result && !loading && (
              <div className="bg-ella-gray-100 rounded-xl border-2 border-dashed border-ella-gray-200 flex items-center justify-center text-center p-12">
                <div className="max-w-xs">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <EllaAvatar size="sm" />
                  </div>
                  <h4 className="font-bold text-ella-gray-900 mb-1">
                    {lang === "fr" ? "Prêt pour l'expérience ?" : "Ready to experiment?"}
                  </h4>
                  <p className="text-xs text-ella-gray-500">
                    {lang === "fr"
                      ? "Configure les paramètres à gauche et lance l'algorithme pour voir la grille FrozenLake se remplir."
                      : "Configure the parameters on the left and run the algorithm to see the FrozenLake grid fill up."}
                  </p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="bg-white rounded-xl border border-ella-gray-200 flex items-center justify-center text-center p-12 shadow-sm">
                <div className="animate-fade-in">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-ella-primary/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-ella-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <EllaAvatar size="sm" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-ella-primary-dark">
                    {lang === "fr" ? "Ella calcule..." : "Ella is computing..."}
                  </p>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="animate-fade-in space-y-6">
                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl border border-ella-gray-200 p-4 text-center shadow-sm">
                    <p className="text-[9px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">
                      {lang === "fr" ? "Itérations" : "Iterations"}
                    </p>
                    <p className="text-2xl font-black font-mono text-ella-primary">
                      {result.iterations}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-ella-gray-200 p-4 text-center shadow-sm">
                    <p className="text-[9px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">
                      Δ final
                    </p>
                    <p className="text-lg font-black font-mono text-ella-gray-900">
                      {result.final_delta.toExponential(2)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-ella-gray-200 p-4 text-center shadow-sm">
                    <p className="text-[9px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">
                      {lang === "fr" ? "But accessible" : "Goal reachable"}
                    </p>
                    <p className={`text-2xl font-black ${result.goal_reachable ? "text-ella-success" : "text-ella-accent"}`}>
                      {result.goal_reachable ? "✓" : "✗"}
                    </p>
                  </div>
                </div>

                {/* Animation step indicator */}
                {animating && animStep >= 0 && result.v_history && (
                  <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                    <div className="w-3 h-3 border-2 border-purple-400 border-t-purple-700 rounded-full animate-spin" />
                    <span className="text-xs font-bold text-purple-700">
                      {lang === "fr" ? "Animation" : "Animating"}: step {animStep + 1} / {result.v_history.length}
                    </span>
                    <button
                      onClick={stopAnimation}
                      className="ml-auto text-xs font-bold text-purple-500 hover:text-purple-800 transition-colors"
                    >
                      {lang === "fr" ? "Arrêter" : "Stop"}
                    </button>
                  </div>
                )}

                {/* FrozenLake Grid */}
                <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">
                      FrozenLake 4×4
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={startAnimation}
                        disabled={animating || !result.v_history || result.v_history.length === 0}
                        className="btn-secondary !text-[10px] !py-1.5 !px-3 !rounded-lg font-black disabled:opacity-30"
                      >
                        {lang === "fr" ? "▶ Animer la convergence" : "▶ Animate convergence"}
                      </button>
                    </div>
                  </div>
                  <FrozenLakeGrid
                    grid={result.grid}
                    gridSize={result.grid_size}
                    V={displayV}
                    Q={displayQ}
                    policy={displayPolicy}
                  />
                </div>

                {/* PI Steps slider */}
                {result.algorithm === "policy_iteration" &&
                  result.pi_steps &&
                  result.pi_steps.length > 1 && (
                    <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                      <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-3">
                        {lang === "fr"
                          ? "Étapes d'amélioration de la politique"
                          : "Policy improvement steps"}
                      </h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={0}
                          max={result.pi_steps.length - 1}
                          value={piStepIdx}
                          onChange={(e) => {
                            stopAnimation();
                            setPiStepIdx(parseInt(e.target.value));
                          }}
                          className="flex-1 accent-ella-primary"
                        />
                        <span className="text-sm font-mono font-bold text-ella-primary shrink-0">
                          {piStepIdx + 1} / {result.pi_steps.length}
                        </span>
                      </div>
                      <p className="text-xs text-ella-gray-500 mt-2">
                        {lang === "fr" ? "Évaluations internes" : "Inner eval iters"}:{" "}
                        <span className="font-mono font-bold text-ella-gray-700">
                          {result.pi_steps[piStepIdx]?.eval_iters ?? "—"}
                        </span>
                      </p>
                    </div>
                  )}

                {/* Delta convergence chart */}
                {result.delta_history && result.delta_history.length > 0 && (
                  <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                    <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-3">
                      {lang === "fr" ? "Convergence (Δ par itération)" : "Convergence (Δ per iteration)"}
                    </h3>
                    <DeltaChart deltas={result.delta_history} />
                  </div>
                )}
              </div>
            )}

            {/* ---- Mission Panel ---- */}
            {missions.length > 0 && !isHydrating && (
              <MissionPanel
                missions={missions}
                missionStates={missionStates}
                setMissionStates={setMissionStates}
                isMissionUnlocked={isMissionUnlocked}
                result={result}
                lang={lang}
                labId={labId}
                onNumericSubmit={handleNumericSubmit}
                onEllaSubmit={handleEllaSubmit}
              />
            )}

            {/* Next lesson link */}
            {result && (
              <div className="flex justify-center pt-8 pb-4">
                <Link
                  href={lab.nextUrl}
                  className="group flex flex-col items-center gap-2"
                >
                  <span className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest group-hover:text-ella-primary transition-colors">
                    {lang === "fr" ? "Leçon suivante" : "Next Lesson"}
                  </span>
                  <div className="px-6 py-4 rounded-2xl bg-ella-primary/10 flex items-center gap-4 text-ella-primary group-hover:bg-ella-primary group-hover:text-white transition-all shadow-lg hover:shadow-ella-primary/30">
                    <span className="font-bold">{lab.nextLabel[lang]}</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MissionPanel — renders all 3 missions with sequential locking
// ---------------------------------------------------------------------------

function MissionPanel({
  missions,
  missionStates,
  setMissionStates,
  isMissionUnlocked,
  result,
  lang,
  labId,
  onNumericSubmit,
  onEllaSubmit,
}: {
  missions: MissionDef[];
  missionStates: Record<string, MissionState>;
  setMissionStates: React.Dispatch<React.SetStateAction<Record<string, MissionState>>>;
  isMissionUnlocked: (idx: number) => boolean;
  result: RLLabRunResponse | null;
  lang: "fr" | "en";
  labId: string;
  onNumericSubmit: (mission: MissionDef) => void;
  onEllaSubmit: (mission: MissionDef) => void;
}) {
  const passedCount = missions.filter((m) => missionStates[m.id]?.passed).length;

  return (
    <div className="bg-white border-2 border-ella-primary/10 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-ella-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-ella-primary/5 rounded-full -mr-16 -mt-16" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="shrink-0 p-1 bg-white rounded-xl shadow-sm border border-ella-primary/10">
            <EllaAvatar size="md" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-ella-primary px-2 py-0.5 bg-ella-primary/10 rounded">
              Missions
            </span>
            <p className="text-sm font-black text-ella-gray-900 mt-1">
              {lang === "fr"
                ? "Complète les missions pour valider ce lab"
                : "Complete the missions to validate this lab"}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
          passedCount === missions.length
            ? "bg-ella-success-bg text-ella-success"
            : "bg-ella-primary-bg text-ella-primary"
        }`}>
          <span className="text-lg font-mono">{passedCount}</span>
          <span className="opacity-50">/ {missions.length}</span>
        </div>
      </div>

      {/* Mission cards */}
      <div className="space-y-4 relative z-10">
        {missions.map((mission, idx) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            index={idx}
            state={missionStates[mission.id] || { ...EMPTY_MISSION_STATE }}
            unlocked={isMissionUnlocked(idx)}
            result={result}
            lang={lang}
            labId={labId}
            onResponseChange={(val) =>
              setMissionStates((prev) => ({
                ...prev,
                [mission.id]: {
                  ...(prev[mission.id] || { ...EMPTY_MISSION_STATE }),
                  response: val,
                  submitted: false,
                },
              }))
            }
            onSubmit={() => {
              if (mission.type === "numeric") {
                onNumericSubmit(mission);
              } else {
                onEllaSubmit(mission);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MissionCard — individual mission with input, submit, feedback
// ---------------------------------------------------------------------------

function MissionCard({
  mission,
  index,
  state,
  unlocked,
  result,
  lang,
  labId,
  onResponseChange,
  onSubmit,
}: {
  mission: MissionDef;
  index: number;
  state: MissionState;
  unlocked: boolean;
  result: RLLabRunResponse | null;
  lang: "fr" | "en";
  labId: string;
  onResponseChange: (val: string) => void;
  onSubmit: () => void;
}) {
  const isComplete = state.passed || state.attempts >= 3;
  const canRetry = !state.passed && state.attempts < 3;
  const needsResult = mission.type === "numeric" && !result;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-500 ${
        !unlocked
          ? "opacity-20 pointer-events-none grayscale blur-[1px] border-ella-gray-200 bg-ella-gray-50"
          : state.passed
          ? "border-ella-success/30 bg-ella-success-bg/50"
          : state.submitted && !state.passed
          ? "border-ella-accent/20 bg-white"
          : "border-ella-gray-200 bg-white"
      }`}
    >
      {/* Mission header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${
            state.passed
              ? "bg-ella-success text-white"
              : !unlocked
              ? "bg-ella-gray-100 text-ella-gray-300"
              : "bg-ella-primary/10 text-ella-primary"
          }`}
        >
          {state.passed ? "✓" : !unlocked ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          ) : (
            index + 1
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-ella-gray-400">
              Mission {index + 1}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
              mission.type === "numeric"
                ? "bg-blue-50 text-blue-600"
                : "bg-purple-50 text-purple-600"
            }`}>
              {mission.type === "numeric"
                ? lang === "fr" ? "Numérique" : "Numeric"
                : lang === "fr" ? "Explication" : "Explanation"}
            </span>
          </div>
          <p className="text-sm font-bold text-ella-gray-800 leading-relaxed">
            {mission.question[lang]}
          </p>
        </div>
      </div>

      {/* Feedback (shown after submission) */}
      {unlocked && state.submitted && state.feedback && (
        <div
          className={`border-l-4 rounded-r-xl p-4 mb-4 ml-11 animate-fade-in ${
            state.passed
              ? "border-ella-success bg-ella-success-bg/70"
              : "border-ella-accent bg-ella-accent-bg/70"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <EllaAvatar size="sm" />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                state.passed ? "text-ella-success" : "text-ella-accent"
              }`}
            >
              {state.passed
                ? lang === "fr" ? "Validé" : "Passed"
                : lang === "fr" ? "Feedback d'Ella" : "Ella's Feedback"}
            </span>
          </div>
          <p className="text-sm text-ella-gray-700 leading-relaxed font-medium whitespace-pre-line">
            {state.feedback}
          </p>
          {state.attempts >= 3 && !state.passed && (
            <p className="text-xs font-bold text-ella-gray-400 italic mt-3 pt-3 border-t border-ella-gray-100 text-center">
              {lang === "fr"
                ? "On continue — reviens sur cette mission plus tard si tu veux approfondir."
                : "Let's move on — come back to this mission later if you want to dig deeper."}
            </p>
          )}
        </div>
      )}

      {/* Input area (only if unlocked and not fully complete) */}
      {unlocked && (!state.submitted || canRetry) && (
        <div className="ml-11 space-y-3 animate-fade-in">
          {/* Attempts counter */}
          {state.attempts > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">
                {lang === "fr" ? "Tentative" : "Attempt"} {state.attempts}/3
              </p>
              {state.submitted && !state.passed && (
                <span className="text-[10px] font-bold text-ella-accent uppercase animate-pulse">
                  {lang === "fr" ? "Corrige ta réponse" : "Fix your answer"}
                </span>
              )}
            </div>
          )}

          {mission.type === "numeric" ? (
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={state.response}
                onChange={(e) => onResponseChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!needsResult && state.response.trim()) onSubmit();
                  }
                }}
                placeholder={lang === "fr" ? "Nombre d'itérations..." : "Number of iterations..."}
                disabled={state.loading}
                className="flex-1 border border-ella-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-ella-gray-800 focus:ring-4 focus:ring-ella-primary/10 focus:border-ella-primary outline-none transition-all placeholder-ella-gray-400"
              />
              <button
                onClick={onSubmit}
                disabled={state.loading || !state.response.trim() || needsResult}
                className="btn-primary !px-5 !py-2.5 flex items-center gap-2 shadow-lg shadow-ella-accent/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {lang === "fr" ? "Vérifier" : "Check"}
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={state.response}
                onChange={(e) => onResponseChange(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    if (state.response.trim()) onSubmit();
                  }
                }}
                onPaste={(e) => {
                  const pastedText = e.clipboardData.getData("text").trim();
                  const previousFeedback = (state.feedback || "").trim();
                  if (previousFeedback && pastedText.length > 30) {
                    const feedbackWords = new Set(previousFeedback.toLowerCase().split(/\s+/));
                    const pastedWords = pastedText.toLowerCase().split(/\s+/);
                    const overlap = pastedWords.filter((w) => feedbackWords.has(w)).length;
                    const similarity = overlap / pastedWords.length;
                    if (similarity > 0.6) {
                      e.preventDefault();
                      alert(
                        lang === "fr"
                          ? "Tu ne peux pas copier-coller le feedback d'Ella. Reformule avec tes propres mots !"
                          : "You can't paste Ella's feedback. Use your own words!"
                      );
                    }
                  }
                }}
                placeholder={
                  state.submitted
                    ? lang === "fr" ? "Améliore ta réponse..." : "Improve your answer..."
                    : lang === "fr" ? "Écris ton explication ici..." : "Write your explanation here..."
                }
                disabled={state.loading}
                className="w-full bg-ella-gray-50 border border-ella-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-ella-primary/10 focus:border-ella-primary outline-none transition-all min-h-[100px] placeholder-ella-gray-400"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-ella-gray-400 uppercase tracking-widest">
                  Ctrl+Enter {lang === "fr" ? "pour envoyer" : "to submit"}
                </p>
                <button
                  onClick={onSubmit}
                  disabled={state.loading || !state.response.trim()}
                  className="btn-primary !px-6 flex items-center gap-2 shadow-lg shadow-ella-accent/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {state.loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      {lang === "fr" ? "Analyse..." : "Analyzing..."}
                    </>
                  ) : (
                    <>
                      {state.submitted
                        ? lang === "fr" ? "Renvoyer à Ella" : "Resubmit to Ella"
                        : lang === "fr" ? "Envoyer à Ella" : "Submit to Ella"}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Hint: must run algo first for numeric */}
          {needsResult && (
            <p className="text-[10px] font-bold text-ella-warning italic">
              {lang === "fr"
                ? "Lance d'abord l'algorithme ci-dessus pour pouvoir répondre."
                : "Run the algorithm above first to be able to answer."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeltaChart — simple bar chart using proportional divs
// ---------------------------------------------------------------------------

function DeltaChart({ deltas }: { deltas: number[] }) {
  if (deltas.length === 0) return null;

  const logDeltas = deltas.map((d) => (d > 0 ? Math.log10(d) : -12));
  const logMax = Math.max(...logDeltas);
  const logMin = Math.min(...logDeltas);
  const range = logMax - logMin || 1;

  const maxBars = 120;
  const step = Math.max(1, Math.floor(deltas.length / maxBars));
  const sampled = deltas.filter((_, i) => i % step === 0);
  const sampledLog = logDeltas.filter((_, i) => i % step === 0);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-px h-24 bg-ella-gray-50 rounded-lg p-2 overflow-hidden">
        {sampledLog.map((logVal, i) => {
          const height = Math.max(2, ((logVal - logMin) / range) * 100);
          return (
            <div
              key={i}
              className="flex-1 min-w-[1px] bg-ella-primary/70 rounded-t-sm hover:bg-ella-primary transition-colors"
              style={{ height: `${height}%` }}
              title={`iter ${i * step + 1}: Δ = ${sampled[i].toExponential(2)}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-ella-gray-400">
        <span>iter 1: {deltas[0].toExponential(1)}</span>
        <span>
          iter {deltas.length}: {deltas[deltas.length - 1].toExponential(1)}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper with ProtectedRoute
// ---------------------------------------------------------------------------

export default function RLLabPage() {
  return (
    <ProtectedRoute>
      <LabContent />
    </ProtectedRoute>
  );
}
