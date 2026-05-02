"use client";

import { useEffect, useState } from "react";
import EllaAvatar from "@/components/EllaAvatar";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccessCodeGate from "@/components/AccessCodeGate";

const sequences = [
  {
    number: "00",
    sequence_id: "00_course_positioning",
    title: "Cadrage : IA Industrielle",
    description: "Introduction aux enjeux de l'IA dans l'industrie et cadrage des cas d'usage.",
    concept: "IA Industrielle, ROI, cadrage métier.",
    has_workshop: true,
    workshop_url: "/courses/ai-manufacturing/labs/00_industrial_ai_framing_lab",
  },
  {
    number: "01",
    sequence_id: "01_industrial_data_iot_it_ot_architecture",
    title: "Architecture IT/OT et Données",
    description: "Connectivité industrielle, protocoles IoT et qualité des données IT/OT.",
    concept: "MQTT, OPC-UA, MES, SCADA, Qualité de donnée.",
    has_workshop: true,
    workshop_url: "/courses/ai-manufacturing/labs/01_industrial_data_architecture_lab",
  },
  {
    number: "02",
    sequence_id: "02_predictive_maintenance_machine_learning",
    title: "Maintenance Prédictive & ML",
    description: "Détection d'anomalies et estimation de la durée de vie résiduelle (RUL).",
    concept: "Anomalies, RUL, capteurs, maintenance proactive.",
    has_workshop: true,
    workshop_url: "/courses/ai-manufacturing/labs/02_predictive_maintenance_strategy_lab",
  },
  {
    number: "03",
    sequence_id: "03_computer_vision_quality_control",
    title: "Vision par Ordinateur & Qualité",
    description: "Automatisation du contrôle qualité par analyse d'image en temps réel.",
    concept: "Deep Learning, Inspection visuelle, Contrôle qualité.",
    has_workshop: true,
    workshop_url: "/courses/ai-manufacturing/labs/03_computer_vision_quality_control_lab",
  },
  {
    number: "04",
    sequence_id: "04_ai_production_flow_supply_chain_optimization",
    title: "Optimisation Flux & Supply Chain",
    description: "Amélioration du TRS et optimisation de l'ordonnancement sous contraintes.",
    concept: "TRS/OEE, Supply chain, Ordonnancement.",
    has_workshop: true,
    workshop_url: "/courses/ai-manufacturing/labs/04_flow_supply_chain_optimization_lab",
  },
  {
    number: "05",
    sequence_id: "05_digital_twins_simulation_industrial_scenarios",
    title: "Jumeaux Numériques & Simulation",
    description: "Modélisation et simulation de processus pour la décision industrielle.",
    concept: "Digital Twins, Simulation, Scénarios.",
    has_workshop: true,
    workshop_url: "/courses/ai-manufacturing/labs/05_digital_twin_scenario_lab",
  },
  {
    number: "06",
    sequence_id: "06_deployment_ot_cybersecurity_industrial_ai_roadmap",
    title: "Déploiement & Roadmap IA",
    description: "Feuille de route, cybersécurité OT et déploiement industriel sécurisé.",
    concept: "Cybersécurité OT, Roadmap, Déploiement.",
    has_workshop: true,
    workshop_url: "/courses/ai-manufacturing/labs/06_final_industrial_ai_roadmap_lab",
  },
];

