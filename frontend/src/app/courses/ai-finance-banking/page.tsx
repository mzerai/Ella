"use client";

import { useEffect, useState } from "react";
import EllaAvatar from "@/components/EllaAvatar";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccessCodeGate from "@/components/AccessCodeGate";

const modules = [
  {
    number: "00",
    module_id: "00_welcome_intro",
    title: "Bienvenue et Introduction",
    description: "Introduction à l'IA en finance et présentation du module.",
    concept: "Introduction, objectifs.",
    has_lab: true,
    lab_url: "/courses/ai-finance-banking/labs/00_course_orientation_lab",
  },
  {
    number: "01",
    module_id: "01_credit_scoring_intro",
    title: "Introduction au Credit Scoring",
    description: "Comprendre le problème du credit scoring et les enjeux métiers.",
    concept: "Credit scoring, risque de crédit.",
    has_lab: true,
    lab_url: "/courses/ai-finance-banking/labs/01_credit_scoring_intro_lab",
  },
  {
    number: "02",
    module_id: "02_credit_scoring_data",
    title: "Données pour le Credit Scoring",
    description: "Préparation et analyse exploratoire des données financières.",
    concept: "Données financières, préparation des données.",
    has_lab: true,
    lab_url: "/courses/ai-finance-banking/labs/02_credit_scoring_data_lab",
  },
  {
    number: "03",
    module_id: "03_credit_scoring_models",
    title: "Modèles de Credit Scoring",
    description: "Apprentissage automatique appliqué au credit scoring : régression logistique, arbres, etc.",
    concept: "Modélisation, Machine Learning.",
    has_lab: true,
    lab_url: "/courses/ai-finance-banking/labs/03_credit_scoring_models_lab",
  },
  {
    number: "04",
    module_id: "04_credit_scoring_metrics_thresholds",
    title: "Évaluation et Décision",
    description: "Mesures de performance et choix du seuil de décision pour minimiser le risque.",
    concept: "Évaluation, seuils de décision, impact financier.",
    has_lab: true,
    lab_url: "/courses/ai-finance-banking/labs/04_credit_scoring_metrics_thresholds_lab",
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
          localStorage.getItem("ellaCompletedFinanceLessons") || "[]"
        );
        setCompletedLessons(completed);
      } catch (e) {
        console.error("Failed to load Finance progress", e);
      }
    };

    updateProgress();
    window.addEventListener("storage", updateProgress);
    return () => window.removeEventListener("storage", updateProgress);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Course Header Band */}
      <header className="bg-gradient-to-br from-slate-900 to-slate-800 text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/"
              className="text-white/50 hover:text-amber-400 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Catalogue
            </Link>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-amber-400/90 text-xs font-bold uppercase tracking-widest">
              AI for Finance & Banking
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight text-white">
            AI for Finance & Banking
          </h1>
          <p className="text-slate-300 max-w-2xl text-lg leading-relaxed font-medium">
            Découvrez comment l'intelligence artificielle transforme le secteur financier. De l'analyse des risques de crédit aux modèles prédictifs — avec ELLA comme coach.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-20 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Le parcours technique
              </h2>
            </div>

            {modules.map((mod) => (
              <div
                key={mod.module_id}
                className="bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all hover:shadow-2xl hover:shadow-slate-900/5 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-2xl shadow-lg transition-transform group-hover:scale-110
                  ${
                    completedLessons.includes(mod.module_id) || isAdmin
                      ? "bg-amber-500 text-slate-900"
                      : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}
                >
                  {mod.number}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 md:line-clamp-1 font-medium italic mb-4 md:mb-0 opacity-80">
                    {mod.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/ai-finance-banking/modules/${mod.module_id}`}
                    className="btn-secondary !text-xs !py-3 !px-5 !rounded-xl font-black bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-amber-400 border-none shadow-none"
                  >
                    Module
                  </Link>
                  {mod.has_lab &&
                    (isAdmin ||
                    completedLessons.includes(mod.module_id) ? (
                      <Link
                        href={mod.lab_url || "#"}
                        className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black bg-slate-900 text-amber-400 hover:bg-slate-800 shadow-lg shadow-slate-900/10"
                      >
                        Cas pratique
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black bg-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-2 border-none shadow-none"
                        title="Complétez le module pour débloquer le cas pratique"
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
                        Cas pratique
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ella Welcome */}
            <div className="bg-white border-2 border-amber-500/10 rounded-[2rem] p-6 shadow-xl shadow-amber-500/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <EllaAvatar size="sm" />
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                  Le mot d'Ella
                </h4>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-bold italic relative z-10">
                "Bienvenue dans le parcours AI for Finance ! Nous allons explorer comment l'IA est appliquée dans le secteur bancaire. Les checkpoints sont là pour ancrer ce que tu apprends."
              </p>
            </div>

            {/* Course Progress */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                  Ma Progression
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-500">
                    {Math.round(
                      ((isAdmin ? modules.length : completedLessons.length) / modules.length) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-1000"
                  style={{
                    width: `${
                      isAdmin
                        ? 100
                        : (completedLessons.length / modules.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="mt-4 flex justify-between text-[10px] uppercase tracking-widest font-black text-slate-400">
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
              className="group block p-6 bg-slate-900 rounded-[2rem] text-amber-400 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/30 active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-amber-400/10 text-amber-400 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
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
                  <h4 className="text-base font-black uppercase tracking-tight leading-none mb-1 text-white">
                    Une question ?
                  </h4>
                  <p className="text-xs text-amber-400/80 font-bold uppercase tracking-widest">
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

export default function FinanceCourse() {
  return (
    <ProtectedRoute>
      <AccessCodeGate courseId="finance" courseTitle="AI for Finance & Banking" accentColor="amber">
        <CourseContent />
      </AccessCodeGate>
    </ProtectedRoute>
  );
}
