"use client";

import { useEffect, useState } from "react";
import EllaAvatar from "@/components/EllaAvatar";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const modules = [
    {
        number: "00",
        module_id: "aile_00_wakeup",
        title: "Le Wake-Up Call",
        description:
            "Pourquoi 'attendre de voir' est la strategie la plus risquee. L'urgence IA, le knowledge gap et le cout de l'inaction.",
        concept: "Urgence IA, knowledge gap, cout de l'inaction, case studies.",
        has_lab: true,
        lab_url: "/courses/ai-leadership/labs/01_self_assessment",
    },
    {
        number: "01",
        module_id: "aile_01_demystify",
        title: "IA Demystifiee pour Dirigeants",
        description:
            "ML, Deep Learning, IA Generative — sans jargon. Les mythes, les limites et le vocabulaire essentiel.",
        concept: "ML/DL/GenAI sans jargon, mythes, limites, vocabulaire dirigeant.",
        has_lab: true,
        lab_url: "/courses/ai-leadership/labs/02_genai_demo",
    },
    {
        number: "02",
        module_id: "aile_02_strategy",
        title: "Strategie IA",
        description:
            "Les 5 pressions convergentes, AI-native vs traditionnel, la fenetre tunisienne et le cadre reglementaire.",
        concept: "5 pressions convergentes, AI-native vs traditionnel, BCT/RGPD, IA souveraine.",
        has_lab: true,
        lab_url: "/courses/ai-leadership/labs/03_competitive_analysis",
    },
    {
        number: "03",
        module_id: "aile_03_governance",
        title: "Gouvernance & Risques",
        description:
            "Framework de gouvernance, evaluation des risques, ethique IA, comite ethique et conformite reglementaire.",
        concept: "Framework gouvernance, risques IA, comite ethique, conformite.",
        has_lab: true,
        lab_url: "/courses/ai-leadership/labs/04_risk_audit",
    },
    {
        number: "04",
        module_id: "aile_04_roi",
        title: "ROI & Business Cases",
        description:
            "Evaluation vendeurs, TCO, ROI, Build vs Buy, et les metriques de succes pour piloter un programme IA.",
        concept: "Evaluation vendeurs, TCO, ROI, Build vs Buy, metriques succes.",
        has_lab: true,
        lab_url: "/courses/ai-leadership/labs/05_business_case",
    },
    {
        number: "05",
        module_id: "aile_05_roadmap",
        title: "Roadmap Transformation",
        description:
            "Gartner AI Maturity Model, design de PoC, change management et plan 12-18 mois.",
        concept: "Gartner 5 niveaux, PoC design, change management, plan 12-18 mois.",
        has_lab: true,
        lab_url: "/courses/ai-leadership/labs/06_maturity_diagnostic",
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
                    localStorage.getItem("ellaCompletedAILELessons") || "[]"
                );
                setCompletedLessons(completed);
            } catch (e) {
                console.error("Failed to load AILE progress", e);
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
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
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
                            Executive AI Leadership
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">
                        Executive AI Leadership
                    </h1>
                    <p className="text-ella-dark-text/70 max-w-2xl text-lg leading-relaxed font-medium">
                        Comprenez l'IA a un niveau strategique. Definissez votre feuille de route IA, pilotez la transformation et prenez les bonnes decisions avec le coaching personnalise d'ELLA.
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-20 w-full relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Module List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-black text-ella-gray-400 uppercase tracking-widest">
                                Le parcours executif
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
                                            : "bg-amber-50 text-amber-300 border border-amber-100"
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
                                        href={`/courses/ai-leadership/modules/${mod.module_id}`}
                                        className="btn-secondary !text-xs !py-3 !px-5 !rounded-xl font-black bg-amber-500/5 text-amber-700 hover:bg-amber-500 hover:text-white border-none shadow-none"
                                    >
                                        Module
                                    </Link>
                                    {mod.has_lab &&
                                        (isAdmin ||
                                        completedLessons.includes(mod.module_id) ? (
                                            <Link
                                                href={mod.lab_url || "#"}
                                                className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black shadow-lg shadow-ella-accent/10"
                                            >
                                                Cas pratique
                                            </Link>
                                        ) : (
                                            <button
                                                disabled
                                                className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black opacity-30 grayscale cursor-not-allowed flex items-center gap-2"
                                                title="Completez le module pour debloquer le cas pratique"
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
                                <h4 className="font-black text-ella-gray-900 uppercase tracking-widest text-[10px]">
                                    Le mot d'Ella
                                </h4>
                            </div>
                            <p className="text-sm text-ella-gray-700 leading-relaxed font-bold italic relative z-10">
                                "Bienvenue dans le parcours Executive AI Leadership ! Ensemble, nous allons explorer comment l'IA peut transformer votre organisation. Chaque module vous prepare a prendre des decisions strategiques eclairees."
                            </p>
                        </div>

                        {/* Course Progress */}
                        <div className="bg-white border border-ella-gray-200 rounded-[2rem] p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-black text-ella-gray-900 uppercase tracking-widest text-[10px]">
                                    Ma Progression
                                </h4>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-amber-700">
                                        {Math.round(
                                            ((isAdmin ? modules.length : completedLessons.length) / modules.length) * 100
                                        )}
                                        %
                                    </span>
                                </div>
                            </div>
                            <div className="w-full h-3 bg-ella-gray-100 rounded-full overflow-hidden">
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
                            className="group block p-6 bg-amber-500 rounded-[2rem] text-white hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/30 active:scale-95"
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
                                        Une question ?
                                    </h4>
                                    <p className="text-xs text-white/70 font-bold uppercase tracking-widest">
                                        Parler a Ella
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

export default function AILeadershipCourse() {
    return (
        <>
            <CourseContent />
        </>
    );
}