function ManufacturingWorkshopContent() {
  const { user } = useAuth();
  const [completedSequences, setCompletedSequences] = useState<string[]>([]);
  const isAdmin = user?.email === "mourad.zerai@gmail.com";

  useEffect(() => {
    const updateProgress = () => {
      try {
        const completed = JSON.parse(
          localStorage.getItem("ellaCompletedManufacturingSequences") || "[]"
        );
        setCompletedSequences(completed);
      } catch (e) {
        console.error("Failed to load Manufacturing progress", e);
      }
    };

    updateProgress();
    window.addEventListener("storage", updateProgress);
    return () => window.removeEventListener("storage", updateProgress);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Workshop Header Band */}
      <header className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/"
              className="text-white/50 hover:text-indigo-400 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Arena
            </Link>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-indigo-400/90 text-xs font-bold uppercase tracking-widest">
              Workshop : AI for Manufacturing
            </span>
          </div>
          <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full mb-6">
             <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Workshop Interactif</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight text-white">
            AI for Manufacturing
          </h1>
          <p className="text-slate-300 max-w-2xl text-lg leading-relaxed font-medium">
            Propulsez votre usine dans l'ère de l'Industrie 4.0. De la maintenance prédictive à l'optimisation des flux — conçu pour les décideurs industriels avec ELLA.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-20 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sequence List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Séquences de travail
              </h2>
            </div>

            {sequences.map((seq) => (
              <div
                key={seq.sequence_id}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all hover:shadow-2xl hover:shadow-indigo-900/5 group border-l-4 border-l-transparent hover:border-l-indigo-500"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-2xl shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3
                  ${
                    completedSequences.includes(seq.sequence_id) || isAdmin
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}
                >
                  {seq.number}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                    {seq.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 md:line-clamp-1 font-medium italic mb-4 md:mb-0 opacity-80">
                    {seq.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/ai-manufacturing/sequences/${seq.sequence_id}`}
                    className="btn-secondary !text-[10px] !py-3 !px-5 !rounded-2xl font-black bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-indigo-400 border-none shadow-none uppercase tracking-widest"
                  >
                    Séquence
                  </Link>
                  {seq.has_workshop &&
                    (isAdmin ||
                    completedSequences.includes(seq.sequence_id) ? (
                      <Link
                        href={seq.workshop_url || "#"}
                        className="btn-primary !text-[10px] !py-3 !px-5 !rounded-2xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 uppercase tracking-widest"
                      >
                        Atelier
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="btn-primary !text-[10px] !py-3 !px-5 !rounded-2xl font-black bg-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-2 border-none shadow-none uppercase tracking-widest"
                        title="Complétez la séquence pour débloquer l'atelier"
                      >
                        <LockIcon className="w-3 h-3" />
                        Atelier
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ella Welcome */}
            <div className="bg-white border-2 border-indigo-500/10 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-500/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <EllaAvatar size="sm" />
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                   ELLA — Facilitatrice
                </h4>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-bold italic relative z-10">
                "Salut ! Je suis ravie de t'accompagner dans cette transformation industrielle. Nous allons voir comment l'IA peut rendre ton usine plus intelligente, plus fiable et plus performante."
              </p>
            </div>

            {/* Workshop Progress */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                  Progression Workshop
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-indigo-600">
                    {Math.round(
                      ((isAdmin ? sequences.length : completedSequences.length) / sequences.length) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-1000"
                  style={{
                    width: `${
                      isAdmin
                        ? 100
                        : (completedSequences.length / sequences.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="mt-4 flex justify-between text-[10px] uppercase tracking-widest font-black text-slate-400">
                <span>
                  {isAdmin ? sequences.length : completedSequences.length}/
                  {sequences.length} Séquences
                </span>
              </div>
            </div>

            {/* Help Card */}
            <Link
              href="/chat"
              className="group block p-8 bg-indigo-600 rounded-[2.5rem] text-white hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/10 text-white p-3 rounded-2xl group-hover:rotate-12 transition-transform">
                  <ChatIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-tight leading-none mb-1 text-white">
                    Une question ?
                  </h4>
                  <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest">
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
    </svg>
  );
}

export default function ManufacturingWorkshop() {
  return (
    <ProtectedRoute>
      <AccessCodeGate courseId="manufacturing" courseTitle="Workshop : AI for Manufacturing" accentColor="indigo">
        <ManufacturingWorkshopContent />
      </AccessCodeGate>
    </ProtectedRoute>
  );
}
