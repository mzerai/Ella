/**
 * RL Lab page — interactive labs for Planning, TD/MC, and Q-Learning/SARSA.
 * Supports both model-based (run) and model-free (train) algorithms.
 * Includes a progressive mission system and ELLA coaching panel.
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import EllaAvatar from "@/components/EllaAvatar";
import FrozenLakeGrid from "@/components/FrozenLakeGrid";
import EllaCoachingPanel from "@/components/EllaCoachingPanel";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  runRLLab,
  trainRLLab,
  sendChatMessage,
  fetchLessonProgress,
  saveCheckpointProgress,
  type RLLabRunRequest,
  type RLLabRunResponse,
  type RLLabTrainRequest,
  type RLLabTrainResponse,
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
  mode: "run" | "train";
  showPolicyMode: boolean;
  nextUrl: string;
  nextLabel: { fr: string; en: string };
}

const LABS: Record<string, LabDef> = {
  policy_evaluation: {
    title: { fr: "Lab — Évaluation de Politique", en: "Lab — Policy Evaluation" },
    description: {
      fr: "Évalue la fonction de valeur V(s) d'une politique fixée sur FrozenLake. Compare politique aléatoire vs politique manuelle et observe comment γ influence les valeurs.",
      en: "Evaluate the value function V(s) of a fixed policy on FrozenLake. Compare random vs manual policy and observe how γ influences values.",
    },
    algorithms: ["policy_evaluation"],
    defaultAlgorithm: "policy_evaluation",
    mode: "run",
    showPolicyMode: true,
    nextUrl: "/courses/reinforcement-learning/modules/rl_02_planning",
    nextLabel: { fr: "Planification — Policy & Value Iteration", en: "Planning — Policy & Value Iteration" },
  },
  planning: {
    title: { fr: "Lab — Planification (VI & PI)", en: "Lab — Planning (VI & PI)" },
    description: {
      fr: "Résous le MDP avec Value Iteration et Policy Iteration. Compare le nombre d'itérations, observe la convergence et navigue les étapes d'amélioration de PI.",
      en: "Solve the MDP with Value Iteration and Policy Iteration. Compare iteration counts, observe convergence and navigate PI improvement steps.",
    },
    algorithms: ["value_iteration", "policy_iteration"],
    defaultAlgorithm: "value_iteration",
    mode: "run",
    showPolicyMode: false,
    nextUrl: "/courses/reinforcement-learning/modules/rl_03_td_mc",
    nextLabel: { fr: "TD(0) et Monte Carlo", en: "TD(0) and Monte Carlo" },
  },
  td_mc: {
    title: { fr: "Lab — TD(0) vs Monte Carlo", en: "Lab — TD(0) vs Monte Carlo" },
    description: {
      fr: "Compare deux méthodes d'évaluation model-free : TD(0) (bootstrapping) et Monte Carlo (fin d'épisode).",
      en: "Compare two model-free evaluation methods: TD(0) (bootstrapping) and Monte Carlo (end-of-episode).",
    },
    algorithms: ["td0", "monte_carlo"],
    defaultAlgorithm: "td0",
    mode: "train",
    showPolicyMode: false,
    nextUrl: "/courses/reinforcement-learning/modules/rl_04_control",
    nextLabel: { fr: "SARSA, Q-Learning, Double Q-Learning", en: "SARSA, Q-Learning, Double Q-Learning" },
  },
  control: {
    title: { fr: "Lab — SARSA vs Q-Learning", en: "Lab — SARSA vs Q-Learning" },
    description: {
      fr: "Compare deux algorithmes de contrôle model-free : SARSA (on-policy) et Q-Learning (off-policy).",
      en: "Compare two model-free control algorithms: SARSA (on-policy) and Q-Learning (off-policy).",
    },
    algorithms: ["sarsa", "q_learning"],
    defaultAlgorithm: "q_learning",
    mode: "train",
    showPolicyMode: false,
    nextUrl: "/courses/reinforcement-learning/modules/rl_05_deep_rl",
    nextLabel: { fr: "Vers le Deep RL — DQN & Synthèse", en: "Towards Deep RL — DQN & Synthesis" },
  },
};

const ALGO_LABELS: Record<string, { fr: string; en: string }> = {
  policy_evaluation: { fr: "Policy Evaluation", en: "Policy Evaluation" },
  value_iteration: { fr: "Value Iteration", en: "Value Iteration" },
  policy_iteration: { fr: "Policy Iteration", en: "Policy Iteration" },
  td0: { fr: "TD(0)", en: "TD(0)" },
  monte_carlo: { fr: "Monte Carlo", en: "Monte Carlo" },
  q_learning: { fr: "Q-Learning", en: "Q-Learning" },
  sarsa: { fr: "SARSA", en: "SARSA" },
};

const THETA_OPTIONS = [1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-10];
const EPISODE_OPTIONS = [1000, 5000, 10000, 20000];

// ---------------------------------------------------------------------------
// Mission definitions
// ---------------------------------------------------------------------------

interface MissionDef {
  id: string;
  type: "numeric" | "ella_eval";
  question: { fr: string; en: string };
  hint?: string;
  getExpected?: (result: RLLabRunResponse | RLLabTrainResponse) => number;
  tolerance?: number;
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
      getExpected: (r) => (r as RLLabRunResponse).iterations,
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
      getExpected: (r) => (r as RLLabRunResponse).iterations,
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
  td_mc: [
    {
      id: "mission_1",
      type: "numeric",
      question: {
        fr: "Entraîne TD(0) avec α=0.1, γ=0.95, 5000 épisodes, mode déterministe. Quelle est la valeur V(s₀) apprise (arrondie à 2 décimales) ?",
        en: "Train TD(0) with α=0.1, γ=0.95, 5000 episodes, deterministic mode. What is the learned V(s₀) (rounded to 2 decimals)?",
      },
      getExpected: (r) => Math.round((r as RLLabTrainResponse).V[0] * 100) / 100,
      tolerance: 0.02,
    },
    {
      id: "mission_2",
      type: "ella_eval",
      question: {
        fr: "Lance Policy Evaluation (lab planning) avec politique random et mêmes paramètres (γ=0.95, déterministe) pour obtenir V* de référence. Compare V(s₀) appris par TD(0) avec V* de référence. Sont-ils proches ? Explique pourquoi TD(0) converge vers la même valeur que PE analytique.",
        en: "Run Policy Evaluation (planning lab) with random policy and same parameters (γ=0.95, deterministic) to get reference V*. Compare V(s₀) learned by TD(0) with the reference V*. Are they close? Explain why TD(0) converges to the same value as analytical PE.",
      },
      hint: "Both TD(0) and analytical PE evaluate the same random policy, so they should converge to the same V values. TD(0) learns from sampled transitions while PE uses the full model P(s'|s,a). They converge to the same result because both solve the Bellman evaluation equation, just by different methods.",
    },
    {
      id: "mission_3",
      type: "ella_eval",
      question: {
        fr: "Compare les valeurs V(s₀) apprises par TD(0) et MC après 5000 épisodes (α=0.1, γ=0.95, déterministe). Les deux méthodes convergent-elles vers des valeurs proches ? Explique pourquoi c'est normal : vers quelle valeur théorique convergent-elles toutes les deux, et par quel mécanisme différent ?",
        en: "Compare the V(s₀) values learned by TD(0) and MC after 5000 episodes (α=0.1, γ=0.95, deterministic). Do both methods converge to similar values? Explain why this is expected: what theoretical value do they both converge to, and by what different mechanism?",
      },
      hint: "Both TD(0) and MC evaluate the same random policy, so they both converge to V_π(random) — the same value that analytical Policy Evaluation computes. TD(0) updates after each step using bootstrapping (current V estimate of next state), while MC waits until episode end and uses the actual complete return. Both are unbiased estimators of V_π in the limit. The student should identify that both target the same V_π and explain the mechanistic difference (step-by-step bootstrap vs end-of-episode returns).",
    },
  ],
  control: [
    {
      id: "mission_1",
      type: "numeric",
      question: {
        fr: "Entraîne Q-Learning avec α=0.1, γ=0.95, ε=0.1, 5000 épisodes, mode déterministe. Quel est le taux de succès (en %) ?",
        en: "Train Q-Learning with α=0.1, γ=0.95, ε=0.1, 5000 episodes, deterministic mode. What is the success rate (in %)?",
      },
      getExpected: (r) => Math.round((r as RLLabTrainResponse).success_rate * 100),
      tolerance: 5,
    },
    {
      id: "mission_2",
      type: "ella_eval",
      question: {
        fr: "Entraîne SARSA avec les mêmes paramètres. Compare les taux de succès de Q-Learning et SARSA. Lequel est meilleur ? Explique la différence entre on-policy et off-policy dans ce contexte.",
        en: "Train SARSA with the same parameters. Compare the success rates of Q-Learning and SARSA. Which is better? Explain the difference between on-policy and off-policy in this context.",
      },
      hint: "Q-Learning is off-policy (learns from greedy policy while exploring with epsilon-greedy), SARSA is on-policy (learns from the same epsilon-greedy policy it follows). In deterministic FrozenLake they should perform similarly. Q-Learning may converge to the same optimal policy. The key insight is that Q-Learning's target uses max(Q[s',:]) while SARSA uses Q[s', a'] where a' is the actual next action.",
    },
    {
      id: "mission_3",
      type: "ella_eval",
      question: {
        fr: "Active le mode Slippery et entraîne Q-Learning et SARSA avec 10000 épisodes. Lequel est le plus prudent (safer) dans un environnement stochastique ? Pourquoi ?",
        en: "Turn on Slippery mode and train both Q-Learning and SARSA with 10000 episodes. Which one is safer in a stochastic environment? Why?",
      },
      hint: "SARSA tends to be safer/more conservative in stochastic environments because it learns the value of the policy it actually follows (including exploration), so it avoids dangerous states near holes. Q-Learning is more optimistic because it assumes greedy behavior in the future. This is the classic cliff-walking argument.",
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
// Main component
// ---------------------------------------------------------------------------

function LabContent() {
  const params = useParams();
  const labId = params.labId as string;
  const lab = LABS[labId];
  const missions = LAB_MISSIONS[labId] || [];
  const isTrainMode = lab?.mode === "train";

  const { user } = useAuth();
  const [lang, setLang] = useState<"fr" | "en">("fr");

  // Controls — model-free labs start with sub-optimal defaults so students experiment
  const [gamma, setGamma] = useState(isTrainMode ? 0.5 : 0.95);
  const [theta, setTheta] = useState(1e-8);
  const [isSlippery, setIsSlippery] = useState(false);
  const [algorithm, setAlgorithm] = useState(lab?.defaultAlgorithm ?? "");
  const [policyMode, setPolicyMode] = useState("random");
  // Train-specific controls
  const [alpha, setAlpha] = useState(0.5);
  const [epsilon, setEpsilon] = useState(0.5);
  const [epsilonDecay, setEpsilonDecay] = useState(0.995);
  const [nEpisodes, setNEpisodes] = useState(1000);

  // Execution
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RLLabRunResponse | null>(null);
  const [trainResult, setTrainResult] = useState<RLLabTrainResponse | null>(null);

  // Reference V* for td_mc lab
  const [refResult, setRefResult] = useState<RLLabRunResponse | null>(null);
  const [refLoading, setRefLoading] = useState(false);

  // Unified result for missions/coaching
  const anyResult: RLLabRunResponse | RLLabTrainResponse | null = runResult || trainResult;

  // Animation (planning labs only)
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(-1);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [piStepIdx, setPiStepIdx] = useState(0);

  // Mission state
  const [missionStates, setMissionStates] = useState<Record<string, MissionState>>({});
  const [isHydrating, setIsHydrating] = useState(true);
  const hasHydrated = useRef(false);

  // ---------------------------------------------------------------------------
  // Hydrate missions
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (hasHydrated.current) return;
    if (user === undefined) return;
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

  const passedCount = missions.filter((m) => missionStates[m.id]?.passed).length;

  const isMissionUnlocked = (idx: number): boolean => {
    if (idx === 0) return true;
    const prev = missions[idx - 1];
    const prevState = missionStates[prev.id];
    return !!(prevState?.passed || (prevState?.attempts ?? 0) >= 3);
  };

  // ---------------------------------------------------------------------------
  // Display values (for planning animation / PI steps)
  // ---------------------------------------------------------------------------
  const displayV =
    animStep >= 0 && runResult?.v_history?.[animStep]
      ? runResult.v_history[animStep]
      : runResult?.algorithm === "policy_iteration" && runResult?.pi_steps && runResult.pi_steps.length > 0
      ? runResult.pi_steps[piStepIdx]?.V ?? runResult.V
      : (anyResult?.V ?? []);

  const displayQ =
    runResult?.algorithm === "policy_iteration" && runResult?.pi_steps && runResult.pi_steps.length > 0 && animStep < 0
      ? runResult.pi_steps[piStepIdx]?.Q ?? runResult.Q
      : (anyResult?.Q ?? []);

  const displayPolicy =
    runResult?.algorithm === "policy_iteration" && runResult?.pi_steps && runResult.pi_steps.length > 0 && animStep < 0
      ? runResult.pi_steps[piStepIdx]?.policy ?? runResult.policy
      : (anyResult?.policy ?? []);

  useEffect(() => { setPiStepIdx(0); }, [runResult]);
  useEffect(() => { return () => { if (animRef.current) clearInterval(animRef.current); }; }, []);

  const stopAnimation = useCallback(() => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
    setAnimating(false);
    setAnimStep(-1);
  }, []);

  const startAnimation = useCallback(() => {
    if (!runResult?.v_history || runResult.v_history.length === 0) return;
    stopAnimation();
    setAnimating(true);
    setAnimStep(0);
    const total = runResult.v_history.length;
    const delay = total > 200 ? 30 : total > 50 ? 80 : 150;
    let step = 0;
    animRef.current = setInterval(() => {
      step += 1;
      if (step >= total) { clearInterval(animRef.current!); animRef.current = null; setAnimating(false); setAnimStep(-1); return; }
      setAnimStep(step);
    }, delay);
  }, [runResult, stopAnimation]);

  // ---------------------------------------------------------------------------
  // Execute
  // ---------------------------------------------------------------------------
  const handleRun = async () => {
    if (!lab) return;
    setLoading(true);
    setError(null);
    setRunResult(null);
    setTrainResult(null);
    stopAnimation();

    try {
      if (isTrainMode) {
        const resp = await trainRLLab({
          algorithm, n_episodes: nEpisodes, alpha, gamma, epsilon,
          epsilon_min: 0.01, epsilon_decay: epsilonDecay,
          is_slippery: isSlippery, map_name: "4x4",
        });
        setTrainResult(resp);
      } else {
        const resp = await runRLLab({
          algorithm, gamma, theta, max_iterations: 1000,
          is_slippery: isSlippery, map_name: "4x4", policy_mode: policyMode,
        });
        setRunResult(resp);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Compute reference V* (td_mc lab only)
  // ---------------------------------------------------------------------------
  const handleComputeRef = async () => {
    setRefLoading(true);
    try {
      const resp = await runRLLab({
        algorithm: "policy_evaluation",
        gamma,
        theta: 1e-10,
        max_iterations: 1000,
        is_slippery: isSlippery,
        map_name: "4x4",
        policy_mode: "random",
      });
      setRefResult(resp);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reference computation failed");
    } finally {
      setRefLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // td_mc derived metrics
  // ---------------------------------------------------------------------------
  const isTdMcLab = labId === "td_mc";
  const tdMcVs0 = trainResult ? trainResult.V[0] : null;
  const tdMcMeanDiff = trainResult && refResult
    ? trainResult.V.reduce((sum, v, i) => sum + Math.abs(v - (refResult.V[i] ?? 0)), 0) / trainResult.V.length
    : null;
  const tdMcVs0History: number[] = trainResult?.v_snapshots
    ? trainResult.v_snapshots.map((snap) => snap.V[0])
    : [];

  // ---------------------------------------------------------------------------
  // Mission handlers
  // ---------------------------------------------------------------------------
  const handleNumericSubmit = (mission: MissionDef) => {
    if (!anyResult || !mission.getExpected) return;
    const state = missionStates[mission.id] || { ...EMPTY_MISSION_STATE };
    const studentAnswer = parseFloat(state.response);
    if (isNaN(studentAnswer)) return;
    const expected = mission.getExpected(anyResult);
    const tol = mission.tolerance ?? 1;
    const passed = Math.abs(studentAnswer - expected) <= tol;
    const currentAttempts = state.attempts + 1;
    const feedback = passed
      ? (lang === "fr" ? "Correct ! Bien joué." : "Correct! Well done.")
      : (lang === "fr" ? "Pas tout à fait — vérifie tes paramètres et relance." : "Not quite — check your parameters and rerun.");
    setMissionStates((prev) => ({ ...prev, [mission.id]: { ...state, feedback, submitted: true, passed, attempts: currentAttempts, loading: false } }));
    saveCheckpointProgress({ course_id: "rl", module_id: labId, checkpoint_id: mission.id, dynamic_question: mission.question[lang], student_response: state.response, ella_feedback: feedback, passed, attempts: currentAttempts });
  };

  const handleEllaSubmit = async (mission: MissionDef) => {
    const state = missionStates[mission.id] || { ...EMPTY_MISSION_STATE };
    if (!state.response.trim()) return;
    const currentAttempts = state.attempts + 1;
    setMissionStates((prev) => ({ ...prev, [mission.id]: { ...state, loading: true, attempts: currentAttempts } }));
    try {
      const evaluationInstruction = `\n\nIMPORTANT: Termine ta réponse par EXACTEMENT l'une de ces deux lignes (et rien d'autre sur cette ligne):\n[CHECKPOINT_PASSED]\n[CHECKPOINT_RETRY]\n\nRègles d'évaluation :\n- [CHECKPOINT_PASSED] uniquement si l'étudiant montre une compréhension réelle et correcte du concept dans sa réponse.\n- [CHECKPOINT_RETRY] dans TOUS les autres cas.\n- Si l'étudiant demande de l'aide : donne un indice pédagogique puis termine par [CHECKPOINT_RETRY].\n- Sois encourageante mais honnête. Ne valide jamais une non-réponse.\n- Tu dois TOUJOURS terminer par l'un des deux tags, sans exception.`;
      const chatResult = await sendChatMessage({
        message: `[NOTEBOOK_CHECKPOINT]\nQuestion posée à l'étudiant: "${mission.question[lang]}"\n\nRéponse de l'étudiant: "${state.response}"\n\nConsigne pour l'évaluation (NE PAS RÉVÉLER À L'ÉTUDIANT): ${mission.hint}${evaluationInstruction}`,
        context: { page_id: labId, page_title: `RL Lab ${labId}`, algorithm: "", lab_name: `Mission ${mission.id}`, extra: { course_id: "rl", checkpoint_mode: true } },
        conversation_history: [],
      });
      let passed = chatResult.answer.includes("[CHECKPOINT_PASSED]");
      const retry = chatResult.answer.includes("[CHECKPOINT_RETRY]");
      if (!passed && !retry) {
        const lower = chatResult.answer.toLowerCase();
        const pos = ["très bien","bravo","excellent","tu as compris","bonne réponse","correct","bien compris","great","well done","you understood","good answer","correct answer","nicely done"];
        const neg = ["pas tout à fait","pas correct","incorrect","réessaie","essaie encore","pas encore","try again","not quite","wrong","rethink","reconsider","reformule","indice","hint"];
        passed = pos.some((s) => lower.includes(s)) && !neg.some((s) => lower.includes(s));
      }
      let cleanFeedback = chatResult.answer.replace("[CHECKPOINT_PASSED]", "").replace("[CHECKPOINT_RETRY]", "").trim();
      cleanFeedback = cleanFeedback.replace(/🎯\s*\*\*Lien avec le lab\*\*.*?(\n\n|\n(?=🔍|⛔|📌)|$)/gs, "").replace(/🔗\s*\*\*Connection to Current Lab\*\*.*?(\n\n|\n(?=💡|⚠️|📚)|$)/gs, "").trim();
      setMissionStates((prev) => ({ ...prev, [mission.id]: { ...state, feedback: cleanFeedback, loading: false, submitted: true, passed, attempts: currentAttempts } }));
      saveCheckpointProgress({ course_id: "rl", module_id: labId, checkpoint_id: mission.id, dynamic_question: mission.question[lang], student_response: state.response, ella_feedback: cleanFeedback, passed, attempts: currentAttempts });
    } catch {
      setMissionStates((prev) => ({ ...prev, [mission.id]: { ...state, feedback: lang === "fr" ? "Oups, souci technique. Réessaie !" : "Oops, technical issue. Try again!", loading: false, submitted: true, passed: false, attempts: currentAttempts } }));
    }
  };

  // ---------------------------------------------------------------------------
  // Unknown lab
  // ---------------------------------------------------------------------------
  if (!lab) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <EllaAvatar size="lg" className="mx-auto mb-6 opacity-30" />
        <h2 className="text-2xl font-bold text-ella-gray-900 mb-3">{lang === "fr" ? "Lab introuvable" : "Lab not found"}</h2>
        <p className="text-ella-gray-500 mb-8">{lang === "fr" ? `Le lab "${labId}" n'existe pas encore.` : `The lab "${labId}" does not exist yet.`}</p>
        <Link href="/courses/reinforcement-learning" className="btn-secondary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          {lang === "fr" ? "Retour au cours" : "Back to course"}
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-ella-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/courses/reinforcement-learning" className="text-ella-gray-400 hover:text-ella-primary transition-colors shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </Link>
            <h1 className="text-sm sm:text-base font-bold text-ella-gray-900 truncate">{lab.title[lang]}</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {missions.length > 0 && (
              <div className="flex items-center gap-1.5 bg-ella-primary-bg rounded-full px-3 py-1">
                <span className="text-[10px] font-black text-ella-primary uppercase tracking-widest">Missions</span>
                <span className="text-xs font-black font-mono text-ella-primary">{passedCount}/{missions.length}</span>
              </div>
            )}
            <button onClick={() => setLang("fr")} className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${lang === "fr" ? "bg-ella-accent text-white shadow-lg shadow-ella-accent/20" : "bg-ella-gray-100 text-ella-gray-400 hover:bg-ella-gray-200"}`}>FR</button>
            <button onClick={() => setLang("en")} className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${lang === "en" ? "bg-ella-accent text-white shadow-lg shadow-ella-accent/20" : "bg-ella-gray-100 text-ella-gray-400 hover:bg-ella-gray-200"}`}>EN</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* Ella Intro Banner */}
        <div className="bg-white border border-ella-primary/10 rounded-2xl p-5 mb-6 flex items-start gap-4 shadow-sm">
          <EllaAvatar size="sm" className="shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xs font-black text-ella-primary uppercase tracking-widest mb-1">{lang === "fr" ? "Le mot d'Ella" : "Ella says"}</h2>
            <p className="text-sm text-ella-gray-700 leading-relaxed font-medium italic">&quot;{lab.description[lang]}&quot;</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm space-y-5">
              <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">{lang === "fr" ? "Hyperparamètres" : "Hyperparameters"}</h3>

              {/* Gamma */}
              <div>
                <label className="flex justify-between text-xs font-bold text-ella-gray-700 mb-1.5">
                  <span>γ (discount)</span><span className="font-mono text-ella-primary">{gamma.toFixed(2)}</span>
                </label>
                <input type="range" min={0} max={1} step={0.05} value={gamma} onChange={(e) => setGamma(parseFloat(e.target.value))} className="w-full accent-ella-primary" />
              </div>

              {/* Theta (run mode only) */}
              {!isTrainMode && (
                <div>
                  <label className="text-xs font-bold text-ella-gray-700 mb-1.5 block">θ (convergence)</label>
                  <select value={theta} onChange={(e) => setTheta(parseFloat(e.target.value))} className="w-full border border-ella-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-ella-gray-700 focus:outline-none focus:ring-2 focus:ring-ella-primary/30">
                    {THETA_OPTIONS.map((t) => <option key={t} value={t}>{t.toExponential()}</option>)}
                  </select>
                </div>
              )}

              {/* Alpha (train mode) */}
              {isTrainMode && (
                <div>
                  <label className="flex justify-between text-xs font-bold text-ella-gray-700 mb-1.5">
                    <span>α (learning rate)</span><span className="font-mono text-ella-primary">{alpha.toFixed(2)}</span>
                  </label>
                  <input type="range" min={0.01} max={1} step={0.01} value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} className="w-full accent-ella-primary" />
                </div>
              )}

              {/* Epsilon (train mode, control labs) */}
              {isTrainMode && labId === "control" && (
                <>
                  <div>
                    <label className="flex justify-between text-xs font-bold text-ella-gray-700 mb-1.5">
                      <span>ε (exploration)</span><span className="font-mono text-ella-primary">{epsilon.toFixed(2)}</span>
                    </label>
                    <input type="range" min={0.01} max={1} step={0.01} value={epsilon} onChange={(e) => setEpsilon(parseFloat(e.target.value))} className="w-full accent-ella-primary" />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs font-bold text-ella-gray-700 mb-1.5">
                      <span>ε decay</span><span className="font-mono text-ella-primary">{epsilonDecay.toFixed(3)}</span>
                    </label>
                    <input type="range" min={0.9} max={1} step={0.005} value={epsilonDecay} onChange={(e) => setEpsilonDecay(parseFloat(e.target.value))} className="w-full accent-ella-primary" />
                  </div>
                </>
              )}

              {/* Episodes (train mode) */}
              {isTrainMode && (
                <div>
                  <label className="text-xs font-bold text-ella-gray-700 mb-1.5 block">{lang === "fr" ? "Épisodes" : "Episodes"}</label>
                  <select value={nEpisodes} onChange={(e) => setNEpisodes(parseInt(e.target.value))} className="w-full border border-ella-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-ella-gray-700 focus:outline-none focus:ring-2 focus:ring-ella-primary/30">
                    {EPISODE_OPTIONS.map((n) => <option key={n} value={n}>{n.toLocaleString()}</option>)}
                  </select>
                </div>
              )}

              {/* Slippery */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ella-gray-700">{lang === "fr" ? "Glissant (stochastique)" : "Slippery (stochastic)"}</span>
                <button onClick={() => setIsSlippery(!isSlippery)} className={`relative w-10 h-5 rounded-full transition-colors ${isSlippery ? "bg-ella-primary" : "bg-ella-gray-200"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isSlippery ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Algorithm selector */}
              {lab.algorithms.length > 1 && (
                <div>
                  <label className="text-xs font-bold text-ella-gray-700 mb-1.5 block">{lang === "fr" ? "Algorithme" : "Algorithm"}</label>
                  <div className="flex gap-2">
                    {lab.algorithms.map((alg) => (
                      <button key={alg} onClick={() => setAlgorithm(alg)} className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all ${algorithm === alg ? "bg-ella-primary text-white shadow-md" : "bg-ella-gray-100 text-ella-gray-500 hover:bg-ella-gray-200"}`}>
                        {ALGO_LABELS[alg]?.[lang] ?? alg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Policy mode (PE lab) */}
              {lab.showPolicyMode && (
                <div>
                  <label className="text-xs font-bold text-ella-gray-700 mb-1.5 block">{lang === "fr" ? "Politique" : "Policy"}</label>
                  <div className="flex gap-2">
                    {["random", "manual"].map((mode) => (
                      <button key={mode} onClick={() => setPolicyMode(mode)} className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all ${policyMode === mode ? "bg-ella-primary text-white shadow-md" : "bg-ella-gray-100 text-ella-gray-500 hover:bg-ella-gray-200"}`}>
                        {mode === "random" ? (lang === "fr" ? "Aléatoire" : "Random") : (lang === "fr" ? "Manuelle (→)" : "Manual (→)")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Run button */}
              <button onClick={handleRun} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 shadow-lg shadow-ella-accent/20 active:translate-y-0.5">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lang === "fr" ? (isTrainMode ? "Entraînement..." : "Calcul en cours...") : (isTrainMode ? "Training..." : "Computing...")}</>
                ) : (
                  <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>{lang === "fr" ? (isTrainMode ? "Entraîner l'agent" : "Lancer l'algorithme") : (isTrainMode ? "Train agent" : "Run algorithm")}</>
                )}
              </button>
            </div>

            {error && <div className="bg-ella-accent-bg text-ella-accent-dark p-4 rounded-lg text-sm border border-ella-accent/20 shadow-sm">{error}</div>}
          </div>

          {/* Results (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Empty state */}
            {!anyResult && !loading && (
              <div className="bg-ella-gray-100 rounded-xl border-2 border-dashed border-ella-gray-200 flex items-center justify-center text-center p-12">
                <div className="max-w-xs">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><EllaAvatar size="sm" /></div>
                  <h4 className="font-bold text-ella-gray-900 mb-1">{lang === "fr" ? "Prêt pour l'expérience ?" : "Ready to experiment?"}</h4>
                  <p className="text-xs text-ella-gray-500">{lang === "fr" ? "Configure les paramètres à gauche et lance l'algorithme." : "Configure the parameters on the left and run the algorithm."}</p>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-xl border border-ella-gray-200 flex items-center justify-center text-center p-12 shadow-sm">
                <div className="animate-fade-in">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-ella-primary/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-ella-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center"><EllaAvatar size="sm" /></div>
                  </div>
                  <p className="text-sm font-bold text-ella-primary-dark">{lang === "fr" ? (isTrainMode ? "Ella entraîne l'agent..." : "Ella calcule...") : (isTrainMode ? "Ella is training the agent..." : "Ella is computing...")}</p>
                  {isTrainMode && <p className="text-xs text-ella-gray-500 mt-1">{nEpisodes.toLocaleString()} {lang === "fr" ? "épisodes" : "episodes"}</p>}
                </div>
              </div>
            )}

            {/* Results content */}
            {anyResult && (
              <div className="animate-fade-in space-y-6">
                {/* Metrics */}
                {trainResult && isTdMcLab ? (
                  <div className="grid grid-cols-4 gap-3">
                    <MetricCard label="V(s₀)" value={tdMcVs0 !== null ? tdMcVs0.toFixed(4) : "—"} color="text-ella-primary" />
                    <MetricCard label={lang === "fr" ? "Écart moyen |V−V*|" : "Mean |V−V*|"} value={tdMcMeanDiff !== null ? tdMcMeanDiff.toFixed(4) : (lang === "fr" ? "Calcule V*" : "Compute V*")} color={tdMcMeanDiff !== null ? (tdMcMeanDiff < 0.01 ? "text-ella-success" : "text-ella-accent") : "text-ella-gray-400"} />
                    <MetricCard label={lang === "fr" ? "Steps moyens" : "Avg steps"} value={trainResult.avg_steps.toFixed(1)} />
                    <MetricCard label={lang === "fr" ? "Épisodes" : "Episodes"} value={trainResult.n_episodes.toLocaleString()} color="text-ella-primary" />
                  </div>
                ) : trainResult ? (
                  <div className="grid grid-cols-4 gap-3">
                    <MetricCard label={lang === "fr" ? "Taux de succès" : "Success rate"} value={`${(trainResult.success_rate * 100).toFixed(1)}%`} color={trainResult.success_rate > 0.5 ? "text-ella-success" : "text-ella-accent"} />
                    <MetricCard label={lang === "fr" ? "Reward moyen" : "Avg reward"} value={trainResult.avg_reward.toFixed(3)} />
                    <MetricCard label={lang === "fr" ? "Steps moyens" : "Avg steps"} value={trainResult.avg_steps.toFixed(1)} />
                    <MetricCard label={lang === "fr" ? "Épisodes" : "Episodes"} value={trainResult.n_episodes.toLocaleString()} color="text-ella-primary" />
                  </div>
                ) : runResult ? (
                  <div className="grid grid-cols-3 gap-3">
                    <MetricCard label={lang === "fr" ? "Itérations" : "Iterations"} value={String(runResult.iterations)} color="text-ella-primary" />
                    <MetricCard label="Δ final" value={runResult.final_delta.toExponential(2)} />
                    <MetricCard label={lang === "fr" ? "But accessible" : "Goal reachable"} value={runResult.goal_reachable ? "✓" : "✗"} color={runResult.goal_reachable ? "text-ella-success" : "text-ella-accent"} />
                  </div>
                ) : null}

                {/* Animation indicator (planning) */}
                {animating && animStep >= 0 && runResult?.v_history && (
                  <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                    <div className="w-3 h-3 border-2 border-purple-400 border-t-purple-700 rounded-full animate-spin" />
                    <span className="text-xs font-bold text-purple-700">{lang === "fr" ? "Animation" : "Animating"}: step {animStep + 1} / {runResult.v_history.length}</span>
                    <button onClick={stopAnimation} className="ml-auto text-xs font-bold text-purple-500 hover:text-purple-800 transition-colors">{lang === "fr" ? "Arrêter" : "Stop"}</button>
                  </div>
                )}

                {/* FrozenLake Grid(s) */}
                {isTdMcLab && trainResult ? (
                  <>
                    {/* Stacked grids for td_mc: learned V then reference V* */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                        <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-4">
                          V {lang === "fr" ? "appris" : "learned"} — {ALGO_LABELS[trainResult.algorithm]?.[lang] ?? trainResult.algorithm}
                        </h3>
                        <FrozenLakeGrid grid={trainResult.grid} gridSize={trainResult.grid_size} V={displayV} Q={displayQ} policy={displayPolicy} showQ={false} />
                      </div>
                      <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm relative">
                        <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-4">
                          V* {lang === "fr" ? "de référence" : "reference"} — Policy Evaluation
                        </h3>
                        {refResult ? (
                          <FrozenLakeGrid grid={refResult.grid} gridSize={refResult.grid_size} V={refResult.V} Q={refResult.Q} policy={refResult.policy} showQ={false} />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-xs text-ella-gray-400 mb-4">{lang === "fr" ? "Calcule V* analytique pour comparer" : "Compute analytical V* to compare"}</p>
                            <button onClick={handleComputeRef} disabled={refLoading} className="btn-secondary !text-xs !py-2 !px-4 flex items-center gap-2 disabled:opacity-30">
                              {refLoading ? (
                                <><div className="w-3 h-3 border-2 border-ella-primary/30 border-t-ella-primary rounded-full animate-spin" />{lang === "fr" ? "Calcul..." : "Computing..."}</>
                              ) : (
                                <>{lang === "fr" ? "Calculer V* de référence" : "Compute reference V*"}</>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* V(s₀) evolution chart */}
                    {tdMcVs0History.length > 0 && (
                      <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">
                            {lang === "fr" ? "Évolution de V(s₀) au fil des épisodes" : "V(s₀) evolution over episodes"}
                          </h3>
                          {refResult && (
                            <span className="text-[10px] font-mono font-bold text-ella-success">
                              V* ref = {refResult.V[0].toFixed(4)}
                            </span>
                          )}
                        </div>
                        <Vs0Chart data={tdMcVs0History} refValue={refResult?.V[0] ?? null} snapshotInterval={100} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">FrozenLake 4×4 — {ALGO_LABELS[anyResult.algorithm]?.[lang] ?? anyResult.algorithm}</h3>
                      {!isTrainMode && runResult && (
                        <button onClick={startAnimation} disabled={animating || !runResult.v_history || runResult.v_history.length === 0} className="btn-secondary !text-[10px] !py-1.5 !px-3 !rounded-lg font-black disabled:opacity-30">
                          {lang === "fr" ? "▶ Animer la convergence" : "▶ Animate convergence"}
                        </button>
                      )}
                    </div>
                    <FrozenLakeGrid grid={anyResult.grid} gridSize={anyResult.grid_size} V={displayV} Q={displayQ} policy={displayPolicy} />
                  </div>
                )}

                {/* PI Steps slider */}
                {runResult?.algorithm === "policy_iteration" && runResult.pi_steps && runResult.pi_steps.length > 1 && (
                  <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                    <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-3">{lang === "fr" ? "Étapes d'amélioration de la politique" : "Policy improvement steps"}</h3>
                    <div className="flex items-center gap-4">
                      <input type="range" min={0} max={runResult.pi_steps.length - 1} value={piStepIdx} onChange={(e) => { stopAnimation(); setPiStepIdx(parseInt(e.target.value)); }} className="flex-1 accent-ella-primary" />
                      <span className="text-sm font-mono font-bold text-ella-primary shrink-0">{piStepIdx + 1} / {runResult.pi_steps.length}</span>
                    </div>
                    <p className="text-xs text-ella-gray-500 mt-2">{lang === "fr" ? "Évaluations internes" : "Inner eval iters"}: <span className="font-mono font-bold text-ella-gray-700">{runResult.pi_steps[piStepIdx]?.eval_iters ?? "—"}</span></p>
                  </div>
                )}

                {/* Delta convergence (planning labs) */}
                {runResult?.delta_history && runResult.delta_history.length > 0 && (
                  <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                    <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-3">{lang === "fr" ? "Convergence (Δ par itération)" : "Convergence (Δ per iteration)"}</h3>
                    <DeltaChart deltas={runResult.delta_history} />
                  </div>
                )}

                {/* Training charts (control lab only — td_mc uses V(s₀) chart above) */}
                {trainResult && !isTdMcLab && (
                  <>
                    <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                      <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-3">{lang === "fr" ? "Reward par épisode" : "Reward per episode"}</h3>
                      <SmoothedChart data={trainResult.reward_history} color="bg-ella-primary" label="reward" />
                    </div>
                    <div className="bg-white rounded-xl border border-ella-gray-200 p-5 shadow-sm">
                      <h3 className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-3">{lang === "fr" ? "Taux de succès (glissant 100 épisodes)" : "Success rate (100-episode moving avg)"}</h3>
                      <SmoothedChart data={trainResult.success_rate_history} color="bg-ella-success" label="success" />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mission Panel */}
            {missions.length > 0 && !isHydrating && (
              <MissionPanel
                missions={missions} missionStates={missionStates} setMissionStates={setMissionStates}
                isMissionUnlocked={isMissionUnlocked} result={anyResult} lang={lang} labId={labId}
                onNumericSubmit={handleNumericSubmit} onEllaSubmit={handleEllaSubmit}
              />
            )}

            {/* Next lesson */}
            {anyResult && (
              <div className="flex justify-center pt-8 pb-4">
                <Link href={lab.nextUrl} className="group flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest group-hover:text-ella-primary transition-colors">{lang === "fr" ? "Leçon suivante" : "Next Lesson"}</span>
                  <div className="px-6 py-4 rounded-2xl bg-ella-primary/10 flex items-center gap-4 text-ella-primary group-hover:bg-ella-primary group-hover:text-white transition-all shadow-lg hover:shadow-ella-primary/30">
                    <span className="font-bold">{lab.nextLabel[lang]}</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg></div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ELLA Coaching Panel */}
      <EllaCoachingPanel
        labId={labId}
        labTitle={lab.title[lang]}
        algorithm={algorithm}
        isSlippery={isSlippery}
        gamma={gamma}
        alpha={isTrainMode ? alpha : undefined}
        result={anyResult}
        lang={lang}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// MetricCard
// ---------------------------------------------------------------------------

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-ella-gray-200 p-4 text-center shadow-sm">
      <p className="text-[9px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black font-mono ${color || "text-ella-gray-900"}`}>{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MissionPanel
// ---------------------------------------------------------------------------

function MissionPanel({
  missions, missionStates, setMissionStates, isMissionUnlocked, result, lang, labId, onNumericSubmit, onEllaSubmit,
}: {
  missions: MissionDef[];
  missionStates: Record<string, MissionState>;
  setMissionStates: React.Dispatch<React.SetStateAction<Record<string, MissionState>>>;
  isMissionUnlocked: (idx: number) => boolean;
  result: RLLabRunResponse | RLLabTrainResponse | null;
  lang: "fr" | "en";
  labId: string;
  onNumericSubmit: (mission: MissionDef) => void;
  onEllaSubmit: (mission: MissionDef) => void;
}) {
  const passedCount = missions.filter((m) => missionStates[m.id]?.passed).length;
  return (
    <div className="bg-white border-2 border-ella-primary/10 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-ella-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-ella-primary/5 rounded-full -mr-16 -mt-16" />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="shrink-0 p-1 bg-white rounded-xl shadow-sm border border-ella-primary/10"><EllaAvatar size="md" /></div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-ella-primary px-2 py-0.5 bg-ella-primary/10 rounded">Missions</span>
            <p className="text-sm font-black text-ella-gray-900 mt-1">{lang === "fr" ? "Complète les missions pour valider ce lab" : "Complete the missions to validate this lab"}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${passedCount === missions.length ? "bg-ella-success-bg text-ella-success" : "bg-ella-primary-bg text-ella-primary"}`}>
          <span className="text-lg font-mono">{passedCount}</span><span className="opacity-50">/ {missions.length}</span>
        </div>
      </div>
      <div className="space-y-4 relative z-10">
        {missions.map((mission, idx) => (
          <MissionCard key={mission.id} mission={mission} index={idx} state={missionStates[mission.id] || { ...EMPTY_MISSION_STATE }} unlocked={isMissionUnlocked(idx)} result={result} lang={lang}
            onResponseChange={(val) => setMissionStates((prev) => ({ ...prev, [mission.id]: { ...(prev[mission.id] || { ...EMPTY_MISSION_STATE }), response: val, submitted: false } }))}
            onSubmit={() => { mission.type === "numeric" ? onNumericSubmit(mission) : onEllaSubmit(mission); }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MissionCard
// ---------------------------------------------------------------------------

function MissionCard({
  mission, index, state, unlocked, result, lang, onResponseChange, onSubmit,
}: {
  mission: MissionDef; index: number; state: MissionState; unlocked: boolean;
  result: RLLabRunResponse | RLLabTrainResponse | null; lang: "fr" | "en";
  onResponseChange: (val: string) => void; onSubmit: () => void;
}) {
  const canRetry = !state.passed && state.attempts < 3;
  const needsResult = mission.type === "numeric" && !result;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-500 ${!unlocked ? "opacity-20 pointer-events-none grayscale blur-[1px] border-ella-gray-200 bg-ella-gray-50" : state.passed ? "border-ella-success/30 bg-ella-success-bg/50" : state.submitted && !state.passed ? "border-ella-accent/20 bg-white" : "border-ella-gray-200 bg-white"}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${state.passed ? "bg-ella-success text-white" : !unlocked ? "bg-ella-gray-100 text-ella-gray-300" : "bg-ella-primary/10 text-ella-primary"}`}>
          {state.passed ? "✓" : !unlocked ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-ella-gray-400">Mission {index + 1}</span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${mission.type === "numeric" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
              {mission.type === "numeric" ? (lang === "fr" ? "Numérique" : "Numeric") : (lang === "fr" ? "Explication" : "Explanation")}
            </span>
          </div>
          <p className="text-sm font-bold text-ella-gray-800 leading-relaxed">{mission.question[lang]}</p>
        </div>
      </div>

      {/* Feedback */}
      {unlocked && state.submitted && state.feedback && (
        <div className={`border-l-4 rounded-r-xl p-4 mb-4 ml-11 animate-fade-in ${state.passed ? "border-ella-success bg-ella-success-bg/70" : "border-ella-accent bg-ella-accent-bg/70"}`}>
          <div className="flex items-center gap-2 mb-2">
            <EllaAvatar size="sm" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${state.passed ? "text-ella-success" : "text-ella-accent"}`}>
              {state.passed ? (lang === "fr" ? "Validé" : "Passed") : (lang === "fr" ? "Feedback d'Ella" : "Ella's Feedback")}
            </span>
          </div>
          <p className="text-sm text-ella-gray-700 leading-relaxed font-medium whitespace-pre-line">{state.feedback}</p>
          {state.attempts >= 3 && !state.passed && (
            <p className="text-xs font-bold text-ella-gray-400 italic mt-3 pt-3 border-t border-ella-gray-100 text-center">
              {lang === "fr" ? "On continue — reviens sur cette mission plus tard si tu veux approfondir." : "Let's move on — come back to this mission later if you want to dig deeper."}
            </p>
          )}
        </div>
      )}

      {/* Input area */}
      {unlocked && (!state.submitted || canRetry) && (
        <div className="ml-11 space-y-3 animate-fade-in">
          {state.attempts > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">{lang === "fr" ? "Tentative" : "Attempt"} {state.attempts}/3</p>
              {state.submitted && !state.passed && <span className="text-[10px] font-bold text-ella-accent uppercase animate-pulse">{lang === "fr" ? "Corrige ta réponse" : "Fix your answer"}</span>}
            </div>
          )}

          {mission.type === "numeric" ? (
            <div className="flex items-center gap-3">
              <input type="number" value={state.response} onChange={(e) => onResponseChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (!needsResult && state.response.trim()) onSubmit(); } }}
                placeholder={lang === "fr" ? "Ta réponse..." : "Your answer..."} disabled={state.loading}
                className="flex-1 border border-ella-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-ella-gray-800 focus:ring-4 focus:ring-ella-primary/10 focus:border-ella-primary outline-none transition-all placeholder-ella-gray-400" />
              <button onClick={onSubmit} disabled={state.loading || !state.response.trim() || needsResult} className="btn-primary !px-5 !py-2.5 flex items-center gap-2 shadow-lg shadow-ella-accent/20 disabled:opacity-30 disabled:cursor-not-allowed">
                {lang === "fr" ? "Vérifier" : "Check"}
              </button>
            </div>
          ) : (
            <>
              <textarea value={state.response} onChange={(e) => onResponseChange(e.target.value)}
                onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); if (state.response.trim()) onSubmit(); } }}
                onPaste={(e) => { const pt = e.clipboardData.getData("text").trim(); const pf = (state.feedback || "").trim(); if (pf && pt.length > 30) { const fw = new Set(pf.toLowerCase().split(/\s+/)); const pw = pt.toLowerCase().split(/\s+/); if (pw.filter((w) => fw.has(w)).length / pw.length > 0.6) { e.preventDefault(); alert(lang === "fr" ? "Tu ne peux pas copier-coller le feedback d'Ella." : "You can't paste Ella's feedback."); } } }}
                placeholder={state.submitted ? (lang === "fr" ? "Améliore ta réponse..." : "Improve your answer...") : (lang === "fr" ? "Écris ton explication..." : "Write your explanation...")}
                disabled={state.loading} className="w-full bg-ella-gray-50 border border-ella-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-ella-primary/10 focus:border-ella-primary outline-none transition-all min-h-[100px] placeholder-ella-gray-400" rows={3} />
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-ella-gray-400 uppercase tracking-widest">Ctrl+Enter {lang === "fr" ? "pour envoyer" : "to submit"}</p>
                <button onClick={onSubmit} disabled={state.loading || !state.response.trim()} className="btn-primary !px-6 flex items-center gap-2 shadow-lg shadow-ella-accent/20 disabled:opacity-30 disabled:cursor-not-allowed">
                  {state.loading ? (<><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />{lang === "fr" ? "Analyse..." : "Analyzing..."}</>)
                    : (<>{state.submitted ? (lang === "fr" ? "Renvoyer à Ella" : "Resubmit") : (lang === "fr" ? "Envoyer à Ella" : "Submit to Ella")}<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg></>)}
                </button>
              </div>
            </>
          )}
          {needsResult && <p className="text-[10px] font-bold text-ella-warning italic">{lang === "fr" ? "Lance d'abord l'algorithme ci-dessus." : "Run the algorithm above first."}</p>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Charts
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
        {sampledLog.map((logVal, i) => (
          <div key={i} className="flex-1 min-w-[1px] bg-ella-primary/70 rounded-t-sm hover:bg-ella-primary transition-colors" style={{ height: `${Math.max(2, ((logVal - logMin) / range) * 100)}%` }} title={`iter ${i * step + 1}: Δ = ${sampled[i].toExponential(2)}`} />
        ))}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-ella-gray-400">
        <span>iter 1: {deltas[0].toExponential(1)}</span>
        <span>iter {deltas.length}: {deltas[deltas.length - 1].toExponential(1)}</span>
      </div>
    </div>
  );
}

const CHART_COLORS: Record<string, { bar: string; hover: string }> = {
  "bg-ella-primary": { bar: "rgba(15,52,96,0.7)", hover: "rgba(15,52,96,1)" },
  "bg-ella-success": { bar: "rgba(16,185,129,0.7)", hover: "rgba(16,185,129,1)" },
};

function SmoothedChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  if (data.length === 0) return null;

  const sampleEvery = 10;
  const window = 50;
  const sampled: number[] = [];
  for (let i = 0; i < data.length; i += sampleEvery) {
    const start = Math.max(0, i - window + 1);
    const chunk = data.slice(start, i + 1);
    sampled.push(chunk.reduce((a, b) => a + b, 0) / chunk.length);
  }

  const maxVal = Math.max(...sampled, 0.001);
  const colors = CHART_COLORS[color] ?? { bar: "rgba(15,52,96,0.7)", hover: "rgba(15,52,96,1)" };

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-px h-24 bg-ella-gray-50 rounded-lg p-2 overflow-hidden">
        {sampled.map((val, i) => (
          <div
            key={i}
            className="flex-1 min-w-[1px] rounded-t-sm transition-colors"
            style={{
              height: `${Math.max(1, (val / maxVal) * 100)}%`,
              backgroundColor: colors.bar,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.bar; }}
            title={`ep ${i * sampleEvery + 1}: ${label} = ${val.toFixed(3)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-ella-gray-400">
        <span>ep 1</span>
        <span>ep {data.length}</span>
      </div>
    </div>
  );
}

function Vs0Chart({ data, refValue, snapshotInterval }: { data: number[]; refValue: number | null; snapshotInterval: number }) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data, refValue ?? 0, 0.001);
  const barColor = "rgba(15,52,96,0.7)";
  const barHover = "rgba(15,52,96,1)";

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-px h-28 bg-ella-gray-50 rounded-lg p-2 overflow-hidden relative">
        {/* Reference line */}
        {refValue !== null && refValue > 0 && (
          <div
            className="absolute left-2 right-2 border-t-2 border-dashed border-emerald-400 pointer-events-none z-10"
            style={{ bottom: `${8 + (refValue / maxVal) * (112 - 16)}px` }}
          >
            <span className="absolute -top-4 right-0 text-[8px] font-mono font-bold text-emerald-600 bg-white/80 px-1 rounded">V*</span>
          </div>
        )}
        {data.map((val, i) => (
          <div
            key={i}
            className="flex-1 min-w-[2px] rounded-t-sm transition-colors"
            style={{ height: `${Math.max(1, (val / maxVal) * 100)}%`, backgroundColor: barColor }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = barHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = barColor; }}
            title={`ep ${(i + 1) * snapshotInterval}: V(s₀) = ${val.toFixed(4)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-ella-gray-400">
        <span>ep {snapshotInterval}</span>
        <span>ep {data.length * snapshotInterval}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

export default function RLLabPage() {
  return (
    <ProtectedRoute>
      <LabContent />
    </ProtectedRoute>
  );
}
