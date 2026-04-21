/**
 * Reinforcement Learning course page — learning path with modules and labs.
 */

"use client";

import { useEffect, useState } from "react";
import EllaAvatar from "@/components/EllaAvatar";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";

const modules = [
  {
    number: "00",
    module_id: "rl_00_culture",
    title: "Culture RL",
    description:
      "Histoire, taxonomie des algorithmes et breakthroughs qui ont marqué le monde.",
    concept: "De Bellman (1957) à RLHF (2022) : le parcours du RL.",
    has_lab: false,
  },
  {
    number: "01",
    module_id: "rl_01_bellman",
    title: "Fondements — Les équations de Bellman",
    description:
      "Le cadre MDP, le retour actualisé, et les deux équations récursives au cœur du RL.",
    concept: "v_π(s) et q_π(s,a) : les fonctions de valeur.",
    has_lab: true,
    lab_url: "/courses/reinforcement-learning/labs/policy_evaluation",
  },
  {
    number: "02",
    module_id: "rl_02_planning",
    title: "Planification — Policy Iteration & Value Iteration",
    description:
      "Quand on connaît le modèle, on résout les équations de Bellman exactement.",
    concept: "Moyenne (PE) vs Maximum (VI) : la différence clé.",
    has_lab: true,
    lab_url: "/courses/reinforcement-learning/labs/planning",
  },
  {
    number: "03",
    module_id: "rl_03_td_mc",
    title: "TD(0) et Monte Carlo",
    description:
      "Apprendre sans modèle : attendre la fin (MC) ou bootstrapper (TD).",
    concept: "Biais vs variance : le compromis fondamental.",
    has_lab: true,
    lab_url: "/courses/reinforcement-learning/labs/td_mc",
  },
  {
    number: "04",
    module_id: "rl_04_control",
    title: "SARSA, Q-Learning, Double Q-Learning",
    description:
      "Trouver la politique optimale sans connaître le modèle.",
    concept: "On-policy (SARSA) vs off-policy (Q-Learning) vs anti-biais (Double Q).",
    has_lab: true,
    lab_url: "/courses/reinforcement-learning/labs/control",
  },
  {
    number: "05",
    module_id: "rl_05_deep_rl",
    title: "Vers le Deep RL — DQN & Synthèse",
    description:
      "Du Q-table au réseau de neurones, puis synthèse des 8 algorithmes.",
    concept: "Réseau cible + experience replay + synthèse comparative.",
    has_lab: true,
    lab_url: "/courses/reinforcement-learning/labs/dqn",
  },
];

function CourseContent() {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const isAdmin = user?.email === "mourad.zerai@gmail.com";

  useEffect(() => {
    const updateProgress = () => {
      try {
        const completed = JSON.parse(
          localStorage.getItem("ellaCompletedRLLessons") || "[]"
        );
        setCompletedLessons(completed);
      } catch (e) {
        console.error("Failed to load RL progress", e);
      }
    };

    updateProgress();
    window.addEventListener("storage", updateProgress);
    return () => window.removeEventListener("storage", updateProgress);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Course Header Band */}
      <header className="bg-gradient-to-br from-ella-dark to-ella-primary-dark text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ella-accent/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/"
              className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Catalogue
            </Link>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-white/90 text-xs font-bold uppercase tracking-widest">
              Reinforcement Learning
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">
            Reinforcement Learning
          </h1>
          <p className="text-ella-dark-text/70 max-w-2xl text-lg leading-relaxed font-medium">
            Maîtrisez les algorithmes fondamentaux du RL — de Bellman à DQN — avec des labs interactifs sur FrozenLake et le coaching personnalisé d'ELLA.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-20 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black text-ella-gray-400 uppercase tracking-widest">
                Le parcours d'apprentissage
              </h2>
            </div>

            {modules.map((mod) => (
              <div
                key={mod.module_id}
                className="bg-white rounded-[2rem] border border-ella-gray-200 p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all hover:shadow-2xl hover:shadow-ella-gray-900/5 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-2xl shadow-lg transition-transform group-hover:scale-110
                  ${
                    completedLessons.includes(mod.module_id) || isAdmin
                      ? "bg-ella-success text-white"
                      : "bg-ella-gray-50 text-ella-gray-300 border border-ella-gray-100"
                  }`}
                >
                  {mod.number}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-ella-gray-900 mb-1.5">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-ella-gray-500 line-clamp-2 md:line-clamp-1 font-medium italic mb-4 md:mb-0 opacity-80">
                    {mod.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/reinforcement-learning/modules/${mod.module_id}`}
                    className="btn-secondary !text-xs !py-3 !px-5 !rounded-xl font-black bg-ella-primary/5 text-ella-primary hover:bg-ella-primary hover:text-white border-none shadow-none"
                  >
                    Leçon
                  </Link>
                  {mod.has_lab &&
                    (isAdmin ||
                    completedLessons.includes(mod.module_id) ? (
                      <Link
                        href={mod.lab_url || "#"}
                        className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black shadow-lg shadow-ella-accent/10"
                      >
                        Lab
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black opacity-30 grayscale cursor-not-allowed flex items-center gap-2"
                        title="Complétez la leçon pour débloquer le Lab"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                          ></path>
                        </svg>
                        Lab
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ella Welcome */}
            <div className="bg-white border-2 border-ella-primary/10 rounded-[2rem] p-6 shadow-xl shadow-ella-primary/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-ella-primary/5 rounded-full -mr-12 -mt-12"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <EllaAvatar size="sm" />
                <h4 className="font-black text-ella-gray-900 uppercase tracking-widest text-[10px]">
                  Le mot d'Ella
                </h4>
              </div>
              <p className="text-sm text-ella-gray-700 leading-relaxed font-bold italic relative z-10">
                "Bienvenue dans le cours de Reinforcement Learning ! On va
                explorer 8 algorithmes ensemble, des fondements mathématiques
                jusqu'au Deep RL. Chaque leçon te prépare au lab suivant."
              </p>
            </div>

            {/* Course Progress */}
            <div className="bg-white border border-ella-gray-200 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-ella-gray-900 uppercase tracking-widest text-[10px]">
                  Ma Progression
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-ella-primary">
                    {Math.round(
                      ((isAdmin ? modules.length : completedLessons.length) / modules.length) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-ella-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ella-primary transition-all duration-1000"
                  style={{
                    width: `${
                      isAdmin
                        ? 100
                        : (completedLessons.length / modules.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="mt-4 flex justify-between text-[10px] uppercase tracking-widest font-black text-ella-gray-400">
                <span>
                  {isAdmin ? modules.length : completedLessons.length}/
                  {modules.length} Modules
                </span>
                <span>
                  {isAdmin ? 0 : modules.length - completedLessons.length}{" "}
                  restants
                </span>
              </div>
            </div>

            {/* Help Card */}
            <Link
              href="/chat"
              className="group block p-6 bg-ella-accent rounded-[2rem] text-white hover:bg-ella-accent-dark transition-all shadow-2xl shadow-ella-accent/30 active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-tight leading-none mb-1">
                    Un blocage ?
                  </h4>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest">
                    Parler à Ella
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReinforcementLearningCourse() {
  return (
    <ProtectedRoute>
      <CourseContent />
    </ProtectedRoute>
  );
}
